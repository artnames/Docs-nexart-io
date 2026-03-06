import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Attestation Node
The attestation node signs CERs and returns signed receipts.

## What it does
- Receives CER bundles from the SDK
- Signs them with Ed25519
- Returns signed receipts (signature, signatureB64Url, attestorKeyId, nodeId)
- Supports full signed receipts and hash-only timestamps

## Public surfaces
- node.nexart.io — node identity and status
- node.nexart.io/.well-known/nexart-node.json — published signing keys

## Key format
{
  "nodeId": "nexart-node-primary",
  "keys": [{ "keyId": "key_01HXYZ...", "algorithm": "Ed25519", "publicKey": "MCowBQ...", "status": "active" }]
}

## Signing algorithm
Ed25519

## Self-hosted nodes
Roadmap only. Not currently available.`;

const AttestationNode = () => (
  <>
    <PageHeader
      title="Attestation Node"
      summary="The server-side component that signs CERs and issues receipts."
      llmBlock={llmBlock}
    />

    <h2 id="role">What Does the Node Do?</h2>
    <p>The attestation node is the signing authority in the NexArt system. When the SDK submits a CER bundle, the node:</p>
    <ol>
      <li>Validates the bundle structure</li>
      <li>Records a precise timestamp</li>
      <li>Signs the CER using Ed25519</li>
      <li>Returns a signed receipt</li>
    </ol>

    <h2 id="modes">Attestation Modes</h2>
    <p>The node supports two attestation modes:</p>
    <ul>
      <li><strong>Full signed receipt</strong> — The node attests the complete CER including snapshot contents. Produces a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signed-receipt</code> bundle.</li>
      <li><strong>Hash-only timestamp</strong> — The node signs only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. Used for legacy or incomplete records. Produces a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">hash-only-timestamp</code> bundle.</li>
    </ul>

    <h2 id="identity">Node Identity</h2>
    <p>The node's identity and status are published at <a href="https://node.nexart.io" target="_blank" rel="noopener noreferrer">node.nexart.io</a>.</p>
    <p>Signing keys are available at a well-known endpoint for independent verification:</p>
    <CodeBlock
      code={`GET node.nexart.io/.well-known/nexart-node.json

{
  "nodeId": "nexart-node-primary",
  "keys": [
    {
      "keyId": "key_01HXYZ...",
      "algorithm": "Ed25519",
      "publicKey": "MCowBQYDK2VwAyEA...",
      "status": "active"
    }
  ]
}`}
      title="Node Key Discovery"
    />

    <h2 id="signing">Signing Details</h2>
    <ul>
      <li><strong>Algorithm</strong> — Ed25519</li>
      <li><strong>Key rotation</strong> — The node may rotate keys over time. Each receipt includes an <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestorKeyId</code> that identifies which key was used.</li>
      <li><strong>Key discovery</strong> — All active and historical keys are published at the well-known endpoint so past receipts remain verifiable.</li>
    </ul>

    <h2 id="verification">Verifying Against the Node</h2>
    <p>To independently verify a signed receipt:</p>
    <ol>
      <li>Fetch the node's keys from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code></li>
      <li>Find the key matching the receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestorKeyId</code></li>
      <li>Verify the Ed25519 signature over the receipt payload</li>
    </ol>
    <p>Or use the public verifier at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>.</p>

    <h2 id="self-hosted">Self-Hosted Nodes</h2>
    <p className="text-muted-foreground"><strong>Roadmap.</strong> Self-hosted attestation nodes are not currently available. This feature is planned for a future release and will allow organizations to run their own signing infrastructure.</p>
  </>
);

export default AttestationNode;
