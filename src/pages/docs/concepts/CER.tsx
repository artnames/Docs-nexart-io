import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# CER (Certified Execution Record)
A CER is a portable, tamper-evident record of an execution. CERs may represent AI or deterministic system executions.

## Full anatomy
{
  bundleType: "cer.ai.execution.v1",
  version: "1.0",
  createdAt: ISO 8601,
  snapshot: { model, inputHash, outputHash, metadata },
  certificateHash: "sha256:...",
  meta: {
    attestation: {
      receipt: { certificateHash, timestamp, nodeId, kid },
      signature: <raw Ed25519 bytes>,
      kid: "key_01HXYZ..."
    }
  }
}

## Key fields
- bundleType: record type identifier (e.g. cer.ai.execution.v1)
- certificateHash: SHA-256 hash of the canonical bundle, uniquely identifies the record
- snapshot: execution metadata (model, hashes of inputs/outputs, app metadata)
- meta.attestation.receipt: canonical payload signed by the attestation node
- meta.attestation.signature: Ed25519 signature proving node attestation
- meta.attestation.kid: signing key identifier

## Bundle types
- cer.ai.execution.v1: AI execution, fully verifiable when attested
- signed-redacted-reseal: redacted export, resealed for safe sharing
- hash-only-timestamp: signs only certificateHash
- legacy: older records with limited verification

## create vs certify
- POST /v1/cer/ai/create: generates a CER bundle without attestation
- POST /v1/cer/ai/certify: creates and attests in one request (recommended)

## Verification
Checks: bundle integrity, node signature, receipt consistency.
Verification statuses: VERIFIED | FAILED | NOT_FOUND. Check statuses: PASS | FAIL | SKIPPED.`;

const CER = () => (
  <>
    <PageHeader
      title="What is a CER?"
      summary="Certified Execution Records are the core unit of proof in NexArt."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>A <strong>Certified Execution Record (CER)</strong> is a portable, tamper-evident record of an execution. CERs can represent AI completions, deterministic system operations, or any execution you want to certify. NexArt is not limited to AI.</p>
    <p>A CER binds execution metadata to a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. The bundle structure is deterministic: given the same inputs, the same hash is produced. Attestation adds a signed receipt under <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code>, but the CER itself is the base record.</p>

    <h2 id="anatomy">CER Anatomy</h2>
    <p>A fully certified CER contains these fields:</p>

    <h3>Top-level fields</h3>
    <ul>
      <li><strong>bundleType</strong>: identifies the record type (e.g. <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.ai.execution.v1</code>). Determines what verification checks apply.</li>
      <li><strong>version</strong>: protocol version (currently <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">"1.0"</code>).</li>
      <li><strong>createdAt</strong>: when the CER was created (ISO 8601).</li>
      <li><strong>certificateHash</strong>: SHA-256 hash derived from the canonical bundle. This is the unique identifier of the record and what the node signs.</li>
    </ul>

    <h3>Snapshot (execution metadata)</h3>
    <ul>
      <li><strong>model</strong>: the model or system that produced the execution.</li>
      <li><strong>inputHash</strong>: SHA-256 hash of the input/prompt. The raw input is not stored in the CER.</li>
      <li><strong>outputHash</strong>: SHA-256 hash of the output/completion.</li>
      <li><strong>metadata</strong>: application-defined fields like <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">appId</code> and <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectId</code>.</li>
    </ul>

    <h3>Attestation (<code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">meta.attestation</code>)</h3>
    <p>Attestation data is stored under <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code> in the CER bundle:</p>
    <ul>
      <li><strong>receipt</strong>: the canonical payload signed by the attestation node. Contains <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">timestamp</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">nodeId</code>, and <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code>.</li>
      <li><strong>signature</strong>: raw Ed25519 signature over the receipt payload.</li>
      <li><strong>kid</strong>: the signing key identifier, matching a key published at the node's well-known endpoint.</li>
    </ul>

    <h2 id="example">Full Example</h2>
    <CodeBlock
      code={`{
  "bundleType": "cer.ai.execution.v1",
  "version": "1.0",
  "createdAt": "2026-03-06T12:00:00.000Z",
  "snapshot": {
    "model": "gpt-4",
    "inputHash": "sha256:a1b2c3d4e5f6...",
    "outputHash": "sha256:f6e5d4c3b2a1...",
    "metadata": {
      "appId": "my-app",
      "projectId": "proj_abc123"
    }
  },
  "certificateHash": "sha256:9e8d7c6b5a4f...",
  "meta": {
    "attestation": {
      "receipt": {
        "certificateHash": "sha256:9e8d7c6b5a4f...",
        "timestamp": "2026-03-06T12:00:00.001Z",
        "nodeId": "nexart-node-primary",
        "kid": "key_01HXYZ..."
      },
      "signature": "<raw Ed25519 signature bytes>",
      "kid": "key_01HXYZ..."
    }
  }
}`}
      title="Certified CER with Signed Receipt"
    />

    <h2 id="create-vs-certify">Create vs Certify</h2>
    <p>There are two API endpoints for creating CERs, and the difference matters:</p>
    <ul>
      <li><strong><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /v1/cer/ai/create</code></strong> generates a CER bundle with a certificateHash but does <strong>not</strong> attest it. The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code> field is absent. Use this if you need the bundle for external handling or deferred attestation.</li>
      <li><strong><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /v1/cer/ai/certify</code></strong> creates the CER and attests it in one request. Returns the certificateHash, receipt, signature, and a verificationUrl. <strong>This is the recommended path for most integrations.</strong></li>
    </ul>

    <h2 id="bundle-types">Bundle Types</h2>
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType</code> field describes the record type and attestation condition:</p>
    <ul>
      <li><strong>cer.ai.execution.v1</strong>: an AI execution record. Fully verifiable when attested. This is the default when you use the certify endpoint.</li>
      <li><strong>signed-redacted-reseal</strong>: a redacted export that has been resealed and signed again for safe sharing while preserving verifiability.</li>
      <li><strong>hash-only-timestamp</strong>: the receipt signs only the certificateHash. Used when full snapshot attestation is not possible.</li>
      <li><strong>legacy</strong>: historical records that may lack full attestation data.</li>
    </ul>

    <h2 id="certificate-hash">Certificate Hash</h2>
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is a SHA-256 hash derived from the canonical bundle structure. It uniquely identifies the record and is what the attestation node signs. Any modification to the CER produces a different hash, making tampering immediately evident.</p>

    <h2 id="exports">Export Paths</h2>
    <ul>
      <li><strong>Full export</strong>: the complete CER with all snapshot data intact.</li>
      <li><strong>Redacted export</strong>: sensitive fields removed, then resealed and signed so verification still works.</li>
      <li><strong>Legacy export</strong>: older records with limited verification coverage.</li>
    </ul>

    <h2 id="verification">Verification</h2>
    <p>Any CER can be verified by checking:</p>
    <ul>
      <li><strong>Bundle Integrity</strong>: the bundle hashes are internally consistent.</li>
      <li><strong>Node Signature</strong>: the receipt signature is valid against a published node key.</li>
      <li><strong>Receipt Consistency</strong>: the receipt's certificateHash matches the CER bundle.</li>
    </ul>
    <p>Verification statuses: <strong>VERIFIED</strong>, <strong>FAILED</strong>, or <strong>NOT_FOUND</strong>. Each check returns <strong>PASS</strong>, <strong>FAIL</strong>, or <strong>SKIPPED</strong>.</p>
    <p>See the <a href="/docs/verification">Verification</a> page and the <a href="/docs/cer-protocol">CER Protocol</a> for full details, including how to verify without API access.</p>
  </>
);

export default CER;
