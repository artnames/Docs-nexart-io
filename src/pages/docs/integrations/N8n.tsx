import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `NexArt n8n Integration

NexArt provides an n8n community node that certifies AI execution results inside workflows.

Flow:
1. An AI step produces output (text, image, structured data).
2. The NexArt Certify AI Execution node sends the execution data to POST /v1/cer/ai/certify.
3. NexArt creates a Certified Execution Record (CER), signs it via the attestation node, and returns a verificationUrl.

The verificationUrl can be stored, shared, or passed to downstream workflow steps.

Endpoint: POST /v1/cer/ai/certify
Authentication: API key via NEXART_API_KEY.

Response includes: verificationUrl, certificateHash, receipt, signatureB64Url.
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
        <li>The NexArt node sends the execution data to the NexArt API (<code>POST /v1/cer/ai/certify</code>). NexArt creates a Certified Execution Record (CER), signs it using the attestation node, and returns a <code>verificationUrl</code> that can be opened in the public verification portal.</li>
        <li>The <code>verificationUrl</code> can be stored, shared, or passed to downstream steps.</li>
      </ol>

      <h2>Endpoint</h2>
      <p>
        The node calls <code>POST /v1/cer/ai/certify</code>. This endpoint creates and certifies a CER in a single request. It handles bundle creation, hash computation, attestation node signing, and receipt generation.
      </p>

      <h2>Configuration</h2>
      <p>The node requires an API key for authentication. Set this in the node credentials:</p>

      <CodeBlock language="text" code="NEXART_API_KEY=your-api-key" />

      <h2>Example Output</h2>
      <p>After certification, the node returns a response containing the verification link, certificate hash, receipt, and signature:</p>

      <CodeBlock language="json" code={`{
  "verificationUrl": "https://verify.nexart.io/e/exec_abc123",
  "certificateHash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
  "receipt": { "..." },
  "signatureB64Url": "MEUCIQD..."
}`} />

      <p>
        The <code>verificationUrl</code> can also use the certificate hash format, for example: <code>https://verify.nexart.io/c/sha256%3A7f83...</code>
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
