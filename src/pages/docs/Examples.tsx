import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Example Data Structures

## CER bundle (ai-execution)
{ bundleType: "ai-execution", version: "1.0", createdAt: ISO 8601,
  snapshot: { model, inputHash: "sha256:...", outputHash: "sha256:...", metadata: { appId, projectId } },
  certificateHash: "sha256:..." }

## Signed receipt (from attestation node)
{ receipt: { certificateHash: "sha256:...", timestamp: ISO 8601, nodeId, attestorKeyId },
  signatureB64Url: base64url Ed25519 signature }

## Redacted reseal
{ bundleType: "signed-redacted-reseal", snapshot with redacted fields, new certificateHash, new receipt }

## Hash-only timestamp
{ bundleType: "hash-only-timestamp", snapshot: null, certificateHash: "sha256:..." }

## Verification report
{ outcome: "VERIFIED" | "PARTIAL" | "INVALID" | "UNAVAILABLE",
  checks: { bundleIntegrity, nodeSignature, receiptConsistency } }

## Node key discovery
GET node.nexart.io/.well-known/nexart-node.json
{ nodeId, activeKid, keys: [{ kid, algorithm: "Ed25519", publicKey }] }`;

const Examples = () => (
  <>
    <PageHeader
      title="Examples"
      summary="Reference data structures used in the NexArt system."
      llmBlock={llmBlock}
    />

    <h2 id="intro">About These Examples</h2>
    <p>This page shows example data structures used in the NexArt system: CER bundles, signed receipts, redacted reseals, hash-only timestamps, verification reports, and node key discovery. These examples are illustrative but follow the real structure used by the system.</p>

    <h2 id="cer">CER Bundle</h2>
    <p>A CER bundle representing a full attested execution record:</p>
    <CodeBlock
      code={`{
  "bundleType": "ai-execution",
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
  "certificateHash": "sha256:9e8d7c6b5a4f3210..."
}`}
      title="CER Bundle"
    />

    <h2 id="receipt">Signed Receipt</h2>
    <p>The signed receipt is produced by the attestation node after it attests a CER. The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signatureB64Url</code> field is the base64url-encoded Ed25519 signature used for transport.</p>
    <CodeBlock
      code={`{
  "receipt": {
    "certificateHash": "sha256:9e8d7c6b5a4f3210...",
    "timestamp": "2026-03-06T12:00:01.000Z",
    "nodeId": "nexart-node-primary",
    "attestorKeyId": "key_01HXYZ..."
  },
  "signatureB64Url": "MEUCIQD3a8b1c4d5e6f..."
}`}
      title="Signed Receipt"
    />

    <h2 id="redacted">Redacted Reseal</h2>
    <p>A redacted reseal is produced when sensitive fields are removed from a CER. The redacted bundle is re-signed by the attestation node, allowing safe sharing while preserving verification. The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is recomputed over the redacted contents.</p>
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

    <h2 id="hash-only">Hash-Only Timestamp</h2>
    <p>A hash-only timestamp attests only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. The snapshot is not included. Verification will normally return <strong>PARTIAL</strong>.</p>
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

    <h2 id="verification-report">Verification Report (VERIFIED)</h2>
    <p>A verification report summarizes the result of validating a CER. It shows the outcome of three checks: bundle integrity, node signature, and receipt consistency.</p>
    <CodeBlock
      code={`{
  "outcome": "VERIFIED",
  "checks": {
    "bundleIntegrity": {
      "status": "pass",
      "detail": "Computed certificateHash matches bundle contents"
    },
    "nodeSignature": {
      "status": "pass",
      "detail": "Ed25519 signature valid against published key",
      "nodeId": "nexart-node-primary",
      "attestorKeyId": "key_01HXYZ..."
    },
    "receiptConsistency": {
      "status": "pass",
      "detail": "Receipt references correct certificateHash"
    }
  },
  "bundleType": "ai-execution",
  "verifiedAt": "2026-03-06T12:05:00.000Z"
}`}
      title="Verification Report (VERIFIED)"
    />

    <h2 id="partial-report">Verification Report (PARTIAL)</h2>
    <p>A hash-only timestamp verifies as PARTIAL because the snapshot was not attested:</p>
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
      "detail": "Ed25519 signature valid against published key"
    },
    "receiptConsistency": {
      "status": "limited",
      "detail": "Snapshot was not attested — hash-only timestamp"
    }
  },
  "bundleType": "hash-only-timestamp",
  "verifiedAt": "2026-03-06T12:05:00.000Z"
}`}
      title="Verification Report (PARTIAL)"
    />

    <h2 id="node-keys">Node Key Discovery</h2>
    <p>Attestation nodes publish their public keys at a well-known endpoint. Verifiers fetch these keys to validate Ed25519 signatures on signed receipts.</p>
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
