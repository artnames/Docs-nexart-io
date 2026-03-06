import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt — Getting Started

NexArt creates Certified Execution Records (CERs) for AI operations.
CERs are portable, tamper-proof records that prove what ran, when, and that the record is intact.

## Core flow
1. AI execution happens in your system
2. A CER is created capturing the execution (full, redacted, or hash-only)
3. The CER is submitted to an attestation node for signing
4. The node returns a signed receipt with an Ed25519 signature
5. Anyone can verify the CER at verify.nexart.io

## Key surfaces
- verify.nexart.io — public verification
- node.nexart.io — attestation node identity
- node.nexart.io/.well-known/nexart-node.json — node signing keys

## CER bundle types
- Full signed receipt — complete execution record with attestation
- Signed redacted reseal — redacted record re-signed for sharing
- Hash-only timestamp — legacy/incomplete records, signs certificateHash only
- Legacy record — older records, not fully verifiable

## Verification outcomes
VERIFIED | PARTIAL | INVALID | UNAVAILABLE`;

const GettingStarted = () => {
  return (
    <>
      <PageHeader
        title="Getting Started"
        summary="Understand the NexArt attestation flow and how CERs work."
        llmBlock={llmBlock}
      />

      <h2 id="what">What is NexArt?</h2>
      <p>NexArt creates <strong>Certified Execution Records (CERs)</strong> — portable, tamper-proof records of AI executions. A CER captures what happened, when it happened, and provides cryptographic proof that the record has not been altered.</p>

      <h2 id="flow">How It Works</h2>
      <ol>
        <li><strong>Execution</strong> — An AI operation runs in your system</li>
        <li><strong>CER creation</strong> — A CER is created capturing the execution details</li>
        <li><strong>Attestation</strong> — The CER is submitted to an attestation node, which signs it with Ed25519</li>
        <li><strong>Receipt</strong> — The node returns a signed receipt proving attestation</li>
        <li><strong>Verification</strong> — Anyone can verify the CER independently</li>
      </ol>

      <h2 id="record-types">Record Types</h2>
      <p>NexArt supports several record types depending on the use case and export path:</p>
      <ul>
        <li><strong>Full signed receipt</strong> — Complete execution record with full attestation</li>
        <li><strong>Signed redacted reseal</strong> — A redacted version of a record, re-signed for safe sharing</li>
        <li><strong>Hash-only timestamp</strong> — Signs only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, used for legacy or incomplete records</li>
        <li><strong>Legacy record</strong> — Older records that may not be fully verifiable</li>
      </ul>

      <h2 id="surfaces">Key Surfaces</h2>
      <ul>
        <li><a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a> — Public verification portal. Anyone with a CER can verify it here.</li>
        <li><a href="https://node.nexart.io" target="_blank" rel="noopener noreferrer">node.nexart.io</a> — Attestation node identity and status</li>
        <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code> — Published signing keys for independent verification</li>
      </ul>

      <h2 id="verification">Verification</h2>
      <p>Verification checks three things:</p>
      <ul>
        <li><strong>Bundle Integrity</strong> — Is the CER internally consistent and untampered?</li>
        <li><strong>Node Signature</strong> — Was it signed by a known attestation node?</li>
        <li><strong>Receipt Consistency</strong> — Does the receipt match the CER?</li>
      </ul>
      <p>Outcomes: <strong>VERIFIED</strong>, <strong>PARTIAL</strong>, <strong>INVALID</strong>, or <strong>UNAVAILABLE</strong>.</p>

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
