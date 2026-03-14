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
      summary="Install, create a CER, and verify in three steps."
      llmBlock={llmBlock}
    />

    <p>
      This is the fastest path from zero to a verified execution record. For a broader overview, see the{" "}
      <Link to="/docs/getting-started" className="text-primary hover:underline">
        Getting Started
      </Link>{" "}
      guide.
    </p>

    <h2>What You Will Do</h2>
    <ul>
      <li>Send one certification request</li>
      <li>Receive a certificate hash and verification URL</li>
      <li>Verify the record publicly</li>
    </ul>

    <h2>1. Install the SDK</h2>
    <CodeBlock language="bash" code="npm install @nexart/ai-execution" />

    <h2>2. Create and Certify a CER</h2>
    <CodeBlock
      language="typescript"
      title="Certify an AI Execution"
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
      <li><strong>Bundle Integrity</strong>: the certificate hash matches the bundle contents</li>
      <li><strong>Node Signature</strong>: the attestation signature is valid (if attested)</li>
      <li><strong>Receipt Consistency</strong>: the receipt matches the certified record</li>
    </ul>

    <p className="font-medium">You now have a verifiable execution record.</p>

    <h2>Optional: Export Evidence</h2>
    <p>
      Once verified, you can export the CER bundle or share the verification URL for external audit or compliance workflows.
    </p>

    <h2>Next Steps</h2>
    <ul>
      <li>
        <Link to="/docs/integrations/langchain" className="text-primary hover:underline">LangChain Integration</Link>
        : certify AI chain and agent executions
      </li>
      <li>
        <Link to="/docs/integrations/n8n" className="text-primary hover:underline">n8n Integration</Link>
        : certify workflow automation results
      </li>
      <li>
        <Link to="/docs/cli" className="text-primary hover:underline">CLI</Link>
        : create and verify CERs from the command line
      </li>
      <li>
        <Link to="/docs/verification" className="text-primary hover:underline">Verification</Link>
        : deep dive into verification semantics
      </li>
      <li>
        <Link to="/docs/cer-protocol" className="text-primary hover:underline">CER Protocol</Link>
        : understand the protocol specification
      </li>
    </ul>
  </div>
);

export default Quickstart;
