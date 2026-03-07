import { Link } from "react-router-dom";
import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt — Getting Started

NexArt produces Certified Execution Records (CERs) for AI and deterministic system executions.

## Fastest path
POST /v1/cer/ai/certify creates a CER, attests it, and returns a verificationUrl in one request.

## Choose your path
- Certify an AI execution via API → POST /v1/cer/ai/certify
- Verify a record → verify.nexart.io
- Use n8n → NexArt n8n community node
- Understand CERs → What is a CER?
- Inspect the attestation node → node.nexart.io

## Core flow
1. Execution — a system or AI process runs
2. CER creation — a CER bundle is produced with execution metadata and a certificateHash
3. Attestation — a node signs the CER using Ed25519
4. Receipt — the node returns a signed receipt
5. Verification — anyone can verify the bundle and receipt independently

## API endpoints
POST /v1/cer/ai/certify — create and certify in one request (recommended)
POST /v1/cer/ai/create — create a CER bundle without attestation

## Verification
verify.nexart.io is the public verifier.
Records can be verified by executionId or certificateHash.
The verifier uses a redacted/public-safe representation. Raw inputs/outputs are not exposed.

## Key surfaces
- verify.nexart.io — public verification portal
- node.nexart.io — attestation node identity
- node.nexart.io/.well-known/nexart-node.json — published signing keys`;

const GettingStarted = () => {
  return (
    <>
      <PageHeader
        title="Getting Started"
        summary="Everything you need to start certifying and verifying AI executions with NexArt."
        llmBlock={llmBlock}
      />

      <h2 id="what">What is NexArt?</h2>
      <p>NexArt produces <strong>Certified Execution Records (CERs)</strong> for AI and deterministic system executions. A CER captures what happened, when it happened, and provides cryptographic proof that the record has not been altered.</p>
      <p>If you are building with AI and need verifiable proof of what your system did, NexArt gives you that in a single API call.</p>

      <h2 id="choose-path">Choose Your Path</h2>
      <div className="not-prose my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: "Certify an AI execution via API", to: "/docs/sdk", desc: "Call POST /v1/cer/ai/certify" },
          { label: "Verify a record", to: "/docs/verification", desc: "Use verify.nexart.io or verify locally" },
          { label: "Use n8n", to: "/docs/integrations/n8n", desc: "Certify inside n8n workflows" },
          { label: "Understand CERs", to: "/docs/concepts/cer", desc: "Learn how execution records work" },
          { label: "Inspect the attestation node", to: "/docs/attestation-node", desc: "See node identity and keys" },
          { label: "See all integration surfaces", to: "/docs/integration-surfaces", desc: "API, CLI, verifier, n8n" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="block rounded-lg border border-border bg-card p-4 hover:border-primary/40 hover:bg-accent/30 transition-colors no-underline"
          >
            <div className="font-medium text-foreground text-sm">{item.label}</div>
            <div className="text-muted-foreground text-xs mt-1">{item.desc}</div>
          </Link>
        ))}
      </div>

      <h2 id="fastest">Fastest Way to Certify</h2>
      <p>For most builders, the recommended path is a single API call:</p>
      <CodeBlock
        code={`POST /v1/cer/ai/certify

{
  "model": "gpt-4",
  "input": "Summarize this contract...",
  "output": "The contract states that...",
  "metadata": {
    "appId": "my-app",
    "projectId": "proj_abc123"
  }
}`}
        title="Certify Request"
      />
      <p>This creates a CER, attests it through the node, and returns everything you need:</p>
      <CodeBlock
        code={`{
  "verificationUrl": "https://verify.nexart.io/e/exec_abc123",
  "certificateHash": "sha256:9e8d7c6b5a4f3210...",
  "receipt": {
    "certificateHash": "sha256:9e8d7c6b5a4f3210...",
    "timestamp": "2026-03-06T12:00:01.000Z",
    "nodeId": "nexart-node-primary",
    "attestorKeyId": "key_01HXYZ..."
  },
  "signatureB64Url": "MEUCIQD3a8b1c4d5e6f..."
}`}
        title="Certify Response"
      />
      <p>Share the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationUrl</code> with anyone. They can verify the record at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a> without needing access to your system.</p>

      <h2 id="create-vs-certify">create vs certify</h2>
      <p>NexArt exposes two endpoints for creating records:</p>
      <ul>
        <li><strong>POST /v1/cer/ai/certify</strong> creates a CER, attests it, and returns a signed receipt with a verification URL. This is the recommended path for most integrations.</li>
        <li><strong>POST /v1/cer/ai/create</strong> creates a CER bundle without attestation. Use this if you want to handle attestation separately or just need the bundle for your own records.</li>
      </ul>
      <p>If you are unsure which to use, start with <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/certify</code>.</p>

      <h2 id="flow">How It Works</h2>
      <ol>
        <li><strong>Execution.</strong> Your system or AI process runs and produces output.</li>
        <li><strong>CER creation.</strong> A CER bundle is produced with execution metadata and a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> (SHA-256).</li>
        <li><strong>Attestation.</strong> The node signs the CER using Ed25519.</li>
        <li><strong>Receipt.</strong> You receive a signed receipt binding the record to the node's identity and a timestamp.</li>
        <li><strong>Verification.</strong> Anyone can verify the bundle and receipt independently, locally or through verify.nexart.io.</li>
      </ol>

      <h2 id="public-verification">Public Verification</h2>
      <p><a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a> is the public verifier. Records can be looked up by execution ID or certificate hash:</p>
      <ul>
        <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">https://verify.nexart.io/e/exec_abc123</code></li>
        <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">https://verify.nexart.io/c/sha256%3A7f83...</code></li>
      </ul>
      <p>The public verifier uses a redacted, public-safe representation of the record. Sensitive input and output fields are not exposed publicly. The verification checks integrity, signature, and receipt consistency without revealing private data.</p>

      <h2 id="what-gets-stored">What Gets Stored?</h2>
      <p>When you certify a record:</p>
      <ul>
        <li>The node returns a <strong>signed receipt</strong> with the certificateHash, timestamp, and signature.</li>
        <li>A <strong>redacted/public-safe version</strong> of the record is persisted for public verification. This version does not include raw inputs or outputs.</li>
        <li>Input and output content is hashed (SHA-256). The hashes are included in the record, but the original content is not stored by the node or the public verifier.</li>
      </ul>
      <p>You control what metadata is included. Sensitive fields can be excluded or will be redacted in the public-safe representation.</p>

      <h2 id="next-steps">Next Steps</h2>
      <ul>
        <li>Read the <a href="/docs/sdk">API reference</a> for endpoint details</li>
        <li>Learn about <a href="/docs/concepts/cer">Certified Execution Records</a></li>
        <li>Explore <a href="/docs/integration-surfaces">integration surfaces</a></li>
        <li>Try verifying a CER at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a></li>
      </ul>
    </>
  );
};

export default GettingStarted;
