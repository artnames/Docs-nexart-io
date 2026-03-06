import PageHeader from "@/components/docs/PageHeader";

const llmBlock = `# NexArt Retention Policy
Retention policy is a project-level setting that controls how long records are retained.

## Available options
- 30 days
- 90 days
- 1 year
- Forever

## Current status
- Display and configuration only
- Enforcement (automatic deletion) is planned for a future release
- Export records via Audit Exports before any future enforcement`;

const Retention = () => (
  <>
    <PageHeader
      title="Retention Policy"
      summary="Project-level setting for how long CER records are retained."
      llmBlock={llmBlock}
    />
    <h2 id="overview">Overview</h2>
    <p>Retention policy is a project-level setting that defines how long NexArt retains your attestation records.</p>

    <h2 id="options">Available Options</h2>
    <ul>
      <li><strong>30 days</strong></li>
      <li><strong>90 days</strong></li>
      <li><strong>1 year</strong></li>
      <li><strong>Forever</strong></li>
    </ul>

    <h2 id="set">Setting a Policy</h2>
    <p>Go to Dashboard → Project Settings → Retention. Select your preferred retention period. The setting applies at the project level.</p>

    <h2 id="enforcement">Current Status</h2>
    <p>Retention policy is currently <strong>display and configuration only</strong>. You can set your preferred retention period, but automatic enforcement (deletion of records after the retention window) is not yet active. This is planned for a future release.</p>
    <p>In the meantime, you can export records at any time using <a href="/docs/dashboard/audit-exports">Audit Exports</a>.</p>
  </>
);

export default Retention;
