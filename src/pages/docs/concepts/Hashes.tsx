import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import { Link } from "react-router-dom";

const llmBlock = `# Certificate Hash vs Project Hash

## certificateHash
- Scope: single execution (one CER)
- Algorithm: SHA-256 of the canonical CER bundle
- Verification URL: verify.nexart.io/c/:certificateHash
- SDK: verifyCer(), verifyCerAsync()

## projectHash
- Scope: multi-step workflow (Project Bundle)
- Algorithm: SHA-256 derived from canonical Project Bundle content (all steps)
- Verification URL: verify.nexart.io/p/:projectHash
- SDK: verifyProjectBundle(), verifyProjectBundleAsync()

Both are SHA-256 hashes. Both are tamper-evident. They differ in scope: one CER vs one Project Bundle.`;

const Hashes = () => (
  <>
    <DocsMeta
      title="Hashes: certificateHash and projectHash"
      description="How NexArt uses certificateHash for individual CERs and projectHash for bundles. certificateHash is the canonical identity."
    />
    <PageHeader
      title="Certificate Hash vs Project Hash"
      summary="Two hash types, two scopes. One for single executions, one for multi-step workflows."
      llmBlock={llmBlock}
    />

    <h2 id="comparison">Comparison</h2>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 font-medium border-b border-border"></th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">certificateHash</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">projectHash</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-3 font-medium border-b border-border">Scope</td>
            <td className="px-4 py-3 border-b border-border">Single execution (one CER)</td>
            <td className="px-4 py-3 border-b border-border">Multi-step workflow (Project Bundle)</td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-medium border-b border-border">Algorithm</td>
            <td className="px-4 py-3 border-b border-border">SHA-256 of canonical CER bundle</td>
            <td className="px-4 py-3 border-b border-border">SHA-256 of canonical Project Bundle</td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-medium border-b border-border">Covers</td>
            <td className="px-4 py-3 border-b border-border">bundleType, version, createdAt, snapshot, context</td>
            <td className="px-4 py-3 border-b border-border">All steps, ordering, per-step CER data, metadata</td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-medium border-b border-border">Verification URL</td>
            <td className="px-4 py-3 border-b border-border"><code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">/c/:certificateHash</code></td>
            <td className="px-4 py-3 border-b border-border"><code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">/p/:projectHash</code></td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-medium border-b border-border">SDK (sync)</td>
            <td className="px-4 py-3 border-b border-border"><code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verifyCer()</code></td>
            <td className="px-4 py-3 border-b border-border"><code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verifyProjectBundle()</code></td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-medium">SDK (async)</td>
            <td className="px-4 py-3"><code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verifyCerAsync()</code></td>
            <td className="px-4 py-3"><code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verifyProjectBundleAsync()</code></td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 id="tamper-evidence">Tamper Evidence</h2>
    <p>Both hashes are tamper-evident. Any modification to the underlying data produces a different hash, making changes immediately detectable during verification.</p>

    <h2 id="when-to-use">When to Use Each</h2>
    <ul>
      <li>Use <strong>certificateHash</strong> when you are certifying a single execution: one AI call, one tool invocation, one deterministic operation.</li>
      <li>Use <strong>projectHash</strong> when you are certifying a multi-step workflow: an agent run with multiple tool calls, a pipeline with sequential stages, or any process where the relationship between steps matters.</li>
    </ul>

    <h2 id="independence">Independence</h2>
    <p>Each CER inside a Project Bundle retains its own <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. You can verify any individual step by its certificateHash without needing the full Project Bundle. The projectHash provides an additional guarantee that the entire workflow is intact.</p>

    <p className="text-sm text-muted-foreground mt-6">
      See <Link to="/docs/concepts/cer" className="text-primary hover:underline">Certified Execution Records</Link> and <Link to="/docs/concepts/project-bundles" className="text-primary hover:underline">Project Bundles</Link> for full details on each artifact type.
    </p>
  </>
);

export default Hashes;
