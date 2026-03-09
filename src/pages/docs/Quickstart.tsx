import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# Quickstart

Install SDK, create a CER, verify.

npm install @nexart/ai-execution

Create:
import { createLangChainCer } from "@nexart/ai-execution";
const { certificateHash } = createLangChainCer({ provider, model, input, output });

Verify:
Open verify.nexart.io and paste the certificate hash.`;

const Quickstart = () => (
  <div className="prose prose-invert max-w-none">
    <PageHeader
      title="Quickstart"
      summary="Install, create a CER, and verify — in three steps."
      llmBlock={llmBlock}
    />

    <p>
      For a broader overview, see the{" "}
      <Link to="/docs/getting-started" className="text-primary hover:underline">
        Getting Started
      </Link>{" "}
      guide.
    </p>

    <h2>1. Install the SDK</h2>
    <CodeBlock language="bash" code="npm install @nexart/ai-execution" />

    <h2>2. Create a CER</h2>
    <CodeBlock
      language="typescript"
      title="Create a CER"
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
    <p>This produces a Certified Execution Record locally and returns a deterministic certificate hash.</p>

    <h2>3. Verify the Record</h2>
    <p>
      Open{" "}
      <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">
        verify.nexart.io
      </a>{" "}
      and paste the certificate hash. The verifier checks:
    </p>
    <ul>
      <li><strong>Bundle Integrity</strong> — the certificate hash matches the bundle contents</li>
      <li><strong>Node Signature</strong> — the attestation signature is valid (if attested)</li>
      <li><strong>Receipt Consistency</strong> — the receipt matches the certified record</li>
    </ul>

    <h2>Next Steps</h2>
    <ul>
      <li>
        <Link to="/docs/integrations" className="text-primary hover:underline">Integrations</Link>{" "}
        — connect to LangChain, n8n, or the CLI
      </li>
      <li>
        <Link to="/docs/concepts/cer" className="text-primary hover:underline">CER Anatomy</Link>{" "}
        — understand the record structure
      </li>
      <li>
        <Link to="/docs/verification" className="text-primary hover:underline">Verification</Link>{" "}
        — deep dive into verification semantics
      </li>
    </ul>
  </div>
);

export default Quickstart;
