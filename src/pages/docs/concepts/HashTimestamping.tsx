import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# Hash-Only Timestamping
Hash-only timestamping signs the certificateHash of a CER. The node does not attest the snapshot contents.

## What it proves
- The certificateHash existed at a specific time
- The node witnessed the hash
- It does NOT prove what the hash represents or that the snapshot is complete

## When used
- Legacy records where full snapshots were never captured
- Systems migrating to NexArt that only have hashes
- Proof-of-existence workflows

## CER structure
bundleType: "hash-only-timestamp", snapshot may be null or minimal, certificateHash present.

## Verification
Hash-only timestamps typically verify as PARTIAL:
- Bundle Integrity — bundle structure and certificateHash are consistent
- Node Signature — receipt signature is valid against the node's public key
- Receipt Consistency — limited because snapshot was not attested

## vs Full signed receipts
Full signed receipts attest the entire CER bundle and can verify as VERIFIED.
Hash-only timestamps attest only the hash reference and verify as PARTIAL.`;

const HashTimestamping = () => (
  <>
    <PageHeader
      title="Hash-Only Timestamping"
      summary="A receipt mode that signs only the certificateHash, proving existence at a specific time."
      llmBlock={llmBlock}
    />

    <h2 id="what">What is Hash-Only Timestamping?</h2>
    <p>Hash-only timestamping signs the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> of a CER. The node does <strong>not</strong> attest the snapshot contents. The receipt proves that the hash existed at a specific time. It does not prove what the hash represents or that the underlying execution data is complete.</p>
    <p>This mode is distinct from full signed receipts and from redacted reseals. It provides the narrowest form of attestation in NexArt.</p>

    <h2 id="how">How It Works</h2>
    <ol>
      <li>A CER bundle is created with <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType: "hash-only-timestamp"</code></li>
      <li>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is present in the bundle</li>
      <li>The snapshot may be null, missing, or incomplete</li>
      <li>The node signs a receipt binding the hash and timestamp. It does not recompute or verify snapshot contents.</li>
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
    <p>Hash-only timestamping is not a common default. It applies in specific scenarios:</p>
    <ul>
      <li><strong>Legacy records.</strong> Records where full execution snapshots were never captured.</li>
      <li><strong>Migration.</strong> Systems migrating to NexArt that only have hash references from a prior system.</li>
      <li><strong>Proof-of-existence.</strong> Workflows where the goal is to prove a hash existed at a specific time, without attesting the underlying content.</li>
    </ul>

    <h2 id="verification">Verification</h2>
    <p>Hash-only timestamp records typically verify as <strong>PARTIAL</strong>. This is expected behavior:</p>
    <ul>
      <li><strong>Bundle Integrity</strong> passes. The bundle structure and <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> are consistent.</li>
      <li><strong>Node Signature</strong> passes. The receipt signature is valid against the node's public key.</li>
      <li><strong>Receipt Consistency</strong> is limited. The snapshot was not attested, so the receipt covers only the hash reference.</li>
    </ul>
    <p>A PARTIAL result for a hash-only timestamp does not indicate an error. It reflects the narrower scope of attestation.</p>

    <h2 id="vs-full">Compared to Full Signed Receipts</h2>
    <p>A full signed receipt (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType: "signed-receipt"</code>) attests the entire CER bundle, including the snapshot. Only full signed receipts can verify as <strong>VERIFIED</strong>.</p>
    <p>Hash-only timestamps attest only the hash reference. They verify as <strong>PARTIAL</strong> because the node never witnessed the snapshot contents.</p>
  </>
);

export default HashTimestamping;
