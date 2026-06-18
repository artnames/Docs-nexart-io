import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# Browser Verification Example

@nexart/ai-execution@1.0.0 provides async, browser-safe verification functions.
No need to write your own browser verifier.

## Functions
- verifyProjectBundleAsync(bundle): verify a Project Bundle in the browser
- verifyCerAsync(bundle): verify a single CER in the browser
- verifySnapshotAsync(snapshot): verify a snapshot in the browser

All use the Web Crypto API internally. No Node.js dependencies.`;

const BrowserVerification = () => (
  <>
    <DocsMeta
      title="Browser Verification"
      description="Verify Certified Execution Records directly in the browser using the public verification portal at verify.nexart.io."
    />
    <PageHeader
      title="Browser Verification"
      summary="Verify CERs and Project Bundles directly in the browser using the async SDK."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>
      As of <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ai-execution@1.0.0</code>, the
      SDK provides async, browser-safe verification functions. You no longer need to write your own browser verifier.
    </p>
    <p>These functions use the Web Crypto API internally and have no Node.js dependencies.</p>

    <div className="not-prose my-6 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
      <div className="text-sm font-medium text-foreground mb-1">Public verification limitation</div>
      <div className="text-sm text-muted-foreground">
        When verifying via public endpoints in the browser,{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">snapshot.input</code> and{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">snapshot.output</code> are redacted.
        <ul className="list-disc pl-5 mt-2">
          <li>Full envelope verification (Layer 3) is NOT possible from public data alone.</li>
          <li>Receipt verification (Layer 2) IS possible.</li>
          <li>certificateHash verification (Layer 1) IS possible against the public-safe representation.</li>
        </ul>
        Full envelope verification requires the unredacted bundle (e.g. when verifying an artifact you hold locally).
      </div>
    </div>

    <h2 id="verify-cer">Verify a CER</h2>
    <CodeBlock
      language="typescript"
      title="Verify a single CER in the browser"
      code={`import { verifyCerAsync } from "@nexart/ai-execution";

const result = await verifyCerAsync(cerBundle);

if (result.status === "VERIFIED") {
  console.log("CER is intact and verified");
} else {
  console.log("Verification failed:", result.checks);
}`}
    />

    <h2 id="verify-project-bundle">Verify a Project Bundle</h2>
    <CodeBlock
      language="typescript"
      title="Verify a Project Bundle in the browser"
      code={`import { verifyProjectBundleAsync } from "@nexart/ai-execution";

const result = await verifyProjectBundleAsync(projectBundle);

if (result.status === "VERIFIED") {
  console.log("All steps verified, projectHash intact");
  console.log("Steps:", result.steps.length);
} else {
  console.log("Verification failed:", result.checks);
}`}
    />

    <h2 id="verify-snapshot">Verify a Snapshot</h2>
    <CodeBlock
      language="typescript"
      title="Verify a snapshot"
      code={`import { verifySnapshotAsync } from "@nexart/ai-execution";

const result = await verifySnapshotAsync(snapshot);
// Verifies snapshot hash integrity`}
    />

    <h2 id="environment">Environment Compatibility</h2>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 font-medium border-b border-border">Mode</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Environment</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Functions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-3 font-medium border-b border-border">Sync</td>
            <td className="px-4 py-3 border-b border-border">Node 18+</td>
            <td className="px-4 py-3 border-b border-border">
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verifyProjectBundle()</code>,{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verifyCer()</code>
            </td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-medium">Async</td>
            <td className="px-4 py-3">Browser, Edge, Node 18+</td>
            <td className="px-4 py-3">
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verifyProjectBundleAsync()</code>,{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verifyCerAsync()</code>,{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verifySnapshotAsync()</code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p className="text-sm text-muted-foreground">
      See{" "}
      <Link to="/docs/sdk" className="text-primary hover:underline">
        AI Execution SDK
      </Link>{" "}
      for the full API reference.
    </p>
  </>
);

export default BrowserVerification;
