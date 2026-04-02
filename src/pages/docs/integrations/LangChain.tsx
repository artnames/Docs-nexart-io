import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `NexArt LangChain Integration

LangChain workflows can produce Certified Execution Records (CERs) using the NexArt AI Execution SDK (@nexart/ai-execution).

Installation: npm install @nexart/ai-execution
Subpath import: import { createLangChainCer } from "@nexart/ai-execution/langchain";

A CER is a cryptographically bound record of an AI execution, including inputs, outputs, and execution metadata.

Local CER creation:
import { createLangChainCer } from "@nexart/ai-execution/langchain";
const { bundle, certificateHash } = createLangChainCer({ provider, model, input, output });

Node attestation:
import { certifyLangChainRun } from "@nexart/ai-execution";
const result = await certifyLangChainRun({ provider, model, input, output, nodeUrl, apiKey });

Verification: verify.nexart.io. Verify by executionId, certificateHash, or uploaded CER bundle.

Use cases: AI agent decisions, moderation pipelines, workflow approvals, AI-assisted automation.
`;

const LangChain = () => {
  return (
    <div className="prose prose-invert max-w-none">
      <PageHeader
        title="LangChain Integration"
        summary="Generate Certified Execution Records (CERs) from LangChain workflows."
        llmBlock={llmBlock}
      />

      <h2>Best For</h2>
      <ul>
        <li>AI agents that make decisions requiring audit trails</li>
        <li>LangChain chains and multi-step workflows</li>
        <li>Decision systems (moderation, policy review, approvals)</li>
        <li>Application logic that needs verifiable execution records</li>
      </ul>

      <h2>Overview</h2>
      <p>
        LangChain workflows can produce Certified Execution Records (CERs) using the NexArt AI
        Execution SDK. A <strong>CER</strong> is a cryptographically bound record of an AI execution,
        including inputs, outputs, and execution metadata. The record produces a deterministic
        certificate hash and can optionally be attested by a NexArt node.
      </p>

      <div className="not-prose my-6 flex flex-col items-center gap-2 text-sm font-mono">
        <div className="px-4 py-2 rounded-md border border-border bg-card text-foreground">LangChain workflow</div>
        <div className="text-muted-foreground">↓</div>
        <div className="px-4 py-2 rounded-md border border-primary/40 bg-primary/10 text-primary font-medium">createLangChainCer()</div>
        <div className="text-muted-foreground">↓</div>
        <div className="px-4 py-2 rounded-md border border-border bg-card text-foreground">CER bundle + certificate hash</div>
        <div className="text-muted-foreground">↓ (optional)</div>
        <div className="px-4 py-2 rounded-md border border-primary/40 bg-primary/10 text-primary font-medium">NexArt node attestation</div>
        <div className="text-muted-foreground">↓</div>
        <div className="px-4 py-2 rounded-md border border-border bg-card text-foreground">verify.nexart.io</div>
      </div>

      <h2>Two Integration Paths</h2>
      <p>The SDK provides two helpers depending on whether you need node attestation:</p>
      <ul>
        <li>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createLangChainCer(...)</code>{" "}
          creates a CER locally. No network call. Returns a deterministic certificate hash you can verify independently.
        </li>
        <li>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certifyLangChainRun(...)</code>{" "}
          creates a CER and sends it to a NexArt node for attestation. Returns a signed receipt and a public verification URL.
        </li>
      </ul>

      <h2>Installation</h2>
      <CodeBlock language="bash" code="npm install @nexart/ai-execution" />
      <p>
        The LangChain integration is available as a subpath import:
      </p>
      <CodeBlock language="typescript" code={`import { createLangChainCer } from "@nexart/ai-execution/langchain";`} />

      <h2>Create a CER Locally</h2>
      <p>
        Generate a CER from a LangChain run without contacting the node. This creates a
        Certified Execution Record locally and returns a deterministic certificate hash.
      </p>
      <CodeBlock language="typescript" title="Local CER Creation" code={`import { createLangChainCer } from "@nexart/ai-execution";

const { bundle, certificateHash } = createLangChainCer({
  provider: "openai",
  model: "gpt-4o-mini",
  input: {
    messages: [
      { role: "user", content: "Should this customer refund request be escalated?" }
    ]
  },
  output: {
    decision: "escalate",
    reason: "high_value_customer"
  }
});

console.log(certificateHash);`} />

      <h2>Certify with the NexArt Node</h2>
      <p>
        When a node URL is provided, the record is attested by the NexArt node and includes a signed
        receipt. This step is optional. Local CER creation is sufficient for many use cases.
      </p>
      <CodeBlock language="typescript" title="Node Attestation" code={`import { certifyLangChainRun } from "@nexart/ai-execution";

const result = await certifyLangChainRun({
  provider: "openai",
  model: "gpt-4o-mini",
  input: {
    messages: [
      { role: "user", content: "Should this customer refund request be escalated?" }
    ]
  },
  output: {
    decision: "escalate",
    reason: "high_value_customer"
  },
  nodeUrl: "https://your-nexart-node.example",
  apiKey: process.env.NEXART_API_KEY
});

console.log(result.verificationUrl);`} />

      <h2>Verification</h2>
      <p>
        A CER produced by LangChain can be verified the same way as any other NexArt record.
        Open{" "}
        <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          https://verify.nexart.io
        </a>
        {" "}and verify using:
      </p>
      <ul>
        <li><strong>Execution ID</strong>: look up by the execution identifier</li>
        <li><strong>Certificate hash</strong>: paste the deterministic hash</li>
        <li><strong>Uploaded CER bundle</strong>: upload the full bundle for offline-first verification</li>
      </ul>

      <h2>Use Cases</h2>
      <ul>
        <li>AI agent decisions that require audit trails</li>
        <li>Moderation pipelines with verifiable outputs</li>
        <li>Workflow approvals backed by tamper-evident records</li>
        <li>AI-assisted automation with certification</li>
      </ul>

      <h2>Official Example Repo</h2>
      <p>
        <a href="https://github.com/artnames/nexart-langchain" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          github.com/artnames/nexart-langchain
        </a>
        {" "}— runnable integration example for LangChain chains and agent workflows.
      </p>

      <h2>Next Steps</h2>
      <ul>
        <li>
          <Link to="/docs/quickstart" className="text-primary hover:underline">Quickstart</Link>
          : create your first CER in three steps
        </li>
        <li>
          <Link to="/docs/verification" className="text-primary hover:underline">Verification</Link>
          : deep dive into verification semantics
        </li>
        <li>
          <Link to="/docs/examples" className="text-primary hover:underline">Examples</Link>
          : copy-ready API requests and response shapes
        </li>
      </ul>
    </div>
  );
};

export default LangChain;
