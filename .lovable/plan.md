# Phase 2B — Documentation Correction Plan

This is a **wording and consistency** pass. No SDK, CLI, node, verifier, hashing, signing, or timestamping logic is touched. `nexart.io` and `verify.nexart.io` are out of scope.

## 1. Scope of edits (documentation only)

I will search the entire `src/pages/docs/**` tree plus `public/llms.txt` / `public/llms-full.txt` / `public/agent-kit-instructions.md` for material inconsistencies against the canonical statements below, and only rewrite passages that actually conflict. Working links, navigation, JSON-LD, sitemap, and prerender pipeline stay as-is.

Preliminary scan already shows current pages that will likely need touch-ups:

- `Quickstart.tsx`, `GettingStarted.tsx`, `Examples.tsx` — identifier and trust-state phrasing, credential timing, remove any "5-minute" promise, mark illustrative hashes.
- `WhatIsNexArt.tsx`, `concepts/CER.tsx`, `concepts/ProjectBundles.tsx`, `concepts/Hashes.tsx` — sharpen certificate hash / Execution ID / Project Hash definitions.
- `Verification.tsx`, `VerificationModel.tsx`, `VerificationSemantics.tsx`, `IndependentVerification.tsx`, `ExternalVerification.tsx`, `EndToEndVerification.tsx`, `BrowserVerification.tsx`, `VerifyNexart.tsx` — three-state distinction (locally sealed / node-attested / externally timestamped), PASS wording, limitations paragraph, offline scope.
- `ConfidentialMode.tsx`, `BuilderIntegrationGuide.tsx` §5–5.1, `PrivacyDataHandling.tsx`, `FAQ.tsx` — replace any "raw data never leaves your environment" framing under 1.3.1 with the TLS + transient node-side sealing wording; keep the "not persisted, not certified" guarantees.
- `AttestationNode.tsx`, `TrustModel.tsx`, `ProtocolOverview.tsx`, `Architecture.tsx` — clarify attestation is optional trust material; timestamping is an additional evidence layer, not automatic.
- `SDK.tsx`, `NexArtCLI.tsx`, `CodeModeSDK.tsx`, `UIRendererSDK.tsx`, `AgentKit.tsx`, `SignalsSDK.tsx` — align version pins with the manifest (see §3); do NOT invent versions; do not describe published npm packages as "not publicly exposed."
- `IntegrationSurfaces.tsx` — the `verify.nexart.io/e/<executionId>` example is misleading (Execution ID is not a cryptographic identity); reword to lookup, not verification.
- `public/llms.txt`, `public/llms-full.txt`, `public/agent-kit-instructions.md` — mirror the corrected canonical statements.

## 2. Canonical wording I will use verbatim

**Certificate hash.** "The certificate hash is the cryptographic identity of one exact CER artifact. It is derived from the canonical certificate-bound content of that CER. The node does not invent the certificate hash."

**Execution ID.** "Execution ID is an application-level identifier used to locate or group records. It may be repeated depending on the application design and MUST NOT be treated as the cryptographic identity of a CER."

**Project Hash.** "The Project Hash is the cryptographic identity of one exact Project Bundle. It is derived from canonical Project Bundle content. It is not an Execution ID."

**Three trust states.**
- *Locally sealed* — certificate hash exists; integrity is checkable; no node signature is implied.
- *Node-attested* — node signature or attestation material is present and verifies under the published node public key.
- *Externally timestamped* — a valid external timestamp token (e.g. RFC 3161 TSA) is present and provides third-party time evidence for the signed record. This is an additional layer, not an automatic property of every CER.

**PASS wording** — used exactly as specified in the request for Certificate hash PASS, Signature PASS, External timestamp PASS.

**Limitations.** "Verification confirms integrity and applicable trust material. It does not establish that the AI output was correct, fair, lawful, or complete. The completeness and truthfulness of the recorded execution data depend on the integration and capture boundary."

**Credentials.**
- Creating and verifying a local sealed record may not require a NexArt account.
- Anyone can verify a public or exported record without an account.
- Obtaining node attestation requires a NexArt API key or approved credentials.
- Hosted public lookup may require the artifact to have been registered or certified.

**Confidential execution (Protocol 1.3.1).** "Raw `input` and `output` are transmitted over TLS to the attestation node for node-side sealing, processed transiently, and excluded from the permanent confidential proof record. They are never persisted by the node and never included in the certified snapshot; only HMAC-SHA256 commitment envelopes are." Explicitly do NOT claim raw values never leave the customer environment for this flow. Any separate client-side commitment flow will be labelled as such only if it actually exists in the SDK; otherwise it will not be described.

## 3. Version source of truth

Docs currently pin versions in per-page prose. I will:

1. Add `src/data/versions.ts` and a documented `docs/versions.json` sync file with fields:
   - `sourceUrl` (authoritative origin — the nexart.io public version manifest URL as recorded in project memory),
   - `lastVerified` (ISO date of this pass),
   - separate keys: `protocolVersions[]`, `canonicalizationProfiles[]`, `cerSchemaVersion`, `packages{...}`, `cli`, `nodeRuntime`, `verifierRuntime`.
2. Seed values from project memory (`@nexart/ai-execution@1.2.0`, `@nexart/agent-kit@0.5.3`, `@nexart/cli@1.0.0`, `@nexart/signals@0.8.2`, `@nexart/codemode-sdk@1.12.0`, `@nexart/ui-renderer@0.9.1`, protocolVersions `1.2.0`/`1.3.0`/`1.3.1`, canonicalization profiles `nexart-v1`/`jcs-v1`, schema `version: "0.1"`).
3. Reference this file from a new short section on `ProtocolOverview.tsx` and cross-link it from SDK/CLI pages. I will not invent any value that isn't already in project memory; if a value isn't known I'll leave the existing prose untouched and flag it in the report.

## 4. Samples & examples

- Mark all inline hashes (`sha256:...`, `exec_abc123`, `n8n-demo-001`) as illustrative placeholders where they aren't already.
- Do not add or "test" public verifier URLs against `verify.nexart.io` (out of scope). I will only confirm that any docs-side sample URL is syntactically the documented shape (`/c/<certificateHash>`, `/p/<projectHash>`) and remove any misleading `/e/<executionId>` verification example.
- Package/CLI commands: keep the currently documented `bun add @nexart/ai-execution` / `npm install` shape; I will not execute installs against the real registry from this sandbox.

## 5. Verification I will run

- `bun run build` (typecheck + Vite build; picks up prerender + smoke plugins).
- `node scripts/verify-crawlability.mjs` and `node scripts/smoke-docs.mjs http://localhost:4179` against the local preview to confirm no route regressed.
- Manual re-read diff of every touched file.

I will NOT run anything against `nexart.io`, `verify.nexart.io`, the node, or any package registry.

## 6. Deliverable

A single response containing all 12 required evidence items plus the 8 final yes/no answers, based only on files actually changed in this pass.

## 7. Open question before I start

**The version manifest URL.** The request says "Use the approved values from the NexArt.io public version manifest or another authoritative shared source" and forbids invented values. Project memory has package versions but no manifest URL. Two options:

- **A. Use project-memory versions as the authoritative source**, record `sourceUrl: "mem://product/package-versions"` and `lastVerified: 2026-07-15` in `docs/versions.json`. Safe, no invention, aligned with the "documented synchronisation file" fallback in the brief.
- **B. You provide the canonical manifest URL** (e.g. `https://nexart.io/.well-known/nexart-versions.json`) and I wire the docs to reference it as `sourceUrl` without fetching at build time.

I will proceed with **A** unless you tell me otherwise, since it's the only option that avoids inventing a URL.
