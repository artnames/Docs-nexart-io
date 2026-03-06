import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Auto-Stamp
Auto-stamp automatically attests every AI execution in an app without manual attest() calls.

Setup:
1. Enable in Dashboard → App Settings → Auto-stamp
2. Configure which models to stamp
3. SDK automatically stamps all matching executions

Config shape:
{ enabled: true, models: ["gpt-4", "claude-*"], exclude_metadata_keys: ["debug"] }`;

const AutoStamp = () => (
  <>
    <PageHeader
      title="Auto-stamp"
      summary="Automatically attest every AI execution without code changes."
      llmBlock={llmBlock}
    />
    <h2 id="what">What is Auto-stamp?</h2>
    <p>Auto-stamp removes the need to manually call <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">nexart.attest()</code> for every execution. Once enabled, the SDK automatically stamps all matching AI calls.</p>

    <h2 id="enable">Enabling Auto-stamp</h2>
    <ol>
      <li>Go to Dashboard → your App → Settings</li>
      <li>Toggle <strong>Auto-stamp</strong> on</li>
      <li>Select which models to include</li>
    </ol>

    <h2 id="config">Configuration</h2>
    <CodeBlock
      code={`{
  "auto_stamp": {
    "enabled": true,
    "models": ["gpt-4", "gpt-4-turbo", "claude-*"],
    "exclude_metadata_keys": ["debug", "internal"],
    "sample_rate": 1.0
  }
}`}
      title="Auto-stamp Config"
    />

    <h2 id="sampling">Sampling</h2>
    <p>For high-volume apps, set <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">sample_rate</code> below 1.0 to stamp a percentage of executions. For example, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">0.1</code> stamps 10% of calls.</p>
  </>
);

export default AutoStamp;
