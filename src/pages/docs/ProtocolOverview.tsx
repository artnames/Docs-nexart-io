import PageHeader from "@/components/docs/PageHeader";

const llmBlock = `# NexArt Protocol Overview

NexArt is a protocol for producing verifiable execution records. It separates execution, attestation, and verification.

## Flow
1. Execution: an AI or deterministic system performs an operation.
2. CER Creation: a Certified Execution Record bundle is created with execution metadata and hashes.
3. certificateHash: a SHA-256 hash of the CER bundle is computed. This is the record's fingerprint.
4. Attestation: the CER or its certificateHash is sent to an attestation node. The node signs it using Ed25519.
5. Signed Receipt: the node returns a signed receipt containing the certificateHash, timestamp, nodeId, and attestorKeyId.
6. Verification: anyone can verify the record by checking bundle integrity, node signature, and receipt consistency.

## Record types
- signed-receipt: full attestation of a CER bundle.
- signed-redacted-reseal: redacted CER re-signed for safe sharing.
- hash-only-timestamp: attestation of only the certificateHash. Typically verifies as PARTIAL.
- legacy: older records that may lack full attestation data.

## Verification outcomes
VERIFIED | PARTIAL | INVALID | UNAVAILABLE

## Public surfaces
- verify.nexart.io: public verification portal.
- node.nexart.io: attestation node identity.
- node.nexart.io/.well-known/nexart-node.json: published node signing keys.

## Key discovery
Verifiers fetch node keys from node.nexart.io/.well-known/nexart-node.json and match the attestorKeyId from the receipt to select the correct public key.`;

const ProtocolOverview = () => (
  <>
    <PageHeader
      title="Protocol Overview"
      summary="How NexArt produces, attests, and verifies execution records."
      llmBlock={llmBlock}
    />

    <h2 id="introduction">Introduction</h2>
    <p>NexArt is a protocol for producing verifiable execution records. It allows any system to create a Certified Execution Record (CER), have it attested by a node, and allow independent verification of the result.</p>
    <p>The protocol separates three concerns:</p>
    <ul>
      <li><strong>Execution.</strong> A system performs an operation and records what happened.</li>
      <li><strong>Attestation.</strong> An independent node signs the record to prove it existed at a specific time.</li>
      <li><strong>Verification.</strong> Anyone can check the record's integrity and the node's signature.</li>
    </ul>

    <h2 id="flow">The Execution → Attestation → Verification Flow</h2>
    <div className="my-6 flex justify-center">
      <div className="flex flex-col items-center gap-1 text-sm font-mono">
        {[
          "Execution",
          "CER Bundle Created",
          "certificateHash Computed",
          "Attestation Node",
          "Signed Receipt",
          "Verification",
        ].map((step, i, arr) => (
          <div key={step} className="flex flex-col items-center">
            <div className="px-4 py-2 rounded-md border border-border bg-card text-foreground text-center min-w-[220px]">
              {step}
            </div>
            {i < arr.length - 1 && (
              <div className="text-muted-foreground text-lg leading-none py-0.5">↓</div>
            )}
          </div>
        ))}
      </div>
    </div>

    <h3>Execution</h3>
    <p>An AI or deterministic system performs an operation. The system records inputs, outputs, and relevant metadata.</p>

    <h3>CER Creation</h3>
    <p>A Certified Execution Record (CER) bundle is created. The bundle contains execution metadata and hashes of inputs and outputs. It follows a deterministic structure so that the same data always produces the same hash.</p>

    <h3>certificateHash</h3>
    <p>A SHA-256 hash of the CER bundle is computed. This becomes the record's fingerprint. Any modification to the bundle produces a different hash, making tampering evident.</p>

    <h3>Attestation</h3>
    <p>The CER (or its certificateHash alone) is sent to an attestation node. The node timestamps the record and signs it using Ed25519. This creates a binding between the node's identity, the timestamp, and the record.</p>

    <h3>Signed Receipt</h3>
    <p>The node returns a signed receipt containing the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, timestamp, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">nodeId</code>, and <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestorKeyId</code>. The signature is encoded as base64url for transport.</p>

    <h3>Verification</h3>
    <p>Anyone can verify the record by checking three things: bundle integrity, node signature, and receipt consistency. Verification can be performed locally or through <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>.</p>

    <h2 id="components">Core Components</h2>

    <h3>Certified Execution Record (CER)</h3>
    <p>A structured record that captures execution metadata and hashes of inputs and outputs. The CER is the base unit of proof in NexArt. It is portable, self-contained, and deterministic.</p>

    <h3>Attestation Node</h3>
    <p>A service that signs CERs and produces receipts. Nodes publish their public keys at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code> so verifiers can independently retrieve them.</p>

    <h3>Signed Receipt</h3>
    <p>A cryptographic proof returned by the node. It proves that the node witnessed the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> at a specific time. The receipt does not imply the node stores or owns the execution data.</p>

    <h3>Verification</h3>
    <p>Verification confirms that the CER has not been modified and that the receipt signature is valid. Results are one of: <strong>VERIFIED</strong>, <strong>PARTIAL</strong>, <strong>INVALID</strong>, or <strong>UNAVAILABLE</strong>.</p>

    <h2 id="record-types">Record Types</h2>
    <p>NexArt supports several record types depending on the attestation scope and export path:</p>
    <ul>
      <li><strong>signed-receipt.</strong> Full attestation of a CER bundle. Supports full verification.</li>
      <li><strong>signed-redacted-reseal.</strong> A redacted version of a CER that has been re-signed by the node for safe sharing.</li>
      <li><strong>hash-only-timestamp.</strong> Attestation of only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. Snapshot contents are not attested. Typically verifies as PARTIAL.</li>
      <li><strong>legacy.</strong> Older records from previous system versions. May lack full attestation data.</li>
    </ul>

    <h2 id="surfaces">Public Surfaces</h2>
    <ul>
      <li><a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer"><strong>verify.nexart.io</strong></a> is the public verification portal for CERs.</li>
      <li><a href="https://node.nexart.io" target="_blank" rel="noopener noreferrer"><strong>node.nexart.io</strong></a> is the attestation node identity and status surface.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code> publishes the node's signing keys for independent signature verification.</li>
    </ul>

    <h2 id="why">Why This Matters</h2>
    <p>AI systems increasingly make decisions autonomously. Organizations need to prove what happened, when, and that the record has not been altered. CERs provide a portable, cryptographic record of execution that supports:</p>
    <ul>
      <li>Auditing</li>
      <li>Compliance</li>
      <li>Reproducibility</li>
      <li>Independent verification</li>
    </ul>
    <p>Because verification is independent of the original system, any third party can confirm the integrity of a record without trusting the system that produced it.</p>
  </>
);

export default ProtocolOverview;
