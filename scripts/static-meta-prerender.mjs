// Vite plugin: after build, write dist/<route>/index.html for every known
// route with a per-route <title>, <meta name="description">, canonical, and
// og:* tags injected into the SPA shell. Runs deterministically without
// puppeteer so it works on hosts that can't launch a headless browser.
// React still hydrates client-side; this just guarantees crawlers and
// link-preview bots see correct per-page metadata in the initial HTML.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const BASE_URL = "https://docs.nexart.io";

// Route -> { title, summary }. Keep in sync with src/pages/docs/*.tsx
// PageHeader props. Generated from source; update when adding routes.
const ROUTE_META = {
  "/docs/what-is-nexart": { title: "What is NexArt", summary: "NexArt turns AI and code executions into cryptographically verifiable evidence." },
  "/docs/getting-started": { title: "Getting Started", summary: "Pick the path that matches your use case: a single execution CER, or a multi-step Project Bundle." },
  "/docs/quickstart": { title: "Quickstart", summary: "Two integration paths: single execution CER, or multi-step Project Bundle. Pick one." },
  "/docs/architecture": { title: "NexArt Architecture", summary: "Canonical, normative reference for the NexArt protocol pipeline: capture, create, hash, attest, verify." },
  "/docs/cer-protocol": { title: "Certified Execution Record (CER) Protocol", summary: "Governance, verification semantics, and schema rules for the NexArt protocol." },
  "/docs/cer-record-management": { title: "CER Record Management", summary: "Operational lifecycle and enterprise control semantics for CER records." },
  "/docs/protocol-overview": { title: "Protocol Overview", summary: "How NexArt produces, attests, and verifies execution records." },
  "/docs/concepts/cer": { title: "Certified Execution Records", summary: "CERs are the core unit of proof in NexArt. They prove execution integrity, not just log events." },
  "/docs/concepts/project-bundles": { title: "Project Bundles", summary: "Structured collections of CERs for multi-step workflows." },
  "/docs/concepts/hashes": { title: "Certificate Hash vs Project Hash", summary: "Two hash types, two scopes. One for single executions, one for multi-step workflows." },
  "/docs/concepts/signed-receipts": { title: "Signed Receipts", summary: "The canonical trust artifact returned by a node after it certifies a CER." },
  "/docs/concepts/hash-timestamping": { title: "Hash-Only Timestamping", summary: "A receipt mode that signs only the certificateHash, proving existence at a specific time." },
  "/docs/concepts/verification-reports": { title: "Verification Reports", summary: "The result of validating a CER bundle and its attestation data." },
  "/docs/concepts/context-signals": { title: "Context Signals", summary: "Optional structured metadata recorded alongside an execution. May be hash-bound or supplemental." },
  "/docs/concepts/execution-context": { title: "Execution Context and Signals", summary: "How to capture structured execution signals with @nexart/signals and certify them with @nexart/ai-execution." },
  "/docs/sdk": { title: "AI Execution SDK", summary: "API reference for certifying AI executions, creating CER bundles, and working with CER packages." },
  "/docs/signals-sdk": { title: "Signals SDK", summary: "@nexart/signals — protocol-agnostic structured execution context with deterministic capture, integrity hashing, replay-safe diffing, and a builder API." },
  "/docs/cli": { title: "NexArt CLI", summary: "Command-line surface over the AI Execution SDK. Seal locally, certify optionally, verify anywhere." },
  "/docs/codemode-sdk": { title: "CodeMode SDK", summary: "@nexart/codemode-sdk v1.10.2 — deterministic generative execution environment for verifiable visual outputs." },
  "/docs/ui-renderer-sdk": { title: "UI Renderer SDK", summary: "@nexart/ui-renderer v0.9.1 — deterministic UI rendering for verifiable interface artifacts." },
  "/docs/attestation-node": { title: "Attestation Node", summary: "The server-side component that signs CERs and issues receipts." },
  "/docs/end-to-end-verification": { title: "From Execution to Public Verification", summary: "The complete end-to-end flow. Local verification proves integrity. Node registration anchors trust. Public verification is an independent witness." },
  "/docs/ai-execution": { title: "AI Execution CER", summary: "The smallest unit of proof in NexArt: a tamper-evident record of one AI execution step." },
  "/docs/verification-semantics": { title: "Verification Semantics", summary: "How to read verification results correctly: identity, reseal behavior, signals scope, and common pitfalls." },
  "/docs/project-bundle-registration": { title: "Project Bundle Registration", summary: "Registration turns a locally verified bundle into a publicly verifiable artifact on verify.nexart.io." },
  "/docs/verification-statuses-and-errors": { title: "Verification Statuses and Errors", summary: "Every verification outcome and node error, what most likely caused it, and what to do next." },
  "/docs/multi-step-and-multi-agent-workflows": { title: "Multi-step and Multi-agent Workflows", summary: "Without bundling, workflows produce logs. With bundling, they produce verifiable execution evidence." },
  "/docs/public-reseals-and-redacted-verification": { title: "Public Reseals and Redacted Verification", summary: "A reseal is a new public artifact, not the original record. It is independently signed and does not weaken the original's integrity." },
  "/docs/certifying-llm-conversations": { title: "Certifying LLM Conversations", summary: "End-to-end pattern for producing per-message and per-conversation Certified Execution Records inside your conversational AI application." },
  "/docs/verification": { title: "Verification", summary: "How to verify any NexArt record, with or without API access." },
  "/docs/verification-model": { title: "Verification Model", summary: "What NexArt verification proves, who can perform it, and the canonical rules every implementation must follow." },
  "/docs/external-verification": { title: "External Verification", summary: "Verify any NexArt Certified Execution Record from scratch using only JCS, SHA-256, and Ed25519 — no NexArt SDK required." },
  "/docs/independent-verification": { title: "Independent Verification", summary: "Verify any NexArt CER without NexArt SDKs using only the bundle, the node public keys, SHA-256, and Ed25519." },
  "/docs/verify-nexart": { title: "verify.nexart.io", summary: "The public verification portal for CERs and Project Bundles." },
  "/docs/browser-verification": { title: "Browser Verification", summary: "Verify CERs and Project Bundles directly in the browser using the async SDK." },
  "/docs/ai-cer-verification-layers": { title: "AI CER Verification Layers", summary: "How NexArt verifies AI Certified Execution Records across three independent trust layers." },
  "/docs/ai-cer-package-format": { title: "AI CER Package Format", summary: "Normative specification for the official NexArt AI CER package and bundle structure." },
  "/docs/trust-model": { title: "Trust Model", summary: "How NexArt establishes and verifies execution integrity." },
  "/docs/integration-surfaces": { title: "Integration Surfaces", summary: "All the ways you can connect to NexArt: API, verifier, CLI, n8n, and SDKs." },
  "/docs/cer-audit-workflows": { title: "CER Audit Workflows", summary: "How Certified Execution Records are packaged, exported, and consumed in audit, compliance, and review workflows." },
  "/docs/integrations": { title: "Integrations", summary: "Connect NexArt to your execution environment. Single-CER and Project Bundle paths are both supported." },
  "/docs/dashboard/projects": { title: "Projects", summary: "The primary organizational container in the NexArt dashboard." },
  "/docs/dashboard/apps": { title: "Apps", summary: "Organizational units within a project for grouping CER records by application or service." },
  "/docs/dashboard/auto-stamp": { title: "Auto-stamp", summary: "Project-level setting that controls automatic attestation during CER ingestion." },
  "/docs/dashboard/retention": { title: "Retention Policy", summary: "Project-level configuration for how long CER records are intended to be stored." },
  "/docs/dashboard/audit-exports": { title: "Audit Exports", summary: "Export verification and attestation information for audit review, analysis, and reporting." },
  "/docs/privacy": { title: "Privacy and Data Handling", summary: "How NexArt handles execution data, what gets stored, and who is responsible for personal data." },
  "/docs/examples": { title: "Examples", summary: "Copy-ready examples for API requests, responses, verification URLs, and data structures." },
  "/docs/integrations/n8n": { title: "n8n Integration", summary: "Certify AI execution results inside n8n workflows using the NexArt certification API." },
  "/docs/integrations/langchain": { title: "LangChain Integration", summary: "Generate Certified Execution Records (CERs) from LangChain workflows." },
  "/docs/agent-kit": { title: "Agent Kit", summary: "A thin convenience layer for producing verifiable execution records from agent tool calls and decisions." },
  "/docs/agent-kit-instructions": { title: "Agent-Kit Setup Instructions for AI Coding Agents", summary: "A prescriptive runbook for AI coding agents. Paste it into your AI assistant and it will install @nexart/agent-kit, certify an AI decision, and verify the bundle." },
  "/docs/python-bridge": { title: "Python Bridge", summary: "Use NexArt from Python via a thin bridge to the canonical JavaScript SDK. Shipped inside @nexart/agent-kit." },
  "/docs/guides": { title: "Builder Guides", summary: "Quick-start paths for common NexArt tasks." },
  "/docs/faq": { title: "FAQ", summary: "Common questions from builders integrating NexArt." },
  "/docs/security/key-management": { title: "Key Management and Rotation (NexArt Node)", summary: "How NexArt Node manages Ed25519 signing keys, rotates them safely, and maintains backward-compatible verification." },
  "/docs/builder-integration-guide": { title: "Builder Integration Guide (NexArt Canonical Node)", summary: "Which endpoint to call, how to shape the payload, and how to read the response so your execution gets a permanent, verifiable certificateHash." },
  "/": { title: "NexArt Docs", summary: "Official NexArt documentation: build, register, and verify Certified Execution Records (CERs)." },
};

const escAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const escHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function applyMeta(shell, route, meta) {
  const url = BASE_URL + (route === "/" ? "/" : route);
  const fullTitle = route === "/" ? meta.title : `${meta.title} — NexArt Docs`;
  let html = shell;

  // <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escHtml(fullTitle)}</title>`);

  // <meta name="description">
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escAttr(meta.summary)}" />`,
  );

  // og:title, twitter:title
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escAttr(fullTitle)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escAttr(fullTitle)}" />`,
  );

  // og:description, twitter:description
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escAttr(meta.summary)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escAttr(meta.summary)}" />`,
  );

  // og:url
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escAttr(url)}" />`,
  );

  // canonical: inject (or replace) right before </head>
  if (/<link\s+rel="canonical"/.test(html)) {
    html = html.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${escAttr(url)}" />`,
    );
  } else {
    html = html.replace(
      /<\/head>/,
      `  <link rel="canonical" href="${escAttr(url)}" />\n</head>`,
    );
  }
  return html;
}

function routeToFilePath(distDir, route) {
  if (route === "/") return join(distDir, "index.html");
  return join(distDir, route.replace(/^\/+/, ""), "index.html");
}

export default function staticMetaPrerender() {
  let distDir;
  let done = false;
  return {
    name: "nexart-static-meta-prerender",
    apply: "build",
    enforce: "post",
    configResolved(config) {
      distDir = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      if (done) return;
      done = true;
      const shellPath = join(distDir, "index.html");
      if (!existsSync(shellPath)) return;
      const shell = await readFile(shellPath, "utf8");

      // Reset / first so it ends up with neutral homepage meta (the puppeteer
      // plugin may have left it with /docs/getting-started content).
      const rootHtml = applyMeta(shell, "/", ROUTE_META["/"]);
      await writeFile(shellPath, rootHtml, "utf8");

      let written = 0;
      for (const route of Object.keys(ROUTE_META)) {
        if (route === "/") continue;
        const meta = ROUTE_META[route];
        if (!meta) continue;
        const out = applyMeta(shell, route, meta);
        const filePath = routeToFilePath(distDir, route);
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, out, "utf8");
        written++;
      }
      console.log(`[static-meta-prerender] wrote ${written} per-route HTML files with unique meta`);
    },
  };
}
