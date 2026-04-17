// Vite plugin: after `vite build` finishes writing dist/, boot a preview
// server, crawl every route with a headless browser, and overwrite
// dist/<route>/index.html with a fully rendered snapshot. Runs as part of
// `vite build` so it works on hosts (like Lovable) that only invoke vite
// directly and never see a custom `npm run build` script.

import { preview } from "vite";
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

// Keep this list in sync with src/App.tsx <Routes>.
const ROUTES = [
  "/",
  "/docs/what-is-nexart",
  "/docs/getting-started",
  "/docs/quickstart",
  "/docs/cer-protocol",
  "/docs/cer-record-management",
  "/docs/protocol-overview",
  "/docs/concepts/cer",
  "/docs/concepts/project-bundles",
  "/docs/concepts/hashes",
  "/docs/concepts/signed-receipts",
  "/docs/concepts/hash-timestamping",
  "/docs/concepts/verification-reports",
  "/docs/concepts/context-signals",
  "/docs/sdk",
  "/docs/cli",
  "/docs/codemode-sdk",
  "/docs/ui-renderer-sdk",
  "/docs/attestation-node",
  "/docs/verification",
  "/docs/verify-nexart",
  "/docs/browser-verification",
  "/docs/ai-cer-verification-layers",
  "/docs/ai-cer-package-format",
  "/docs/trust-model",
  "/docs/integration-surfaces",
  "/docs/cer-audit-workflows",
  "/docs/integrations",
  "/docs/dashboard/projects",
  "/docs/dashboard/apps",
  "/docs/dashboard/auto-stamp",
  "/docs/dashboard/retention",
  "/docs/dashboard/audit-exports",
  "/docs/privacy",
  "/docs/examples",
  "/docs/integrations/n8n",
  "/docs/integrations/langchain",
  "/docs/agent-kit",
  "/docs/guides",
  "/docs/faq",
];

function routeToFilePath(distDir, route) {
  if (route === "/") return join(distDir, "index.html");
  return join(distDir, route.replace(/^\/+/, ""), "index.html");
}

async function snapshot(page, baseUrl, distDir, route) {
  const url = baseUrl + route;
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
  // Give React Helmet a tick to flush head changes.
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  const html = await page.evaluate(
    () => "<!doctype html>\n" + document.documentElement.outerHTML,
  );
  const filePath = routeToFilePath(distDir, route);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, html, "utf8");
  return filePath;
}

export default function prerenderPlugin(options = {}) {
  const { routes = ROUTES, port = 4179, enabled = true } = options;
  let resolvedDistDir;
  let didRun = false;

  return {
    name: "nexart-prerender",
    apply: "build",
    configResolved(config) {
      resolvedDistDir = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      // closeBundle can fire more than once across plugin chains; guard it.
      if (!enabled || didRun) return;
      didRun = true;

      if (!existsSync(resolvedDistDir)) {
        this.warn(`prerender: dist dir not found at ${resolvedDistDir}; skipping`);
        return;
      }

      // Lazy-load puppeteer so dev server / SSR builds never pay the cost.
      let puppeteer;
      try {
        puppeteer = (await import("puppeteer")).default;
      } catch (err) {
        this.warn(`prerender: puppeteer not available, skipping (${err.message})`);
        return;
      }

      console.log(`\n[prerender] starting preview server on :${port}`);
      const server = await preview({
        preview: { port, strictPort: true, host: "127.0.0.1" },
        logLevel: "warn",
      });
      const baseUrl = `http://127.0.0.1:${port}`;

      let browser;
      let failed = 0;
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 900 });
        await page.setRequestInterception(true);
        page.on("request", (req) => {
          const type = req.resourceType();
          if (type === "media" || type === "font") return req.abort();
          req.continue();
        });

        for (const route of routes) {
          try {
            const out = await snapshot(page, baseUrl, resolvedDistDir, route);
            console.log(
              `[prerender]   ✓ ${route} → ${out.replace(resolvedDistDir + "/", "")}`,
            );
          } catch (err) {
            failed++;
            console.error(`[prerender]   ✗ ${route}: ${err.message}`);
          }
        }
      } finally {
        if (browser) await browser.close().catch(() => {});
        await new Promise((res) => server.httpServer.close(res));
      }

      // SPA fallback for routes we did not prerender.
      try {
        await copyFile(
          join(resolvedDistDir, "index.html"),
          join(resolvedDistDir, "200.html"),
        );
      } catch {}

      if (failed > 0) {
        this.warn(`prerender: ${failed} route(s) failed`);
      } else {
        console.log(`[prerender] wrote ${routes.length} routes\n`);
      }
    },
  };
}
