import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const AuditExports = () => (
  <>
    <PageHeader
      title="Audit Exports"
      summary="Export attestation records for compliance and auditing."
    />
    <h2 id="overview">Overview</h2>
    <p>Audit exports let you download a complete archive of CERs, receipts, and verification reports for a specific time range or project.</p>

    <h2 id="formats">Export Formats</h2>
    <ul>
      <li><strong>JSON</strong> — Machine-readable, suitable for further processing</li>
      <li><strong>CSV</strong> — For spreadsheets and simple analysis</li>
      <li><strong>PDF Report</strong> — Formatted for human review and compliance audits</li>
    </ul>

    <h2 id="create">Creating an Export</h2>
    <ol>
      <li>Go to Dashboard → Audit Exports</li>
      <li>Select project, app (optional), and date range</li>
      <li>Choose format</li>
      <li>Click <strong>Generate Export</strong></li>
    </ol>

    <h2 id="api">API Export</h2>
    <CodeBlock
      code={`POST /api/v1/exports
{
  "project_id": "proj_abc123",
  "start_date": "2026-01-01",
  "end_date": "2026-03-06",
  "format": "json"
}

Response:
{
  "export_id": "exp_9x8k2m",
  "status": "processing",
  "download_url": null  // available when status is "ready"
}`}
      title="API Export"
    />
  </>
);

export default AuditExports;
