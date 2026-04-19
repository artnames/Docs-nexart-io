import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

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
Hash-only timestamps verify as VERIFIED when all applicable checks pass:
- Bundle Integrity - PASS (bundle structure and certificateHash are consistent)
- Node Signature - PASS (receipt signature is valid against the node's public key)
- Receipt Consistency - PASS (receipt references the certificateHash)

The attestation scope is narrower than a full signed receipt, but the verification status is VERIFIED per the CER Protocol.

## vs Full signed receipts
Full signed receipts attest the entire CER bundle.
Hash-only timestamps attest only the hash reference.
Both verify as VERIFIED when checks pass.`;

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
    <p>Hash-only timestamp records verify as <strong>VERIFIED</strong> when all applicable checks pass. Per the <Link to="/docs/cer-protocol" className="text-primary hover:underline">CER Protocol</Link>:</p>
    <ul>
      <li><strong>Bundle Integrity</strong> - PASS. The bundle structure and <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> are consistent.</li>
      <li><strong>Node Signature</strong> - PASS. The receipt signature is valid against the node's public key.</li>
      <li><strong>Receipt Consistency</strong> - PASS. The receipt references the correct <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.</li>
    </ul>
    <p>The attestation scope is narrower than a full signed receipt (snapshot contents are not attested), but the verification status is VERIFIED because all applicable checks pass.</p>

    <h2 id="vs-full">Compared to Full Signed Receipts</h2>
    <p>A full signed receipt (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType: "signed-receipt"</code>) attests the entire CER bundle, including the snapshot. Hash-only timestamps attest only the hash reference.</p>
    <p>Both verify as <strong>VERIFIED</strong> when all applicable checks pass. The difference is in attestation scope, not verification status.</p>
  </>
);

export default HashTimestamping;