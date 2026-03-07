import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Verification
Verification confirms three things about a CER:
1. The bundle has not been modified
2. The receipt was signed by a valid attestation node
3. The receipt references the correct certificateHash

## Public verifier
verify.nexart.io is the public verification portal.
Records can be verified by executionId or certificateHash.
The verifier uses a redacted/public-safe representation. Raw inputs/outputs are not exposed.
URL formats: /e/exec_abc123 or /c/sha256%3A...

## Checks
1. Bundle Integrity — recompute certificateHash from bundle contents, confirm it matches
2. Node Signature — validate Ed25519 signature using key from node.nexart.io/.well-known/nexart-node.json
3. Receipt Consistency — receipt references same certificateHash as bundle, node identity matches

## What gets stored for public verification
- The node returns a signed receipt with certificateHash, timestamp, and signature
- A redacted/public-safe version of the record is persisted
- Input and output content is hashed, not stored by the node or verifier
- Sensitive fields may be hidden from public view

## Outcomes
VERIFIED — all checks pass, valid signed receipt
PARTIAL — some checks pass, no full attestation (hash-only timestamps, redacted exports)
INVALID — one or more checks fail (modified record, bad signature)
UNAVAILABLE — missing data, unsupported format, unknown node

## By bundle type
signed-receipt → VERIFIED
signed-redacted-reseal → VERIFIED or PARTIAL
hash-only-timestamp → PARTIAL
legacy → PARTIAL or UNAVAILABLE`;

const Verification = () => (
  <>
    <PageHeader
      title="Verification"
      summary="How to verify any NexArt record and understand what the public verifier shows."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>Verification confirms three things about a CER:</p>
    <ol>
      <li>The CER bundle has not been modified</li>
      <li>The receipt was signed by a valid NexArt attestation node</li>
      <li>The receipt references the correct <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code></li>
    </ol>

    <h2 id="public-verifier">Public Verifier</h2>
    <p><a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a> is the public verification portal. You can verify a record in two ways:</p>
    <ul>
      <li>By execution ID: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">https://verify.nexart.io/e/exec_abc123</code></li>
      <li>By certificate hash: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">https://verify.nexart.io/c/sha256%3A7f83...</code></li>
    </ul>
    <p>The verifier performs the same checks as independent local verification. The output is a verification report showing the status of each check.</p>

    <h2 id="public-vs-private">What Is Publicly Visible?</h2>
    <p>The public verifier uses a <strong>redacted, public-safe representation</strong> of the record. This means:</p>
    <ul>
      <li>The verification status, certificateHash, timestamp, and node identity are visible.</li>
      <li>Raw input and output content is <strong>not</strong> exposed. The record contains SHA-256 hashes of these fields, not the original text.</li>
      <li>Metadata fields (like appId) may be included or redacted depending on the record's export settings.</li>
    </ul>
    <p>This design allows anyone to verify that a record is intact and properly signed, without seeing the private data that produced it.</p>

    <h2 id="what-gets-stored">What Gets Stored?</h2>
    <p>When a record is certified:</p>
    <ul>
      <li>The attestation node returns a <strong>signed receipt</strong> with the certificateHash, timestamp, node identity, and Ed25519 signature.</li>
      <li>A <strong>redacted/public-safe version</strong> of the record is persisted for public verification.</li>
      <li>Input and output content is hashed (SHA-256). The hashes are included in the record, but the original content is not stored by the node or the public verifier.</li>
      <li>Sensitive fields may be excluded or redacted. You control what metadata is included when you create the record.</li>
    </ul>

    <h2 id="checks">What Gets Checked</h2>
    <ol>
      <li><strong>Bundle Integrity.</strong> Recompute the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> from the bundle contents and confirm it matches. Any modification produces a different hash.</li>
      <li><strong>Node Signature.</strong> Validate the Ed25519 signature using the public key published at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code>.</li>
      <li><strong>Receipt Consistency.</strong> Confirm the receipt references the same <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> as the bundle and that the node identity matches.</li>
    </ol>

    <h2 id="outcomes">Outcomes</h2>
    <CodeBlock
      code={`VERIFIED      All checks pass. The CER is intact and has a valid
              signed receipt.

PARTIAL       Some checks pass, but the record does not have
              full attestation data. Common for hash-only timestamps
              or certain redacted exports.

INVALID       One or more checks fail. The record may have been
              modified or the signature does not match.

UNAVAILABLE   Verification cannot be completed due to missing data,
              unsupported format, or unknown node identity.`}
      title="Verification Outcomes"
    />

    <h2 id="independent">Independent Verification</h2>
    <p>To verify a CER without relying on NexArt infrastructure:</p>
    <ol>
      <li>Recompute the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> from the CER bundle (SHA-256)</li>
      <li>Compare it with the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> in the signed receipt</li>
      <li>Fetch the node's public key from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code></li>
      <li>Find the key matching the receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestorKeyId</code></li>
      <li>Verify the Ed25519 signature over the receipt payload</li>
    </ol>
    <p>Once these steps pass, the attestation can be trusted independently of NexArt infrastructure.</p>

    <h2 id="by-bundle-type">Verification by Bundle Type</h2>
    <ul>
      <li><strong>signed-receipt.</strong> Full verification. All checks should pass, resulting in <strong>VERIFIED</strong>.</li>
      <li><strong>signed-redacted-reseal.</strong> Some snapshot fields may be removed. Verification may return <strong>VERIFIED</strong> or <strong>PARTIAL</strong> depending on redaction scope.</li>
      <li><strong>hash-only-timestamp.</strong> Only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is attested. Snapshot integrity is not covered. Expect <strong>PARTIAL</strong>.</li>
      <li><strong>legacy.</strong> Older record formats. Verification coverage may be incomplete. Expect <strong>PARTIAL</strong> or <strong>UNAVAILABLE</strong>.</li>
    </ul>
  </>
);

export default Verification;
