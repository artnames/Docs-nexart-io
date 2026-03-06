import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Attestation Node
The attestation node is the server-side component that:
- Receives hash bundles from the SDK
- Creates CERs with cryptographic signatures
- Stores attestation records
- Provides verification endpoints

Nodes are identified by node_id (e.g., "nexart-node-us-east-1").
Each node has a public key for signature verification.
NexArt runs managed nodes. Self-hosted nodes are on the roadmap.`;

const AttestationNode = () => (
  <>
    <PageHeader
      title="Attestation Node"
      summary="The server-side component that signs and stores execution records."
      llmBlock={llmBlock}
    />

    <h2 id="role">What Does the Node Do?</h2>
    <p>The attestation node is the trusted third party in the NexArt system. When your SDK submits a hash bundle, the node:</p>
    <ol>
      <li>Validates the bundle format</li>
      <li>Records a precise timestamp</li>
      <li>Creates a CER with all metadata</li>
      <li>Signs the CER with its private key</li>
      <li>Returns a signed receipt</li>
    </ol>

    <h2 id="regions">Managed Nodes</h2>
    <p>NexArt operates managed attestation nodes in multiple regions. Your SDK connects to the nearest node automatically.</p>
    <CodeBlock
      code={`Available regions:
- nexart-node-us-east-1
- nexart-node-eu-west-1
- nexart-node-ap-southeast-1`}
      title="Regions"
    />

    <h2 id="public-keys">Node Public Keys</h2>
    <p>Each node's public key is published so anyone can independently verify signatures.</p>
    <CodeBlock
      code={`GET /api/v1/nodes

{
  "nodes": [
    {
      "node_id": "nexart-node-us-east-1",
      "public_key": "-----BEGIN PUBLIC KEY-----\\nMFkw...",
      "algorithm": "ECDSA-P256",
      "status": "active"
    }
  ]
}`}
      title="Node Info Endpoint"
    />

    <h2 id="self-hosted">Self-Hosted (Roadmap)</h2>
    <p>Self-hosted attestation nodes are on the roadmap. This will allow organizations to run their own signing infrastructure while still participating in the NexArt verification network.</p>
  </>
);

export default AttestationNode;
