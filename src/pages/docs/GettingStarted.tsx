import { Link } from "react-router-dom";
import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# Getting Started with NexArt

NexArt creates Certified Execution Records (CERs), cryptographically bound records of AI or deterministic execution that can be independently verified.

## Install
npm install @nexart/ai-execution

## Create a CER
import { createLangChainCer } from "@nexart/ai-execution";
const { certificateHash } = createLangChainCer({ provider, model, input, output });

## Verify
Paste the certificate hash at verify.nexart.io.

## Flow
Application/Agent → create CER → certificate hash → (optional) NexArt node attestation → verify.nexart.io`;

const GettingStarted = () => {
  return (
    <>
      <PageHeader
        title="Getting Started"
        summary="Go from install to verified CER in under 5 minutes."
        llmBlock={llmBlock}
      />

      <h2 id="what">What NexArt Does</h2>
      <p>
        NexArt creates <strong>Certified Execution Records (CERs)</strong>, cryptographically bound
        records of AI or deterministic execution that can be independently verified.
      </p>
      <p>
        CERs contain execution metadata and produce a deterministic certificate hash. Optional node
        attestation provides signed receipts for third-party verification.
      </p>

      <h2 id="install">Install the SDK</h2>
      <CodeBlock language="bash" code="npm install @nexart/ai-execution" />

      <h2 id="create">Create Your First CER</h2>
      <p>Generate a Certified Execution Record locally:</p>
      <CodeBlock
        language="typescript"
        title="Create a CER"
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
        This produces a Certified Execution Record and returns a deterministic certificate hash.
      </p>
      <p>
        Raw input and output fields are optional in CERs. Hashes are the core integrity mechanism.
      </p>

      <h2 id="verify">Verify the Record</h2>
      <p>
        Verification can be performed independently. Open{" "}
        <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">
          https://verify.nexart.io
        </a>{" "}
        and paste the certificate hash to verify the record.
      </p>

      <h2 id="flow">Execution Flow</h2>
      <div className="not-prose my-6 flex flex-col items-center gap-0 text-sm font-mono">
        {[
          "Application / Agent",
          "↓",
          "create CER",
          "↓",
          "certificate hash",
          "↓",
          "(optional)",
          "NexArt node attestation",
          "↓",
          "verify.nexart.io",
        ].map((line, i) => (
          <span
            key={i}
            className={
              line === "↓"
                ? "text-muted-foreground"
                : line === "(optional)"
                  ? "text-xs text-muted-foreground"
                  : "px-3 py-1 rounded bg-muted text-foreground"
            }
          >
            {line}
          </span>
        ))}
      </div>

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
          <Link to="/docs/quickstart" className="text-primary hover:underline">
            Quickstart
          </Link>
          : create and verify a CER in three steps
        </li>
        <li>
          <Link to="/docs/integrations/langchain" className="text-primary hover:underline">
            LangChain
          </Link>
          : generate CERs from LangChain AI workflows
        </li>
        <li>
          <Link to="/docs/integrations/n8n" className="text-primary hover:underline">
            n8n
          </Link>
          : certify execution inside n8n automation pipelines
        </li>
        <li>
          <Link to="/docs/cli" className="text-primary hover:underline">
            CLI
          </Link>
          : create and verify CERs from the command line
        </li>
        <li>
          <Link to="/docs/sdk" className="text-primary hover:underline">
            SDK &amp; Protocol
          </Link>
          : full API reference and protocol details
        </li>
      </ul>
    </>
  );
};

export default GettingStarted;
