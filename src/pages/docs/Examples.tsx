import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Examples
Realistic data shapes for CERs, signed receipts, and verification reports.

## CER bundle (signed-receipt)
{ bundleType: "signed-receipt", version: "1.0", createdAt: ISO 8601, snapshot: { model, promptHash, outputHash, metadata }, certificateHash: "sha256:..." }

## Signed receipt
{ receipt: { certificateHash, timestamp, attestorKeyId, nodeId }, signature: Ed25519, signatureB64Url: base64url }

## Verification outcomes
VERIFIED | PARTIAL | INVALID | UNAVAILABLE

## Public surfaces
- verify.nexart.io — verify any CER
- node.nexart.io/.well-known/nexart-node.json — node signing keys`;

const Examples = () => (
  <>
    <PageHeader
      title="Examples"
      summary="Realistic data shapes and verification examples."
      llmBlock={llmBlock}
    />

    <h2 id="cer">CER Bundle</h2>
    <p>A full CER with <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType: "signed-receipt"</code>:</p>
    <CodeBlock
      code={`{
  "bundleType": "signed-receipt",
  "version": "1.0",
  "createdAt": "2026-03-06T12:00:00.000Z",
  "snapshot": {
    "model": "gpt-4",
    "promptHash": "sha256:a1b2c3d4e5f67890...",
    "outputHash": "sha256:f6e5d4c3b2a10987...",
    "metadata": {
      "appId": "customer-chatbot",
      "projectId": "proj_abc123"
    }
  },
  "certificateHash": "sha256:9e8d7c6b5a4f3210..."
}`}
      title="CER Bundle (signed-receipt)"
    />

    <h2 id="receipt">Signed Receipt</h2>
    <p>The receipt returned by the attestation node after signing:</p>
    <CodeBlock
      code={`{
  "receipt": {
    "certificateHash": "sha256:9e8d7c6b5a4f3210...",
    "timestamp": "2026-03-06T12:00:01.000Z",
    "attestorKeyId": "key_01HXYZ...",
    "nodeId": "nexart-node-primary"
  },
  "signature": "<Ed25519 signature bytes>",
  "signatureB64Url": "MEUCIQD3a8b1c4d5e6f..."
}`}
      title="Signed Receipt"
    />

    <h2 id="redacted">Redacted Reseal</h2>
    <p>A CER where sensitive fields have been redacted and the record re-signed:</p>
    <CodeBlock
      code={`{
  "bundleType": "signed-redacted-reseal",
  "version": "1.0",
  "createdAt": "2026-03-06T12:00:00.000Z",
  "snapshot": {
    "model": "gpt-4",
    "promptHash": "[REDACTED]",
    "outputHash": "sha256:f6e5d4c3b2a10987...",
    "metadata": {
      "appId": "customer-chatbot"
    }
  },
  "certificateHash": "sha256:1a2b3c4d5e6f7890..."
}`}
      title="Redacted Reseal"
    />

    <h2 id="hash-only">Hash-Only Timestamp</h2>
    <p>A legacy record where only the certificate hash was attested:</p>
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

    <h2 id="verification-report">Verification Report</h2>
    <p>The result of verifying a CER at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>:</p>
    <CodeBlock
      code={`{
  "outcome": "VERIFIED",
  "checks": {
    "bundleIntegrity": {
      "status": "pass",
      "detail": "certificateHash matches bundle contents"
    },
    "nodeSignature": {
      "status": "pass",
      "detail": "Ed25519 signature valid",
      "attestorKeyId": "key_01HXYZ...",
      "nodeId": "nexart-node-primary"
    },
    "receiptConsistency": {
      "status": "pass",
      "detail": "Receipt references correct certificateHash"
    }
  },
  "bundleType": "signed-receipt",
  "verifiedAt": "2026-03-06T12:05:00.000Z"
}`}
      title="Verification Report (VERIFIED)"
    />

    <h2 id="partial-report">Partial Verification</h2>
    <p>A hash-only timestamp verifies as PARTIAL:</p>
    <CodeBlock
      code={`{
  "outcome": "PARTIAL",
  "checks": {
    "bundleIntegrity": {
      "status": "pass",
      "detail": "certificateHash is intact"
    },
    "nodeSignature": {
      "status": "pass",
      "detail": "Ed25519 signature valid"
    },
    "receiptConsistency": {
      "status": "limited",
      "detail": "No snapshot attested — hash-only timestamp"
    }
  },
  "bundleType": "hash-only-timestamp",
  "verifiedAt": "2026-03-06T12:05:00.000Z"
}`}
      title="Verification Report (PARTIAL)"
    />

    <h2 id="node-keys">Node Key Discovery</h2>
    <p>Fetch the attestation node's public signing keys for independent verification:</p>
    <CodeBlock
      code={`GET node.nexart.io/.well-known/nexart-node.json

{
  "nodeId": "nexart-node-primary",
  "keys": [
    {
      "keyId": "key_01HXYZ...",
      "algorithm": "Ed25519",
      "publicKey": "MCowBQYDK2VwAyEA...",
      "status": "active"
    }
  ]
}`}
      title="Node Key Discovery"
    />
  </>
);

export default Examples;
