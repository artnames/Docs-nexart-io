import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt - Getting Started

NexArt provides AI execution attestation. It creates tamper-proof records (CERs) of AI operations.

## Quick Integration
1. Install SDK: npm install @nexart/sdk
2. Initialize: const nexart = new NexArt({ apiKey: "your-key" })
3. Wrap AI calls with nexart.attest() to get signed receipts
4. Each receipt contains: hash, timestamp, signature, CER ID

## Key Endpoints
- POST /api/v1/attest - Submit execution for attestation
- GET /api/v1/verify/{id} - Verify a receipt
- GET /api/v1/report/{id} - Get full verification report

## Bundle Shape
{ model, prompt_hash, output_hash, timestamp, metadata }`;

const GettingStarted = () => {
  return (
    <>
      <PageHeader
        title="Getting Started"
        summary="Set up NexArt attestation in your app in under 5 minutes."
        llmBlock={llmBlock}
      />

      <h2 id="install">1. Install the SDK</h2>
      <CodeBlock code="npm install @nexart/sdk" title="Terminal" />

      <h2 id="initialize">2. Initialize</h2>
      <p>Create a NexArt client with your API key from the dashboard.</p>
      <CodeBlock
        code={`import { NexArt } from "@nexart/sdk";

const nexart = new NexArt({
  apiKey: process.env.NEXART_API_KEY,
  environment: "production" // or "sandbox"
});`}
        title="init.ts"
      />

      <h2 id="first-attestation">3. Create Your First Attestation</h2>
      <p>Wrap any AI execution with <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">nexart.attest()</code> to get a signed receipt.</p>
      <CodeBlock
        code={`const result = await nexart.attest({
  model: "gpt-4",
  prompt_hash: "sha256:abc123...",
  output_hash: "sha256:def456...",
  metadata: {
    app_id: "my-app",
    user_id: "user-123"
  }
});

console.log(result.receipt_id);  // "cer_8x7k2m..."
console.log(result.signature);   // "0x3f2a..."
console.log(result.timestamp);   // "2026-03-06T12:00:00Z"`}
        title="attest.ts"
      />

      <h2 id="verify">4. Verify a Receipt</h2>
      <p>Anyone with a receipt ID can independently verify it.</p>
      <CodeBlock
        code={`const verification = await nexart.verify("cer_8x7k2m...");

// Returns:
{
  "valid": true,
  "receipt_id": "cer_8x7k2m...",
  "timestamp": "2026-03-06T12:00:00Z",
  "integrity": "intact",
  "signer": "nexart-node-us-east-1"
}`}
        title="verify.ts"
      />

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li>Learn about <a href="/docs/concepts/cer">Certified Execution Records (CERs)</a></li>
        <li>Explore the <a href="/docs/sdk">full SDK reference</a></li>
        <li>Set up <a href="/docs/dashboard/auto-stamp">auto-stamping</a> for continuous attestation</li>
      </ul>
    </>
  );
};

export default GettingStarted;
