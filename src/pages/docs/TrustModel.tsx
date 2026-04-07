import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Trust Model
NexArt establishes execution integrity through three mechanisms:
1. Deterministic hashing: CER bundles produce a unique certificateHash (SHA-256)
2. Node attestation: an attestation node signs the certificateHash with Ed25519
3. Independent verification: anyone can verify using the CER bundle and the node's published public keys

## How trust is established
1. Application sends execution data to POST /v1/cer/ai/certify
2. NexArt creates a CER bundle (bundleType: cer.ai.execution.v1) and computes the certificateHash
3. The attestation node signs the certificateHash, producing a receipt stored at meta.attestation
4. The API returns the CER with receipt, signature, and verificationUrl
5. Anyone can verify the record at verify.nexart.io or independently

## Node attestation
- Nodes sign using Ed25519
- Public keys are published at node.nexart.io/.well-known/nexart-node.json
- Keys use kid and activeKid fields
- The receipt binds certificateHash + timestamp + nodeId
- The node does not store or own the execution data

## Independent verification
Verification requires no NexArt API access:
1. Recompute certificateHash from the CER bundle
2. Compare with the certificateHash in meta.attestation.receipt
3. Fetch the node's public key from node.nexart.io/.well-known/nexart-node.json matching the kid
4. Verify the Ed25519 signature

## What NexArt does NOT do
- NexArt does not store raw prompts or outputs
- NexArt does not guarantee the correctness of the execution itself
- NexArt does not act as a certificate authority for identity
- Attestation proves the record was witnessed, not that the execution was correct`;

const TrustModel = () => (
  <>
    <PageHeader
      title="Trust Model"
      summary="How NexArt establishes and verifies execution integrity."
      llmBlock={llmBlock}
    />

    <h2 id="overview">How Trust Works</h2>
    <p>NexArt establishes execution integrity through three mechanisms:</p>
    <ol>
      <li><strong>Deterministic hashing.</strong> Every CER bundle produces a unique <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> (SHA-256). Any change to the record changes the hash.</li>
      <li><strong>Node attestation.</strong> An attestation node signs the certificateHash using Ed25519, producing a receipt stored at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code> in the CER bundle.</li>
      <li><strong>Independent verification.</strong> Anyone can verify the record using the CER bundle and the node's published public keys. No API access is required.</li>
    </ol>

    <h2 id="flow">Certification Flow</h2>
    <p>Here is what happens when you call <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /v1/cer/ai/certify</code>:</p>
    <CodeBlock
      code={`1. Your application sends execution data to the NexArt API
2. NexArt creates a CER bundle (bundleType: "cer.ai.execution.v1")
   and computes the certificateHash (SHA-256)
3. The attestation node signs the certificateHash → produces a receipt
4. The API returns:
   - certificateHash
   - receipt (with timestamp, nodeId, kid)
   - signatureB64Url
   - verificationUrl
5. Anyone can verify the record at the verificationUrl or independently`}
      title="Certification Flow"
    />
    <p className="text-sm text-muted-foreground">In the CER bundle, the receipt and signature are stored at <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">meta.attestation</code>. The API response duplicates them at the top level for convenience.</p>

    <h2 id="node-attestation">Node Attestation</h2>
    <p>The attestation node is an independent witness. It does not define truth or control verification. When it signs a CER, it produces a receipt that proves:</p>
    <ul>
      <li>The node witnessed the CER bundle at a specific time</li>
      <li>The certificateHash was computed from the bundle at that time</li>
      <li>The node's identity is bound to the receipt</li>
    </ul>
    <p>Nodes sign using <strong>Ed25519</strong>. Their public keys are published at a well-known endpoint so anyone can verify independently:</p>
    <CodeBlock
      code={`GET node.nexart.io/.well-known/nexart-node.json

{
  "nodeId": "nexart-node-primary",
  "activeKid": "key_01HXYZ...",
  "keys": [
    {
      "kid": "key_01HXYZ...",
      "algorithm": "Ed25519",
      "publicKey": "MCowBQYDK2VwAyEA..."
    }
  ]
}`}
      title="Node Key Discovery"
    />
    <p>The node does not store or own the execution data. It witnesses the record and produces a cryptographic proof.</p>

    <h2 id="independent-verification">Independent Verification</h2>
    <p>Verification can be performed without any NexArt API access. You need two things:</p>
    <ul>
      <li>The CER bundle (including <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code>)</li>
      <li>The node's public key (from the well-known endpoint)</li>
    </ul>
    <p>Steps:</p>
    <ol>
      <li>Recompute the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> from the CER bundle</li>
      <li>Compare it with the certificateHash in <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.receipt</code></li>
      <li>Fetch the node's public key matching the receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code></li>
      <li>Verify the Ed25519 signature over the receipt payload</li>
    </ol>
    <p>If all steps pass, the attestation is trustworthy regardless of whether NexArt infrastructure is available.</p>

    <h2 id="what-attestation-proves">What Attestation Proves (and Does Not Prove)</h2>
    <p>Attestation proves that:</p>
    <ul>
      <li>The CER existed at the attested timestamp</li>
      <li>The record has not been modified since attestation</li>
      <li>A specific node witnessed and signed the record</li>
    </ul>
    <p>Attestation does <strong>not</strong> prove that:</p>
    <ul>
      <li>The execution itself was correct or accurate</li>
      <li>The inputs or outputs were truthful</li>
      <li>The application behaved as intended</li>
    </ul>
    <p>NexArt certifies that a record is intact and was witnessed. It does not evaluate the content of the execution.</p>

    <h2 id="boundaries">Trust Boundaries</h2>
    <ul>
      <li>NexArt does not store raw prompts or outputs. CERs contain hashes, not payloads.</li>
      <li>NexArt does not act as a certificate authority for user identity.</li>
      <li>The integrating application controls what metadata is included in the CER.</li>
      <li>Public verification uses a redacted representation. Sensitive data is not exposed.</li>
    </ul>
  </>
);

export default TrustModel;
