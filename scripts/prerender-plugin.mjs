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
  "/docs/architecture",
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
  "/docs/concepts/execution-context",
  "/docs/sdk",
  "/docs/signals-sdk",
  "/docs/cli",
  "/docs/codemode-sdk",
  "/docs/ui-renderer-sdk",
  "/docs/attestation-node",
  "/docs/end-to-end-verification",
  "/docs/ai-execution",
  "/docs/verification-semantics",
  "/docs/project-bundle-registration",
  "/docs/verification-statuses-and-errors",
  "/docs/multi-step-and-multi-agent-workflows",
  "/docs/public-reseals-and-redacted-verification",
  "/docs/certifying-llm-conversations",
  "/docs/verification",
  "/docs/verification-model",
  "/docs/external-verification",
  "/docs/independent-verification",
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
  "/docs/agent-kit-instructions",
  "/docs/python-bridge",
  "/docs/guides",
  "/docs/faq",
  "/docs/security/key-management",
  "/docs/confidential-mode",
  "/docs/builder-integration-guide",
];

const PARENT_ROUTES = new Set(
  ROUTES.filter((route) => route !== "/").filter((route) =>
    ROUTES.some((candidate) => candidate !== route && candidate.startsWith(`${route}/`)),
  ),
);

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
  // Always write as <route>/index.html so hosts serve it with the correct
  // text/html content-type. Extensionless files were being served as
  // application/octet-stream, triggering a download instead of rendering.
  return join(distDir, route.replace(/^\/+/, ""), "index.html");
}

function markdownAlternateHref(route) {
  if (route === "/") return "/index.md";
  return `${route}.md`;
}

async function snapshot(page, baseUrl, distDir, route) {
  const url = baseUrl + route;
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
  await waitForRouteContent(page);
  // page.content() already returns a full document starting with
  // <!DOCTYPE html>. Do NOT prepend another doctype — a duplicated DOCTYPE
  // trips strict HTML parsers (some LLM crawlers report the page as empty
  // or fall back to the SPA shell), which is exactly the failure the docs
  // audit surfaced. Also inject a <link rel="alternate" type="text/markdown">
  // pointing at the per-route .md shadow so LLM ingesters can grab clean
  // plaintext instead of re-parsing the hydrated React HTML.
  let html = await page.content();
  const mdHref = markdownAlternateHref(route);
  const alt = `<link rel="alternate" type="text/markdown" href="${mdHref}">`;
  if (!html.includes('type="text/markdown"')) {
    html = html.replace(/<\/head>/i, `    ${alt}\n  </head>`);
  }
  const filePath = routeToFilePath(distDir, route);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, html, "utf8");
  return filePath;
}

function routeToMarkdownPath(distDir, route) {
  if (route === "/") return join(distDir, "index.md");
  return join(distDir, route.replace(/^\/+/, "") + ".md");
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
            // Extract structured markdown for llms-full.txt — preserves
            // heading hierarchy (H1 page title, H2/H3+ subsections), GFM
            // pipe tables, and fenced code blocks. Plain DOM textContent
            // mangles tables (run-on cells) and loses code fences, which
            // makes the file useless to LLMs ingesting it.
            try {
              const extracted = await page.evaluate(() => {
                const pageTitle =
                  document.querySelector("main h1, [class*='docs-prose'] h1")
                    ?.textContent?.trim() ||
                  document.querySelector("h1")?.textContent?.trim() ||
                  document.title ||
                  "";
                const main = document.querySelector("main") || document.body;
                const clone = main.cloneNode(true);
                clone
                  .querySelectorAll("nav, aside, script, style, footer, button, [aria-hidden='true']")
                  .forEach((n) => n.remove());

                const norm = (s) =>
                  (s || "")
                    .replace(/\u00a0/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();

                const renderTable = (table) => {
                  const rows = Array.from(table.querySelectorAll("tr"));
                  if (!rows.length) return "";
                  const cells = rows.map((tr) =>
                    Array.from(tr.querySelectorAll("th,td")).map((c) =>
                      norm(c.textContent).replace(/\|/g, "\\|"),
                    ),
                  );
                  const width = Math.max(...cells.map((r) => r.length));
                  const pad = (r) => {
                    while (r.length < width) r.push("");
                    return r;
                  };
                  const header = pad(cells[0]);
                  const body = cells.slice(1).map(pad);
                  const sep = header.map(() => "---");
                  return [
                    "| " + header.join(" | ") + " |",
                    "| " + sep.join(" | ") + " |",
                    ...body.map((r) => "| " + r.join(" | ") + " |"),
                  ].join("\n");
                };

                const skipFirstH1 = { done: false };
                const walk = (node) => {
                  if (node.nodeType === Node.TEXT_NODE) {
                    return node.textContent.replace(/\u00a0/g, " ");
                  }
                  if (node.nodeType !== Node.ELEMENT_NODE) return "";
                  const tag = node.tagName.toLowerCase();
                  if (tag === "pre") {
                    const code = node.querySelector("code");
                    const lang =
                      (code &&
                        [...code.classList]
                          .find((c) => c.startsWith("language-"))
                          ?.slice(9)) ||
                      "";
                    const text = (code || node).textContent.replace(/\n+$/, "");
                    return `\n\n\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
                  }
                  if (tag === "code" && node.parentElement?.tagName !== "PRE") {
                    return "`" + node.textContent + "`";
                  }
                  if (tag === "table") {
                    return "\n\n" + renderTable(node) + "\n\n";
                  }
                  if (/^h[1-6]$/.test(tag)) {
                    const level = Number(tag[1]);
                    const text = norm(node.textContent);
                    if (!text) return "";
                    if (level === 1 && !skipFirstH1.done) {
                      skipFirstH1.done = true;
                      return "";
                    }
                    // Demote: page title is H1, everything else >= H2.
                    const demoted = Math.max(2, level);
                    return `\n\n${"#".repeat(demoted)} ${text}\n\n`;
                  }
                  if (tag === "li") {
                    const inner = Array.from(node.childNodes)
                      .map(walk)
                      .join("")
                      .trim();
                    return `- ${inner}\n`;
                  }
                  if (tag === "br") return "\n";
                  if (["p", "ul", "ol", "section", "div", "blockquote"].includes(tag)) {
                    const inner = Array.from(node.childNodes).map(walk).join("");
                    return inner + (["p", "blockquote"].includes(tag) ? "\n\n" : "\n");
                  }
                  return Array.from(node.childNodes).map(walk).join("");
                };

                let md = walk(clone);
                md = md
                  .replace(/[ \t]+\n/g, "\n")
                  .replace(/\n{3,}/g, "\n\n")
                  .trim();
                return { title: pageTitle, md };
              });
              const url = `https://docs.nexart.io${route === "/" ? "" : route}`;
              llmsFullSections.push(
                `# ${extracted.title}\n\nURL: ${url}\n\n${extracted.md}`,
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
