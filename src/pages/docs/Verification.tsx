import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Verification
Verify any CER independently.

## Public verifier
verify.nexart.io

## What gets checked
1. Bundle Integrity — certificateHash matches bundle contents
2. Node Signature — Ed25519 signature is valid against published key
3. Receipt Consistency — receipt correctly references the CER

## Outcomes
VERIFIED — all checks pass, full attestation intact
PARTIAL — some checks pass (hash-only timestamps, redacted reseals)
INVALID — one or more checks fail, possible tampering
UNAVAILABLE — cannot verify (missing data, unknown node)

## Independent verification
Fetch node keys from node.nexart.io/.well-known/nexart-node.json
Verify Ed25519 signature over the receipt payload`;

const Verification = () => (
  <>
    <PageHeader
      title="Verification"
      summary="How to independently verify any NexArt attestation."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>Any CER can be verified independently. Verification confirms that the record is authentic, intact, and properly attested by a known node.</p>

    <h2 id="public-verifier">Public Verifier</h2>
    <p>The easiest way to verify a CER is at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>. Upload or paste a CER and get a verification report.</p>

    <h2 id="checks">What Gets Checked</h2>
    <ol>
      <li><strong>Bundle Integrity</strong> — Does the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> match the actual bundle contents? Any modification to the CER after attestation will cause this check to fail.</li>
      <li><strong>Node Signature</strong> — Is the Ed25519 signature valid? Is it signed by a key published at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code>?</li>
      <li><strong>Receipt Consistency</strong> — Does the signed receipt reference the correct <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>? Do the timestamps and node IDs align?</li>
    </ol>

    <h2 id="outcomes">Outcomes</h2>
    <CodeBlock
      code={`VERIFIED      All checks pass. Full attestation is intact.
PARTIAL       Some checks pass. Expected for hash-only timestamps
              and redacted reseals.
INVALID       One or more checks fail. Record may be tampered.
UNAVAILABLE   Cannot perform verification. Missing data or
              unknown node.`}
      title="Verification Outcomes"
    />

    <h2 id="independent">Independent Verification</h2>
    <p>You can verify a CER without using verify.nexart.io:</p>
    <ol>
      <li>Recompute the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> from the bundle contents (SHA-256)</li>
      <li>Compare it to the hash in the signed receipt</li>
      <li>Fetch the node's public key from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code></li>
      <li>Verify the Ed25519 signature over the receipt payload</li>
    </ol>

    <h2 id="by-bundle-type">Verification by Bundle Type</h2>
    <ul>
      <li><strong>signed-receipt</strong> — Full verification. Expects VERIFIED.</li>
      <li><strong>signed-redacted-reseal</strong> — Redacted fields cannot be verified. Expects PARTIAL or VERIFIED depending on what was redacted.</li>
      <li><strong>hash-only-timestamp</strong> — Only the hash is attested, not snapshot contents. Expects PARTIAL.</li>
      <li><strong>legacy</strong> — Older records with limited verification coverage. May return PARTIAL or UNAVAILABLE.</li>
    </ul>
  </>
);

export default Verification;
