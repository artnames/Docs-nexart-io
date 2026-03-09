import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Audit Exports
Audit exports allow users to export verification and attestation information from the dashboard.

## Export types
1. Single-record audit export (JSON) — audit summary for one CER, from the record detail / CER drawer
2. Project-level export (CSV) — summary of records belonging to a project

## Important distinction
- Audit exports are summary/reporting formats for auditors and operational workflows
- Raw CER downloads are separate — protocol-level bundles for independent cryptographic verification
- The audit export is NOT the raw CER bundle

## Single-record audit export fields
exportType, exportedAt, execution_id, certificate_hash, bundle_type, surface, project, app,
verification (outcome + checks), stamp_status, stamp_mode, attestor_key_id, node_url,
protocol_version, sdk_version, execution_timestamp, auto_stamp_status

## Project-level CSV fields
created_at, project, app, execution_id, bundle_type, surface, certificate_hash,
verification_status, stamp_status, protocol_version, sdk_version`;

const AuditExports = () => (
  <>
    <PageHeader
      title="Audit Exports"
      summary="Export verification and attestation information for audit review, analysis, and reporting."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>Audit Exports allow users to export verification and attestation information from the NexArt dashboard for audit review, external analysis, record portability, and operational reporting.</p>
    <p>Exports are generated from the dashboard and reflect the current verification state of records.</p>

    <h2 id="types">Supported Export Types</h2>
    <ul>
      <li><strong>Single-record audit export (JSON).</strong> Export an audit summary for one CER from the record detail view or CER drawer.</li>
      <li><strong>Project-level export (CSV).</strong> Export a CSV summary of records belonging to a project.</li>
    </ul>

    <h2 id="single">Single-Record Audit Export (JSON)</h2>
    <p>The single-record export is an <strong>audit summary</strong>. It is not the raw CER bundle. It is designed for review and reporting rather than raw protocol transport.</p>
    <p>To export: open a CER in the dashboard and click <strong>Export audit report</strong>.</p>
    <p>The export includes fields such as:</p>
    <CodeBlock
      code={`{
  "exportType": "audit-report",
  "exportedAt": "2026-03-06T12:10:00.000Z",
  "execution_id": "exec_8x7k2m4n9p",
  "certificate_hash": "sha256:9e8d7c6b5a4f...",
  "bundle_type": "signed-receipt",
  "surface": "nexart.io",
  "project": "my-project",
  "app": "customer-chatbot",
  "verification": {
    "status": "VERIFIED",
    "bundleIntegrity": "PASS",
    "nodeSignature": "PASS",
    "receiptConsistency": "PASS"
  },
  "stamp_status": "stamped",
  "stamp_mode": "auto",
  "attestor_key_id": "key_01HXYZ...",
  "node_url": "node.nexart.io",
  "protocol_version": "1.0",
  "sdk_version": "0.4.2",
  "execution_timestamp": "2026-03-06T12:00:00.000Z",
  "auto_stamp_status": "enabled"
}`}
      title="Single-Record Audit Export"
    />

    <h2 id="single-fields">Single-Record Export Fields</h2>
    <ul>
      <li><strong>execution_id</strong> is the unique identifier for the execution.</li>
      <li><strong>certificate_hash</strong> is the SHA-256 hash of the CER bundle.</li>
      <li><strong>bundle_type</strong> indicates the record type (signed-receipt, hash-only-timestamp, etc.).</li>
      <li><strong>surface</strong> shows where the record was created.</li>
      <li><strong>verification</strong> contains the verification outcome and individual check results.</li>
      <li><strong>stamp_status / stamp_mode</strong> indicate whether the record is stamped and how.</li>
      <li><strong>attestor_key_id / node_url</strong> provide attestation node information.</li>
      <li><strong>protocol_version / sdk_version</strong> capture version metadata.</li>
      <li><strong>execution_timestamp</strong> records when the execution occurred.</li>
      <li><strong>auto_stamp_status</strong> reflects the project auto-stamp setting at time of ingestion.</li>
    </ul>

    <h2 id="project">Project-Level Export (CSV)</h2>
    <p>The project export produces a CSV summary of all records in a project. It is intended for operational review, spreadsheet analysis, audit scoping, and high-level reporting.</p>
    <p>To export: open a project in the dashboard and click <strong>Export CSV</strong>.</p>
    <p>Each row includes:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">created_at</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">project</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">app</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">execution_id</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundle_type</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">surface</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificate_hash</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verification_status</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">stamp_status</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocol_version</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">sdk_version</code></li>
    </ul>
    <p>The CSV export does not replace the raw CER bundle download.</p>

    <h2 id="vs-raw">Audit Export vs Raw CER Download</h2>
    <ul>
      <li><strong>Audit Export.</strong> Summary and reporting format. Easier for auditors and operational workflows. Includes verification state, project context, and attestation metadata.</li>
      <li><strong>Raw CER Download.</strong> Protocol-level bundle. Used for independent cryptographic verification and record portability. Available separately through the CER download flow.</li>
    </ul>
    <p>Both are available from the dashboard. They serve different purposes.</p>
  </>
);

export default AuditExports;
