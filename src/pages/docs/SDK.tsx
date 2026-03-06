import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt AI Execution SDK
npm install @nexart/sdk

## Core Methods
- new NexArt({ apiKey }) - Initialize client
- nexart.attest({ model, prompt_hash, output_hash, metadata }) - Create attestation
- nexart.verify(receipt_id) - Verify a receipt
- nexart.getReport(cer_id) - Get verification report
- nexart.list({ app_id, limit, offset }) - List CERs

## Auto-hash helper
import { hashContent } from "@nexart/sdk";
const hash = hashContent("your prompt text"); // Returns sha256:...

## Error handling
All methods throw NexArtError with code, message, and request_id.`;

const SDK = () => (
  <>
    <PageHeader
      title="AI Execution SDK"
      summary="Client library for creating and verifying attestations."
      llmBlock={llmBlock}
    />

    <h2 id="installation">Installation</h2>
    <CodeBlock code="npm install @nexart/sdk" title="Terminal" />

    <h2 id="client">Client Setup</h2>
    <CodeBlock
      code={`import { NexArt } from "@nexart/sdk";

const nexart = new NexArt({
  apiKey: process.env.NEXART_API_KEY,
  environment: "production",
  timeout: 10000 // ms
});`}
      title="Setup"
    />

    <h2 id="attest">nexart.attest()</h2>
    <p>Submit an AI execution for attestation. Returns a signed receipt.</p>
    <CodeBlock
      code={`const receipt = await nexart.attest({
  model: "gpt-4",
  prompt_hash: hashContent(prompt),
  output_hash: hashContent(output),
  metadata: {
    app_id: "my-app",
    session_id: "sess_123"
  }
});`}
      title="Attest"
    />

    <h2 id="hash-helper">Hash Helper</h2>
    <p>The SDK includes a utility to hash content client-side before attestation.</p>
    <CodeBlock
      code={`import { hashContent } from "@nexart/sdk";

const hash = hashContent("Hello, world!");
// "sha256:315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3"`}
      title="Hash Helper"
    />

    <h2 id="verify">nexart.verify()</h2>
    <CodeBlock
      code={`const result = await nexart.verify("rcpt_2k8m4x9n");
// { valid: true, integrity: "intact", ... }`}
      title="Verify"
    />

    <h2 id="list">nexart.list()</h2>
    <CodeBlock
      code={`const cers = await nexart.list({
  app_id: "my-app",
  limit: 50,
  offset: 0
});
// { data: [...], total: 142, has_more: true }`}
      title="List CERs"
    />

    <h2 id="errors">Error Handling</h2>
    <CodeBlock
      code={`try {
  await nexart.attest(payload);
} catch (err) {
  if (err instanceof NexArtError) {
    console.log(err.code);       // "INVALID_HASH"
    console.log(err.message);    // "prompt_hash is not valid SHA-256"
    console.log(err.request_id); // "req_abc123"
  }
}`}
      title="Error Handling"
    />
  </>
);

export default SDK;
