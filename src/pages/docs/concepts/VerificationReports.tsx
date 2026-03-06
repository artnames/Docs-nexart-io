import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# Verification Reports
A verification report is a detailed audit document for a CER. It includes:
- CER data and receipt
- Hash verification result
- Signature validation
- Timestamp proof
- Node identity confirmation

Generate via: GET /api/v1/report/{cer_id}
Or SDK: nexart.getReport(cer_id)
Reports can be exported as JSON or PDF for compliance.`;

const VerificationReports = () => (
  <>
    <PageHeader
      title="Verification Reports"
      summary="Detailed audit documents that prove execution integrity."
      llmBlock={llmBlock}
    />
    <h2 id="what">What is a Verification Report?</h2>
    <p>A verification report is a comprehensive document that proves the integrity of a specific AI execution. It combines the CER data, receipt, and independent verification into a single auditable artifact.</p>

    <h2 id="contents">Report Contents</h2>
    <ul>
      <li>CER data (hashes, model, timestamp)</li>
      <li>Receipt and signature</li>
      <li>Hash verification result</li>
      <li>Signature validation status</li>
      <li>Timestamp proof chain</li>
      <li>Attestation node identity</li>
    </ul>

    <h2 id="example">Example Report</h2>
    <CodeBlock
      code={`{
  "report_id": "rpt_4m2k8x9n",
  "cer_id": "cer_8x7k2m4n9p",
  "generated_at": "2026-03-06T12:05:00Z",
  "verification": {
    "hash_integrity": "valid",
    "signature_valid": true,
    "timestamp_verified": true,
    "node_authenticated": true
  },
  "summary": "All checks passed. Execution record is intact.",
  "exportable": ["json", "pdf"]
}`}
      title="Report Response"
    />
  </>
);

export default VerificationReports;
