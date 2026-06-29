#!/usr/bin/env node
// Crawlability and LLM-index verification.
//
// For every docs route exposed by the SPA:
//   1. Confirm a non-empty prerendered HTML artifact exists in dist/.
//   2. Confirm the artifact contains real content (an <h1>) and a <title>.
//   3. Confirm dist/llms-full.txt was generated, is fresh, and has a section
//      for every route.
//
// Run after `vite build` (which triggers the prerender plugin) or against a
// deployed site by passing --remote=https://docs.nexart.io.
//
// Usage:
//   node scripts/verify-crawlability.mjs              # check local dist/
//   node scripts/verify-crawlability.mjs --remote=URL # fetch live site

import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../dist");

// Mirrors scripts/prerender-plugin.mjs ROUTES. Keep in sync with src/App.tsx.
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
  ROUTES.filter((r) => r !== "/").filter((r) =>
    ROUTES.some((c) => c !== r && c.startsWith(`${r}/`)),
  ),
);

const MIN_HTML_BYTES = 2_000;          // anything smaller is the SPA shell
const MAX_LLMS_FULL_AGE_MS = 24 * 3600 * 1000; // freshness window for local check

function routeToFilePath(route) {
  if (route === "/") return join(distDir, "index.html");
  if (PARENT_ROUTES.has(route)) {
    return join(distDir, route.replace(/^\/+/, ""), "index.html");
  }
  return join(distDir, route.replace(/^\/+/, ""));
}

function routeTitle(route) {
  if (route === "/") return "/";
  return route;
}

async function checkLocal() {
  const errors = [];
  const warnings = [];

  if (!existsSync(distDir)) {
    return {
      ok: false,
      errors: [`dist/ not found at ${distDir}. Run \`vite build\` first.`],
      warnings: [],
      stats: {},
    };
  }

  // 1. Per-route HTML artifacts.
  let bytesTotal = 0;
  let routesOk = 0;
  for (const route of ROUTES) {
    const file = routeToFilePath(route);
    if (!existsSync(file)) {
      errors.push(`MISSING html: ${routeTitle(route)} -> ${file}`);
      continue;
    }
    const buf = await readFile(file);
    bytesTotal += buf.byteLength;
    if (buf.byteLength < MIN_HTML_BYTES) {
      errors.push(
        `TOO SMALL: ${routeTitle(route)} (${buf.byteLength} bytes; SPA shell?)`,
      );
      continue;
    }
    const html = buf.toString("utf8");
    if (!/<h1[\s>]/i.test(html)) {
      errors.push(`NO <h1>: ${routeTitle(route)}`);
      continue;
    }
    if (!/<title>[^<]+<\/title>/i.test(html)) {
      warnings.push(`NO <title>: ${routeTitle(route)}`);
    }
    routesOk++;
  }

  // 2. llms-full.txt artifact.
  const llmsFullPath = join(distDir, "llms-full.txt");
  let llmsSections = 0;
  let llmsAgeMs = null;
  if (!existsSync(llmsFullPath)) {
    errors.push("MISSING dist/llms-full.txt (prerender plugin did not run).");
  } else {
    const [statRes, content] = await Promise.all([
      stat(llmsFullPath),
      readFile(llmsFullPath, "utf8"),
    ]);
    llmsAgeMs = Date.now() - statRes.mtimeMs;
    if (llmsAgeMs > MAX_LLMS_FULL_AGE_MS) {
      warnings.push(
        `llms-full.txt is ${(llmsAgeMs / 3600_000).toFixed(1)}h old (>24h). Rebuild before publish.`,
      );
    }

    // The prerender writes "URL: https://docs.nexart.io{route}" per page.
    for (const route of ROUTES) {
      const url = `https://docs.nexart.io${route === "/" ? "" : route}`;
      const needle = `URL: ${url}\n`;
      if (!content.includes(needle)) {
        errors.push(`llms-full.txt missing section for ${routeTitle(route)}`);
      } else {
        llmsSections++;
      }
    }

    const headerMatch = content.match(/Pages:\s*(\d+)/);
    if (headerMatch && Number(headerMatch[1]) !== ROUTES.length) {
      warnings.push(
        `llms-full.txt header reports ${headerMatch[1]} pages, expected ${ROUTES.length}.`,
      );
    }
  }

  // 3. llms.txt sanity (not regenerated, but should exist).
  const llmsIndexPath = join(distDir, "llms.txt");
  if (!existsSync(llmsIndexPath)) {
    warnings.push("dist/llms.txt missing (static index of doc URLs).");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: {
      routesChecked: ROUTES.length,
      routesOk,
      htmlBytesTotal: bytesTotal,
      llmsSections,
      llmsAgeHours: llmsAgeMs == null ? null : +(llmsAgeMs / 3600_000).toFixed(2),
    },
  };
}

async function checkRemote(base) {
  const errors = [];
  const warnings = [];
  const root = base.replace(/\/+$/, "");

  let routesOk = 0;
  for (const route of ROUTES) {
    const url = `${root}${route === "/" ? "" : route}`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) {
        errors.push(`HTTP ${res.status}: ${url}`);
        continue;
      }
      const html = await res.text();
      if (html.length < MIN_HTML_BYTES) {
        errors.push(`TOO SMALL: ${url} (${html.length} bytes)`);
        continue;
      }
      if (!/<h1[\s>]/i.test(html)) {
        errors.push(`NO <h1> in served HTML: ${url}`);
        continue;
      }
      routesOk++;
    } catch (err) {
      errors.push(`FETCH FAILED: ${url} (${err.message})`);
    }
  }

  // llms-full.txt remote.
  let llmsSections = 0;
  try {
    const res = await fetch(`${root}/llms-full.txt`);
    if (!res.ok) {
      errors.push(`llms-full.txt HTTP ${res.status} on remote.`);
    } else {
      const content = await res.text();
      for (const route of ROUTES) {
        const url = `https://docs.nexart.io${route === "/" ? "" : route}`;
        if (content.includes(`URL: ${url}\n`)) llmsSections++;
        else errors.push(`Remote llms-full.txt missing ${route}`);
      }
    }
  } catch (err) {
    errors.push(`llms-full.txt fetch failed: ${err.message}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: { routesChecked: ROUTES.length, routesOk, llmsSections },
  };
}

function printReport(label, result) {
  const { ok, errors, warnings, stats } = result;
  console.log(`\n=== Crawlability check: ${label} ===`);
  console.log("Stats:", JSON.stringify(stats, null, 2));
  if (warnings.length) {
    console.log(`\nWarnings (${warnings.length}):`);
    warnings.forEach((w) => console.log(`  ! ${w}`));
  }
  if (errors.length) {
    console.log(`\nErrors (${errors.length}):`);
    errors.forEach((e) => console.log(`  x ${e}`));
  }
  console.log(`\nResult: ${ok ? "PASS" : "FAIL"}`);
  return ok;
}

async function main() {
  const remoteArg = process.argv.find((a) => a.startsWith("--remote="));
  if (remoteArg) {
    const base = remoteArg.slice("--remote=".length);
    const result = await checkRemote(base);
    process.exit(printReport(`remote ${base}`, result) ? 0 : 1);
  } else {
    const result = await checkLocal();
    process.exit(printReport(`local ${distDir}`, result) ? 0 : 1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
