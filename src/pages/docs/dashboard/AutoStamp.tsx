import PageHeader from "@/components/docs/PageHeader";

const llmBlock = `# NexArt Auto-Stamp
Auto-stamp is a project-level setting that controls automatic stamping during CER ingestion.

## How it works
- Enabled at the project level in the dashboard
- When enabled: CERs are automatically stamped during ingestion
- When disabled: manual stamping is still available
- This is an ingestion-time behavior in nexart.io, not an SDK-side hook`;

const AutoStamp = () => (
  <>
    <PageHeader
      title="Auto-stamp"
      summary="Automatic stamping during CER ingestion, configurable per project."
      llmBlock={llmBlock}
    />
    <h2 id="what">What is Auto-stamp?</h2>
    <p>Auto-stamp is a project-level setting that controls whether CERs are automatically stamped during ingestion. When enabled, records are stamped as they are ingested into nexart.io without requiring manual action.</p>

    <h2 id="how">How It Works</h2>
    <ul>
      <li><strong>Enabled</strong> — CERs are automatically stamped during ingestion</li>
      <li><strong>Disabled</strong> — CERs are ingested but not automatically stamped. Manual stamping remains available.</li>
    </ul>
    <p>Auto-stamp is an ingestion-time behavior in nexart.io. It is not an SDK-side hook that intercepts model calls.</p>

    <h2 id="configure">Configuring Auto-stamp</h2>
    <ol>
      <li>Go to Dashboard → your Project → Settings</li>
      <li>Toggle <strong>Auto-stamp</strong> on or off</li>
    </ol>
    <p>The setting applies to all CERs ingested under that project.</p>

    <h2 id="when">When to Use It</h2>
    <ul>
      <li><strong>Enable</strong> when you want every ingested record to be stamped automatically</li>
      <li><strong>Disable</strong> when you want to review records before stamping, or only stamp selectively</li>
    </ul>
  </>
);

export default AutoStamp;
