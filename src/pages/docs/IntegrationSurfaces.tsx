import { Link } from "react-router-dom";
import PageHeader from "@/components/docs/PageHeader";

const llmBlock = `# NexArt Integration Surfaces

## API
POST /v1/cer/ai/certify — create and certify a CER in one request (recommended)
POST /v1/cer/ai/create — create a CER bundle without attestation
Authentication: Bearer NEXART_API_KEY

## Public Verifier
verify.nexart.io — verify records by executionId or certificateHash
Uses redacted/public-safe representation. Raw inputs/outputs not exposed.

## Attestation Node
node.nexart.io — node identity and status
node.nexart.io/.well-known/nexart-node.json — published Ed25519 signing keys

## n8n
Community node for certifying AI executions inside n8n workflows.
Calls POST /v1/cer/ai/certify and returns verificationUrl.

## NexArt CLI
Command-line tool for deterministic rendering and verification.
npx --yes @nexart/cli@0.2.3
Currently supports CodeMode (deterministic generative rendering).

## SDKs
AI Execution SDK — CER creation and attestation workflows
CodeMode SDK — deterministic generative execution
UI Renderer SDK — deterministic UI rendering`;

const IntegrationSurfaces = () => (
  <>
    <PageHeader
      title="Integration Surfaces"
      summary="All the ways you can connect to NexArt: API, verifier, CLI, n8n, and SDKs."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>NexArt can be accessed through several surfaces depending on your use case. This page lists them all in one place.</p>

    <h2 id="api">Node API</h2>
    <p>The primary integration point for most builders. Two endpoints are available:</p>
    <ul>
      <li><strong>POST /v1/cer/ai/certify</strong> creates a CER, attests it, and returns a signed receipt with a verification URL. Recommended for most integrations.</li>
      <li><strong>POST /v1/cer/ai/create</strong> creates a CER bundle without attestation. Useful if you want the bundle for your own records or plan to attest it separately.</li>
    </ul>
    <p>Authentication uses an API key passed as a Bearer token (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NEXART_API_KEY</code>).</p>
    <p><Link to="/docs/sdk" className="text-primary hover:underline">See the API reference</Link></p>

    <h2 id="verifier">Public Verifier</h2>
    <p><a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a> is the public verification portal. Anyone can verify a record by:</p>
    <ul>
      <li>Execution ID: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">https://verify.nexart.io/e/exec_abc123</code></li>
      <li>Certificate hash: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">https://verify.nexart.io/c/sha256%3A7f83...</code></li>
    </ul>
    <p>The verifier uses a redacted, public-safe representation of the record. Sensitive input and output content is not exposed. Verification checks bundle integrity, node signature, and receipt consistency.</p>
    <p><Link to="/docs/verification" className="text-primary hover:underline">Learn about verification</Link></p>

    <h2 id="node">Attestation Node</h2>
    <p>The attestation node signs CERs and issues receipts. Its public surfaces are:</p>
    <ul>
      <li><a href="https://node.nexart.io" target="_blank" rel="noopener noreferrer">node.nexart.io</a> shows the node's identity and status.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code> publishes Ed25519 signing keys for independent verification.</li>
    </ul>
    <p><Link to="/docs/attestation-node" className="text-primary hover:underline">See the attestation node docs</Link></p>

    <h2 id="n8n">n8n Integration</h2>
    <p>The NexArt n8n community node allows you to certify AI execution results inside n8n workflows. The node calls <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /v1/cer/ai/certify</code> and returns a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationUrl</code> that can be stored or shared.</p>
    <p><Link to="/docs/integrations/n8n" className="text-primary hover:underline">See the n8n integration docs</Link></p>

    <h2 id="cli">NexArt CLI</h2>
    <p>The command-line interface for deterministic rendering and verification. Currently supports CodeMode (deterministic generative rendering) with expanding AI CLI support planned.</p>
    <p>Install and run with:</p>
    <code className="block bg-muted px-3 py-2 rounded text-sm font-mono my-2">npx --yes @nexart/cli@0.2.3 --help</code>
    <p><Link to="/docs/cli" className="text-primary hover:underline">See the CLI docs</Link></p>

    <h2 id="sdks">SDKs</h2>
    <ul>
      <li><Link to="/docs/sdk" className="text-primary hover:underline"><strong>AI Execution SDK</strong></Link> for CER creation and attestation workflows.</li>
      <li><Link to="/docs/codemode-sdk" className="text-primary hover:underline"><strong>CodeMode SDK</strong></Link> for deterministic generative execution.</li>
      <li><Link to="/docs/ui-renderer-sdk" className="text-primary hover:underline"><strong>UI Renderer SDK</strong></Link> for deterministic UI rendering.</li>
    </ul>
  </>
);

export default IntegrationSurfaces;
