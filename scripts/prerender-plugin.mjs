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

async function waitForRouteContent(page) {
  // Tolerant readiness: wait for any H1 inside the docs main/prose container,
  // then give React Router + Helmet a brief settle window. Avoid strict
  // content-match assertions because H1 text varies wildly across route types.
  await page
    .waitForSelector('main h1, [class*="docs-prose"] h1', { timeout: 10_000 })
    .catch(() => {
      // Some routes (e.g. "/" redirect target, marketing index) may render
      // their H1 outside <main>; fall through and let the settle delay handle it.
    });
  await new Promise((resolve) => setTimeout(resolve, 750));
}

function routeToFilePath(distDir, route) {
  if (route === "/") return join(distDir, "index.html");
  // Lovable hosting serves exact files for deep paths before falling back to
  // the SPA shell. Writing /docs/foo as a real file ensures /docs/foo returns
  // prerendered HTML instead of the root index fallback.
  return join(distDir, route.replace(/^\/+/, ""));
}

async function snapshot(page, baseUrl, distDir, route) {
  const url = baseUrl + route;
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
  await waitForRouteContent(page);
  const html = "<!doctype html>\n" + (await page.content());
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

        const llmsFullSections = [];
        for (const route of routes) {
          try {
            const out = await snapshot(page, baseUrl, resolvedDistDir, route);
            console.log(
              `[prerender]   ✓ ${route} → ${out.replace(resolvedDistDir + "/", "")}`,
            );
            // Extract plain text + title for llms-full.txt
            try {
              const extracted = await page.evaluate(() => {
                const title =
                  document.querySelector("h1")?.textContent?.trim() ||
                  document.title ||
                  "";
                const main =
                  document.querySelector("main") || document.body;
                // Strip nav/aside/script/style/footer noise
                const clone = main.cloneNode(true);
                clone
                  .querySelectorAll("nav, aside, script, style, footer, button")
                  .forEach((n) => n.remove());
                const text = (clone.textContent || "")
                  .replace(/\u00a0/g, " ")
                  .replace(/[ \t]+/g, " ")
                  .replace(/\n[ \t]+/g, "\n")
                  .replace(/\n{3,}/g, "\n\n")
                  .trim();
                return { title, text };
              });
              const url = `https://docs.nexart.io${route === "/" ? "" : route}`;
              llmsFullSections.push(
                `# ${extracted.title}\n\nURL: ${url}\n\n${extracted.text}`,
              );
            } catch (err) {
              console.warn(
                `[prerender]   (llms-full extract failed for ${route}: ${err.message})`,
              );
            }
          } catch (err) {
            failed++;
            console.error(`[prerender]   ✗ ${route}: ${err.message}`);
          }
        }

        // Write llms-full.txt to dist root
        try {
          const header = [
            "# NexArt Documentation — Full Text",
            "",
            "> Concatenated full text of every NexArt documentation page.",
            "> Companion to /llms.txt (which lists URLs only).",
            "> Generated at build time from the live rendered pages.",
            "",
            `Generated: ${new Date().toISOString()}`,
            `Pages: ${llmsFullSections.length}`,
            "",
            "---",
            "",
          ].join("\n");
          await writeFile(
            join(resolvedDistDir, "llms-full.txt"),
            header + llmsFullSections.join("\n\n---\n\n") + "\n",
            "utf8",
          );
          console.log(
            `[prerender] wrote llms-full.txt (${llmsFullSections.length} pages)`,
          );
        } catch (err) {
          console.warn(`[prerender] failed to write llms-full.txt: ${err.message}`);
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
