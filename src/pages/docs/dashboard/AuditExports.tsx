import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Audit Exports
Export attestation records for compliance and auditing.

## Available exports
1. Single-record audit export (JSON) — export one CER as a JSON file
2. Project-level export (CSV) — export all CERs in a project as CSV

## What exports include
- Verification status
- Stamp status
- Project and app context
- Certificate hash
- Protocol version
- SDK version`;

const AuditExports = () => (
  <>
    <PageHeader
      title="Audit Exports"
      summary="Export attestation records for compliance and auditing."
      llmBlock={llmBlock}
    />
    <h2 id="overview">Overview</h2>
    <p>Audit exports let you download attestation records from the NexArt dashboard for compliance, auditing, or external analysis.</p>

    <h2 id="types">Export Types</h2>
    <ul>
      <li><strong>Single-record audit export (JSON)</strong> — Export an individual CER as a JSON file. Available from the record detail view in the dashboard.</li>
      <li><strong>Project-level export (CSV)</strong> — Export all CER records in a project as a CSV file. Available from the project view in the dashboard.</li>
    </ul>

    <h2 id="contents">What Exports Include</h2>
    <p>Exports contain the following information for each record:</p>
    <ul>
      <li>Verification status</li>
      <li>Stamp status</li>
      <li>Project and app context</li>
      <li>Certificate hash</li>
      <li>Protocol version</li>
      <li>SDK version</li>
    </ul>

    <h2 id="single">Single-Record Export (JSON)</h2>
    <p>From any CER detail page in the dashboard, click <strong>Export</strong> to download the record as a JSON file. This is useful for sharing a specific attestation with auditors or for independent verification.</p>
    <CodeBlock
      code={`{
  "bundleType": "signed-receipt",
  "version": "1.0",
  "createdAt": "2026-03-06T12:00:00.000Z",
  "snapshot": { ... },
  "certificateHash": "sha256:9e8d7c6b5a4f...",
  "receipt": { ... },
  "verificationStatus": "VERIFIED",
  "stampStatus": "stamped",
  "project": "my-project",
  "app": "customer-chatbot",
  "protocolVersion": "1.0",
  "sdkVersion": "0.4.2"
}`}
      title="Single-Record JSON Export (simplified)"
    />

    <h2 id="project">Project-Level Export (CSV)</h2>
    <p>From the project view, click <strong>Export CSV</strong> to download all records in the project. Each row represents one CER with columns for verification status, stamp status, certificate hash, timestamps, and metadata.</p>
  </>
);

export default AuditExports;
