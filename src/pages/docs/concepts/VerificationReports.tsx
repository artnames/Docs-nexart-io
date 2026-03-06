import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# Verification Reports
A verification report is the result of verifying a CER. It checks three things:

## Checks
1. Bundle Integrity — Is the CER internally consistent and untampered?
2. Node Signature — Was it signed by a known attestation node (Ed25519)?
3. Receipt Consistency — Does the receipt match the CER?

## Outcomes
- VERIFIED — All checks pass. Full attestation intact.
- PARTIAL — Some checks pass. Typical for hash-only timestamps.
- INVALID — One or more checks fail. Record may be tampered.
- UNAVAILABLE — Cannot perform verification (missing data, unknown node, etc.)

## Public verifier
verify.nexart.io`;

const VerificationReports = () => (
  <>
    <PageHeader
      title="Verification Reports"
      summary="The result of verifying a CER — what gets checked and what the outcomes mean."
      llmBlock={llmBlock}
    />
    <h2 id="what">What is a Verification Report?</h2>
    <p>A verification report is the result of verifying a CER. It tells you whether the record is authentic, intact, and properly attested. You can generate one at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>.</p>

    <h2 id="checks">What Gets Checked</h2>
    <p>Every verification runs three checks:</p>
    <ul>
      <li><strong>Bundle Integrity</strong> — Is the CER internally consistent? Does the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> match the actual contents?</li>
      <li><strong>Node Signature</strong> — Was the receipt signed by a known attestation node using Ed25519? Is the key still valid?</li>
      <li><strong>Receipt Consistency</strong> — Does the signed receipt correctly reference the CER? Do the hashes and timestamps align?</li>
    </ul>

    <h2 id="outcomes">Outcomes</h2>
    <CodeBlock
      code={`VERIFIED     All checks pass. Full attestation is intact.
PARTIAL      Some checks pass. Typical for hash-only timestamps
             or redacted reseals where snapshot attestation is limited.
INVALID      One or more checks fail. The record may be tampered
             or the signature does not match.
UNAVAILABLE  Verification cannot be performed. Missing data,
             unknown node, or unsupported bundle type.`}
      title="Verification Outcomes"
    />

    <h2 id="example">Example Report</h2>
    <CodeBlock
      code={`{
  "outcome": "VERIFIED",
  "checks": {
    "bundleIntegrity": {
      "status": "pass",
      "detail": "certificateHash matches bundle contents"
    },
    "nodeSignature": {
      "status": "pass",
      "detail": "Ed25519 signature valid",
      "attestorKeyId": "key_01HXYZ...",
      "nodeId": "nexart-node-primary"
    },
    "receiptConsistency": {
      "status": "pass",
      "detail": "Receipt references correct certificateHash"
    }
  },
  "bundleType": "signed-receipt",
  "verifiedAt": "2026-03-06T12:05:00.000Z"
}`}
      title="Verification Report (VERIFIED)"
    />

    <h2 id="partial">When You Get PARTIAL</h2>
    <p>A PARTIAL result is expected for certain record types. Hash-only timestamps, for example, only attest the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> — not the snapshot contents. The signature and hash are valid, but the attestation scope is limited.</p>
    <p>Redacted reseals may also produce PARTIAL results depending on what was redacted.</p>

    <h2 id="invalid">When You Get INVALID</h2>
    <p>An INVALID result means something is wrong. Common causes:</p>
    <ul>
      <li>The CER contents have been modified after attestation</li>
      <li>The signature does not match the node's published key</li>
      <li>The receipt references a different <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> than the bundle</li>
    </ul>
  </>
);

export default VerificationReports;
