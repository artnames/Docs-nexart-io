import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Examples

## Example A: Certify request
POST /v1/cer/ai/certify with model, input, output, metadata.
Returns verificationUrl, certificateHash, receipt, signatureB64Url.

## Example B: Certify response
{ verificationUrl, certificateHash, receipt: { certificateHash, timestamp, nodeId, kid }, signatureB64Url }

## Example C: Verification URLs
https://verify.nexart.io/e/exec_abc123
https://verify.nexart.io/c/sha256%3A...

## Example D: n8n flow
AI Step → NexArt Certify AI Execution → verificationUrl + receipt

## CER bundle (cer.ai.execution.v1)
{ bundleType: "cer.ai.execution.v1", version: "1.0", createdAt: ISO 8601,
  snapshot: { model, inputHash, outputHash, metadata }, certificateHash,
  meta: { attestation: { receipt, signature, kid } } }

## Create-only response (no attestation)
Returns CER bundle with certificateHash but no meta.attestation.

## Signed receipt
{ receipt: { certificateHash, timestamp, nodeId, kid }, signature, kid }

## Verification report
{ status: "VERIFIED" | "FAILED" | "NOT_FOUND",
  checks: { bundleIntegrity, nodeSignature, receiptConsistency } }

## Node key discovery
GET node.nexart.io/.well-known/nexart-node.json
Fields: nodeId, activeKid, keys[] (kid, algorithm, publicKey)`;

const Examples = () => (
  <>
    <PageHeader
      title="Examples"
      summary="Copy-ready examples for API requests, responses, verification URLs, and data structures."
      llmBlock={llmBlock}
    />

    {/* ── Section A: Reference Implementations ── */}
    <h2>Reference Implementations</h2>
    <p>End-to-end examples showing how NexArt fits into real applications.</p>

    <div className="not-prose my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="font-medium text-foreground text-sm">Agent Decision Example</div>
        <div className="text-muted-foreground text-xs mt-1">
          Certify an AI decision such as moderation, policy review, or workflow approval.
        </div>
        <div className="text-xs text-muted-foreground/60 mt-2 italic">Reference example — coming next</div>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="font-medium text-foreground text-sm">Pipeline Certification Example</div>
        <div className="text-muted-foreground text-xs mt-1">
          Certify a multi-step AI workflow or execution pipeline.
        </div>
        <div className="text-xs text-muted-foreground/60 mt-2 italic">Reference example — coming next</div>
      </div>
    </div>

    {/* ── Section B: Common Integration Patterns ── */}
    <h2>Common Integration Patterns</h2>
    <p>Request/response shapes you'll use in most integrations.</p>

    <h3 id="certify-request">Certify an AI Execution</h3>
    <p>Send execution data to the certify endpoint and receive a verifiable record.</p>
    <CodeBlock
      code={`POST /v1/cer/ai/certify
Authorization: Bearer NEXART_API_KEY

{
  "model": "gpt-4",
  "input": "Summarize this contract and highlight key obligations.",
  "output": "The contract requires monthly reporting and a 30-day notice period for termination.",
  "metadata": {
    "appId": "contract-assistant",
    "projectId": "proj_abc123"
  }
}`}
      title="Certify Request"
    />

    <h3 id="certify-response">Certify Response</h3>
    <p>The response includes everything needed to share and verify the record.</p>
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
    <p className="text-sm text-muted-foreground">The API response includes receipt and signature at the top level for convenience. In the CER bundle, this data lives at <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">meta.attestation</code>.</p>

    <h3 id="verification-urls">Verification URLs</h3>
    <p>Records can be verified publicly using either format:</p>
    <CodeBlock
      code={`# By execution ID
https://verify.nexart.io/e/exec_abc123

# By certificate hash
https://verify.nexart.io/c/sha256%3A9e8d7c6b5a4f3210...`}
      title="Verification URL Formats"
    />
    <p>Share these URLs with anyone. The public verifier shows the verification status without exposing raw inputs or outputs.</p>

    <h3 id="create-only">Create-Only Response (No Attestation)</h3>
    <p>If you use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /v1/cer/ai/create</code>, you get the CER bundle but no attestation, receipt, or verification URL.</p>
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
      "appId": "contract-assistant",
      "projectId": "proj_abc123"
    }
  },
  "certificateHash": "sha256:9e8d7c6b5a4f3210..."
}`}
      title="Create Response (No Attestation)"
    />

    <h3 id="receipt">Signed Receipt</h3>
    <p>The signed receipt is produced by the attestation node and stored at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code> in the CER bundle.</p>
    <CodeBlock
      code={`// meta.attestation:
{
  "receipt": {
    "certificateHash": "sha256:9e8d7c6b5a4f3210...",
    "timestamp": "2026-03-06T12:00:01.000Z",
    "nodeId": "nexart-node-primary",
    "kid": "key_01HXYZ..."
  },
  "signature": "<raw Ed25519 signature bytes>",
  "kid": "key_01HXYZ..."
}`}
      title="Signed Receipt (meta.attestation)"
    />

    {/* ── Section C: Advanced / Protocol Shapes ── */}
    <h2>Advanced / Protocol Shapes</h2>
    <p>Lower-level protocol structures for advanced integrations and verification tooling.</p>

    <h3 id="n8n-flow">n8n Flow</h3>
    <p>Certify AI results inside an n8n workflow using the NexArt community node.</p>
    <div className="not-prose my-6 flex flex-col items-center gap-2 text-sm font-mono">
      <div className="px-4 py-2 rounded-md border border-border bg-card text-foreground">AI Step (e.g. OpenAI, Claude)</div>
      <div className="text-muted-foreground">↓</div>
      <div className="px-4 py-2 rounded-md border border-primary/40 bg-primary/10 text-primary font-medium">NexArt Certify AI Execution</div>
      <div className="text-muted-foreground">↓</div>
      <div className="px-4 py-2 rounded-md border border-border bg-card text-foreground">verificationUrl + receipt</div>
    </div>

    <h3 id="cer-bundle">CER Bundle (Certified)</h3>
    <p>A fully certified CER bundle with attestation data:</p>
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
      "appId": "customer-chatbot",
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

    <h3 id="redacted">Redacted Reseal</h3>
    <p>A redacted reseal has sensitive fields removed and is re-signed for safe sharing. The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is recomputed over the redacted contents.</p>
    <CodeBlock
      code={`{
  "bundleType": "signed-redacted-reseal",
  "version": "1.0",
  "createdAt": "2026-03-06T12:00:00.000Z",
  "snapshot": {
    "model": "gpt-4",
    "inputHash": "[REDACTED]",
    "outputHash": "sha256:f6e5d4c3b2a10987...",
    "metadata": {
      "appId": "customer-chatbot"
    }
  },
  "certificateHash": "sha256:1a2b3c4d5e6f7890..."
}`}
      title="Redacted Reseal"
    />

    <h3 id="hash-only">Hash-Only Timestamp</h3>
    <p>Attests only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. Snapshot is not included. Verifies as <strong>VERIFIED</strong> when all applicable checks pass.</p>
    <CodeBlock
      code={`{
  "bundleType": "hash-only-timestamp",
  "version": "1.0",
  "createdAt": "2026-03-06T12:00:00.000Z",
  "snapshot": null,
  "certificateHash": "sha256:7f8e9d0c1b2a3456..."
}`}
      title="Hash-Only Timestamp"
    />

    <h3 id="verification-report">Verification Report</h3>
    <p>Summarizes the result of validating a CER.</p>
    <CodeBlock
      code={`{
  "status": "VERIFIED",
  "checks": {
    "bundleIntegrity": "PASS",
    "nodeSignature": "PASS",
    "receiptConsistency": "PASS"
  },
  "reasonCodes": [],
  "certificateHash": "sha256:...",
  "bundleType": "cer.ai.execution.v1",
  "verifiedAt": "2026-03-06T12:05:00.000Z",
  "verifier": "nexart-verifier/1.0.0"
}`}
      title="Verification Report (VERIFIED)"
    />

    <h3 id="node-keys">Node Key Discovery</h3>
    <p>Nodes publish their public keys at a well-known endpoint for independent signature verification.</p>
    <CodeBlock
      code={`GET node.nexart.io/.well-known/nexart-node.json

{
  "nodeId": "nexart-node-primary",
  "activeKid": "key_01HXYZ...",
  "keys": [
    {
      "kid": "key_01HXYZ...",
      "algorithm": "Ed25519",
      "publicKey": "MCowBQYDK2VwAyEA..."
    }
  ]
}`}
      title="Node Key Discovery"
    />
  </>
);

export default Examples;
