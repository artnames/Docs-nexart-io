import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `NexArt LangChain Integration

LangChain workflows can produce Certified Execution Records (CERs) using the NexArt AI Execution SDK (@nexart/ai-execution).

Installation: npm install @nexart/ai-execution

Local CER creation:
import { createLangChainCer } from "@nexart/ai-execution";
const { bundle, certificateHash } = createLangChainCer({ provider, model, input, output });

Node attestation:
import { certifyLangChainRun } from "@nexart/ai-execution";
const result = await certifyLangChainRun({ provider, model, input, output, nodeUrl, apiKey });

Verification: verify.nexart.io — verify by executionId, certificateHash, or uploaded CER bundle.

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

      <h2>Overview</h2>
      <p>
        LangChain workflows can produce Certified Execution Records (CERs) using the NexArt AI
        Execution SDK. This allows developers to:
      </p>
      <ul>
        <li>Generate tamper-evident records for AI runs</li>
        <li>Optionally send those records to a NexArt node for attestation</li>
        <li>Verify the execution independently using the NexArt verifier</li>
      </ul>
      <p>
        A <strong>Certified Execution Record (CER)</strong> is a cryptographically bound record of an AI execution, including inputs, outputs, and execution metadata. The record produces a deterministic certificate hash and can optionally be attested by a NexArt node.
      </p>
      <p>
        The integration uses the <code>@nexart/ai-execution</code> package.
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

      <h2>Installation</h2>
      <CodeBlock language="bash" code="npm install @nexart/ai-execution" />

      <h2>Create a CER Locally</h2>
      <p>
        You can generate a CER from a LangChain run without contacting the node. This creates a
        Certified Execution Record locally and returns a deterministic certificate hash.
      </p>
      <CodeBlock language="typescript" title="Local CER Creation" code={`import { createLangChainCer } from "@nexart/ai-execution";

const { bundle, certificateHash } = createLangChainCer({
  provider: "openai",
  model: "gpt-4o-mini",
  input: {
    messages: [{ role: "user", content: "What is 2 + 2?" }]
  },
  output: {
    text: "4"
  }
});

console.log(certificateHash);`} />

      <h2>Certify with the NexArt Node</h2>
      <p>
        When a node URL is provided, the record is attested by the NexArt node and includes a signed
        receipt. This step is optional — local CER creation is sufficient for many use cases.
      </p>
      <CodeBlock language="typescript" title="Node Attestation" code={`import { certifyLangChainRun } from "@nexart/ai-execution";

const result = await certifyLangChainRun({
  provider: "openai",
  model: "gpt-4o-mini",
  input: {
    messages: [{ role: "user", content: "What is 2 + 2?" }]
  },
  output: {
    text: "4"
  },
  nodeUrl: "https://nexart-node.example",
  apiKey: process.env.NEXART_API_KEY
});

console.log(result.receipt.attestationId);`} />

      <h2>Verification</h2>
      <p>
        Generated CERs can be verified independently at{" "}
        <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          verify.nexart.io
        </a>
        . Records can be verified using:
      </p>
      <ul>
        <li>Execution ID</li>
        <li>Certificate hash</li>
        <li>Uploaded CER bundle</li>
      </ul>

      <h2>Use Cases</h2>
      <ul>
        <li>AI agent decisions that require audit trails</li>
        <li>Moderation pipelines with verifiable outputs</li>
        <li>Workflow approvals backed by tamper-evident records</li>
        <li>AI-assisted automation with certification</li>
      </ul>
    </div>
  );
};

export default LangChain;
