import PageHeader from "@/components/docs/PageHeader";

const llmBlock = `# NexArt FAQ Summary

## What is NexArt?
NexArt works with Certified Execution Records (CERs) — portable, tamper-evident records of AI or deterministic system executions.

## How verification works
Three checks: Bundle Integrity, Node Signature, Receipt Consistency.
Outcomes: VERIFIED | PARTIAL | INVALID | UNAVAILABLE.
Verify at verify.nexart.io or locally using bundle + node keys.

## Signed receipts vs hash-only timestamps
- Signed receipts: full attestation, can verify as VERIFIED
- Hash-only timestamps: sign only certificateHash, verify as PARTIAL (snapshot not attested)

## What is certificateHash?
SHA-256 fingerprint of the CER bundle. Uniquely identifies the record. Attestation receipts bind to this hash.

## Node key discovery
node.nexart.io/.well-known/nexart-node.json
Use attestorKeyId from the receipt to select the correct key.

## Record types
Records may be full, redacted, hash-only, or legacy depending on source and export path.`;

const FAQ = () => (
  <>
    <PageHeader
      title="FAQ"
      summary="Frequently asked questions about NexArt."
      llmBlock={llmBlock}
    />

    <h2 id="what-is-nexart">What is NexArt?</h2>
    <p>NexArt works with <strong>Certified Execution Records (CERs)</strong>, portable, tamper-evident records of AI or deterministic system executions. CERs capture what happened, when, and provide cryptographic proof that the record has not been altered.</p>

    <h2 id="what-verify">What can NexArt verify?</h2>
    <p>Verification checks three things: <strong>Bundle Integrity</strong> (the CER bundle hashes are internally consistent), <strong>Node Signature</strong> (the receipt signature is valid against the node's published Ed25519 key), and <strong>Receipt Consistency</strong> (the receipt references the correct <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>). Results are <strong>VERIFIED</strong>, <strong>PARTIAL</strong>, <strong>INVALID</strong>, or <strong>UNAVAILABLE</strong>.</p>

    <h2 id="receipts-vs-timestamps">What is the difference between signed receipts and hash-only timestamps?</h2>
    <p>A <strong>signed receipt</strong> supports full attestation of the CER bundle and can verify as VERIFIED. A <strong>hash-only timestamp</strong> signs only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. It proves the hash existed at a specific time but does not attest the snapshot contents. Hash-only timestamps typically verify as <strong>PARTIAL</strong>.</p>

    <h2 id="partial">What does PARTIAL mean?</h2>
    <p>A PARTIAL verification result does not necessarily mean something is wrong. It usually means the record has limited attestation scope: snapshot contents were not fully attested, or the record is a redacted, legacy, or hash-only form. The signature and hash may still be valid. The attestation simply covers a narrower scope than a full signed receipt.</p>

    <h2 id="redacted">What does a redacted export prove?</h2>
    <p>A redacted export contains a limited view of the original record with sensitive fields removed. A <strong>redacted reseal</strong> is signed again by the attestation node so the shared version remains verifiable. The signature covers exactly what is present in the exported record. The original full bundle is not recoverable from the redacted version.</p>

    <h2 id="legacy">What is a legacy record?</h2>
    <p>A legacy record is a historical record format that may lack full attestation data, a complete bundle structure, or a signed receipt. Legacy records may verify as <strong>PARTIAL</strong> or <strong>UNAVAILABLE</strong> depending on available data.</p>

    <h2 id="certificate-hash">What is certificateHash?</h2>
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is the SHA-256 fingerprint of the CER bundle. It uniquely identifies the record. Attestation receipts bind to this hash. Any modification to the bundle produces a different hash, making tampering evident.</p>

    <h2 id="store-data">Does NexArt always store the full original content?</h2>
    <p>Not always. Records may be full, redacted, hash-only, or legacy depending on the source and export path. Some records contain complete snapshot data, others contain only hashes, and redacted exports have sensitive fields removed. The record's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType</code> indicates what kind of data is present.</p>

    <h2 id="node-keys">Where do verifiers fetch node keys?</h2>
    <p>Node signing keys are published at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code>. Verifiers use the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestorKeyId</code> from the receipt to select the correct key for Ed25519 signature verification.</p>

    <h2 id="models">Which AI models are supported?</h2>
    <p>NexArt does not depend on a specific AI provider. Model identifiers can be recorded in CER metadata. NexArt can be used with many AI systems as long as valid execution records are produced.</p>

    <h2 id="self-hosted">Can I self-host an attestation node?</h2>
    <p>Self-hosted attestation nodes are on the roadmap but not currently available.</p>

    <h2 id="verify-where">Where can I verify a CER?</h2>
    <p>Public verification is available at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>. Independent verification can also be performed locally using the CER bundle, signed receipt, and node keys from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code>.</p>
  </>
);

export default FAQ;
