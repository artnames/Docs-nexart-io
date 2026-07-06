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

const ROUTE_TITLES = {
  "/": "Getting Started",
  "/docs/what-is-nexart": "What is NexArt",
  "/docs/getting-started": "Getting Started",
  "/docs/quickstart": "Quickstart",
  "/docs/architecture": "NexArt Architecture",
  "/docs/cer-protocol": "Certified Execution Record (CER) Protocol",
  "/docs/cer-record-management": "CER Record Management",
  "/docs/protocol-overview": "Protocol Overview",
  "/docs/concepts/cer": "Certified Execution Records",
  "/docs/concepts/project-bundles": "Project Bundles",
  "/docs/concepts/hashes": "Certificate Hash vs Project Hash",
  "/docs/concepts/signed-receipts": "Signed Receipts",
  "/docs/concepts/hash-timestamping": "Hash-Only Timestamping",
  "/docs/concepts/verification-reports": "Verification Reports",
  "/docs/concepts/context-signals": "Context Signals",
  "/docs/concepts/execution-context": "Execution Context and Signals",
  "/docs/sdk": "AI Execution SDK",
  "/docs/signals-sdk": "Signals SDK",
  "/docs/cli": "NexArt CLI",
  "/docs/codemode-sdk": "CodeMode SDK",
  "/docs/ui-renderer-sdk": "UI Renderer SDK",
  "/docs/attestation-node": "Attestation Node",
  "/docs/end-to-end-verification": "From Execution to Public Verification",
  "/docs/ai-execution": "AI Execution CER",
  "/docs/verification-semantics": "Verification Semantics",
  "/docs/project-bundle-registration": "Project Bundle Registration",
  "/docs/verification-statuses-and-errors": "Verification Statuses and Errors",
  "/docs/multi-step-and-multi-agent-workflows": "Multi-step and Multi-agent Workflows",
  "/docs/public-reseals-and-redacted-verification": "Public Reseals and Redacted Verification",
  "/docs/certifying-llm-conversations": "Certifying LLM Conversations",
  "/docs/verification": "Verification",
  "/docs/verification-model": "Verification Model",
  "/docs/external-verification": "External Verification",
  "/docs/independent-verification": "Independent Verification",
  "/docs/verify-nexart": "verify.nexart.io",
  "/docs/browser-verification": "Browser Verification",
  "/docs/ai-cer-verification-layers": "AI CER Verification Layers",
  "/docs/ai-cer-package-format": "AI CER Package Format",
  "/docs/trust-model": "Trust Model",
  "/docs/integration-surfaces": "Integration Surfaces",
  "/docs/cer-audit-workflows": "CER Audit Workflows",
  "/docs/integrations": "Integrations",
  "/docs/dashboard/projects": "Projects",
  "/docs/dashboard/apps": "Apps",
  "/docs/dashboard/auto-stamp": "Auto-stamp",
  "/docs/dashboard/retention": "Retention Policy",
  "/docs/dashboard/audit-exports": "Audit Exports",
  "/docs/privacy": "Privacy and Data Handling",
  "/docs/examples": "Examples",
  "/docs/integrations/n8n": "n8n Integration",
  "/docs/integrations/langchain": "LangChain Integration",
  "/docs/agent-kit": "Agent Kit",
  "/docs/agent-kit-instructions": "Agent-Kit Setup Instructions for AI Coding Agents",
  "/docs/python-bridge": "Python Bridge",
  "/docs/guides": "Builder Guides",
  "/docs/faq": "FAQ",
  "/docs/security/key-management": "Key Management and Rotation (NexArt Node)",
  "/docs/confidential-mode": "Confidential Execution Mode",
  "/docs/builder-integration-guide": "Builder Integration Guide (NexArt Canonical Node)",
};

const MIN_HTML_BYTES = 2_000;          // anything smaller is the SPA shell
const MAX_LLMS_FULL_AGE_MS = 24 * 3600 * 1000; // freshness window for local check

function routeToFilePath(route) {
  if (route === "/") return join(distDir, "index.html");
  // Prerender always writes <route>/index.html so hosts serve it as text/html.
  return join(distDir, route.replace(/^\/+/, ""), "index.html");
}

function routeTitle(route) {
  if (route === "/") return "/";
  return route;
}

function expectedMarkdownHref(route) {
  return route === "/" ? "/index.md" : `${route}.md`;
}

function expectedMarkdownRel(route) {
  return route === "/" ? "index.md" : route.replace(/^\/+/, "") + ".md";
}

function getH1(html) {
  return html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    ?.replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasExpectedMarkdownAlternate(html, route) {
  const href = expectedMarkdownHref(route).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`<link[^>]+rel=["']alternate["'][^>]+type=["']text/markdown["'][^>]+href=["']${href}["']`, "i").test(html);
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
    const h1 = getH1(html);
    if (!h1) {
      errors.push(`NO <h1>: ${routeTitle(route)}`);
      continue;
    }
    const expectedTitle = ROUTE_TITLES[route];
    if (expectedTitle && h1 !== expectedTitle) {
      errors.push(`WRONG <h1>: ${routeTitle(route)} expected "${expectedTitle}", got "${h1}"`);
      continue;
    }
    if (!/<title>[^<]+<\/title>/i.test(html)) {
      warnings.push(`NO <title>: ${routeTitle(route)}`);
    }
    // Duplicated DOCTYPE breaks strict HTML parsers (LLM crawlers report
    // the page as empty). Must appear exactly once.
    const doctypeCount = (html.match(/<!doctype\s+html/gi) || []).length;
    if (doctypeCount !== 1) {
      errors.push(
        `DUPLICATE DOCTYPE (${doctypeCount}): ${routeTitle(route)}`,
      );
      continue;
    }
    // Per-route markdown alternate must be advertised and resolvable.
    if (!hasExpectedMarkdownAlternate(html, route)) {
      errors.push(`NO markdown alternate <link>: ${routeTitle(route)}`);
      continue;
    }
    const mdRel = expectedMarkdownRel(route);
    const mdFile = join(distDir, mdRel);
    if (!existsSync(mdFile)) {
      errors.push(`MISSING .md shadow: ${routeTitle(route)} -> ${mdFile}`);
      continue;
    }
    const md = await readFile(mdFile, "utf8");
    if (expectedTitle && !md.startsWith(`# ${expectedTitle}\n`)) {
      errors.push(`WRONG .md shadow title: ${routeTitle(route)}`);
      continue;
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
      const h1 = getH1(html);
      if (!h1) {
        errors.push(`NO <h1> in served HTML: ${url}`);
        continue;
      }
      const doctypeCount = (html.match(/<!doctype\s+html/gi) || []).length;
      if (doctypeCount !== 1) {
        errors.push(`DUPLICATE DOCTYPE (${doctypeCount}): ${url}`);
        continue;
      }
      const expectedTitle = ROUTE_TITLES[route];
      if (expectedTitle && h1 !== expectedTitle) {
        errors.push(`WRONG <h1>: ${url} expected "${expectedTitle}", got "${h1}"`);
        continue;
      }
      if (!hasExpectedMarkdownAlternate(html, route)) {
        errors.push(`NO route-specific markdown alternate <link>: ${url}`);
        continue;
      }
      const mdRes = await fetch(`${root}${expectedMarkdownHref(route)}`, { redirect: "follow" });
      if (!mdRes.ok) {
        errors.push(`Markdown shadow HTTP ${mdRes.status}: ${root}${expectedMarkdownHref(route)}`);
        continue;
      }
      const md = await mdRes.text();
      if (expectedTitle && !md.startsWith(`# ${expectedTitle}\n`)) {
        errors.push(`WRONG remote .md title: ${root}${expectedMarkdownHref(route)}`);
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
