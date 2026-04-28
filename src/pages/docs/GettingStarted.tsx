import { Link } from "react-router-dom";
import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# Getting Started with NexArt

NexArt creates Certified Execution Records (CERs), cryptographically bound records of AI or deterministic execution that can be independently verified.

NexArt supports two integration paths:

## Path A - Single CER (one execution)
For builders who want to certify one execution at a time.
1. Run the execution
2. Create a CER with @nexart/ai-execution
3. (Optional) Attest via the node and verify at verify.nexart.io/c/{certificateHash}

## Path B - Project Bundle (multi-step / multi-agent workflows)
For builders with multi-step or multi-agent workflows that should be verified as a single unit.
1. Create a CER per step
2. Assemble a Project Bundle
3. Register the bundle on the node for public verification at verify.nexart.io

Both paths are first-class. Project Bundles are NOT required for single-execution use cases.

## Install
npm install @nexart/ai-execution

## certificateHash is the canonical identity
Always look up records by certificateHash, not by executionId.
Public verification URL: https://verify.nexart.io/c/{certificateHash}`;

const GettingStarted = () => {
  return (
    <>
      <DocsMeta
        title="Getting Started"
        description="Start with NexArt: certify a single execution or assemble a Project Bundle for multi-step and multi-agent workflows."
      />
      <PageHeader
        title="Getting Started"
        summary="Pick the path that matches your use case: a single execution CER, or a multi-step Project Bundle."
        llmBlock={llmBlock}
      />

      <h2 id="what">What NexArt Does</h2>
      <p>
        NexArt creates <strong>Certified Execution Records (CERs)</strong>, cryptographically bound
        records of AI or deterministic execution that can be independently verified.
      </p>
      <p>
        Every CER produces a deterministic <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.
        That hash is the canonical identity of the record. Optional node attestation produces a signed
        receipt so anyone can verify the record without trusting your infrastructure.
      </p>

      <h2 id="paths">Two Integration Paths</h2>
      <p>
        NexArt supports both single-execution certification and multi-step workflow certification.
        Pick the one that matches your use case. You do not need Project Bundles for every integration.
      </p>

      <div className="not-prose my-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm font-medium text-foreground mb-1">Path A - Single CER</div>
          <div className="text-xs text-muted-foreground mb-3">One execution, one verifiable record.</div>
          <ul className="text-sm text-foreground/90 list-disc pl-4 space-y-1">
            <li>Run the execution</li>
            <li>Create a CER (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">@nexart/ai-execution</code>)</li>
            <li>Optional: verify locally</li>
            <li>Optional: attest via node and share <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">/c/{`{certificateHash}`}</code></li>
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm font-medium text-foreground mb-1">Path B - Project Bundle</div>
          <div className="text-xs text-muted-foreground mb-3">Multi-step or multi-agent workflows verified as a unit.</div>
          <ul className="text-sm text-foreground/90 list-disc pl-4 space-y-1">
            <li>Create a CER per step</li>
            <li>Assemble a <Link to="/docs/concepts/project-bundles" className="text-primary hover:underline">Project Bundle</Link></li>
            <li>Register the bundle on the node</li>
            <li>Verify publicly at <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">verify.nexart.io</code></li>
          </ul>
        </div>
      </div>

      <h2 id="install">Install the SDK</h2>
      <CodeBlock language="bash" code="npm install @nexart/ai-execution" />
      <p className="text-sm text-muted-foreground">Current version: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">@nexart/ai-execution@0.15.0</code>.</p>

      <h2 id="path-a">Path A: Create a Single CER</h2>
      <p>The simplest integration. One execution produces one verifiable record.</p>
      <CodeBlock
        language="typescript"
        title="Single CER"
        code={`import { createLangChainCer } from "@nexart/ai-execution";

const { certificateHash } = createLangChainCer({
  provider: "openai",
  model: "gpt-4o-mini",
  input: {
    messages: [{ role: "user", content: "What is 2 + 2?" }]
  },
  output: {
    text: "4"
  }
});

console.log(certificateHash);`}
      />
      <p>
        The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is
        the canonical identity of the record. Verify the CER locally with the SDK, or share the public
        URL <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">https://verify.nexart.io/c/{`{certificateHash}`}</code>.
      </p>
      <p className="text-sm text-muted-foreground">
        Note: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">executionId</code> is
        not a unique artifact identifier. Always look up records by{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code>.
      </p>

      <h2 id="path-b">Path B: Workflow with a Project Bundle</h2>
      <p>
        For multi-step or multi-agent workflows, certify each step as its own CER and group them into a
        Project Bundle. The bundle has its own <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code> covering
        all step <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> values.
      </p>
      <CodeBlock
        language="typescript"
        title="Linear workflow with @nexart/agent-kit"
        code={`import { startWorkflow } from "@nexart/agent-kit";

const workflow = startWorkflow({ projectTitle: "Contract review" });

const clauses = await workflow.step("Extract clauses", async () => {
  return await llm.call("Extract key clauses...");
});

const risks = await workflow.step("Summarize risks", async () => {
  return await llm.call("Summarize risks from: " + clauses);
});

const bundle = workflow.finish();
// bundle.integrity.projectHash is the verifiable hash`}
      />
      <p>
        For public verification on <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verify.nexart.io</code>,
        the bundle must be registered on the node. See{" "}
        <Link to="/docs/end-to-end-verification" className="text-primary hover:underline">End-to-End Verification</Link> for
        the full registration flow.
      </p>

      <h2 id="verify">Verify the Record</h2>
      <p>
        Verification can be performed independently. Open{" "}
        <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">
          https://verify.nexart.io
        </a>{" "}
        and paste the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>,
        or open the URL directly:
      </p>
      <CodeBlock language="bash" code="https://verify.nexart.io/c/{certificateHash}" />

      <h2 id="examples">Official Example Repos</h2>
      <div className="not-prose my-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a href="https://github.com/artnames/nexart-langchain" target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-border bg-card p-4 hover:border-primary/40 hover:bg-accent/30 transition-colors no-underline">
          <div className="font-medium text-foreground text-sm">LangChain example</div>
          <div className="text-muted-foreground text-xs mt-1">Create and verify CERs in LangChain chains and agent workflows.</div>
          <div className="text-xs text-muted-foreground/60 mt-2">github.com/artnames/nexart-langchain</div>
        </a>
        <a href="https://github.com/artnames/nexart-n8n" target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-border bg-card p-4 hover:border-primary/40 hover:bg-accent/30 transition-colors no-underline">
          <div className="font-medium text-foreground text-sm">n8n example</div>
          <div className="text-muted-foreground text-xs mt-1">Turn n8n workflow outcomes into Certified Execution Records.</div>
          <div className="text-xs text-muted-foreground/60 mt-2">github.com/artnames/nexart-n8n</div>
        </a>
      </div>

      <h2 id="next">Next Steps</h2>
      <ul>
        <li>
          <Link to="/docs/quickstart" className="text-primary hover:underline">Quickstart</Link>
          : the shortest path through both paths
        </li>
        <li>
          <Link to="/docs/concepts/project-bundles" className="text-primary hover:underline">Project Bundles</Link>
          : how multi-step workflows are grouped and verified
        </li>
        <li>
          <Link to="/docs/end-to-end-verification" className="text-primary hover:underline">End-to-End Verification</Link>
          : node registration and public verification
        </li>
        <li>
          <Link to="/docs/integrations/langchain" className="text-primary hover:underline">LangChain</Link>{" "}
          and{" "}
          <Link to="/docs/integrations/n8n" className="text-primary hover:underline">n8n</Link>
          : framework integrations
        </li>
        <li>
          <Link to="/docs/cli" className="text-primary hover:underline">CLI</Link>
          : create and verify CERs from the command line
        </li>
      </ul>
    </>
  );
};

export default GettingStarted;
