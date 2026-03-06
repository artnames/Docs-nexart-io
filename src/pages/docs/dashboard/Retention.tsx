import PageHeader from "@/components/docs/PageHeader";

const llmBlock = `# NexArt Retention Policy
Retention policy is a project-level configuration defining how long CERs are intended to be stored.

## Available options
- 30 days — development, temporary workflows
- 90 days — operational monitoring, short audit windows
- 1 year — typical production retention
- Forever — retained indefinitely unless manually deleted or exported

## Current status
- Configuration only — stored and displayed in the dashboard
- Automatic deletion or archival is NOT yet enforced
- Enforcement planned for a future release

## Key points
- Affects record storage lifecycle, not cryptographic validity
- Applies to new records ingested under the project
- Records can be exported at any time via Audit Exports
- Exported CERs remain independently verifiable outside NexArt`;

const Retention = () => (
  <>
    <PageHeader
      title="Retention Policy"
      summary="Project-level configuration for how long CER records are intended to be stored."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>Retention policy is a <strong>project-level configuration</strong> that defines how long Certified Execution Records (CERs) are intended to be stored within NexArt. The policy affects <strong>record storage lifecycle</strong>, not the cryptographic validity of CERs.</p>
    <p>Retention policies help organizations manage:</p>
    <ul>
      <li>Storage costs</li>
      <li>Compliance requirements</li>
      <li>Record lifecycle management</li>
    </ul>

    <h2 id="options">Available Options</h2>
    <ul>
      <li><strong>30 days.</strong> Short-term storage suitable for development environments or temporary workflows.</li>
      <li><strong>90 days.</strong> Medium-term storage for operational monitoring and short audit windows.</li>
      <li><strong>1 year.</strong> Typical operational retention period for many production systems.</li>
      <li><strong>Forever.</strong> Records are retained indefinitely unless manually deleted or exported.</li>
    </ul>
    <p>These are project-level defaults applied to new records ingested under the project.</p>

    <h2 id="set">Setting a Retention Policy</h2>
    <ol>
      <li>Open the <strong>NexArt Dashboard</strong></li>
      <li>Navigate to <strong>Projects</strong></li>
      <li>Select a project</li>
      <li>Open <strong>Project Settings</strong></li>
      <li>Choose a <strong>Retention Policy</strong></li>
    </ol>
    <p>The selected policy applies to new records ingested under that project.</p>

    <h2 id="status">Current Implementation Status</h2>
    <p>Retention policy is currently <strong>configuration only</strong>. The setting is stored and displayed in the dashboard, but:</p>
    <ul>
      <li>Automatic deletion is <strong>not yet enforced</strong></li>
      <li>Automatic archival is <strong>not yet enforced</strong></li>
      <li>Records are retained regardless of the configured policy until enforcement is implemented</li>
    </ul>
    <p>Enforcement will be implemented in a future release.</p>

    <h2 id="exports">Record Ownership and Exports</h2>
    <p>Even with a configured retention policy:</p>
    <ul>
      <li>Users can export CER records at any time</li>
      <li>Exported records remain valid outside the NexArt platform</li>
      <li>Exported records can still be independently verified</li>
    </ul>
    <p><a href="/docs/dashboard/audit-exports">Audit Exports</a> are the recommended way to archive records before any future lifecycle enforcement takes effect.</p>

    <h2 id="future">Future Lifecycle Enforcement</h2>
    <p className="text-muted-foreground">Future versions of NexArt will use the retention policy to automatically manage record lifecycle, including automated archival, deletion after the configured retention window, and enterprise archival tiers. No timelines are guaranteed.</p>
  </>
);

export default Retention;
