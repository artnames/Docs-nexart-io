import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `NexArt n8n Integration

NexArt provides an n8n community node that certifies AI execution results inside workflows.

Flow:
1. An AI step produces output (text, image, structured data).
2. The NexArt Certify AI Execution node sends the execution data to POST /v1/cer/ai/certify.
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
      <PageHeader
        title="n8n"
        summary="Certify AI execution results inside n8n workflows using the NexArt community node."
        llmBlock={llmBlock}
      />

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/30 bg-primary/5 text-sm text-primary mb-6">
        Early integration
      </div>

      <h2>Overview</h2>
      <p>
        The NexArt n8n node allows you to certify AI execution results directly inside n8n workflows.
        When an AI step produces output, the node sends the execution data to the NexArt API
        and returns a <code>verificationUrl</code> that links to the public verification portal.
      </p>
      <p>
        This makes it easy to add verifiable execution records to any automated workflow without
        writing custom integration code.
      </p>

      <h2>How It Works</h2>
      <p>The integration follows a simple three-step flow:</p>

      <div className="not-prose my-6 flex flex-col items-center gap-2 text-sm font-mono">
        <div className="px-4 py-2 rounded-md border border-border bg-card text-foreground">AI Step (e.g. OpenAI, Claude)</div>
        <div className="text-muted-foreground">↓</div>
        <div className="px-4 py-2 rounded-md border border-primary/40 bg-primary/10 text-primary font-medium">NexArt Certify AI Execution</div>
        <div className="text-muted-foreground">↓</div>
        <div className="px-4 py-2 rounded-md border border-border bg-card text-foreground">verificationUrl + receipt</div>
      </div>

      <ol>
        <li>An AI step in your workflow produces output (text, image, or structured data).</li>
        <li>The NexArt node sends the execution data to the NexArt API (<code>POST /v1/cer/ai/certify</code>). NexArt creates a Certified Execution Record (<code>bundleType: "cer.ai.execution.v1"</code>), signs it using the attestation node, and returns a <code>verificationUrl</code> that can be opened in the public verification portal.</li>
        <li>The <code>verificationUrl</code> can be stored, shared, or passed to downstream steps.</li>
      </ol>

      <h2>Endpoint</h2>
      <p>
        The node calls <code>POST /v1/cer/ai/certify</code>. This endpoint creates and certifies a CER in a single request. It handles bundle creation, hash computation, attestation node signing, and receipt generation.
      </p>

      <h2>Configuration</h2>
      <p>The node requires an API key for authentication. Set this in the node credentials:</p>

      <CodeBlock language="text" code="NEXART_API_KEY=your-api-key" />

      <h2>Quick Demo (2 minutes)</h2>
      <p>
        This example shows how to generate a Certified Execution Record (CER) from an n8n workflow
        using the NexArt certification API.
      </p>

      <h3>1. Start n8n</h3>
      <CodeBlock language="bash" code="npx n8n" />
      <p>Open the editor:</p>
      <CodeBlock language="text" code="http://localhost:5678" />

      <h3>2. Create a workflow</h3>
      <p>Add the following nodes:</p>
      <div className="not-prose my-6 flex flex-col items-center gap-2 text-sm font-mono">
        <div className="px-4 py-2 rounded-md border border-border bg-card text-foreground">Manual Trigger</div>
        <div className="text-muted-foreground">↓</div>
        <div className="px-4 py-2 rounded-md border border-primary/40 bg-primary/10 text-primary font-medium">HTTP Request</div>
      </div>
      <p>Configure the HTTP Request node:</p>
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
      <p>Set the request body:</p>
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

      <h3>3. Execute the workflow</h3>
      <p>Run the node. The NexArt API will return a Certified Execution Record and a verification link.</p>
      <p>Example response:</p>
      <CodeBlock language="json" code={`{
  "verificationUrl": "https://verify.nexart.io/e/n8n-demo-001",
  "certificateHash": "sha256:...",
  "receipt": { ... },
  "signatureB64Url": "..."
}`} title="Certify Response" />
      <p className="text-sm text-muted-foreground">
        The API response includes receipt and signature at the top level for convenience. In the CER bundle, attestation data lives at <code>meta.attestation</code>.
      </p>

      <h3>4. Verify the execution record</h3>
      <p>Open the returned verification link:</p>
      <CodeBlock language="text" code="https://verify.nexart.io/e/n8n-demo-001" />
      <p>The verification portal confirms:</p>
      <CodeBlock language="text" code={`Bundle Integrity:      PASS
Node Signature:        PASS
Receipt Consistency:   PASS`} title="Verification Result" />

      <h2>Minimal Workflow Structure</h2>
      <div className="not-prose my-6 flex flex-col items-center gap-2 text-sm font-mono">
        <div className="px-4 py-2 rounded-md border border-border bg-card text-foreground">Manual Trigger</div>
        <div className="text-muted-foreground">↓</div>
        <div className="px-4 py-2 rounded-md border border-primary/40 bg-primary/10 text-primary font-medium">HTTP Request (POST /v1/cer/ai/certify)</div>
      </div>
      <p>
        This minimal workflow demonstrates how an automation pipeline can certify AI execution results
        and return a publicly verifiable execution record.
      </p>

      <h2>Example Output</h2>
      <p>After certification, the node returns a response containing the verification link, certificate hash, receipt, and signature:</p>

      <CodeBlock language="json" code={`{
  "verificationUrl": "https://verify.nexart.io/e/exec_abc123",
  "certificateHash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
  "receipt": {
    "certificateHash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    "timestamp": "2026-03-06T12:00:01.000Z",
    "nodeId": "nexart-node-primary",
    "kid": "key_01HXYZ..."
  },
  "signatureB64Url": "MEUCIQD..."
}`} />

      <p>
        The <code>verificationUrl</code> can also use the certificate hash format, for example: <code>https://verify.nexart.io/c/sha256%3A7f83...</code>
      </p>
      <p className="text-sm text-muted-foreground">
        In the CER bundle, attestation data is stored at <code>meta.attestation</code>. The API response duplicates receipt and signature at the top level for convenience.
      </p>

      <h2>Use Cases</h2>
      <ul>
        <li>Certify AI-generated content in automated publishing pipelines</li>
        <li>Attach verification links to customer-facing reports</li>
        <li>Create audit trails for AI decisions in compliance workflows</li>
        <li>Store verifiable records alongside workflow outputs</li>
      </ul>
    </div>
  );
};

export default N8n;
