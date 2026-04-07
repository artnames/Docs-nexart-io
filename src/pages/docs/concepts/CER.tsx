import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

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
      title="Certified Execution Records"
      summary="CERs are the core unit of proof in NexArt. They prove execution integrity, not just log events."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>A <strong>Certified Execution Record (CER)</strong> is a portable, tamper-evident record of an execution. CERs can represent AI completions, deterministic system operations, or any execution you want to certify.</p>

    <div className="not-prose my-6 rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-sm font-medium text-foreground mb-1">Logs vs CERs</div>
      <div className="text-sm text-muted-foreground">
        Logs describe events. CERs prove execution integrity. A CER binds execution inputs, outputs, parameters, and context into a single tamper-evident artifact with a deterministic hash.
      </div>
    </div>

    <p>A CER binds execution metadata to a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. The bundle structure is deterministic: given the same inputs, the same hash is produced. Attestation adds a signed receipt under <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code>, but the CER itself is the base record.</p>

    <h2 id="what-it-contains">What a CER Contains</h2>
    <ul>
      <li><strong>Inputs</strong>: hashed (SHA-256) representation of the execution input. Raw content is not stored in the CER.</li>
      <li><strong>Outputs</strong>: hashed representation of the execution output.</li>
      <li><strong>Parameters</strong>: model identifier, execution configuration.</li>
      <li><strong>Context (signals)</strong>: optional structured metadata recorded alongside the execution. See <Link to="/docs/concepts/context-signals" className="text-primary hover:underline">Context Signals</Link>.</li>
      <li><strong>Metadata</strong>: application-defined fields like <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">appId</code> and <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectId</code>.</li>
      <li><strong>certificateHash</strong>: SHA-256 hash derived from the canonical bundle. This is the unique identifier and what the node signs.</li>
    </ul>

    <h2 id="anatomy">CER Anatomy</h2>
    <p>A fully certified CER contains these fields:</p>

    <h3>Top-level fields</h3>
    <ul>
      <li><strong>bundleType</strong>: identifies the record type (e.g. <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.ai.execution.v1</code>). Determines what verification checks apply.</li>
      <li><strong>version</strong>: protocol version (currently <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">"1.0"</code>).</li>
      <li><strong>createdAt</strong>: when the CER was created (ISO 8601).</li>
      <li><strong>certificateHash</strong>: SHA-256 hash derived from the canonical bundle.</li>
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

    <h2 id="tamper-evidence">Tamper Evidence</h2>
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> makes tampering immediately evident. Any modification to the CER produces a different hash. Verification tools recompute the hash and compare it to detect changes.</p>

    <h2 id="replayability">Replayability</h2>
    <p>Because a CER captures all relevant execution parameters and context, it can support replay where applicable. The deterministic hash computation means the same inputs always produce the same certificateHash, enabling independent verification without re-executing.</p>

    <h2 id="verification">Verification</h2>
    <p>Any CER can be verified independently. No trust in NexArt infrastructure is required. Verification checks:</p>
    <ul>
      <li><strong>Bundle Integrity</strong>: the bundle hashes are internally consistent.</li>
      <li><strong>Node Signature</strong>: the receipt signature is valid against a published node key. SKIPPED if no attestation.</li>
      <li><strong>Receipt Consistency</strong>: the receipt's certificateHash matches the CER bundle. SKIPPED if no attestation.</li>
    </ul>
    <p>The node provides attestation and discovery. It is not required to verify integrity. Integrity is proven by the hashes alone.</p>
    <p>Verification statuses: <strong>VERIFIED</strong>, <strong>FAILED</strong>, or <strong>NOT_FOUND</strong>. Each check returns <strong>PASS</strong>, <strong>FAIL</strong>, or <strong>SKIPPED</strong>.</p>
    <p>Verify using the SDK (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyCer()</code> or <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyCerAsync()</code>) or at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>.</p>
    <p>See <Link to="/docs/verification" className="text-primary hover:underline">How Verification Works</Link>, <Link to="/docs/concepts/hashes" className="text-primary hover:underline">Certificate Hash vs Project Hash</Link>, and the <Link to="/docs/cer-protocol" className="text-primary hover:underline">CER Protocol</Link> for full details.</p>

    <h2 id="guarantees">What NexArt Guarantees (and Does Not)</h2>
    <p><strong>Guaranteed:</strong> integrity of the recorded execution (tamper-evidence via certificateHash), independent verification without trusting NexArt infrastructure.</p>
    <p><strong>Not guaranteed:</strong> correctness of the execution result, completeness of recorded steps. NexArt proves what happened. It does not evaluate whether the result was correct or whether all steps were recorded.</p>

    <h2 id="multi-step">Multi-Step Workflows</h2>
    <p>For workflows with multiple steps, CERs can be collected into a <Link to="/docs/concepts/project-bundles" className="text-primary hover:underline">Project Bundle</Link> with its own <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code> covering the entire sequence. Use <Link to="/docs/agent-kit" className="text-primary hover:underline">agent-kit</Link> for simplified workflow orchestration.</p>
  </>
);

export default CER;
