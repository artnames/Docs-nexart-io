import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Verification Reports
A verification report is the result of validating a CER bundle and its attestation data.

## Checks
1. Bundle Integrity — computed certificateHash matches the bundle contents
2. Node Signature — receipt signature is valid against the node's published Ed25519 key
3. Receipt Consistency — receipt references the same certificateHash as the CER bundle

## Outcomes
VERIFIED — all checks pass and the record has a valid signed receipt
PARTIAL — some checks pass but the record lacks full attestation (hash-only timestamps, redacted reseals)
INVALID — one or more checks fail (tampering, mismatched hashes, invalid signature)
UNAVAILABLE — required data is missing, node identity unknown, or format unsupported

## How to verify
Locally using the CER bundle and node keys from node.nexart.io/.well-known/nexart-node.json
Or through the public verifier at verify.nexart.io`;

const VerificationReports = () => (
  <>
    <PageHeader
      title="Verification Reports"
      summary="The result of validating a CER bundle and its attestation data."
      llmBlock={llmBlock}
    />

    <h2 id="what">What is a Verification Report?</h2>
    <p>A verification report summarizes the integrity and attestation state of a CER. It is the result of validating the bundle structure, the node signature, and the consistency between the receipt and the record.</p>
    <p>Verification may be performed locally using the CER bundle and the node's published keys, or through the public verifier at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>.</p>

    <h2 id="checks">Verification Checks</h2>
    <ol>
      <li><strong>Bundle Integrity.</strong> Confirm that the CER bundle hashes are internally consistent and that the computed <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> matches the bundle contents.</li>
      <li><strong>Node Signature.</strong> Verify that the receipt signature is valid using the attestation node's published Ed25519 public key.</li>
      <li><strong>Receipt Consistency.</strong> Confirm that the receipt references the same <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> as the CER bundle.</li>
    </ol>

    <h2 id="outcomes">Outcomes</h2>
    <ul>
      <li><strong>VERIFIED.</strong> All verification checks pass and the record has a valid signed receipt.</li>
      <li><strong>PARTIAL.</strong> Some verification checks pass but the record does not contain a full attestation. This commonly occurs with hash-only timestamps or certain redacted exports.</li>
      <li><strong>INVALID.</strong> One or more verification checks fail. This may indicate tampering, mismatched hashes, or an invalid signature.</li>
      <li><strong>UNAVAILABLE.</strong> Verification cannot be performed because required data is missing, the node identity is unknown, or the record format is unsupported.</li>
    </ul>

    <h2 id="example">Example Report</h2>
    <CodeBlock
      code={`{
  "outcome": "VERIFIED",
  "checks": {
    "bundleIntegrity": {
      "status": "pass",
      "detail": "Computed certificateHash matches bundle contents"
    },
    "nodeSignature": {
      "status": "pass",
      "detail": "Ed25519 signature valid against published key",
      "nodeId": "nexart-node-primary",
      "attestorKeyId": "key_01HXYZ..."
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
    <p>A PARTIAL result is expected for certain bundle types. It does not necessarily mean something is wrong.</p>
    <ul>
      <li><strong>Hash-only timestamps.</strong> The node signed the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> but did not attest the snapshot contents. Bundle integrity and node signature pass, but receipt consistency is limited in scope.</li>
      <li><strong>Redacted reseals.</strong> Some fields were removed before resealing. The attestation covers the redacted version, which may limit the scope of what can be verified.</li>
    </ul>

    <h2 id="invalid">When You Get INVALID</h2>
    <p>An INVALID result means one or more checks failed. Common causes:</p>
    <ul>
      <li>Bundle contents were modified after attestation</li>
      <li>Signature does not match the node's published key</li>
      <li>Receipt references a different <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> than the bundle</li>
      <li>Corrupted or malformed bundle</li>
    </ul>
  </>
);

export default VerificationReports;
