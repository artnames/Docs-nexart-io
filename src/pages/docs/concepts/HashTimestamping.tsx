import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# Hash-Only Timestamping
Hash-only timestamping is a specific attestation mode for legacy or incomplete records.

## How it works
- The node signs only the certificateHash of the CER
- It does NOT attest or verify the snapshot contents
- The result is a signed timestamp proving the hash existed at a specific time

## When it's used
- Legacy records migrated from older systems
- Incomplete records where full snapshot data is unavailable
- Systems that only need proof-of-existence, not content attestation

## Verification
- Hash-only timestamps verify as PARTIAL (not VERIFIED)
- Bundle integrity check: pass
- Node signature check: pass
- Receipt consistency: limited (no snapshot attestation)

## Signature
Ed25519, same as full signed receipts.
Keys at node.nexart.io/.well-known/nexart-node.json`;

const HashTimestamping = () => (
  <>
    <PageHeader
      title="Hash-Only Timestamping"
      summary="A specific attestation mode for legacy or incomplete records."
      llmBlock={llmBlock}
    />
    <h2 id="what">What is Hash-Only Timestamping?</h2>
    <p>Hash-only timestamping is a specific attestation mode where the node signs only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> of a CER. It does <strong>not</strong> attest or verify the snapshot contents.</p>
    <p>This provides proof that a specific hash existed at a specific time, without making any claims about the underlying execution data.</p>

    <h2 id="how">How It Works</h2>
    <ol>
      <li>A CER is created with <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType: "hash-only-timestamp"</code></li>
      <li>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> (SHA-256) is computed from the record</li>
      <li>The attestation node signs only the hash using Ed25519</li>
      <li>A signed receipt is returned — but it covers the hash, not the snapshot</li>
    </ol>

    <h2 id="example">Example</h2>
    <CodeBlock
      code={`{
  "bundleType": "hash-only-timestamp",
  "version": "1.0",
  "createdAt": "2026-03-06T12:00:00.000Z",
  "snapshot": null,
  "certificateHash": "sha256:9e8d7c6b5a4f..."
}`}
      title="Hash-Only Timestamp CER"
    />

    <h2 id="when">When Is It Used?</h2>
    <ul>
      <li><strong>Legacy records</strong> — Records migrated from older systems where full execution data was not captured</li>
      <li><strong>Incomplete records</strong> — Cases where the full snapshot is unavailable at attestation time</li>
      <li><strong>Proof-of-existence</strong> — When you only need to prove a hash existed at a specific time, not attest what it contains</li>
    </ul>

    <h2 id="verification">Verification</h2>
    <p>Hash-only timestamps verify as <strong>PARTIAL</strong>, not VERIFIED. The verification report will show:</p>
    <ul>
      <li><strong>Bundle Integrity</strong> — Pass (the hash is intact)</li>
      <li><strong>Node Signature</strong> — Pass (the signature is valid)</li>
      <li><strong>Receipt Consistency</strong> — Limited (no snapshot was attested)</li>
    </ul>
    <p>This is by design. A hash-only timestamp proves the hash existed at a point in time, but it cannot verify that the underlying content is complete or unmodified.</p>

    <h2 id="vs-full">Compared to Full Signed Receipts</h2>
    <p>A full signed receipt (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType: "signed-receipt"</code>) attests the entire CER including snapshot contents. It verifies as <strong>VERIFIED</strong>. Hash-only timestamps are a lighter alternative when full attestation is not possible.</p>
  </>
);

export default HashTimestamping;
