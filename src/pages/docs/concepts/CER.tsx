import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# CER (Certified Execution Record)
A CER is a portable, tamper-evident record of an execution. CERs may represent AI or deterministic system executions.

## Structure
{
  bundleType: "signed-receipt" | "signed-redacted-reseal" | "hash-only-timestamp" | "legacy",
  version: "1.0",
  createdAt: ISO 8601,
  snapshot: { ... execution metadata ... },
  certificateHash: "sha256:..."
}

## certificateHash
- SHA-256 hash derived from the canonical bundle structure
- Uniquely identifies the record
- What the attestation node signs
- Any modification changes the hash

## Bundle types
- signed-receipt — CER with a signed node receipt. Fully verifiable.
- signed-redacted-reseal — redacted export, resealed and signed for safe sharing.
- hash-only-timestamp — signs only certificateHash when full snapshot attestation is not possible.
- legacy — historical records that may lack full attestation or verification data.

## Export paths
- Full export — complete CER with all snapshot data
- Redacted export — sensitive fields removed, resealed to preserve verifiability
- Legacy export — older records with limited verification coverage

## Verification
Checks: bundle integrity, node signature, receipt consistency.
Outcomes: VERIFIED | PARTIAL | INVALID | UNAVAILABLE
Verify locally with bundle + node keys, or at verify.nexart.io.`;

const CER = () => (
  <>
    <PageHeader
      title="What is a CER?"
      summary="Certified Execution Records are the core unit of proof in NexArt."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>A <strong>Certified Execution Record (CER)</strong> is a portable, tamper-evident record of an execution. CERs may represent AI or deterministic system executions. NexArt is not limited to AI.</p>
    <p>A CER binds execution metadata to a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. The bundle structure is deterministic: given the same inputs, the same hash is produced. Verification relies on this hash. Attestation adds a signed receipt, but the CER itself is the base record.</p>

    <h2 id="structure">Protected Structure</h2>
    <p>Every CER has these top-level fields:</p>
    <ul>
      <li><strong>bundleType</strong> identifies the type of record and attestation (see below).</li>
      <li><strong>version</strong> is the protocol version.</li>
      <li><strong>createdAt</strong> records when the CER was created (ISO 8601).</li>
      <li><strong>snapshot</strong> contains the execution metadata captured in the record.</li>
      <li><strong>certificateHash</strong> is a SHA-256 hash derived from the canonical bundle structure.</li>
    </ul>

    <h2 id="example">Example</h2>
    <CodeBlock
      code={`{
  "bundleType": "signed-receipt",
  "version": "1.0",
  "createdAt": "2026-03-06T12:00:00.000Z",
  "snapshot": {
    "model": "gpt-4",
    "promptHash": "sha256:a1b2c3d4e5f6...",
    "outputHash": "sha256:f6e5d4c3b2a1...",
    "metadata": {
      "appId": "my-app",
      "projectId": "proj_abc123"
    }
  },
  "certificateHash": "sha256:9e8d7c6b5a4f..."
}`}
      title="CER Example"
    />

    <h2 id="bundle-types">Bundle Types</h2>
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType</code> field describes the export or attestation condition of the record:</p>
    <ul>
      <li><strong>signed-receipt.</strong> A CER bundle that includes a signed node receipt. Fully verifiable.</li>
      <li><strong>signed-redacted-reseal.</strong> A redacted export that has been resealed and signed again so it can be shared safely while preserving verifiability.</li>
      <li><strong>hash-only-timestamp.</strong> A receipt that signs only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> when full snapshot attestation is not possible.</li>
      <li><strong>legacy.</strong> Historical records that may lack full attestation or verification data.</li>
    </ul>

    <h2 id="certificate-hash">Certificate Hash</h2>
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is a SHA-256 hash derived from the canonical bundle structure. It uniquely identifies the record and is what the attestation node signs. Any modification to the CER, even a single character, produces a different hash, making tampering evident.</p>

    <h2 id="exports">Exports</h2>
    <p>CERs can be exported through different paths:</p>
    <ul>
      <li><strong>Full export.</strong> The complete CER with all snapshot data intact.</li>
      <li><strong>Redacted export.</strong> Sensitive fields are removed. The record is resealed and signed again so that verification still works against the redacted version.</li>
      <li><strong>Legacy export.</strong> Older records with limited verification coverage.</li>
    </ul>

    <h2 id="verification">Verification</h2>
    <p>Any CER can be verified by checking:</p>
    <ul>
      <li><strong>Bundle Integrity.</strong> The CER bundle hashes are internally consistent.</li>
      <li><strong>Node Signature.</strong> The receipt signature is valid against a published node key.</li>
      <li><strong>Receipt Consistency.</strong> The receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> matches the CER bundle.</li>
    </ul>
    <p>Outcomes: <strong>VERIFIED</strong>, <strong>PARTIAL</strong>, <strong>INVALID</strong>, or <strong>UNAVAILABLE</strong>.</p>
    <p>Verification can be performed locally using the bundle and node keys, or through the public verifier at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>.</p>
  </>
);

export default CER;
