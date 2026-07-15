import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# NexArt Canonical Node - Builder Integration Guide

Audience: developers and AI agents integrating a system that needs to be certified by the NexArt Canonical Node.

## 30-second mental model
The node takes a description of an execution (AI call or creative code), seals it deterministically, and returns a signed certificate that anyone can verify offline.

Two non-negotiable rules:
1. One executionId -> one certificateHash, forever. Re-submitting the same executionId with the same content replays the original certificate. Re-submitting it with different content is rejected (409 EXECUTION_MUTATION_DETECTED).
2. The node fails hard. Missing or malformed fields return a 4xx with a precise error. The node never silently strips or fixes input.

## Flow selection
- AI Execution (standard) -> POST /v1/cer/ai/certify (protocolVersion omitted or "1.2.0" / "1.3.0").
- AI Execution (confidential, sensitive I/O) -> POST /v1/cer/ai/certify with protocolVersion "1.3.1".
- Code Mode (p5.js render) -> POST /api/render, then POST /verify.
- Verify an existing certificate -> POST /v1/cer/verify or GET /v1/cer/public.
- Project bundle -> POST /v1/project-bundle/register.

## Authentication
All certifying endpoints require: Authorization: Bearer <api_key>.
- Missing/invalid bearer -> 401 UNAUTHORIZED.
- DB unavailable -> 503 SERVICE_UNAVAILABLE (fails closed).
Public verification endpoints (POST /v1/cer/verify, GET /v1/cer/public, GET /api/public-cer-proof) need no API key.

## Protocol versions accepted by the node
- (omitted) / "1.2.0" -> default, nexart-v1 canonicalization, hash-bound certificate.
- "1.3.0" -> transitional, jcs-v1 (RFC 8785) canonicalization auto-selected, plaintext snapshot.
- "1.3.1" -> confidential AI execution. Node seals raw input/output into commitment envelopes server-side.
Any other value -> 400 VALIDATION_ERROR.
All hashes are SHA-256 strings: sha256:<64-lowercase-hex>.

## AI Execution - standard (1.2.0 / 1.3.0)
Endpoint: POST /v1/cer/ai/certify.
Required: provider, model, and exactly one of (input | inputHash) and one of (output | outputHash).
Recommended: executionId (stable, unique, idempotent).
Optional: protocolVersion, parameters, modelVersion, appId, metadata, context (must have context.signals: []), timestamp, createdAt.
Rule: submitting both input and inputHash (or both output and outputHash) is rejected with 400.
Preview endpoint: POST /v1/cer/ai/create returns the bundle and certificateHash WITHOUT signing or persisting.

## AI Execution - confidential (1.3.1)
Endpoint: POST /v1/cer/ai/certify.
Required: protocolVersion "1.3.1", provider, model, raw input, raw output, prompt (non-empty), parameters object with { temperature, maxTokens, topP, seed } (topP and seed may be null, others must be finite numbers).
Forbidden: inputHash, outputHash. Submitting either -> 400.
Behaviour: node seals raw input/output into commitment envelopes (HMAC-SHA256, scheme "hmac-sha256-v1"). Salts are derived deterministically from executionId so retries are idempotent and produce the same commitments and certificateHash. Raw input and output are transmitted over TLS and processed transiently. They are excluded from the certified snapshot and from proof_json, and the documented confidential flow is designed not to persist them and to strip them from failure-path logging.
Code Mode rejects 1.3.1 explicitly. There is no raw AI I/O to seal there.
Verification verdict for a 1.3.1 record: SDK verdict VERIFIED_CONFIDENTIAL, classification VERIFIED, content-mode HASH_BOUND.

## Certify response (200)
Returns: ok, cer, certificateHash, bundleType, createdAt, attestationId, nodeRuntimeHash, protocolVersion, issuedAt, kid, attestorKeyId, attestation, receipt, signature (Ed25519 base64url over the receipt), verificationEnvelope, verificationEnvelopeSignature, timestamp { type: "rfc3161" | "node-issued", status, provider, token }, verificationUrl, requestId.
Header: X-Certificate-Hash mirrors certificateHash.
Persist certificateHash + executionId on the client side. They are the lookup keys.

## Code Mode certification (p5.js)
POST /api/render (authenticated): { code, seed?, VAR?, width?, height?, protocolVersion? }. Canvas is fixed at 1950 x 2400; supplying any other width/height -> 400. Public POST /render is disabled in production. With Accept: application/json returns { pngBase64, runtimeHash, width, height, sdkVersion, protocolVersion, executionTimeMs }; otherwise returns raw image/png with header X-Runtime-Hash.
POST /verify (authenticated): { snapshot: { code, seed, vars, execution: { mode, totalFrames, fps } }, expectedHash?, expectedAnimationHash?, expectedPosterHash? }. Loop mode triggers when execution.mode === "loop" or draw() is defined and totalFrames > 1. totalFrames must be 2..MAX_TOTAL_FRAMES (default 1800, operator-configurable). Loop mode requires a draw() function; missing -> 400 LOOP_MODE_ERROR, never falls back to static.

## Verifying a certificate (no API key)
POST /v1/cer/verify with { bundle } returns { status: "verified" | "failed", reasonCode, checks { structure, certificateHash, inputHash, outputHash, signature }, computedCertificateHash, classification: VERIFIED | LEGACY_VERIFIED | UNVERIFIABLE | FAILED, timestamp }.
GET /v1/cer/public?certificate_hash=<sha256:...> OR ?execution_id=<id> returns the stored proof plus a canonical block enabling external verifiers to verify by direct hashing and direct Ed25519 verification.
GET /api/public-cer-proof is the privacy-preserving variant. Both return 404 for records hidden/deleted by retention.

## Project bundles
POST /v1/project-bundle/register (authenticated): { bundleType: "cer.project.bundle.v1", integrity: { projectHash }, totalSteps, stepRegistry: [{ stepId, certificateHash }], embeddedBundles }.
POST /v1/project-bundle/verify (public): { bundle } returns per-step pass/fail plus submitted-vs-computed projectHash check.

## Error catalogue
- 400 VALIDATION_ERROR: missing/malformed field. Response carries details[].
- 400 LOOP_MODE_ERROR: totalFrames out of 2..MAX_TOTAL_FRAMES (default 1800), or loop with no draw().
- 401 UNAUTHORIZED: missing/invalid Bearer.
- 409 EXECUTION_MUTATION_DETECTED: same executionId with mutated content. Original record is preserved.
- 422 PROTOCOL_SCHEMA_UNSATISFIED: content fails the requested protocol's SDK check.
- 500 ATTESTATION_ERROR / INTERNAL_ERROR.
- 503 SERVICE_UNAVAILABLE: DB unavailable. Fails closed; retry later.

## Idempotency and determinism
- Always send your own executionId.
- True retry (same executionId, same content) replays the original certificate; same certificateHash returned.
- Conflicting retry (same executionId, changed content) -> 409.
- 1.3.1 sealing salts are derived deterministically from executionId; commitments and certificateHash are stable across retries.
- For fully reproducible hashes in standard mode also send a fixed createdAt and timestamp; otherwise the node mints a fresh createdAt on first certify (still idempotent for true retries via replay).`;

const BuilderIntegrationGuide = () => (
  <>
    <PageHeader
      title="Builder Integration Guide"
      summary="The practical 'get certified' reference. Which endpoint to call, how to shape the payload, and how to read the response."
      llmBlock={llmBlock}
    />

    <p>
      This is the practical companion to the deeper protocol documentation. It mirrors the canonical
      builder integration guide shipped with the NexArt Canonical Node. For the full wire contract
      (envelope projection, signature pseudocode, key discovery, every endpoint), see{" "}
      <Link to="/docs/attestation-node" className="text-primary hover:underline">Attestation Node</Link> and{" "}
      <Link to="/docs/independent-verification" className="text-primary hover:underline">Independent Verification</Link>.
    </p>

    <h2 id="mental-model">1. The 30-Second Mental Model</h2>
    <p>The node does one job: take a description of something that was executed (either creative code or an AI model call), run/seal it deterministically, and return a signed certificate that anyone can later verify offline.</p>
    <CodeBlock
      title="Flow"
      language="text"
      code={`your system  ->  choose a flow  ->  POST a payload  ->  node returns certificateHash + signature
                                                            |
                                                            v
                                              anyone can verify it later, forever`}
    />
    <p>Two non-negotiable rules to design around:</p>
    <ol>
      <li><strong>One <code>executionId</code> &rarr; one <code>certificateHash</code>, forever.</strong> Re-submitting the same <code>executionId</code> with the same content replays the original certificate. Re-submitting it with different content is rejected (<code>409</code>). Pick a stable, unique <code>executionId</code> per real execution.</li>
      <li><strong>The node fails hard.</strong> It never "fixes" or silently strips input. If a field is missing or malformed, you get a <code>4xx</code> with a precise error - not a best-effort guess.</li>
    </ol>

    <h2 id="flow-selection">2. Which Flow Do I Need?</h2>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 border-b border-border">Situation</th>
            <th className="text-left px-4 py-3 border-b border-border">Flow</th>
            <th className="text-left px-4 py-3 border-b border-border">Endpoint</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border"><td className="px-4 py-3">Ran an AI model and want to certify the call</td><td className="px-4 py-3">AI Execution</td><td className="px-4 py-3 font-mono text-xs">POST /v1/cer/ai/certify</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3">AI input/output is sensitive, must never be stored in plaintext</td><td className="px-4 py-3">AI Execution - Confidential (1.3.1)</td><td className="px-4 py-3 font-mono text-xs">POST /v1/cer/ai/certify with protocolVersion "1.3.1"</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3">Ran creative code (p5.js) and want to certify the render</td><td className="px-4 py-3">Code Mode</td><td className="px-4 py-3 font-mono text-xs">POST /api/render, POST /verify</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3">Verify an existing certificate</td><td className="px-4 py-3">Verification</td><td className="px-4 py-3 font-mono text-xs">POST /v1/cer/verify / GET /v1/cer/public</td></tr>
          <tr><td className="px-4 py-3">Tying multiple certified steps into one project</td><td className="px-4 py-3">Project Bundle</td><td className="px-4 py-3 font-mono text-xs">POST /v1/project-bundle/register</td></tr>
        </tbody>
      </table>
    </div>
    <p><strong>Decision tree for AI Execution.</strong> Is the input/output sensitive (PII, private prompts, customer data)?</p>
    <ul>
      <li><strong>YES</strong> &rarr; use <code>protocolVersion: "1.3.1"</code> (node seals raw I/O server-side).</li>
      <li><strong>NO</strong> &rarr; use the default (omit <code>protocolVersion</code> &rarr; <code>"1.2.0"</code>); submit hashes or raw I/O.</li>
    </ul>

    <h2 id="auth">3. Authentication</h2>
    <p>Every certifying endpoint is authenticated with a Bearer API key:</p>
    <CodeBlock language="text" code={`Authorization: Bearer <your_api_key>`} />
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead><tr className="bg-muted/50"><th className="text-left px-4 py-3 border-b border-border">Situation</th><th className="text-left px-4 py-3 border-b border-border">Response</th></tr></thead>
        <tbody>
          <tr className="border-b border-border"><td className="px-4 py-3">Header missing or not <code>Bearer ...</code></td><td className="px-4 py-3 font-mono text-xs">401 {`{ "error": "UNAUTHORIZED" }`}</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3">Key invalid / inactive</td><td className="px-4 py-3 font-mono text-xs">401 {`{ "error": "UNAUTHORIZED" }`}</td></tr>
          <tr><td className="px-4 py-3">Database temporarily unavailable</td><td className="px-4 py-3 font-mono text-xs">503 {`{ "error": "SERVICE_UNAVAILABLE" }`} (fails closed)</td></tr>
        </tbody>
      </table>
    </div>
    <p>Public verification/lookup endpoints (<code>POST /v1/cer/verify</code>, <code>GET /v1/cer/public</code>, <code>GET /api/public-cer-proof</code>) need no API key. Admin endpoints (<code>/v1/admin/*</code>) use the <code>X-Admin-Secret</code> header and are not part of normal integration.</p>

    <h2 id="protocol-versions">4. Protocol Versions Accepted by the Node</h2>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead><tr className="bg-muted/50"><th className="text-left px-4 py-3 border-b border-border">Version</th><th className="text-left px-4 py-3 border-b border-border">When it applies</th><th className="text-left px-4 py-3 border-b border-border">Behaviour</th></tr></thead>
        <tbody>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">(omitted) / "1.2.0"</td><td className="px-4 py-3">Default</td><td className="px-4 py-3">Standard hash-bound certificate. Byte-identical to legacy.</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">"1.3.0"</td><td className="px-4 py-3">Transitional (still accepted)</td><td className="px-4 py-3">Standard certificate, JCS (RFC 8785) canonicalization auto-selected.</td></tr>
          <tr><td className="px-4 py-3 font-mono text-xs">"1.3.1"</td><td className="px-4 py-3">Confidential AI execution</td><td className="px-4 py-3">Node seals raw input/output into commitments server-side.</td></tr>
        </tbody>
      </table>
    </div>
    <p>The node currently accepts <code>1.2.0</code>, <code>1.3.0</code>, and <code>1.3.1</code>. The recommended default for new confidential work is <code>1.3.1</code> (advertised by <code>GET /</code>). Any other value is rejected with <code>400 VALIDATION_ERROR</code>.</p>
    <p>All hashes are SHA-256 in the form <code>sha256:&lt;64-lowercase-hex&gt;</code> - never raw hex, never base64.</p>

    <h2 id="ai-standard">5. AI Execution - Standard Certification</h2>

    <h3 id="preview"><code>POST /v1/cer/ai/create</code> - preview (no signing, no storage)</h3>
    <p>Use this to see the bundle and its <code>certificateHash</code> before committing. It does not sign or persist anything. Same request shape as certify.</p>

    <h3 id="certify"><code>POST /v1/cer/ai/certify</code> - sign and persist</h3>
    <p>This is the endpoint that produces a permanent, signed certificate. Required and optional fields for standard mode (<code>1.2.0</code> / <code>1.3.0</code>):</p>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead><tr className="bg-muted/50"><th className="text-left px-4 py-3 border-b border-border">Field</th><th className="text-left px-4 py-3 border-b border-border">Type</th><th className="text-left px-4 py-3 border-b border-border">Required</th><th className="text-left px-4 py-3 border-b border-border">Notes</th></tr></thead>
        <tbody>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">provider</td><td className="px-4 py-3">string</td><td className="px-4 py-3">yes</td><td className="px-4 py-3">e.g. <code>"openai"</code></td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">model</td><td className="px-4 py-3">string</td><td className="px-4 py-3">yes</td><td className="px-4 py-3">e.g. <code>"gpt-4o"</code></td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">input</td><td className="px-4 py-3">string</td><td className="px-4 py-3">one of <code>input</code> / <code>inputHash</code></td><td className="px-4 py-3">raw prompt/input text</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">inputHash</td><td className="px-4 py-3">string</td><td className="px-4 py-3">one of <code>input</code> / <code>inputHash</code></td><td className="px-4 py-3"><code>sha256:&lt;hex&gt;</code>; submit this to keep input private</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">output</td><td className="px-4 py-3">string</td><td className="px-4 py-3">one of <code>output</code> / <code>outputHash</code></td><td className="px-4 py-3">raw model output</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">outputHash</td><td className="px-4 py-3">string</td><td className="px-4 py-3">one of <code>output</code> / <code>outputHash</code></td><td className="px-4 py-3"><code>sha256:&lt;hex&gt;</code></td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">executionId</td><td className="px-4 py-3">string</td><td className="px-4 py-3">recommended</td><td className="px-4 py-3">Your stable unique id. Auto-generated if omitted, but then you lose idempotency control.</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">protocolVersion</td><td className="px-4 py-3">string</td><td className="px-4 py-3">optional</td><td className="px-4 py-3">omit for <code>1.2.0</code></td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">parameters</td><td className="px-4 py-3">object</td><td className="px-4 py-3">optional</td><td className="px-4 py-3">model params (temperature, etc.)</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">modelVersion</td><td className="px-4 py-3">string</td><td className="px-4 py-3">optional</td><td className="px-4 py-3">-</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">appId</td><td className="px-4 py-3">string</td><td className="px-4 py-3">optional</td><td className="px-4 py-3">-</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">metadata</td><td className="px-4 py-3">object</td><td className="px-4 py-3">optional</td><td className="px-4 py-3">opaque, echoed back, not hashed</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">context</td><td className="px-4 py-3">object</td><td className="px-4 py-3">optional</td><td className="px-4 py-3">if present, must contain <code>context.signals: []</code> (array)</td></tr>
          <tr><td className="px-4 py-3 font-mono text-xs">timestamp / createdAt</td><td className="px-4 py-3">ISO-8601 string</td><td className="px-4 py-3">optional</td><td className="px-4 py-3">supply for fully reproducible hashes on retry</td></tr>
        </tbody>
      </table>
    </div>
    <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
      You MAY submit <code>input</code> OR <code>inputHash</code>, never both (same for <code>output</code>). Providing both returns <code>400</code>. To keep content private, submit the hash form.
    </p>
    <CodeBlock
      title="Minimal example - private, hash-only"
      language="bash"
      code={`curl -X POST https://node.nexart.io/v1/cer/ai/certify \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "openai",
    "model": "gpt-4o",
    "executionId": "exec-2026-06-29-abc123",
    "inputHash": "sha256:5f2c...e9",
    "outputHash": "sha256:91a0...4d",
    "parameters": { "temperature": 0.7 }
  }'`}
    />

    <h2 id="bind-identity">5.1 Binding Identity / PII into the Certificate (Where It Must Go)</h2>
    <p>
      A common requirement is to bind a person's identity (name, email, customer id, or any PII) to the
      certificate so the proof is provably about that subject - without storing the PII in plaintext.
    </p>
    <p>
      The node builds the certified snapshot from a fixed set of fields. Any unknown top-level field you
      invent (e.g. <code>identity</code>) is silently dropped - it will NOT be bound by
      <code> certificateHash</code>, and it will NOT raise an error. That silent drop is the trap: it
      looks like it worked, but the binding is fake.
    </p>
    <p>Here is exactly where each field lands under <code>1.3.1</code>:</p>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead><tr className="bg-muted/50"><th className="text-left px-4 py-3 border-b border-border">Where you put it</th><th className="text-left px-4 py-3 border-b border-border">Bound by <code>certificateHash</code>?</th><th className="text-left px-4 py-3 border-b border-border">Stored / visible?</th><th className="text-left px-4 py-3 border-b border-border">Use for PII?</th></tr></thead>
        <tbody>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">input / output</td><td className="px-4 py-3">Yes (via the sealed commitment)</td><td className="px-4 py-3">Never stored raw - confidential</td><td className="px-4 py-3"><strong>Yes - put PII here</strong></td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">prompt, provider, model, parameters, executionId, context</td><td className="px-4 py-3">Yes</td><td className="px-4 py-3">Plaintext (stored and echoed)</td><td className="px-4 py-3">No</td></tr>
          <tr><td className="px-4 py-3 font-mono text-xs">metadata</td><td className="px-4 py-3">No (outside the hash perimeter)</td><td className="px-4 py-3">Plaintext</td><td className="px-4 py-3">No</td></tr>
        </tbody>
      </table>
    </div>
    <p>
      <strong>Rule of thumb:</strong> the only slot that is both bound by <code>certificateHash</code>
      and confidential is <code>input</code> / <code>output</code>. To bind PII, embed it inside
      <code> input</code> (or <code>output</code>) - typically as a JSON-encoded string so it stays
      structured and deterministic:
    </p>
    <CodeBlock
      title="Binding identity into the sealed input (1.3.1)"
      language="json"
      code={`{
  "protocolVersion": "1.3.1",
  "provider": "openai",
  "model": "gpt-4o",
  "executionId": "exec-2026-06-29-user-7f3a",
  "prompt": "Generate the onboarding summary.",
  "input": "{\\"identity\\":{\\"name\\":\\"Jane Doe\\",\\"email\\":\\"jane@example.com\\"},\\"content\\":\\"<the actual model input>\\"}",
  "output": "<the raw model output>",
  "parameters": { "temperature": 0.2, "maxTokens": 1024, "topP": 0.95, "seed": 42 }
}`}
    />
    <p>
      Result: the identity is sealed into the commitment, bound by <code>certificateHash</code>, and
      never stored or logged in plaintext. There is no separate sealed <code>identity</code> slot in the
      <code> 1.3.1</code> schema - <code>input</code> / <code>output</code> is the mechanism. Keep
      <code> prompt</code> non-empty and PII-free; it is bound by the hash but stored in plaintext.
    </p>
    <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
      Do NOT put PII in <code>prompt</code>, <code>context</code>, or <code>metadata</code>.
      <code> prompt</code>/<code>context</code> are bound by the hash but stored in plaintext;
      <code> metadata</code> is not bound at all, so it provides no real cryptographic binding.
    </p>

    <h2 id="ai-confidential">6. AI Execution - Confidential Certification (1.3.1)</h2>
    <p>
      Use this when the raw input/output must never be stored, but you still want a verifiable certificate.
      The node seals your raw values into cryptographic commitments server-side; the raw text never enters
      the certificate, the signed envelope, the local ledger, persistent storage, or the logs. See{" "}
      <Link to="/docs/confidential-mode" className="text-primary hover:underline">Confidential Execution</Link>{" "}
      for the full model.
    </p>
    <p>
      <strong>Key difference from standard mode:</strong> with <code>1.3.1</code> you submit raw <code>input</code>/<code>output</code>
      and the node hashes them for you. Submitting pre-computed hashes is rejected - the node must see
      the raw values to seal them.
    </p>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead><tr className="bg-muted/50"><th className="text-left px-4 py-3 border-b border-border">Field</th><th className="text-left px-4 py-3 border-b border-border">Type</th><th className="text-left px-4 py-3 border-b border-border">Required</th><th className="text-left px-4 py-3 border-b border-border">Notes</th></tr></thead>
        <tbody>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">protocolVersion</td><td className="px-4 py-3">"1.3.1"</td><td className="px-4 py-3">yes</td><td className="px-4 py-3">turns on confidential sealing</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">provider</td><td className="px-4 py-3">string</td><td className="px-4 py-3">yes</td><td className="px-4 py-3">-</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">model</td><td className="px-4 py-3">string</td><td className="px-4 py-3">yes</td><td className="px-4 py-3">-</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">input</td><td className="px-4 py-3">string (raw)</td><td className="px-4 py-3">yes</td><td className="px-4 py-3">node seals it; never stored raw</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">output</td><td className="px-4 py-3">string (raw)</td><td className="px-4 py-3">yes</td><td className="px-4 py-3">node seals it; never stored raw</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">prompt</td><td className="px-4 py-3">string</td><td className="px-4 py-3">yes</td><td className="px-4 py-3">non-empty; stays plaintext (part of the certified record)</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">parameters</td><td className="px-4 py-3">object</td><td className="px-4 py-3">yes</td><td className="px-4 py-3">must be <code>{`{ temperature, maxTokens, topP, seed }`}</code></td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">parameters.temperature</td><td className="px-4 py-3">number</td><td className="px-4 py-3">yes</td><td className="px-4 py-3">finite number</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">parameters.maxTokens</td><td className="px-4 py-3">number</td><td className="px-4 py-3">yes</td><td className="px-4 py-3">finite number</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">parameters.topP</td><td className="px-4 py-3">number | null</td><td className="px-4 py-3">yes</td><td className="px-4 py-3">finite number or null</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">parameters.seed</td><td className="px-4 py-3">number | null</td><td className="px-4 py-3">yes</td><td className="px-4 py-3">finite number or null</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">inputHash / outputHash</td><td className="px-4 py-3">-</td><td className="px-4 py-3"><strong>forbidden</strong></td><td className="px-4 py-3">submitting either &rarr; 400</td></tr>
          <tr><td className="px-4 py-3 font-mono text-xs">executionId</td><td className="px-4 py-3">string</td><td className="px-4 py-3">recommended</td><td className="px-4 py-3">stable id; drives deterministic sealing</td></tr>
        </tbody>
      </table>
    </div>
    <CodeBlock
      title="Confidential example - protocolVersion 1.3.1"
      language="bash"
      code={`curl -X POST https://node.nexart.io/v1/cer/ai/certify \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "protocolVersion": "1.3.1",
    "provider": "openai",
    "model": "gpt-4o",
    "executionId": "exec-2026-06-29-private-001",
    "prompt": "Summarize the attached medical record.",
    "input": "<<raw sensitive input text>>",
    "output": "<<raw sensitive model output>>",
    "parameters": { "temperature": 0.2, "maxTokens": 1024, "topP": 0.95, "seed": 42 }
  }'`}
    />
    <p><strong>What the node guarantees for 1.3.1:</strong></p>
    <ul>
      <li>Raw <code>input</code>/<code>output</code> are sealed into commitment envelopes; only the envelopes and their hashes are certified and stored.</li>
      <li>The same <code>executionId</code> always produces the same commitment and <code>certificateHash</code> (deterministic salts) - so retries are idempotent.</li>
      <li>On any failure path, raw I/O is stripped before anything is logged or persisted.</li>
      <li>Verifying the result returns SDK verdict <code>VERIFIED_CONFIDENTIAL</code> / classification <code>VERIFIED</code>, content-mode <code>HASH_BOUND</code>.</li>
      <li>The Code-Mode render path explicitly rejects <code>1.3.1</code> - there is no raw AI I/O to seal there.</li>
    </ul>

    <h2 id="response">7. The Certify Response</h2>
    <p>Both standard and confidential certify return the same envelope shape on success (HTTP 200):</p>
    <CodeBlock
      title="200 OK response"
      language="json"
      code={`{
  "ok": true,
  "cer": { /* the full CER bundle that was certified */ },
  "certificateHash": "sha256:...",
  "bundleType": "cer.ai.execution.v1",
  "createdAt": "2026-06-29T12:00:00.000Z",
  "attestationId": "...",
  "nodeRuntimeHash": "sha256:...",
  "protocolVersion": "1.3.1",
  "issuedAt": "2026-06-29T12:00:00.100Z",
  "kid": "...",
  "attestorKeyId": "...",
  "attestation": { /* attestation summary */ },
  "receipt": { /* signed receipt fields */ },
  "signature": "base64url...",
  "verificationEnvelope": { /* envelope v2 */ },
  "verificationEnvelopeSignature": "base64url...",
  "timestamp": { "type": "rfc3161|node-issued", "status": "...", "provider": "...", "token": "..." },
  "verificationUrl": "https://...",
  "requestId": "..."
}`}
    />
    <p>The <code>certificateHash</code> is also returned as the response header <code>X-Certificate-Hash</code>. Persist <code>certificateHash</code> + <code>executionId</code> on your side. They are the keys you use for later lookups and the proof that your execution was certified.</p>

    <h2 id="code-mode">8. Code Mode Certification (p5.js)</h2>

    <h3 id="render"><code>POST /api/render</code> - render code to an image (authenticated)</h3>
    <CodeBlock
      language="json"
      code={`{
  "code": "function setup(){ createCanvas(1950,2400); } function draw(){ /* ... */ }",
  "seed": "default",
  "VAR": [0, 1, 2],
  "width": 1950,
  "height": 2400,
  "protocolVersion": "1.2.0"
}`}
    />
    <p>The canvas size is fixed by the node. <code>width</code>/<code>height</code>, if sent, must equal <code>1950 x 2400</code> or you get <code>400</code>. With <code>Accept: application/json</code> the response is:</p>
    <CodeBlock
      language="json"
      code={`{ "pngBase64": "...", "runtimeHash": "sha256:...", "width": 1950, "height": 2400,
  "sdkVersion": "...", "protocolVersion": "...", "executionTimeMs": 123 }`}
    />
    <p>Without that header you receive the raw <code>image/png</code> plus an <code>X-Runtime-Hash</code> header. The public <code>POST /render</code> is disabled in production - use the authenticated <code>POST /api/render</code>.</p>

    <h3 id="verify-code"><code>POST /verify</code> - certify a render or animation (authenticated, executes code)</h3>
    <CodeBlock
      language="json"
      code={`{
  "snapshot": {
    "code": "...",
    "seed": "default",
    "vars": [0,1,2],
    "execution": { "mode": "loop", "totalFrames": 120, "fps": 30 }
  },
  "expectedHash": "sha256:...",
  "expectedAnimationHash": "sha256:...",
  "expectedPosterHash": "sha256:..."
}`}
    />
    <p><strong>Loop mode rules:</strong></p>
    <ul>
      <li>Loop mode triggers when <code>execution.mode === "loop"</code> (or the code defines a <code>draw()</code> and <code>totalFrames &gt; 1</code>).</li>
      <li><code>totalFrames</code> must be <code>2 ... MAX_TOTAL_FRAMES</code> (default <code>1800</code>, operator-configurable via the <code>MAX_TOTAL_FRAMES</code> env var); outside that &rarr; <code>400 LOOP_MODE_ERROR</code>.</li>
      <li>Loop mode requires a <code>draw()</code> function. If <code>draw()</code> is missing it FAILS - it never falls back to a static render.</li>
    </ul>

    <h2 id="verify">9. Verifying a Certificate (no API key)</h2>

    <h3 id="cer-verify"><code>POST /v1/cer/verify</code> - stateless verdict</h3>
    <CodeBlock
      language="json"
      code={`// request
{ "bundle": { /* a complete CER bundle */ } }

// response
{
  "status": "verified|failed",
  "reasonCode": "OK|INPUT_HASH_MISMATCH|CERTIFICATE_HASH_MISMATCH|SIGNATURE_INVALID|...",
  "checks": { "structure": "pass", "certificateHash": "pass", "inputHash": "pass",
              "outputHash": "pass", "signature": "pass|skipped" },
  "computedCertificateHash": "sha256:...",
  "classification": "VERIFIED|LEGACY_VERIFIED|UNVERIFIABLE|FAILED",
  "timestamp": { "type": "rfc3161|node-issued", "status": "verified|invalid|untrusted" }
}`}
    />

    <h3 id="cer-public"><code>GET /v1/cer/public</code> - look up a stored proof</h3>
    <p>Query by either key (parameters are snake_case):</p>
    <CodeBlock
      language="text"
      code={`GET /v1/cer/public?certificate_hash=sha256:...
GET /v1/cer/public?execution_id=exec-2026-06-29-abc123`}
    />
    <p>Returns the stored proof including a canonical block that lets an external verifier verify by direct hashing + direct Ed25519 verification - no bundle reconstruction needed. <code>GET /api/public-cer-proof</code> is the privacy-preserving variant. Both return <code>404</code> for records that have been hidden/deleted by retention.</p>

    <h2 id="project-bundles">10. Project Bundles (Multi-Step Executions)</h2>
    <p>Tie several already-certified steps into one project proof.</p>
    <CodeBlock
      title="POST /v1/project-bundle/register (authenticated)"
      language="json"
      code={`{
  "bundleType": "cer.project.bundle.v1",
  "integrity": { "projectHash": "sha256:..." },
  "totalSteps": 5,
  "stepRegistry": [ { "stepId": "step-1", "certificateHash": "sha256:..." } ],
  "embeddedBundles": { "step-1": { /* the certified step bundle */ } }
}`}
    />
    <p><code>POST /v1/project-bundle/verify</code> takes <code>{`{ "bundle": { ... } }`}</code> and returns a per-step pass/fail summary plus a <code>projectHash</code> submitted-vs-computed check.</p>

    <h2 id="errors">11. Error Catalogue</h2>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead><tr className="bg-muted/50"><th className="text-left px-4 py-3 border-b border-border">HTTP</th><th className="text-left px-4 py-3 border-b border-border">error / code</th><th className="text-left px-4 py-3 border-b border-border">Meaning</th><th className="text-left px-4 py-3 border-b border-border">Fix</th></tr></thead>
        <tbody>
          <tr className="border-b border-border"><td className="px-4 py-3">400</td><td className="px-4 py-3 font-mono text-xs">VALIDATION_ERROR</td><td className="px-4 py-3">A field is missing/malformed; <code>details[]</code> lists each.</td><td className="px-4 py-3">Fix the offending field(s).</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3">400</td><td className="px-4 py-3 font-mono text-xs">LOOP_MODE_ERROR</td><td className="px-4 py-3"><code>totalFrames</code> out of 2..MAX_TOTAL_FRAMES (default 1800), or loop with no <code>draw()</code>.</td><td className="px-4 py-3">Correct frames / add <code>draw()</code>.</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3">401</td><td className="px-4 py-3 font-mono text-xs">UNAUTHORIZED</td><td className="px-4 py-3">Missing or invalid Bearer key.</td><td className="px-4 py-3">Send a valid <code>Authorization: Bearer</code>.</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3">409</td><td className="px-4 py-3 font-mono text-xs">EXECUTION_MUTATION_DETECTED</td><td className="px-4 py-3">Same <code>executionId</code>, different content.</td><td className="px-4 py-3">Use a new <code>executionId</code>, or resubmit identical content.</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3">422</td><td className="px-4 py-3 font-mono text-xs">PROTOCOL_SCHEMA_UNSATISFIED</td><td className="px-4 py-3">Content fails the requested protocol's SDK check.</td><td className="px-4 py-3">Match the protocol's required shape.</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3">500</td><td className="px-4 py-3 font-mono text-xs">ATTESTATION_ERROR / INTERNAL_ERROR</td><td className="px-4 py-3">Unexpected server failure.</td><td className="px-4 py-3">Retry; contact operator if persistent.</td></tr>
          <tr><td className="px-4 py-3">503</td><td className="px-4 py-3 font-mono text-xs">SERVICE_UNAVAILABLE</td><td className="px-4 py-3">DB unavailable (fails closed).</td><td className="px-4 py-3">Retry later.</td></tr>
        </tbody>
      </table>
    </div>
    <p>Validation responses carry a human-readable <code>message</code> (errors joined by <code>;</code>) and a machine-readable <code>details</code> array:</p>
    <CodeBlock
      language="json"
      code={`{
  "error": "VALIDATION_ERROR",
  "message": "protocolVersion \\"1.3.1\\" requires a non-empty prompt string; parameters.maxTokens must be a finite number",
  "details": [
    "protocolVersion \\"1.3.1\\" requires a non-empty prompt string",
    "parameters.maxTokens must be a finite number"
  ],
  "requestId": "..."
}`}
    />

    <h2 id="determinism">12. Determinism and Idempotency</h2>
    <ul>
      <li>Always send your own <code>executionId</code>. It is the anchor for idempotency and lookups.</li>
      <li>A true retry (same <code>executionId</code>, same content) replays the original signed certificate - you get the same <code>certificateHash</code> back. Safe to retry on network failure.</li>
      <li>A conflicting retry (same <code>executionId</code>, changed content) is rejected with <code>409</code>. This is by design - a certified execution is immutable.</li>
      <li>For <code>1.3.1</code>, sealing salts are derived deterministically from <code>executionId</code>, so the commitment and <code>certificateHash</code> are stable across retries and redeploys.</li>
      <li>For fully reproducible hashes in standard mode, also send a fixed <code>createdAt</code> and <code>timestamp</code>; otherwise the node mints a fresh <code>createdAt</code> on first certify (still idempotent for true retries via replay).</li>
    </ul>

    <h2 id="checklist">13. A Complete "Get Certified" Checklist</h2>
    <ol>
      <li>Obtain an API key; send it as <code>Authorization: Bearer &lt;key&gt;</code>.</li>
      <li>Pick your flow: AI standard, AI confidential <code>1.3.1</code>, or Code Mode.</li>
      <li>Generate a stable, unique <code>executionId</code> for the execution.</li>
      <li>Shape the payload per sections 5 / 6 / 8 - respect required fields and the <code>input</code> XOR <code>inputHash</code> rule (and the <code>1.3.1</code> "raw only, no hashes" rule).</li>
      <li>Optional: preview with <code>POST /v1/cer/ai/create</code>.</li>
      <li>POST to the certify endpoint. On <code>200</code>, store <code>certificateHash</code> + <code>executionId</code> (and keep the <code>verificationEnvelope</code> / <code>signature</code> if you verify offline).</li>
      <li>Verify anytime with <code>POST /v1/cer/verify</code> or <code>GET /v1/cer/public</code>.</li>
    </ol>
    <p>
      For the exhaustive wire contract see{" "}
      <Link to="/docs/attestation-node" className="text-primary hover:underline">Attestation Node</Link>,{" "}
      <Link to="/docs/independent-verification" className="text-primary hover:underline">Independent Verification</Link>, and{" "}
      <Link to="/docs/confidential-mode" className="text-primary hover:underline">Confidential Execution</Link>.
    </p>
  </>
);

export default BuilderIntegrationGuide;
