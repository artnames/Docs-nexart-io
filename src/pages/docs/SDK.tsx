import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt AI Execution SDK

## API Endpoints

POST /v1/cer/ai/certify (recommended)
Creates a CER, attests it via the node, and returns certificateHash, receipt, signatureB64Url, and verificationUrl.

POST /v1/cer/ai/create
Creates a CER bundle without attestation. Returns the bundle and certificateHash but no receipt or verificationUrl.

## Recommended path
Use POST /v1/cer/ai/certify for most integrations. It handles CER creation, attestation, and receipt generation in one request.

## Authentication
API key via NEXART_API_KEY header.

## CER bundle shape
{
  bundleType: "cer.ai.execution.v1",
  version: "1.0",
  createdAt: ISO 8601,
  snapshot: {
    model: "gpt-4",
    inputHash: "sha256:...",
    outputHash: "sha256:...",
    metadata: { appId, projectId }
  },
  certificateHash: "sha256:...",
  meta: {
    attestation: {
      receipt: { certificateHash, timestamp, nodeId, kid },
      signature: <raw Ed25519 bytes>,
      kid: "key_01HXYZ..."
    }
  }
}

## Certify response
{
  verificationUrl: "https://verify.nexart.io/e/exec_abc123",
  certificateHash: "sha256:...",
  receipt: { certificateHash, timestamp, nodeId, kid },
  signatureB64Url: "MEUCIQD..."
}

The canonical location for attestation data is bundle.meta.attestation.
The API response duplicates receipt and signature fields for convenience.

## Verification
Locally using bundle + node keys from node.nexart.io/.well-known/nexart-node.json
Or through verify.nexart.io
Checks: Bundle Integrity, Node Signature, Receipt Consistency, Verification Envelope (when present)
Verification statuses: VERIFIED | FAILED | NOT_FOUND (per CER Protocol). Check statuses: PASS | FAIL | SKIPPED.
Newer uploaded AI CER bundles may include meta.verificationEnvelope and meta.verificationEnvelopeSignature for stronger verification.`;

const SDK = () => (
  <>
    <PageHeader
      title="AI Execution SDK"
      summary="API reference for certifying AI executions and creating CER bundles."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>The AI Execution SDK provides two endpoints for working with Certified Execution Records. Most builders should use the <strong>certify</strong> endpoint, which handles everything in a single request.</p>

    <div className="not-prose my-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="text-sm font-medium text-primary mb-1">Recommended for most integrations</div>
      <div className="text-sm text-foreground">
        Use <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">POST /v1/cer/ai/certify</code> to create a CER, get node attestation, and receive a verification URL in one call.
      </div>
    </div>

    <h2 id="endpoints">API Endpoints</h2>

    <h3 id="certify">POST /v1/cer/ai/certify</h3>
    <p>Creates a Certified Execution Record, attests it through the node, and returns a signed receipt with a verification URL. This is the simplest way to get a verifiable proof of an AI execution.</p>
    <p><strong>What it does:</strong></p>
    <ul>
      <li>Creates a CER bundle with execution metadata</li>
      <li>Computes the certificateHash (SHA-256)</li>
      <li>Submits the bundle to the attestation node</li>
      <li>Returns the signed receipt, signature, and a public verification URL</li>
    </ul>

    <CodeBlock
      code={`POST /v1/cer/ai/certify
Authorization: Bearer NEXART_API_KEY

{
  "model": "gpt-4",
  "input": "Summarize this contract...",
  "output": "The contract states that...",
  "metadata": {
    "appId": "my-app",
    "projectId": "proj_abc123"
  }
}`}
      title="Certify Request"
    />

    <CodeBlock
      code={`{
  "verificationUrl": "https://verify.nexart.io/e/exec_abc123",
  "certificateHash": "sha256:9e8d7c6b5a4f3210...",
  "receipt": {
    "certificateHash": "sha256:9e8d7c6b5a4f3210...",
    "timestamp": "2026-03-06T12:00:01.000Z",
    "nodeId": "nexart-node-primary",
    "kid": "key_01HXYZ..."
  },
  "signatureB64Url": "MEUCIQD3a8b1c4d5e6f..."
}`}
      title="Certify Response"
    />
    <p className="text-sm text-muted-foreground">The API response includes receipt and signature fields for convenience. The canonical location for attestation data within the CER bundle is <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">bundle.meta.attestation</code>.</p>

    <h3 id="create">POST /v1/cer/ai/create</h3>
    <p>Creates a CER bundle without attestation. The bundle is returned with a certificateHash, but no receipt or verification URL is generated.</p>
    <p><strong>When to use this:</strong></p>
    <ul>
      <li>You want to generate the CER bundle for your own records</li>
      <li>You plan to submit the bundle for attestation separately</li>
      <li>You need the bundle structure but do not need node signing right now</li>
    </ul>

    <CodeBlock
      code={`POST /v1/cer/ai/create
Authorization: Bearer NEXART_API_KEY

{
  "model": "gpt-4",
  "input": "Summarize this contract...",
  "output": "The contract states that...",
  "metadata": {
    "appId": "my-app",
    "projectId": "proj_abc123"
  }
}`}
      title="Create Request"
    />

    <CodeBlock
      code={`{
  "bundleType": "cer.ai.execution.v1",
  "version": "1.0",
  "createdAt": "2026-03-06T12:00:00.000Z",
  "snapshot": {
    "model": "gpt-4",
    "inputHash": "sha256:a1b2c3d4e5f67890...",
    "outputHash": "sha256:f6e5d4c3b2a10987...",
    "metadata": {
      "appId": "my-app",
      "projectId": "proj_abc123"
    }
  },
  "certificateHash": "sha256:9e8d7c6b5a4f3210..."
}`}
      title="Create Response"
    />
    <p>Note: the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">create</code> response returns the CER bundle directly. There is no receipt, signature, or verification URL. The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code> field is absent. To get attestation, use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/certify</code> instead.</p>

    <h2 id="authentication">Authentication</h2>
    <p>Both endpoints require an API key passed as a Bearer token:</p>
    <CodeBlock code="Authorization: Bearer NEXART_API_KEY" language="text" />

    <h2 id="cer-shape">CER Bundle Shape</h2>
    <p>A fully certified CER bundle follows this structure:</p>
    <CodeBlock
      code={`{
  "bundleType": "cer.ai.execution.v1",
  "version": "1.0",
  "createdAt": "2026-03-06T12:00:00.000Z",
  "snapshot": {
    "model": "gpt-4",
    "inputHash": "sha256:a1b2c3d4e5f67890...",
    "outputHash": "sha256:f6e5d4c3b2a10987...",
    "metadata": {
      "appId": "my-app",
      "projectId": "proj_abc123"
    }
  },
  "certificateHash": "sha256:9e8d7c6b5a4f3210...",
  "meta": {
    "attestation": {
      "receipt": {
        "certificateHash": "sha256:9e8d7c6b5a4f3210...",
        "timestamp": "2026-03-06T12:00:01.000Z",
        "nodeId": "nexart-node-primary",
        "kid": "key_01HXYZ..."
      },
      "signature": "<raw Ed25519 signature bytes>",
      "kid": "key_01HXYZ..."
    }
  }
}`}
      title="CER Bundle (Certified)"
    />
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot</code> contains execution metadata. Input and output content is hashed (SHA-256) rather than stored directly. Attestation data lives under <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code>.</p>

    <h2 id="key-terms">Key Terms</h2>
    <ul>
      <li><strong>create vs certify.</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">create</code> produces a CER bundle. <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certify</code> produces a CER bundle and gets it attested by the node in one step.</li>
      <li><strong>Attestation vs verification.</strong> Attestation is when the node signs a record. Verification is when anyone checks that the signature and bundle are valid.</li>
      <li><strong>Signed receipt vs hash-only timestamp.</strong> A signed receipt attests the full CER bundle. A hash-only timestamp attests only the certificateHash, without the snapshot contents.</li>
    </ul>

    <h2 id="signals">Context Signals</h2>
    <p>Both endpoints accept an optional <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signals</code> parameter — an array of structured metadata objects recorded alongside the execution.</p>
    <CodeBlock
      code={`{
  "model": "gpt-4",
  "input": "Summarize this contract...",
  "output": "The contract states that...",
  "signals": [
    {
      "type": "policy.check",
      "source": "compliance-engine",
      "payload": { "policyId": "ret-30d", "result": "pass" }
    }
  ]
}`}
      title="Request with Signals"
    />
    <p>When signals are present, they are included in the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> computation. This makes them part of the tamper-evidence chain — any modification to a signal after certification will cause verification to fail.</p>
    <p className="text-sm text-muted-foreground">Signals are backward-compatible. Requests without the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">signals</code> field behave exactly as before. Existing CER bundles without signals remain valid and verifiable.</p>

    <h2 id="verification">Verification</h2>
    <p>CERs produced by the certify endpoint can be verified across multiple layers:</p>
    <ul>
      <li><strong>Bundle Integrity.</strong> The CER bundle hashes are internally consistent.</li>
      <li><strong>Node Signature.</strong> The receipt signature is valid against the node's published Ed25519 key.</li>
      <li><strong>Receipt Consistency.</strong> The receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> matches the CER bundle.</li>
      <li><strong>Verification Envelope.</strong> When present (newer uploaded bundles), <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.verificationEnvelopeSignature</code> validates the authoritative displayed verification surface.</li>
    </ul>
    <p>Verification statuses: <strong>VERIFIED</strong>, <strong>FAILED</strong>, or <strong>NOT_FOUND</strong>. Each check returns <strong>PASS</strong>, <strong>FAIL</strong>, or <strong>SKIPPED</strong>.</p>
    <p>Verify at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a> or locally using the bundle and node keys from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code>. For a full breakdown of verification layers, see <Link to="/docs/ai-cer-verification-layers" className="text-primary hover:underline">AI CER Verification Layers</Link>.</p>

    <h2 id="scope">Scope</h2>
    <p className="text-muted-foreground">The SDK API surface is still evolving. This page documents the current endpoints and data model. Check back for updates as new capabilities are added.</p>
  </>
);

export default SDK;
