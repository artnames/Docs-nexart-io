import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Signed Receipts (Attestation Receipt Protocol)
A signed receipt is the canonical trust artifact in NexArt. It is the attestation proof returned by a node after it certifies a CER.

## What it proves
- The node witnessed the CER bundle
- The receipt binds the node's identity and timestamp to the CER's certificateHash
- The signature is Ed25519

## Canonical location
Attestation data lives at bundle.meta.attestation:
- meta.attestation.receipt — { certificateHash, timestamp, nodeId, kid }
- meta.attestation.signature — raw Ed25519 bytes
- meta.attestation.kid — signing key identifier

## Trust hierarchy
1. Signed receipt (cer.ai.execution.v1 with attestation) — full attestation, fully verifiable
2. hash-only-timestamp — only certificateHash is signed, no snapshot attestation
3. legacy — older records, may lack attestation data

## Canonical signing payload
The signed payload is exactly the receipt object. The node signs its canonical JSON representation using Ed25519.
The resulting signature is stored at meta.attestation.signature. Verification must be performed against this exact payload.
Fields: certificateHash, timestamp, nodeId, kid. No additional fields may be included.
Stable canonical JSON ordering is required for independent verification.

## Receipt immutability
A signed receipt is immutable. If any field changes, the signature becomes invalid.
If the underlying CER changes, a new CER bundle and new signed receipt must be generated.

## Verification rules
A valid signed receipt must satisfy ALL of:
1. certificateHash matches the CER bundle being verified
2. Ed25519 signature is valid for the canonical receipt payload
3. kid resolves to a public key published by the node metadata endpoint
4. Node metadata confirms the signing key exists and was published by the declared nodeId

## Protocol version binding
Receipts are bound to the CER protocol version used by the bundle they attest.
Verification tools must interpret receipts according to the applicable protocol rules.
Future protocol revisions may extend receipt structures while preserving backward verification compatibility.

## Key discovery
node.nexart.io/.well-known/nexart-node.json
Fields: nodeId, activeKid, keys[] (kid, algorithm, publicKey)

## Scope
Current trust model is centered on a canonical attestation node. The receipt protocol is designed for future independent node interoperability.`;

const SignedReceipts = () => (
  <>
    <PageHeader
      title="Signed Receipts"
      summary="The canonical trust artifact returned by a node after it certifies a CER."
      llmBlock={llmBlock}
    />

    <h2 id="what">What is a Signed Receipt?</h2>
    <p>A signed receipt is the attestation proof returned by a NexArt node after it certifies a CER bundle. It is the canonical trust artifact in the NexArt protocol.</p>
    <p>The receipt binds three things together:</p>
    <ul>
      <li>The CER's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code></li>
      <li>The node's identity</li>
      <li>A timestamp</li>
    </ul>
    <p>The Ed25519 signature proves the node witnessed the record at that point in time. The node does not store or own the execution data.</p>

    <h2 id="canonical-location">Canonical Location</h2>
    <p>In a certified CER bundle, attestation data lives under <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code>:</p>
    <ul>
      <li><strong>meta.attestation.receipt</strong> — the canonical payload that was signed</li>
      <li><strong>meta.attestation.signature</strong> — raw Ed25519 signature</li>
      <li><strong>meta.attestation.kid</strong> — the signing key identifier</li>
    </ul>
    <p>The API response from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /v1/cer/ai/certify</code> duplicates the receipt and signature at the top level for convenience, but the CER bundle is the canonical source.</p>

    <h2 id="trust-hierarchy">Trust Hierarchy</h2>
    <p>Not all CERs have the same level of attestation. Signed receipts represent the strongest trust level:</p>
    <ol>
      <li><strong>Signed receipt</strong> — full node attestation. The entire CER bundle is witnessed and signed. This is the canonical trust model and the default when you use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /v1/cer/ai/certify</code>.</li>
      <li><strong>Hash-only timestamp</strong> — only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is signed. The node attests the hash exists at a point in time but does not witness the full snapshot. Used when full attestation is not possible.</li>
      <li><strong>Legacy</strong> — older records that may lack attestation data entirely. Verification coverage is limited.</li>
    </ol>
    <p>For most integrations, signed receipts are what you want. They are the default output of the certify endpoint.</p>

    <h2 id="shape">Receipt Structure</h2>
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt</code> object is the canonical payload that gets signed. Verification is always performed against this payload.</p>
    <CodeBlock
      code={`// Inside the CER bundle at meta.attestation:
{
  "receipt": {
    "certificateHash": "sha256:9e8d7c6b5a4f...",
    "timestamp": "2026-03-06T12:00:00.000Z",
    "nodeId": "nexart-node-primary",
    "kid": "key_01HXYZ..."
  },
  "signature": "<raw Ed25519 signature bytes>",
  "kid": "key_01HXYZ..."
}`}
      title="Attestation Data (meta.attestation)"
    />

    <h2 id="fields">Field Reference</h2>
    <ul>
      <li><strong>receipt</strong> — the canonical payload signed by the node.</li>
      <li><strong>certificateHash</strong> — SHA-256 hash of the CER bundle being attested.</li>
      <li><strong>timestamp</strong> — attestation time generated by the node (ISO 8601).</li>
      <li><strong>nodeId</strong> — identifies which node produced the receipt.</li>
      <li><strong>kid</strong> — the signing key identifier. Matches a key published at the node's well-known endpoint.</li>
      <li><strong>signature</strong> — raw Ed25519 signature over the canonical receipt payload.</li>
    </ul>
    <p>The API response also includes <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signatureB64Url</code> (base64url encoding) for transport convenience.</p>

    <h2 id="verification-url">Verification URLs</h2>
    <p>When you certify a record via the API, the response includes a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationUrl</code>. This URL points to the public verifier where anyone can independently check the record:</p>
    <CodeBlock
      code={`// By execution ID
https://verify.nexart.io/e/exec_abc123

// By certificate hash
https://verify.nexart.io/c/sha256%3A7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`}
      title="Verification URL Formats"
    />
    <p>The verification URL is safe to share. The public verifier shows only a redacted, public-safe representation of the record.</p>

    <h2 id="key-discovery">Key Discovery</h2>
    <p>Nodes publish their public keys at a well-known endpoint. The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> in the receipt tells you which key to use for verification.</p>
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

    <h2 id="canonical-signing-payload">Canonical Signing Payload</h2>
    <p>The signed payload is exactly the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt</code> object. The node signs the canonical JSON representation of this payload using Ed25519. The resulting signature is stored at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.signature</code>.</p>
    <p>Verification must be performed against this exact payload. The canonical payload consists of the following fields only:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">timestamp</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">nodeId</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code></li>
    </ul>
    <p>Stable canonical JSON ordering is required so that independent verifiers produce identical byte sequences and therefore identical verification results. No additional fields may be included in the signing payload.</p>

    <h2 id="receipt-immutability">Receipt Immutability</h2>
    <p>A signed receipt is <strong>immutable</strong>. If any field in the receipt payload is modified after signing, the Ed25519 signature becomes invalid and the attestation cannot be verified.</p>
    <p>The receipt binds together:</p>
    <ul>
      <li>The CER's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code></li>
      <li>The node identity (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">nodeId</code>)</li>
      <li>The attestation timestamp</li>
      <li>The signing key identifier (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code>)</li>
    </ul>
    <p>If the underlying CER changes, a new CER bundle and a new signed receipt must be generated. There is no mechanism to re-sign or amend an existing receipt.</p>
    <p>This immutability is a protocol guarantee. Any mutation to a signed receipt renders the attestation unverifiable.</p>

    <h2 id="verification-rules">Verification Rules</h2>
    <p>A valid signed receipt must satisfy <strong>all</strong> of the following conditions:</p>
    <ol>
      <li>The receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> matches the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> of the CER bundle being verified.</li>
      <li>The Ed25519 signature is valid for the canonical receipt payload.</li>
      <li>The receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> resolves to a public key published by the node at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/.well-known/nexart-node.json</code>.</li>
      <li>The node metadata document confirms that the signing key exists and was published by the node identified by <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">nodeId</code>.</li>
    </ol>
    <p>If any condition fails, the receipt is invalid and the attestation cannot be trusted. These rules apply uniformly to all compliant verification implementations.</p>

    <h2 id="verification">Verifying a Receipt</h2>
    <ol>
      <li>Retrieve the node's public keys from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code></li>
      <li>Select the key matching the receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code></li>
      <li>Verify the Ed25519 signature over the canonical receipt payload</li>
      <li>Confirm the receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> matches the CER bundle</li>
    </ol>
    <p>This process requires no API access to NexArt. You only need the CER bundle and the node's published public key.</p>
    <p>You can also verify through the public verifier at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>.</p>

    <h2 id="protocol-version-binding">Protocol Version Binding</h2>
    <p>Receipts are bound to the CER protocol version used by the bundle they attest. The receipt proves that the node witnessed the record according to the protocol rules applicable at that time.</p>
    <p>Verification tools must interpret the receipt according to the CER Protocol rules applicable to the attested bundle. A receipt signed under an earlier protocol version remains valid when verified against the rules of that version.</p>
    <p>Future protocol revisions may extend receipt structures while preserving backward verification compatibility. Historical receipts must remain independently verifiable under their original protocol semantics.</p>

    <h2 id="scope">Scope</h2>
    <p>The current NexArt trust model is centered on a canonical attestation node. The receipt protocol is designed so that independent node implementations can verify and interoperate against the same receipt structure in the future, but this page describes the current canonical trust model only.</p>
  </>
);

export default SignedReceipts;
