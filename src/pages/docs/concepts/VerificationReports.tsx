import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# NexArt Verification Reports
A verification report is the result of validating a CER bundle and its attestation data.

## Checks
Each check returns PASS, FAIL, or SKIPPED.
1. Bundle Integrity — computed certificateHash matches the bundle contents
2. Node Signature — receipt signature is valid against the node's published Ed25519 key (matched by kid). SKIPPED if no attestation.
3. Receipt Consistency — receipt (at meta.attestation.receipt) references the same certificateHash as the CER bundle. SKIPPED if no attestation.

## Verification statuses (per CER Protocol)
VERIFIED — all applicable checks pass
FAILED — one or more checks fail
NOT_FOUND — record not located

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
    <p>Each check returns <strong>PASS</strong>, <strong>FAIL</strong>, or <strong>SKIPPED</strong>:</p>
    <ol>
      <li><strong>Bundle Integrity.</strong> Confirm that the CER bundle hashes are internally consistent and that the computed <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> matches the bundle contents.</li>
      <li><strong>Node Signature.</strong> Verify that the receipt signature is valid using the attestation node's published Ed25519 public key, matched by the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> in the receipt. <strong>SKIPPED</strong> if no attestation is present.</li>
      <li><strong>Receipt Consistency.</strong> Confirm that the receipt at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.receipt</code> references the same <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> as the CER bundle. <strong>SKIPPED</strong> if no attestation is present.</li>
    </ol>

    <h2 id="outcomes">Verification Statuses</h2>
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">status</code> field indicates the overall verification outcome, as defined by the <Link to="/docs/cer-protocol" className="text-primary hover:underline">CER Protocol</Link>:</p>
    <ul>
      <li><strong>VERIFIED.</strong> All applicable verification checks pass.</li>
      <li><strong>FAILED.</strong> One or more verification checks fail. This may indicate tampering, mismatched hashes, or an invalid signature.</li>
      <li><strong>NOT_FOUND.</strong> The requested execution record was not located.</li>
    </ul>

    <h2 id="example">Example Report</h2>
    <CodeBlock
      code={`{
  "status": "VERIFIED",
  "checks": {
    "bundleIntegrity": "PASS",
    "nodeSignature": "PASS",
    "receiptConsistency": "PASS"
  },
  "reasonCodes": [],
  "certificateHash": "sha256:...",
  "bundleType": "cer.ai.execution.v1",
  "verifiedAt": "2026-03-06T12:05:00.000Z",
  "verifier": "nexart-verifier/1.0.0"
}`}
      title="Verification Report (VERIFIED)"
    />

    <h2 id="skipped">When Checks Are SKIPPED</h2>
    <p>If a CER bundle has no attestation, the Node Signature and Receipt Consistency checks are <strong>SKIPPED</strong>. This is expected for unattested bundles created via <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /v1/cer/ai/create</code>.</p>
    <CodeBlock
      code={`{
  "status": "VERIFIED",
  "checks": {
    "bundleIntegrity": "PASS",
    "nodeSignature": "SKIPPED",
    "receiptConsistency": "SKIPPED"
  },
  "reasonCodes": [],
  "certificateHash": "sha256:...",
  "bundleType": "cer.ai.execution.v1",
  "verifiedAt": "2026-03-06T12:05:00.000Z",
  "verifier": "nexart-verifier/1.0.0"
}`}
      title="Verification Report (No Attestation)"
    />

    <h2 id="failed">When You Get FAILED</h2>
    <p>A FAILED result means one or more checks did not pass. Common causes:</p>
    <ul>
      <li>Bundle contents were modified after attestation</li>
      <li>Signature does not match the node's published key</li>
      <li>Receipt references a different <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> than the bundle</li>
      <li>Corrupted or malformed bundle</li>
    </ul>
  </>
);

export default VerificationReports;