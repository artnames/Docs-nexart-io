#!/usr/bin/env node
// Smoke test: fetches every docs route (against a base URL) with JS
// disabled — i.e. plain HTTP GET — and asserts the initial HTML meets
// the LLM/crawler acceptance criteria:
//   1. HTTP 200
//   2. non-empty visible body text (> 500 chars after stripping tags)
//   3. correct <title> and <h1> for the route
//   4. does NOT duplicate /docs/getting-started content on other routes
//
// Usage:
//   node scripts/smoke-docs.mjs                  # against https://docs.nexart.io
//   node scripts/smoke-docs.mjs http://localhost:4179
//   BASE_URL=https://staging.example node scripts/smoke-docs.mjs

const BASE = process.argv[2] || process.env.BASE_URL || "https://docs.nexart.io";

// route -> expected <h1> text (exact match after trim).
const ROUTES = {
  "/docs/what-is-nexart": "What is NexArt",
  "/docs/getting-started": "Getting Started",
  "/docs/quickstart": "Quickstart",
  "/docs/architecture": "Architecture",
  "/docs/cer-protocol": "CER Protocol",
  "/docs/cer-record-management": "CER Record Management",
  "/docs/protocol-overview": "Protocol Overview",
  "/docs/concepts/cer": "Certified Execution Records",
  "/docs/concepts/project-bundles": "Project Bundles",
  "/docs/concepts/hashes": "Certificate Hash vs Project Hash",
  "/docs/concepts/signed-receipts": "Signed Receipts",
  "/docs/concepts/hash-timestamping": "Hash-Only Timestamping",
  "/docs/concepts/verification-reports": "Verification Reports",
  "/docs/concepts/context-signals": "Context Signals",
  "/docs/concepts/execution-context": "Execution Context",
  "/docs/sdk": "SDK",
  "/docs/signals-sdk": "Signals SDK",
  "/docs/cli": "NexArt CLI",
  "/docs/codemode-sdk": "CodeMode SDK",
  "/docs/ui-renderer-sdk": "UI Renderer SDK",
  "/docs/attestation-node": "Attestation Node",
  "/docs/end-to-end-verification": "End-to-End Verification",
  "/docs/ai-execution": "AI Execution CER",
  "/docs/verification-semantics": "Verification Semantics",
  "/docs/project-bundle-registration": "Project Bundle Registration",
  "/docs/verification-statuses-and-errors": "Verification Statuses and Errors",
  "/docs/multi-step-and-multi-agent-workflows": "Multi-Step and Multi-Agent Workflows",
  "/docs/public-reseals-and-redacted-verification": "Public Reseals and Redacted Verification",
  "/docs/certifying-llm-conversations": "Certifying LLM Conversations",
  "/docs/verification": "Verification",
  "/docs/verification-model": "Verification Model",
  "/docs/external-verification": "External Verification",
  "/docs/independent-verification": "Independent Verification",
  "/docs/verify-nexart": "Verify NexArt",
  "/docs/browser-verification": "Browser Verification",
  "/docs/ai-cer-verification-layers": "AI CER Verification Layers",
  "/docs/ai-cer-package-format": "AI CER Package Format",
  "/docs/trust-model": "Trust Model",
  "/docs/integration-surfaces": "Integration Surfaces",
  "/docs/cer-audit-workflows": "CER Audit Workflows",
  "/docs/integrations": "Integrations",
  "/docs/dashboard/projects": "Projects",
  "/docs/dashboard/apps": "Apps",
  "/docs/dashboard/auto-stamp": "Auto-Stamp",
  "/docs/dashboard/retention": "Retention Policy",
  "/docs/dashboard/audit-exports": "Audit Exports",
  "/docs/privacy": "Privacy & Data Handling",
  "/docs/examples": "Examples",
  "/docs/integrations/n8n": "n8n Integration",
  "/docs/integrations/langchain": "LangChain Integration",
  "/docs/agent-kit": "Agent-Kit",
  "/docs/agent-kit-instructions": "Agent-Kit Instructions for AI Agents",
  "/docs/python-bridge": "Python Bridge",
  "/docs/guides": "Builder Guides",
  "/docs/faq": "FAQ",
  "/docs/security/key-management": "Key Management",
  "/docs/confidential-mode": "Confidential Execution Mode",
  "/docs/builder-integration-guide": "Builder Integration Guide",
};

const MIN_BODY_CHARS = 500;

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extract(re, s) {
  const m = s.match(re);
  return m ? m[1].trim() : null;
}

async function check(route, expectedH1, gettingStartedFingerprint) {
  const url = BASE + route;
  const res = await fetch(url, { redirect: "follow" });
  const errors = [];
  if (res.status !== 200) errors.push(`HTTP ${res.status}`);
  const html = await res.text();

  const title = extract(/<title>([^<]+)<\/title>/i, html);
  const h1 = extract(/<h1[^>]*>([^<]+)<\/h1>/i, html);
  const bodyText = stripTags(html);

  if (bodyText.length < MIN_BODY_CHARS)
    errors.push(`body text too short (${bodyText.length} < ${MIN_BODY_CHARS})`);
  if (!title || !title.includes(expectedH1))
    errors.push(`title mismatch: got "${title}", expected to contain "${expectedH1}"`);
  if (h1 !== expectedH1)
    errors.push(`h1 mismatch: got "${h1}", expected "${expectedH1}"`);

  // Duplicate-of-getting-started guard.
  if (
    route !== "/docs/getting-started" &&
    gettingStartedFingerprint &&
    bodyText.includes(gettingStartedFingerprint)
  ) {
    errors.push(`content duplicates /docs/getting-started`);
  }

  return { route, ok: errors.length === 0, errors, title, h1, size: bodyText.length };
}

async function main() {
  console.log(`Smoke-testing ${Object.keys(ROUTES).length} routes against ${BASE}\n`);

  // Fingerprint = a distinctive sentence from Getting Started body used to
  // detect fallback/duplication on other routes.
  const gsRes = await fetch(BASE + "/docs/getting-started");
  const gsText = stripTags(await gsRes.text());
  // A stable, unique-to-GS phrase from the page copy.
  const fp = "Pick the path that matches your use case";
  const gsFingerprint = gsText.includes(fp) ? fp : null;

  let failed = 0;
  for (const [route, expectedH1] of Object.entries(ROUTES)) {
    const r = await check(route, expectedH1, gsFingerprint);
    if (r.ok) {
      console.log(`  ✓ ${route}  (${r.size} chars)`);
    } else {
      failed++;
      console.log(`  ✗ ${route}`);
      for (const e of r.errors) console.log(`      - ${e}`);
    }
  }

  console.log(
    `\n${failed === 0 ? "OK" : "FAIL"}: ${Object.keys(ROUTES).length - failed}/${Object.keys(ROUTES).length} routes passed`,
  );
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
