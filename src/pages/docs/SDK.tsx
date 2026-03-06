import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt AI Execution SDK
The AI Execution SDK creates CERs from AI executions and submits them for attestation.

## What it does
- Captures AI execution data (model, input, output, metadata)
- Creates CER bundles with the correct protected structure
- Computes certificateHash (SHA-256)
- Submits CERs to the attestation node for signing
- Returns signed receipts

## CER bundle structure
{
  bundleType: "signed-receipt",
  version: "1.0",
  createdAt: ISO 8601,
  snapshot: { model, promptHash, outputHash, metadata },
  certificateHash: "sha256:..."
}

## Receipt structure
{
  receipt: { certificateHash, timestamp, attestorKeyId, nodeId },
  signature: Ed25519 signature,
  signatureB64Url: base64url-encoded signature
}

## Verification
Verify CERs at verify.nexart.io or independently using the node's published Ed25519 key.
Node keys: node.nexart.io/.well-known/nexart-node.json`;

const SDK = () => (
  <>
    <PageHeader
      title="AI Execution SDK"
      summary="Creates CER bundles from AI executions and submits them for attestation."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>The AI Execution SDK is the client-side component that captures AI execution data, creates CER bundles, and submits them to the attestation node. It handles bundle construction, hash computation, and receipt handling.</p>

    <h2 id="what-it-does">What the SDK Does</h2>
    <ol>
      <li>Captures execution data — model identifier, input/output hashes, metadata</li>
      <li>Creates a CER with the correct protected structure (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">version</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot</code>)</li>
      <li>Computes the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> (SHA-256) over the bundle</li>
      <li>Submits the CER to the attestation node</li>
      <li>Returns the signed receipt from the node</li>
    </ol>

    <h2 id="cer-shape">CER Bundle Shape</h2>
    <p>The SDK produces CER bundles in this structure:</p>
    <CodeBlock
      code={`{
  "bundleType": "signed-receipt",
  "version": "1.0",
  "createdAt": "2026-03-06T12:00:00.000Z",
  "snapshot": {
    "model": "gpt-4",
    "promptHash": "sha256:a1b2c3d4e5f6...",
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

    <h2 id="receipt-shape">Signed Receipt Shape</h2>
    <p>After attestation, the node returns a signed receipt:</p>
    <CodeBlock
      code={`{
  "receipt": {
    "certificateHash": "sha256:9e8d7c6b5a4f...",
    "timestamp": "2026-03-06T12:00:00.000Z",
    "attestorKeyId": "key_01HXYZ...",
    "nodeId": "nexart-node-primary"
  },
  "signature": "<Ed25519 signature bytes>",
  "signatureB64Url": "MEUCIQD3..."
}`}
      title="Signed Receipt"
    />

    <h2 id="hashing">Hash Computation</h2>
    <p>The SDK computes SHA-256 hashes of input and output content before including them in the CER. The raw content is not sent to the attestation node — only hashes are transmitted.</p>
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is computed over the entire CER bundle, creating a single fingerprint that ties all fields together.</p>

    <h2 id="redacted">Redacted Reseal</h2>
    <p>The SDK also supports creating redacted versions of CERs. A redacted CER has sensitive fields removed and is re-signed by the node (a "reseal"). This produces a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signed-redacted-reseal</code> bundle that can be shared externally while preserving verifiability.</p>

    <h2 id="verification">Verification</h2>
    <p>CERs produced by the SDK can be verified at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a> or independently by checking the Ed25519 signature against the node's published key at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code>.</p>
  </>
);

export default SDK;
