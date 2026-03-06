import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Verification
Verification confirms three things about a CER:
1. The bundle has not been modified
2. The receipt was signed by a valid attestation node
3. The receipt references the correct certificateHash

## Checks
1. Bundle Integrity — recompute certificateHash from bundle contents, confirm it matches
2. Node Signature — validate Ed25519 signature using key from node.nexart.io/.well-known/nexart-node.json
3. Receipt Consistency — receipt references same certificateHash as bundle, node identity matches

## Independent verification steps
1. Recompute certificateHash from CER bundle (SHA-256)
2. Compare with certificateHash in the signed receipt
3. Fetch node public key from node.nexart.io/.well-known/nexart-node.json
4. Locate key matching attestorKeyId
5. Verify Ed25519 signature over receipt payload

## Outcomes
VERIFIED — all checks pass, valid signed receipt
PARTIAL — some checks pass, no full attestation (hash-only timestamps, redacted exports)
INVALID — one or more checks fail (modified record, bad signature)
UNAVAILABLE — missing data, unsupported format, unknown node

## By bundle type
signed-receipt → VERIFIED
signed-redacted-reseal → VERIFIED or PARTIAL
hash-only-timestamp → PARTIAL
legacy → PARTIAL or UNAVAILABLE

## Verify at
verify.nexart.io or locally using bundle + node keys`;

const Verification = () => (
  <>
    <PageHeader
      title="Verification"
      summary="How to independently validate any NexArt attestation and interpret the result."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>Verification confirms three things about a CER:</p>
    <ol>
      <li>The CER bundle has not been modified</li>
      <li>The receipt was signed by a valid NexArt attestation node</li>
      <li>The receipt references the correct <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code></li>
    </ol>
    <p>Verification can be performed locally using the bundle and the node's public keys, or through the public verifier at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>.</p>

    <h2 id="public-verifier">Public Verifier</h2>
    <p><a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a> provides a UI that performs the same checks as independent verification. You can:</p>
    <ul>
      <li>Upload a CER bundle</li>
      <li>Paste a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code></li>
      <li>Fetch a record by URL (if available)</li>
    </ul>
    <p>The output is a verification report showing the status of each check.</p>

    <h2 id="checks">What Gets Checked</h2>
    <ol>
      <li><strong>Bundle Integrity.</strong> Recompute the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> from the bundle contents and confirm it matches the stored hash. Any modification to the bundle produces a different hash.</li>
      <li><strong>Node Signature.</strong> Validate the Ed25519 signature using the public key published at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code>.</li>
      <li><strong>Receipt Consistency.</strong> Confirm the receipt references the same <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> as the bundle and that the node identity matches the published metadata.</li>
    </ol>

    <h2 id="outcomes">Outcomes</h2>
    <CodeBlock
      code={`VERIFIED      All checks pass. The CER is intact and has a valid
              signed receipt.

PARTIAL       Some checks pass, but the record does not contain
              full attestation data. Common for hash-only timestamps
              or certain redacted exports.

INVALID       One or more checks fail. The record may have been
              modified or the signature does not match the
              published node key.

UNAVAILABLE   Verification cannot be completed due to missing data,
              unsupported bundle format, or unknown node identity.`}
      title="Verification Outcomes"
    />

    <h2 id="independent">Independent Verification</h2>
    <p>To verify a CER without relying on NexArt infrastructure:</p>
    <ol>
      <li>Recompute the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> from the CER bundle (SHA-256)</li>
      <li>Compare it with the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> referenced in the signed receipt</li>
      <li>Fetch the node's public key from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code></li>
      <li>Locate the key matching the receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestorKeyId</code></li>
      <li>Verify the Ed25519 signature over the receipt payload</li>
    </ol>
    <p>Once these steps pass, the attestation can be trusted independently of NexArt infrastructure.</p>

    <h2 id="by-bundle-type">Verification by Bundle Type</h2>
    <ul>
      <li><strong>signed-receipt.</strong> Full verification. All checks should pass, resulting in <strong>VERIFIED</strong>.</li>
      <li><strong>signed-redacted-reseal.</strong> Some snapshot fields may be removed. Verification may return <strong>VERIFIED</strong> or <strong>PARTIAL</strong> depending on the redaction scope.</li>
      <li><strong>hash-only-timestamp.</strong> Only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is attested. Snapshot integrity is not covered. Expect <strong>PARTIAL</strong>.</li>
      <li><strong>legacy.</strong> Older record formats. Verification coverage may be incomplete. Expect <strong>PARTIAL</strong> or <strong>UNAVAILABLE</strong>.</li>
    </ul>
  </>
);

export default Verification;
