import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt AI Execution SDK
The SDK helps produce CER bundles for AI executions and supports verification-related workflows.

## SDK responsibilities
- Structure AI execution data into a CER bundle
- Compute certificateHash (SHA-256) over the canonical bundle
- Support attestation-related workflows (CER creation is separate from node attestation)
- Provide verification helpers

## CER bundle shape
{
  bundleType: "ai-execution",
  version: "1.0",
  createdAt: ISO 8601,
  snapshot: {
    model: "gpt-4",
    inputHash: "sha256:...",
    outputHash: "sha256:...",
    metadata: { appId, projectId }
  },
  certificateHash: "sha256:..."
}

## Attestation
CER creation and node attestation are separate steps.
The node returns a signed receipt binding certificateHash to the node's identity.

## Signed receipt (from the node)
{
  receipt: { certificateHash, timestamp, nodeId, attestorKeyId },
  signatureB64Url: base64url Ed25519 signature
}

## Verification
Locally using bundle + node keys from node.nexart.io/.well-known/nexart-node.json
Or through verify.nexart.io
Checks: Bundle Integrity, Node Signature, Receipt Consistency
Outcomes: VERIFIED | PARTIAL | INVALID | UNAVAILABLE`;

const SDK = () => (
  <>
    <PageHeader
      title="AI Execution SDK"
      summary="Produces CER bundles for AI executions and supports verification workflows."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>The AI Execution SDK helps produce <strong>Certified Execution Record (CER)</strong> bundles for AI executions and supports local verification-related workflows. It is not only a transport client to the attestation node. CER creation and node attestation are separate concepts.</p>

    <h2 id="responsibilities">What the SDK Does</h2>
    <ul>
      <li><strong>Structure execution data.</strong> Capture or structure AI execution metadata into a CER bundle.</li>
      <li><strong>Create a CER bundle.</strong> Produce a well-formed bundle with the correct fields and canonical structure.</li>
      <li><strong>Compute certificateHash.</strong> Derive a SHA-256 hash over the canonical bundle, binding all fields together.</li>
      <li><strong>Support attestation workflows.</strong> Facilitate submission of CERs for node attestation where applicable.</li>
      <li><strong>Verification helpers.</strong> Support local verification of bundles and receipts.</li>
    </ul>

    <h2 id="cer-shape">CER Bundle Shape</h2>
    <p>The SDK produces CER bundles in this structure:</p>
    <CodeBlock
      code={`{
  "bundleType": "ai-execution",
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
  "certificateHash": "sha256:9e8d7c6b5a4f..."
}`}
      title="CER Bundle"
    />
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot</code> contains the execution metadata: model identifier, input and output hashes, and any associated metadata.</p>

    <h2 id="attestation">Attestation</h2>
    <p>CER creation and node attestation are separate steps. The SDK creates the bundle; attestation happens when the bundle is submitted to an attestation node. The node signs the record and returns a signed receipt.</p>
    <p>The receipt is an attestation artifact from the node. The SDK does not generate it.</p>

    <h2 id="receipt">Signed Receipt</h2>
    <p>After attestation, the node returns a signed receipt binding the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> to the node's identity and a timestamp:</p>
    <CodeBlock
      code={`{
  "receipt": {
    "certificateHash": "sha256:9e8d7c6b5a4f...",
    "timestamp": "2026-03-06T12:00:01.000Z",
    "nodeId": "nexart-node-primary",
    "attestorKeyId": "key_01HXYZ..."
  },
  "signatureB64Url": "MEUCIQD3a8b1c4d5e6f..."
}`}
      title="Signed Receipt (from the node)"
    />
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signatureB64Url</code> is a base64url-encoded Ed25519 signature over the canonical receipt payload.</p>

    <h2 id="hashing">Hash Computation</h2>
    <p>The SDK hashes input and output content (SHA-256) and includes the resulting hashes in the CER snapshot. The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is then computed over the entire canonical bundle structure, creating a single fingerprint that binds all fields together.</p>
    <p>During attestation, the node signs a receipt that references this <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.</p>

    <h2 id="redacted-reseal">Redacted Reseal</h2>
    <p>NexArt supports a redacted reseal flow as part of the record export and attestation workflow. A redacted export has sensitive fields removed and is then resealed (signed again by the attestation node) so it can be shared safely while preserving verifiability.</p>
    <p>This is a system-level workflow. The redacted reseal process involves the attestation node, not only the SDK.</p>

    <h2 id="verification">Verification</h2>
    <p>CERs produced by the SDK can be verified by checking:</p>
    <ul>
      <li><strong>Bundle Integrity.</strong> The CER bundle hashes are internally consistent.</li>
      <li><strong>Node Signature.</strong> The receipt signature is valid against the node's published Ed25519 key.</li>
      <li><strong>Receipt Consistency.</strong> The receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> matches the CER bundle.</li>
    </ul>
    <p>Outcomes: <strong>VERIFIED</strong>, <strong>PARTIAL</strong>, <strong>INVALID</strong>, or <strong>UNAVAILABLE</strong>.</p>
    <p>Verification can be performed locally using the bundle and node keys from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code>, or through the public verifier at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>.</p>

    <h2 id="scope">Scope of This Page</h2>
    <p className="text-muted-foreground">This page focuses on the CER bundle model and attestation flow. The SDK API surface is still evolving, so this documentation describes the current model rather than every helper function.</p>
  </>
);

export default SDK;
