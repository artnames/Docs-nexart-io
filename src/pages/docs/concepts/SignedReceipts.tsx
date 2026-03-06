import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Signed Receipts
A signed receipt is the attestation proof returned by the node after signing a CER.

## Receipt fields
- receipt: the attestation payload
- signature: raw Ed25519 signature bytes
- signatureB64Url: base64url-encoded signature
- attestorKeyId: identifies which signing key was used
- nodeId: which attestation node signed it
- certificateHash: the hash of the attested CER

## Signature algorithm
Ed25519

## Key discovery
Node public keys are published at:
node.nexart.io/.well-known/nexart-node.json

## Verification
Verify at verify.nexart.io or independently using the node's published public key.`;

const SignedReceipts = () => (
  <>
    <PageHeader
      title="Signed Receipts"
      summary="The cryptographic proof returned after attestation."
      llmBlock={llmBlock}
    />
    <h2 id="what">What is a Signed Receipt?</h2>
    <p>When a CER is submitted for attestation, the node signs it and returns a <strong>signed receipt</strong>. This receipt is proof that the attestation node witnessed and recorded the execution. The signature is generated using <strong>Ed25519</strong>.</p>

    <h2 id="shape">Receipt Shape</h2>
    <CodeBlock
      code={`{
  "receipt": {
    "certificateHash": "sha256:9e8d7c6b5a4f...",
    "timestamp": "2026-03-06T12:00:00.000Z",
    "attestorKeyId": "key_01HXYZ...",
    "nodeId": "nexart-node-primary"
  },
  "signature": "<raw Ed25519 signature bytes>",
  "signatureB64Url": "MEUCIQD3..."
}`}
      title="Signed Receipt"
    />

    <h2 id="fields">Field Reference</h2>
    <ul>
      <li><strong>receipt</strong> — The attestation payload containing the certificate hash, timestamp, key ID, and node ID</li>
      <li><strong>signature</strong> — Raw Ed25519 signature over the receipt</li>
      <li><strong>signatureB64Url</strong> — Base64url-encoded version of the signature for transport</li>
      <li><strong>attestorKeyId</strong> — Identifies which signing key the node used. Nodes may rotate keys over time.</li>
      <li><strong>nodeId</strong> — Which attestation node produced this receipt</li>
      <li><strong>certificateHash</strong> — The SHA-256 hash of the CER that was attested. Links the receipt to the specific record.</li>
    </ul>

    <h2 id="key-discovery">Key Discovery</h2>
    <p>Node signing keys are published at a well-known endpoint so anyone can independently verify signatures:</p>
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

    <h2 id="verification">Verifying a Receipt</h2>
    <p>To verify a signed receipt:</p>
    <ol>
      <li>Fetch the node's public key from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code></li>
      <li>Find the key matching the receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestorKeyId</code></li>
      <li>Verify the Ed25519 signature over the receipt payload</li>
    </ol>
    <p>Or use the public verifier at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>.</p>
  </>
);

export default SignedReceipts;
