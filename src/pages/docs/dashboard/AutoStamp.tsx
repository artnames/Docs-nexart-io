import PageHeader from "@/components/docs/PageHeader";

const llmBlock = `# NexArt Auto-Stamp
Auto-stamp is a project-level ingestion setting.

## What it does
- Controls whether CERs are automatically submitted for attestation during ingestion
- Runs server-side in nexart.io, not client-side or SDK-side
- Affects only records associated with that project
- Does not change CER structure — only affects whether a signed receipt is added automatically

## States
Enabled: CERs are automatically sent through the stamping flow during ingestion
Disabled: CERs are ingested and stored, but no automatic stamp. Manual stamping remains available.

## Manual stamping
Even with auto-stamp disabled, records can be manually stamped later:
- Full attestation / signed receipt
- Redacted reseal where applicable
- Hash-only timestamp for legacy or incomplete records

## Relationship to verification
- Stamped records receive signed receipts → all checks PASS → status VERIFIED
- Unstamped records can still verify as VERIFIED for bundle integrity, but attestation checks are SKIPPED`;

const AutoStamp = () => (
  <>
    <PageHeader
      title="Auto-stamp"
      summary="Project-level setting that controls automatic attestation during CER ingestion."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>Auto-stamp is a project-level ingestion setting. It controls whether CERs are automatically submitted for attestation when they are ingested into nexart.io.</p>
    <p>Auto-stamp is not a client-side or SDK-side interception feature. It runs during ingestion on the NexArt platform and affects only records associated with the configured project.</p>

    <h2 id="how">How It Works</h2>
    <ul>
      <li><strong>Enabled.</strong> CERs ingested under the project are automatically sent through the stamping flow during ingestion. Records receive a signed receipt without manual intervention.</li>
      <li><strong>Disabled.</strong> CERs are still ingested and stored, but no automatic stamp is requested. Manual stamping remains available later.</li>
    </ul>
    <p>Auto-stamp behavior is evaluated during ingestion. It does not change the CER structure itself. It only affects whether an attestation receipt is added automatically.</p>

    <h2 id="configure">Configuring Auto-stamp</h2>
    <ol>
      <li>Open the NexArt Dashboard</li>
      <li>Navigate to <strong>Projects</strong></li>
      <li>Select a project</li>
      <li>Open the project settings</li>
      <li>Toggle <strong>Auto-stamp CERs during ingestion</strong></li>
    </ol>
    <p>The setting applies at the project level. All CERs ingested under that project follow the configured behavior.</p>

    <h2 id="manual">Manual Stamping Still Works</h2>
    <p>Even when auto-stamp is disabled, records are still created normally. Users can manually stamp a record later. Available stamping actions include:</p>
    <ul>
      <li>Full attestation, which produces a signed receipt</li>
      <li>Redacted reseal, where applicable</li>
      <li>Hash-only timestamp, for legacy or incomplete records</li>
    </ul>

    <h2 id="when">When to Use It</h2>
    <p><strong>Enable</strong> when:</p>
    <ul>
      <li>You want newly ingested records to become verifiable immediately</li>
      <li>You want consistent automatic attestation for a project</li>
    </ul>
    <p><strong>Disable</strong> when:</p>
    <ul>
      <li>You want to review records before attesting them</li>
      <li>You want to control node usage more carefully</li>
      <li>You only want to stamp selected records manually</li>
    </ul>

    <h2 id="verification">Relationship to Verification</h2>
    <p>Auto-stamp affects whether a record receives a signed receipt automatically. Signed receipts improve verification coverage, so a stamped record can verify as <strong>VERIFIED</strong>.</p>
    <p>If a record is not stamped automatically, verification may remain <strong>PARTIAL</strong> until a manual stamp is added.</p>
  </>
);

export default AutoStamp;
