import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Verification
Verify any CER or receipt independently.

## SDK
const result = await nexart.verify("rcpt_id");
// { valid: true, integrity: "intact" }

## REST API
GET /api/v1/verify/{receipt_id}

## Full Report
GET /api/v1/report/{cer_id}

## What gets checked:
- Hash integrity (prompt_hash + output_hash unchanged)
- Signature validity (node's ECDSA signature)
- Timestamp consistency
- Node identity authentication`;

const Verification = () => (
  <>
    <PageHeader
      title="Verification"
      summary="How to independently verify any NexArt attestation."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>Verification is the other side of attestation. Anyone with a receipt ID can independently verify that an AI execution record is authentic and unmodified.</p>

    <h2 id="sdk-verify">SDK Verification</h2>
    <CodeBlock
      code={`const result = await nexart.verify("rcpt_2k8m4x9n");

console.log(result);
// {
//   valid: true,
//   receipt_id: "rcpt_2k8m4x9n",
//   cer_id: "cer_8x7k2m4n9p",
//   integrity: "intact",
//   signature_valid: true,
//   timestamp: "2026-03-06T12:00:00Z"
// }`}
      title="SDK Verification"
    />

    <h2 id="api">REST API</h2>
    <CodeBlock
      code={`GET /api/v1/verify/rcpt_2k8m4x9n

Response:
{
  "valid": true,
  "integrity": "intact",
  "checks": {
    "hash_integrity": "pass",
    "signature": "pass",
    "timestamp": "pass",
    "node_identity": "pass"
  }
}`}
      title="REST API"
    />

    <h2 id="content-verify">Content Verification</h2>
    <p>To verify that specific content matches a CER, re-hash it and compare:</p>
    <CodeBlock
      code={`import { hashContent } from "@nexart/sdk";

const originalPrompt = "What is the capital of France?";
const currentHash = hashContent(originalPrompt);

const cer = await nexart.getCER("cer_8x7k2m4n9p");

if (currentHash === cer.prompt_hash) {
  console.log("Content matches the attested record");
}`}
      title="Content Verification"
    />
  </>
);

export default Verification;
