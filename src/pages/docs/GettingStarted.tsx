import PageHeader from "@/components/docs/PageHeader";

const llmBlock = `# NexArt — Getting Started

NexArt works with Certified Execution Records (CERs) — portable, tamper-evident records of AI or deterministic system executions.

## Core flow
1. Execution — a system or AI process runs
2. CER creation — a CER bundle is produced with execution metadata and a certificateHash
3. Attestation — a node may sign the CER using Ed25519
4. Receipt — the node returns a signed receipt
5. Verification — anyone can verify the bundle and receipt independently

## Record types
- Full signed receipt — complete CER bundle with a signed node receipt
- Signed redacted reseal — redacted export, resealed and signed again for safe sharing
- Hash-only timestamp — signs only the certificateHash when full snapshot attestation is not possible
- Legacy record — historical records that may lack a signed receipt or full verification data

## Key surfaces
- verify.nexart.io — public verification portal
- node.nexart.io — public identity surface of the attestation node
- node.nexart.io/.well-known/nexart-node.json — published signing keys

## Verification checks
1. Bundle Integrity — CER bundle hashes are internally consistent
2. Node Signature — receipt signature is valid against a published node key
3. Receipt Consistency — receipt's certificateHash matches the CER bundle

## Verification outcomes
VERIFIED | PARTIAL | INVALID | UNAVAILABLE

Verification can be performed locally using the bundle and node keys, or through verify.nexart.io.`;

const GettingStarted = () => {
  return (
    <>
      <PageHeader
        title="Getting Started"
        summary="Understand how NexArt works and what CERs are."
        llmBlock={llmBlock}
      />

      <h2 id="what">What is NexArt?</h2>
      <p>NexArt works with <strong>Certified Execution Records (CERs)</strong> — portable, tamper-evident records of AI or deterministic system executions. A CER captures what happened, when it happened, and provides cryptographic proof that the record has not been altered.</p>

      <h2 id="flow">How It Works</h2>
      <ol>
        <li><strong>Execution</strong> — A system or AI process runs</li>
        <li><strong>CER creation</strong> — A CER bundle is produced with execution metadata and a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code></li>
        <li><strong>Attestation</strong> — A node may sign the CER using Ed25519</li>
        <li><strong>Receipt</strong> — The node returns a signed receipt</li>
        <li><strong>Verification</strong> — Anyone can verify the bundle and receipt independently</li>
      </ol>

      <h2 id="record-types">Record Types</h2>
      <ul>
        <li><strong>Full signed receipt</strong> — A complete CER bundle with a signed node receipt</li>
        <li><strong>Signed redacted reseal</strong> — A redacted export that has been resealed and signed again for safe sharing</li>
        <li><strong>Hash-only timestamp</strong> — A receipt that signs only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> when full snapshot attestation is not possible</li>
        <li><strong>Legacy record</strong> — Historical records that may lack a signed receipt or full verification data</li>
      </ul>

      <h2 id="surfaces">Key Surfaces</h2>
      <ul>
        <li><a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a> — Public verification portal</li>
        <li><a href="https://node.nexart.io" target="_blank" rel="noopener noreferrer">node.nexart.io</a> — Public identity surface of the NexArt attestation node</li>
        <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code> — Published signing keys used for independent verification</li>
      </ul>

      <h2 id="verification">Verification</h2>
      <p>Verification checks three things:</p>
      <ul>
        <li><strong>Bundle Integrity</strong> — The CER bundle hashes are internally consistent</li>
        <li><strong>Node Signature</strong> — The receipt signature is valid against a published node key</li>
        <li><strong>Receipt Consistency</strong> — The receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> matches the CER bundle</li>
      </ul>
      <p>Outcomes: <strong>VERIFIED</strong>, <strong>PARTIAL</strong>, <strong>INVALID</strong>, or <strong>UNAVAILABLE</strong>.</p>
      <p>Verification can be performed locally using the bundle and node keys, or through <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>.</p>

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li>Learn about <a href="/docs/concepts/cer">Certified Execution Records</a></li>
        <li>Understand <a href="/docs/concepts/signed-receipts">Signed Receipts</a></li>
        <li>Explore the <a href="/docs/sdk">AI Execution SDK</a></li>
        <li>Try verifying a CER at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a></li>
      </ul>
    </>
  );
};

export default GettingStarted;
