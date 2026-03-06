import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# CER (Certified Execution Record)
A CER is a portable, tamper-proof record of an AI execution.

## Protected structure
{
  bundleType: "signed-receipt" | "signed-redacted-reseal" | "hash-only-timestamp" | "legacy",
  version: "1.0",
  createdAt: ISO 8601 timestamp,
  snapshot: { ... execution data ... },
  certificateHash: "sha256:..."
}

## Bundle types
- signed-receipt: full execution record with attestation
- signed-redacted-reseal: redacted record re-signed for sharing
- hash-only-timestamp: signs certificateHash only (legacy/incomplete)
- legacy: older records, not fully verifiable

## Exports
CERs can be exported as full, redacted, or legacy depending on the system and export path.
Verification at verify.nexart.io checks bundle integrity, node signature, and receipt consistency.`;

const CER = () => (
  <>
    <PageHeader
      title="What is a CER?"
      summary="Certified Execution Records are the core unit of proof in NexArt."
      llmBlock={llmBlock}
    />
    <h2 id="overview">Overview</h2>
    <p>A <strong>Certified Execution Record (CER)</strong> is a portable, tamper-proof record of an AI execution. It captures what ran, when it ran, and provides cryptographic proof that the record has not been altered since attestation.</p>

    <h2 id="structure">Protected Structure</h2>
    <p>Every CER follows a protected structure with these top-level fields:</p>
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
      title="CER Example (signed-receipt)"
    />

    <h2 id="bundle-types">Bundle Types</h2>
    <p>CERs are not one-size-fits-all. The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType</code> field indicates what kind of record this is:</p>
    <ul>
      <li><strong>signed-receipt</strong> — Full execution record with complete attestation. The snapshot contains all execution data, and the record is fully verifiable.</li>
      <li><strong>signed-redacted-reseal</strong> — A redacted version of a record that has been re-signed by the attestation node. Used when sharing records externally while protecting sensitive fields.</li>
      <li><strong>hash-only-timestamp</strong> — Signs only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. Does not attest snapshot contents. Used for legacy or incomplete records.</li>
      <li><strong>legacy</strong> — Older records from earlier versions of the system. May not be fully verifiable.</li>
    </ul>

    <h2 id="certificate-hash">Certificate Hash</h2>
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is a SHA-256 hash that uniquely identifies the CER's contents. It serves as the fingerprint used during attestation and verification. Any change to the record produces a different hash, making tampering detectable.</p>

    <h2 id="exports">Exports</h2>
    <p>CERs can be exported in different forms depending on the system configuration and export path. A full export includes all snapshot data. A redacted export omits sensitive fields while preserving verifiability through the reseal process. Legacy exports may have limited verification coverage.</p>

    <h2 id="verification">Verification</h2>
    <p>Any CER can be verified at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>. Verification checks bundle integrity, node signature, and receipt consistency. Results are one of: <strong>VERIFIED</strong>, <strong>PARTIAL</strong>, <strong>INVALID</strong>, or <strong>UNAVAILABLE</strong>.</p>
  </>
);

export default CER;
