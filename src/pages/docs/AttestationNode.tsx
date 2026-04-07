import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Attestation Node
The attestation node signs CERs and returns signed receipts.

## Node role in the protocol
Attestation nodes act as independent witnesses for Certified Execution Records.
A node verifies the integrity of a CER bundle and signs an attestation receipt confirming that the record existed at a specific point in time.
Nodes do not own or control the execution data. Their role is limited to validating bundle integrity and producing a signed receipt.

## Minimal node requirements
A NexArt attestation node must:
- Verify the CER bundle structure
- Recompute the certificateHash from the canonical bundle
- Confirm the computed certificateHash matches the declared value
- Generate an attestation timestamp
- Produce a signed attestation receipt
- Publish signing keys through the node metadata endpoint (/.well-known/nexart-node.json)

## What it does
- Receives CER bundles from the API
- Signs them with Ed25519
- Returns signed receipts stored at bundle.meta.attestation
- Supports full signed receipts and hash-only timestamps

## Node metadata endpoint
All NexArt attestation nodes must publish a node metadata document at /.well-known/nexart-node.json.
Required fields: nodeId, activeKid, keys[] (each with kid, algorithm, publicKey, status)

## Key format
{
  "nodeId": "nexart-node-primary",
  "activeKid": "key_01HXYZ...",
  "keys": [{ "kid": "key_01HXYZ...", "algorithm": "Ed25519", "publicKey": "MCowBQ...", "status": "active" }]
}

## Node compatibility
A CER remains valid regardless of which compliant NexArt attestation node produced the receipt.
Verification relies only on: the CER bundle, the signed receipt, and the node's published public key material.
Verification must not depend on the continued availability of the original attestation node beyond its published verification material.

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

    <h2 id="protocol-role">Node Role in the Protocol</h2>
    <p>Attestation nodes act as independent witnesses for Certified Execution Records. A node verifies the integrity of a CER bundle and signs an attestation receipt confirming that the record existed at a specific point in time.</p>
    <p>Nodes do not own or control the execution data. Their role is limited to validating bundle integrity and producing a signed receipt.</p>

    <div className="not-prose my-6 rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-sm font-medium text-foreground mb-1">Where trust comes from</div>
      <div className="text-sm text-muted-foreground">
        Trust comes from cryptographic integrity, independent verification, and optional attestation. Not from the node itself. The node is a witness, not a trust authority.
      </div>
    </div>

    <h2 id="minimal-requirements">Minimal Node Requirements</h2>
    <p>A NexArt attestation node must satisfy the following protocol contract:</p>
    <ol>
      <li>Verify the CER bundle structure.</li>
      <li>Recompute the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> from the canonical bundle.</li>
      <li>Confirm the computed <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> matches the declared value.</li>
      <li>Generate an attestation timestamp.</li>
      <li>Produce a signed attestation receipt binding the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, timestamp, node identity, and signing key identifier.</li>
      <li>Publish signing keys through the node metadata endpoint.</li>
    </ol>

    <h2 id="role">What Does the Node Do?</h2>
    <p>The attestation node is an independent witness in the NexArt system. It does not define truth or control verification. When the API submits a CER bundle, the node:</p>
    <ol>
      <li>Validates the bundle structure</li>
      <li>Records a precise timestamp</li>
      <li>Signs the CER using Ed25519</li>
      <li>Returns a signed receipt (stored at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code> in the CER bundle)</li>
    </ol>

    <h2 id="modes">Attestation Modes</h2>
    <p>The node supports two attestation modes:</p>
    <ul>
      <li><strong>Full signed receipt.</strong> The node attests the complete CER including snapshot contents. The default for <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.ai.execution.v1</code> bundles.</li>
      <li><strong>Hash-only timestamp.</strong> The node signs only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. Used for legacy or incomplete records. Produces a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">hash-only-timestamp</code> bundle.</li>
    </ul>

    <h2 id="metadata-endpoint">Node Metadata Endpoint</h2>
    <p>All NexArt attestation nodes must publish a node metadata document at:</p>
    <p><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/.well-known/nexart-node.json</code></p>
    <p>This document exposes the node identity and signing keys required for independent receipt verification.</p>
    <p>The canonical node publishes at <a href="https://node.nexart.io" target="_blank" rel="noopener noreferrer">node.nexart.io</a>.</p>
    <p><strong>Required fields:</strong></p>
    <ul>
      <li><strong>nodeId</strong>: unique identifier for the attestation node.</li>
      <li><strong>activeKid</strong>: the key identifier currently used for signing.</li>
      <li><strong>keys[]</strong>: array of signing key entries. Each entry requires:
        <ul className="mt-1">
          <li><strong>kid</strong>: unique key identifier.</li>
          <li><strong>algorithm</strong>: signing algorithm (Ed25519).</li>
          <li><strong>publicKey</strong>: the public key material.</li>
          <li><strong>status</strong>: key status (e.g. <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">active</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">retired</code>).</li>
        </ul>
      </li>
    </ul>
    <CodeBlock
      code={`GET node.nexart.io/.well-known/nexart-node.json

{
  "nodeId": "nexart-node-primary",
  "activeKid": "key_01HXYZ...",
  "keys": [
    {
      "kid": "key_01HXYZ...",
      "algorithm": "Ed25519",
      "publicKey": "MCowBQYDK2VwAyEA...",
      "status": "active"
    }
  ]
}`}
      title="Node Metadata Document"
    />

    <h2 id="signing">Signing Details</h2>
    <ul>
      <li><strong>Algorithm.</strong> Ed25519.</li>
      <li><strong>Key rotation.</strong> The node may rotate keys over time. Each receipt includes a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> that identifies which key was used. The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">activeKid</code> field indicates the current primary signing key.</li>
      <li><strong>Key discovery.</strong> All active and historical keys are published at the well-known endpoint so past receipts remain verifiable.</li>
    </ul>

    <h2 id="verification">Verifying Against the Node</h2>
    <p>To independently verify a signed receipt:</p>
    <ol>
      <li>Fetch the node's keys from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/.well-known/nexart-node.json</code></li>
      <li>Find the key matching the receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code></li>
      <li>Verify the Ed25519 signature over the canonical receipt payload</li>
    </ol>
    <p>Or use the public verifier at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>.</p>

    <h2 id="compatibility">Node Compatibility</h2>
    <p>A CER remains valid regardless of which compliant NexArt attestation node produced the receipt.</p>
    <p>Verification tools must rely only on:</p>
    <ul>
      <li>The CER bundle</li>
      <li>The signed receipt</li>
      <li>The node's published public key material</li>
    </ul>
    <p>Verification must not depend on the continued availability of the original attestation node beyond its published verification material.</p>

    <h2 id="self-hosted">Self-Hosted Nodes</h2>
    <p className="text-muted-foreground"><strong>Roadmap.</strong> Self-hosted attestation nodes are not currently available. This feature is planned for a future release.</p>
  </>
);

export default AttestationNode;
