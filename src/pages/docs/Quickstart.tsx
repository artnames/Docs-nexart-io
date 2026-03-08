import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# Quickstart: Create and Verify Your First Certified Execution Record

NexArt creates Certified Execution Records (CERs) that allow AI or deterministic executions to be independently verified.
Each CER contains a certificate hash, node attestation, and a public verification link.

## Create a CER
POST /v1/cer/ai/certify with executionId, provider, model, input, output.
Returns verificationUrl, certificateHash, receipt (with kid), signatureB64Url.

## Verify
Open verificationUrl. Checks: bundleIntegrity, nodeSignature, receiptConsistency.

## Export
Audit package: cer.json, receipt.json, verification-report.json, node-metadata.json, evidence-summary.html, README.txt.

Attestation data in the CER bundle lives at meta.attestation.`;

const Quickstart = () => (
  <div className="prose prose-invert max-w-none">
    <PageHeader
      title="Quickstart: Create and Verify Your First Certified Execution Record"
      summary="Generate a CER in under one minute using a single API request and the public verifier."
      llmBlock={llmBlock}
    />

    <p>
      NexArt creates Certified Execution Records (CERs) that allow AI or deterministic executions
      to be independently verified. Each CER contains a certificate hash, node attestation, and a
      public verification link. This guide shows how to create and verify a CER in under a minute.
    </p>

    <h2>Create a Certified Execution Record</h2>
    <p>
      The NexArt API can create and certify a CER in a single request. Run the following command to
      certify an execution:
    </p>
    <CodeBlock
      language="bash"
      title="Create and certify a CER"
      code={`curl https://node.nexart.io/v1/cer/ai/certify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "executionId": "demo-001",
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
    }
  }'`}
    />
    <p>
      The API computes the certificate hash, creates the CER bundle, and requests a signed
      attestation from the NexArt node.
    </p>

    <h2>API Response</h2>
    <p>The API returns the certified record with a verification link:</p>
    <CodeBlock
      language="json"
      title="Certify Response"
      code={`{
  "verificationUrl": "https://verify.nexart.io/e/demo-001",
  "certificateHash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
  "receipt": {
    "certificateHash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    "timestamp": "2026-03-06T12:00:01.000Z",
    "nodeId": "nexart-node-primary",
    "kid": "k1"
  },
  "signatureB64Url": "MEUCIQD..."
}`}
    />
    <p>
      The <code>verificationUrl</code> links to the public verification portal where the execution
      record can be independently verified.
    </p>
    <p className="text-sm text-muted-foreground">
      The API response includes receipt and signature at the top level for convenience. In the CER
      bundle, attestation data lives at <code>meta.attestation</code>.
    </p>

    <h2>Verify the Execution Record</h2>
    <p>The record can be verified publicly. Open the verification link returned by the API:</p>
    <CodeBlock language="text" code="https://verify.nexart.io/e/demo-001" />
    <p>The verifier checks:</p>
    <ul>
      <li><strong>Bundle Integrity</strong> — the certificate hash matches the bundle contents</li>
      <li><strong>Node Signature</strong> — the attestation signature is valid</li>
      <li><strong>Receipt Consistency</strong> — the receipt matches the certified record</li>
    </ul>

    <h2>Export Evidence</h2>
    <p>
      Certified records can also be exported from the NexArt dashboard as an audit package. The
      package contains:
    </p>
    <CodeBlock
      language="text"
      title="Audit Package Contents"
      code={`cer.json
receipt.json
verification-report.json
node-metadata.json
evidence-summary.html
README.txt`}
    />
    <p>
      The audit package allows offline verification and independent review without requiring API
      access.
    </p>

    <h2>Next Steps</h2>
    <ul>
      <li><Link to="/docs/verification" className="text-primary hover:underline">Verification</Link></li>
      <li><Link to="/docs/concepts/cer" className="text-primary hover:underline">CER Anatomy</Link></li>
      <li><Link to="/docs/concepts/signed-receipts" className="text-primary hover:underline">Signed Receipts</Link></li>
      <li><Link to="/docs/integrations/n8n" className="text-primary hover:underline">n8n Integration</Link></li>
      <li><Link to="/docs/protocol-overview" className="text-primary hover:underline">Protocol Overview</Link></li>
    </ul>
    <p>
      These guides explain the CER structure, verification process, and integration options for
      automation platforms and AI systems.
    </p>
  </div>
);

export default Quickstart;
