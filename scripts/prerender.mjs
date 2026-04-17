// Build-time prerender: boots `vite preview`, visits every route with a
// headless browser, and writes a fully rendered HTML snapshot to
// dist/<route>/index.html. Crawlers and LLMs get real content on the first
// response; React still hydrates for interactive users.

import { preview } from "vite";
import puppeteer from "puppeteer";
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../dist");

// Keep this list in sync with src/App.tsx <Routes>.
const routes = [
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

function routeToFilePath(route) {
  if (route === "/") return join(distDir, "index.html");
  return join(distDir, route.replace(/^\/+/, ""), "index.html");
}

async function snapshot(page, baseUrl, route) {
  const url = baseUrl + route;
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
  // Give React Helmet a tick to flush head changes.
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  const html = await page.evaluate(() => "<!doctype html>\n" + document.documentElement.outerHTML);
  const filePath = routeToFilePath(route);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, html, "utf8");
  return filePath;
}

async function main() {
  if (!existsSync(distDir)) {
    throw new Error("dist/ not found. Run `vite build` before prerender.");
  }

  const server = await preview({
    preview: { port: 4179, strictPort: true, host: "127.0.0.1" },
    logLevel: "warn",
  });
  const baseUrl = `http://127.0.0.1:4179`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let failed = 0;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    // Speed: block heavy fonts; HTML/CSS/JS still load.
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (type === "media" || type === "font") return req.abort();
      req.continue();
    });

    for (const route of routes) {
      try {
        const out = await snapshot(page, baseUrl, route);
        console.log(`  ✓ ${route} → ${out.replace(distDir + "/", "")}`);
      } catch (err) {
        failed++;
        console.error(`  ✗ ${route}: ${err.message}`);
      }
    }
  } finally {
    await browser.close();
    await new Promise((res) => server.httpServer.close(res));
  }

  // Ensure SPA fallback still exists for routes we didn't prerender.
  // dist/index.html now contains the prerendered "/" — keep a copy as
  // 200.html for hosts that use it as SPA fallback.
  try {
    await copyFile(join(distDir, "index.html"), join(distDir, "200.html"));
  } catch {}

  if (failed > 0) {
    console.error(`Prerender finished with ${failed} failed route(s).`);
    process.exit(1);
  }
  console.log(`Prerendered ${routes.length} routes.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
