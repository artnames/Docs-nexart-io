import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `NexArt n8n Integration

NexArt can be used inside n8n workflows to certify AI execution results using the NexArt certification API.

Flow:
1. An AI step produces output (text, image, structured data).
2. An HTTP Request node sends the execution data to POST /v1/cer/ai/certify.
3. NexArt creates a CER (bundleType: cer.ai.execution.v1), signs it via the attestation node, and returns a verificationUrl.

The verificationUrl can be stored, shared, or passed to downstream workflow steps.

Endpoint: POST /v1/cer/ai/certify
Authentication: API key via NEXART_API_KEY.

Quick demo: npx n8n → Manual Trigger → HTTP Request (POST /v1/cer/ai/certify) → verify at verify.nexart.io.

Response includes: verificationUrl, certificateHash, receipt (with kid), signatureB64Url.
Attestation data in the CER bundle lives at meta.attestation.
`;

const N8n = () => {
  return (
    <div className="prose prose-invert max-w-none">
      <DocsMeta
        title="n8n Integration"
        description="Add NexArt to n8n workflows using the HTTP Request node. Certify each step and aggregate into Project Bundles."
      />
      <PageHeader
        title="n8n"
        summary="Certify AI execution results inside n8n workflows using the NexArt certification API."
        llmBlock={llmBlock}
      />

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/30 bg-primary/5 text-sm text-primary mb-6">
        Early integration
      </div>

      <h2>Best For</h2>
      <ul>
        <li>Workflow automation with minimal custom code</li>
        <li>No-code / low-code certification pipelines</li>
        <li>Automated reports with verifiable AI outputs</li>
        <li>Customer-facing workflows requiring audit trails</li>
        <li>Compliance pipelines that need tamper-evident records</li>
      </ul>

      <h2>Overview</h2>
      <p>
        NexArt integrates with n8n workflows via the standard HTTP Request node. When an AI step
        produces output, the HTTP Request node sends the execution data to the NexArt API and
        returns a <code>verificationUrl</code> linking to the public verification portal.
      </p>
      <p>
        This is the recommended path if your AI logic already runs inside n8n workflows.
      </p>

      <h2>How It Works</h2>

      <div className="not-prose my-6 flex flex-col items-center gap-2 text-sm font-mono">
        <div className="px-4 py-2 rounded-md border border-border bg-card text-foreground">AI Step (e.g. OpenAI, Claude)</div>
        <div className="text-muted-foreground">↓</div>
        <div className="px-4 py-2 rounded-md border border-primary/40 bg-primary/10 text-primary font-medium">HTTP Request (POST /v1/cer/ai/certify)</div>
        <div className="text-muted-foreground">↓</div>
        <div className="px-4 py-2 rounded-md border border-border bg-card text-foreground">verificationUrl + receipt</div>
      </div>

      <ol>
        <li>An AI step produces output (text, image, or structured data).</li>
        <li>The HTTP Request node sends it to <code>POST /v1/cer/ai/certify</code>. NexArt creates a CER, signs it via the attestation node, and returns a <code>verificationUrl</code>.</li>
        <li>Store, share, or pass the <code>verificationUrl</code> to downstream steps.</li>
      </ol>

      <h2>Configuration</h2>
      <p>Set your API key as a Bearer token credential in the HTTP Request node:</p>
      <CodeBlock language="text" code="NEXART_API_KEY=your-api-key" />

      <h2>Quick Demo</h2>

      <h3>1. Start n8n</h3>
      <CodeBlock language="bash" code="npx n8n" />
      <p>Open the editor at <code>http://localhost:5678</code>.</p>

      <h3>2. Create a workflow</h3>
      <p>Add a Manual Trigger followed by an HTTP Request node:</p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full text-sm border border-border rounded-md">
          <tbody>
            <tr className="border-b border-border">
              <td className="px-4 py-2 font-medium text-foreground bg-muted/30">Method</td>
              <td className="px-4 py-2 font-mono text-foreground/90">POST</td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-4 py-2 font-medium text-foreground bg-muted/30">URL</td>
              <td className="px-4 py-2 font-mono text-foreground/90">https://node.nexart.io/v1/cer/ai/certify</td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-4 py-2 font-medium text-foreground bg-muted/30">Authentication</td>
              <td className="px-4 py-2 font-mono text-foreground/90">Bearer Auth</td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-4 py-2 font-medium text-foreground bg-muted/30">Header</td>
              <td className="px-4 py-2 font-mono text-foreground/90">Content-Type: application/json</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Request body:</p>
      <CodeBlock language="json" code={`{
  "executionId": "n8n-demo-001",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "input": {
    "messages": [
      {
        "role": "user",
        "content": "Should this automated report be approved?"
      }
    ]
  },
  "output": {
    "decision": "approve",
    "reason": "policy_passed"
  },
  "metadata": {
    "projectId": "demo",
    "appId": "n8n-demo"
  }
}`} title="Request Body" />

      <h3>3. Execute and verify</h3>
      <p>Run the workflow. The API returns a CER with a verification link:</p>
      <CodeBlock language="json" code={`{
  "verificationUrl": "https://verify.nexart.io/e/n8n-demo-001",
  "certificateHash": "sha256:...",
  "receipt": { ... },
  "signatureB64Url": "..."
}`} title="Certify Response" />
      <p className="text-sm text-muted-foreground">
        Attestation data lives at <code>meta.attestation</code> in the CER bundle.
      </p>
      <p>
        Open the <code>verificationUrl</code> to confirm the record at{" "}
        <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          verify.nexart.io
        </a>.
      </p>

      <h2>Use Cases</h2>
      <ul>
        <li>Certify AI-generated content in automated publishing pipelines</li>
        <li>Attach verification links to customer-facing reports</li>
        <li>Create audit trails for AI decisions in compliance workflows</li>
        <li>Store verifiable records alongside workflow outputs</li>
      </ul>

      <h2>Official Example Repo</h2>
      <p>
        <a href="https://github.com/artnames/nexart-n8n" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          github.com/artnames/nexart-n8n
        </a>
        {" "}- runnable integration example for n8n workflows.
      </p>

      <h2>Next Steps</h2>
      <ul>
        <li>
          <Link to="/docs/verification" className="text-primary hover:underline">Verification</Link>
          : understand how CER verification works
        </li>
        <li>
          <Link to="/docs/examples" className="text-primary hover:underline">Examples</Link>
          : copy-ready API requests and response shapes
        </li>
        <li>
          <Link to="/docs/integrations/langchain" className="text-primary hover:underline">LangChain</Link>
          : for teams moving from workflow automation into code
        </li>
      </ul>
    </div>
  );
};

export default N8n;
