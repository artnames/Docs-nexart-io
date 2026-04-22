import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# Quickstart

NexArt supports two paths. Pick one.

## Path A - Single CER (one execution)
npm install @nexart/ai-execution
import { createLangChainCer } from "@nexart/ai-execution";
const { certificateHash } = createLangChainCer({ provider, model, input, output });
Verify: https://verify.nexart.io/c/{certificateHash}

## Path B - Project Bundle (multi-step workflow)
npm install @nexart/agent-kit
import { startWorkflow } from "@nexart/agent-kit";
const w = startWorkflow({ projectTitle });
await w.step("name", async () => {...});
const bundle = w.finish();
Then register the bundle on the node for public verification.

certificateHash is the canonical identity. Always verify by certificateHash, never by executionId.`;

const Quickstart = () => (
  <div className="prose prose-invert max-w-none">
    <PageHeader
      title="Quickstart"
      summary="Two integration paths: single execution CER, or multi-step Project Bundle. Pick one."
      llmBlock={llmBlock}
    />

    <p>
      The fastest path from zero to a verified record. For a broader overview, see{" "}
      <Link to="/docs/getting-started" className="text-primary hover:underline">Getting Started</Link>.
    </p>

    <h2>Choose a Path</h2>
    <ul>
      <li><strong>Path A - Single CER</strong>: certify one execution. The most common starting point.</li>
      <li><strong>Path B - Project Bundle</strong>: certify a multi-step or multi-agent workflow as a single verifiable unit.</li>
    </ul>
    <p>Project Bundles are <strong>not</strong> required for single-execution use cases.</p>

    <h2>Path A: Single CER</h2>

    <h3>1. Install the SDK</h3>
    <CodeBlock language="bash" code="npm install @nexart/ai-execution" />
    <p className="text-sm text-muted-foreground">Current version: <code>@nexart/ai-execution@0.15.0</code>.</p>

    <h3>2. Create and Certify a CER</h3>
    <CodeBlock
      language="typescript"
      title="Certify a single AI Execution"
      code={`import { createLangChainCer } from "@nexart/ai-execution";

const { bundle, certificateHash } = createLangChainCer({
  provider: "openai",
  model: "gpt-4o-mini",
  input: {
    messages: [{ role: "user", content: "Should this report be approved?" }]
  },
  output: {
    decision: "approve",
    reason: "policy_passed"
  }
});

console.log(certificateHash);`}
    />
    <p>This produces a Certified Execution Record locally and returns a deterministic <code>certificateHash</code>. That hash is the canonical identity of the record.</p>

    <h3>3. Verify</h3>
    <p>
      Open{" "}
      <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>{" "}
      and paste the <code>certificateHash</code>, or open the URL directly:
    </p>
    <CodeBlock language="bash" code="https://verify.nexart.io/c/{certificateHash}" />
    <p>
      Local CER creation produces a valid, verifiable artifact. Public resolution on <code>verify.nexart.io</code> depends on node attestation or availability of the record.
    </p>
    <p>The verifier checks Bundle Integrity, Node Signature (if attested), and Receipt Consistency.</p>

    <h2>Path B: Project Bundle (Multi-Step Workflow)</h2>

    <h3>1. Install agent-kit</h3>
    <CodeBlock language="bash" code="npm install @nexart/agent-kit" />
    <p className="text-sm text-muted-foreground">Current version: <code>@nexart/agent-kit@0.4.0</code>.</p>

    <h3>2. Build a workflow</h3>
    <CodeBlock
      language="typescript"
      title="Linear workflow producing a Project Bundle"
      code={`import { startWorkflow } from "@nexart/agent-kit";

const workflow = startWorkflow({ projectTitle: "Refund decision" });

const policy = await workflow.step("Check policy", async () => {
  return { eligible: true, policyId: "ret-30d" };
});

const decision = await workflow.step("Final decision", async () => {
  return { decision: "approve_refund", policy };
});

const bundle = workflow.finish();
console.log(bundle.integrity.projectHash);`}
    />

    <h3>3. Register on the node and verify publicly</h3>
    <p>
      To make the bundle verifiable on <code>verify.nexart.io</code>, register it on the node. See{" "}
      <Link to="/docs/end-to-end-verification" className="text-primary hover:underline">End-to-End Verification</Link> for
      the registration flow and node behavior.
    </p>

    <h2>Important: certificateHash, not executionId</h2>
    <p>
      Always look up and share records by <code>certificateHash</code>. <code>executionId</code> is{" "}
      <strong>not</strong> a unique artifact identifier and must not be used as the primary identity for verification.
    </p>

    <h2>Next Steps</h2>
    <ul>
      <li><Link to="/docs/integrations/langchain" className="text-primary hover:underline">LangChain Integration</Link>: certify chain and agent executions</li>
      <li><Link to="/docs/integrations/n8n" className="text-primary hover:underline">n8n Integration</Link>: certify workflow automation results</li>
      <li><Link to="/docs/concepts/project-bundles" className="text-primary hover:underline">Project Bundles</Link>: deeper look at multi-step verification</li>
      <li><Link to="/docs/cli" className="text-primary hover:underline">CLI</Link>: create and verify CERs from the command line</li>
      <li><Link to="/docs/verification" className="text-primary hover:underline">Verification</Link>: deep dive into verification semantics</li>
    </ul>
  </div>
);

export default Quickstart;
