import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# NexArt Attestation Node (v0.11.2)
The attestation node verifies, persists, and signs CERs and Project Bundles.

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

## Persistence and registration
The node persists registered artifacts (single CERs via /api/attest; Project Bundles via /v1/project-bundle/register).
Persistence is what makes an artifact resolvable on verify.nexart.io.
Failure modes include PERSISTENCE_FAILED (write to proof tables failed) and AUTH_INVALID.

## Redacted reseal behavior
The node MAY return a redacted reseal of the original CER for public verification.
Reseal exists so artifacts containing sensitive metadata can still be publicly
verified after redaction.

A reseal is a NEW bundle (bundleType: signed-redacted-reseal) with:
- a NEW certificateHash covering the redacted content
- a provenance pointer to the ORIGINAL certificateHash (reference only)
- a fresh node signature over the resealed content

The original certificateHash is reference-only in public context.
The resealed hash is what the public verifier validates.

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

    <h2 id="where-trust-comes-from">Where trust comes from</h2>
    <p>Trust in NexArt is derived from three independent properties:</p>
    <ol>
      <li>
        <strong>Deterministic integrity.</strong>
        <ul>
          <li>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> binds the record to its exact contents.</li>
          <li>Any modification produces a different hash.</li>
        </ul>
      </li>
      <li>
        <strong>Node attestation.</strong>
        <ul>
          <li>A node signs the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> and records when it was observed.</li>
          <li>This provides a verifiable witness, not authority over the data.</li>
        </ul>
      </li>
      <li>
        <strong>Independent verification.</strong>
        <ul>
          <li>Verification is performed using open algorithms and published keys.</li>
          <li>The node does not control verification outcomes.</li>
        </ul>
      </li>
    </ol>
    <p>The node acts as a cryptographic witness, not a source of truth. Verification remains valid even if the node is unavailable, provided its public keys are known.</p>

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
    <p>Verification can be performed at two levels:</p>
    <ul>
      <li><strong>Full verification</strong> requires access to the complete CER bundle.</li>
      <li><strong>Public verification</strong> relies on redacted representations and confirms attestation without exposing underlying execution data.</li>
    </ul>

    <h2 id="compatibility">Node Compatibility</h2>
    <p>A CER remains valid regardless of which compliant NexArt attestation node produced the receipt.</p>
    <p>Verification tools must rely only on:</p>
    <ul>
      <li>The CER bundle</li>
      <li>The signed receipt</li>
      <li>The node's published public key material</li>
    </ul>
    <p>Verification must not depend on the continued availability of the original attestation node beyond its published verification material.</p>

    <h2 id="persistence">Persistence and Registration</h2>
    <p>
      Beyond signing, the canonical node persists registered artifacts. Persistence is
      what makes an artifact resolvable on{" "}
      <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>.
    </p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /api/attest</code> persists a single CER attestation.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /v1/project-bundle/register</code> persists a full Project Bundle.</li>
    </ul>
    <p>Common registration failure modes:</p>
    <ul>
      <li><strong>AUTH_INVALID</strong>: missing or wrong API key.</li>
      <li><strong>PERSISTENCE_FAILED</strong>: the bundle was signed but writing to the proof tables failed; the artifact will not resolve publicly. Retry with the same payload.</li>
      <li><strong>HASH_MISMATCH</strong>: the recomputed hash does not match the declared hash; usually caused by undefined values breaking canonical JSON.</li>
    </ul>
    <p>
      A 200 response is not sufficient evidence of success. Always confirm against
      the public verifier as the authoritative success signal. See{" "}
      <Link to="/docs/end-to-end-verification" className="text-primary hover:underline">End-to-End Verification</Link>.
    </p>
    <p className="text-sm text-muted-foreground border-l-2 border-border pl-3 mt-3">
      <strong>Note:</strong> NexArt nodes also accept{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /api/stamp</code>{" "}
      as a backward-compatible alias for{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/api/attest</code>.
      New integrations should use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/api/attest</code>.
      The alias will remain available for at least 12 months from this documentation change.
    </p>

    <h2 id="reseal">Redacted Reseal Behavior</h2>
    <p>
      The node MAY return a <strong>redacted reseal</strong> of the original CER for
      public verification. Reseal exists so that artifacts containing sensitive
      metadata can still be publicly verified after redaction, without exposing the
      private fields.
    </p>
    <p>A reseal is a NEW bundle with the following properties:</p>
    <ul>
      <li><strong>bundleType:</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signed-redacted-reseal</code></li>
      <li><strong>NEW certificateHash:</strong> covers the resealed (redacted) content. This is what the public verifier validates.</li>
      <li><strong>Provenance pointer:</strong> references the ORIGINAL <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. Reference only; not validated.</li>
      <li><strong>Fresh node signature:</strong> covers the resealed content under <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code>.</li>
    </ul>
    <p>
      The original and resealed hashes can legitimately coexist. They describe the
      same execution at different visibility levels. See{" "}
      <Link to="/docs/verification-semantics" className="text-primary hover:underline">Verification Semantics</Link>{" "}
      for the rules to apply when handling reseals.
    </p>

    <h2 id="node-api">Node API Endpoints</h2>
    <p>The canonical attestation node exposes the following endpoints. Authenticated endpoints require <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">Authorization: Bearer NEXART_API_KEY</code>.</p>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 font-medium border-b border-border">Endpoint</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Auth</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Purpose</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Typical use</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="px-4 py-3 font-mono text-xs">POST /v1/cer/ai/create</td>
            <td className="px-4 py-3">API key</td>
            <td className="px-4 py-3">Create a CER bundle without attestation.</td>
            <td className="px-4 py-3">Deferred attestation flows.</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-3 font-mono text-xs">POST /v1/cer/ai/certify</td>
            <td className="px-4 py-3">API key</td>
            <td className="px-4 py-3">Create and attest a CER in one call.</td>
            <td className="px-4 py-3">Default integration path.</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-3 font-mono text-xs">POST /v1/cer/verify</td>
            <td className="px-4 py-3">Public</td>
            <td className="px-4 py-3">Verify a single CER against the node's view.</td>
            <td className="px-4 py-3">Server-side verification of a held bundle.</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-3 font-mono text-xs">GET /v1/cer/public?certificate_hash=&lt;hash&gt;</td>
            <td className="px-4 py-3">Public</td>
            <td className="px-4 py-3">Fetch the public-safe (redacted) representation of a CER.</td>
            <td className="px-4 py-3">Backing the public verifier UI.</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-3 font-mono text-xs">POST /v1/project-bundle/register</td>
            <td className="px-4 py-3">API key</td>
            <td className="px-4 py-3">Register a Project Bundle and obtain a project-level receipt.</td>
            <td className="px-4 py-3">Multi-step or multi-agent workflows.</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-3 font-mono text-xs">POST /v1/project-bundle/verify</td>
            <td className="px-4 py-3">Public</td>
            <td className="px-4 py-3">Verify a Project Bundle.</td>
            <td className="px-4 py-3">Server-side verification of a held Project Bundle.</td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-mono text-xs">POST /v1/admin/recertify-batch</td>
            <td className="px-4 py-3">Admin key</td>
            <td className="px-4 py-3">Re-seal affected executions (e.g. v0.16.0 → v0.16.1 envelope alignment).</td>
            <td className="px-4 py-3">Operator remediation only.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 id="idempotency">Idempotency and Mutation Rules</h2>
    <ul>
      <li>One <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">execution_id</code> maps to one <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> forever.</li>
      <li>Re-submitting the same <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">execution_id</code> with the same content is idempotent and returns the original record.</li>
      <li>Re-submitting the same <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">execution_id</code> with mutated content returns <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">409 EXECUTION_MUTATION_DETECTED</code>. The original record is preserved.</li>
      <li>To represent a corrected execution, create a new record with a new <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">execution_id</code>.</li>
    </ul>

    <h2 id="error-codes">Error Codes</h2>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 font-medium border-b border-border">Code</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">CERTIFICATE_HASH_MISMATCH</td><td className="px-4 py-3">Recomputed certificateHash does not match the value declared in the bundle.</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">BUNDLE_HASH_MISMATCH</td><td className="px-4 py-3">Bundle hash does not match the receipt or envelope reference.</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">NODE_SIGNATURE_INVALID</td><td className="px-4 py-3">Ed25519 signature on the receipt fails verification against the published key.</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">RECEIPT_BUNDLE_HASH_MISMATCH</td><td className="px-4 py-3">Receipt references a different certificateHash than the bundle.</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">EXECUTION_MUTATION_DETECTED</td><td className="px-4 py-3">Same execution_id submitted with mutated content. Returned with HTTP 409.</td></tr>
          <tr className="border-b border-border"><td className="px-4 py-3 font-mono text-xs">UNAUTHORIZED</td><td className="px-4 py-3">Missing, malformed, or rejected API key.</td></tr>
          <tr><td className="px-4 py-3 font-mono text-xs">QUOTA_EXCEEDED</td><td className="px-4 py-3">Account or project quota exceeded.</td></tr>
        </tbody>
      </table>
    </div>

    <h2 id="self-hosted">Self-Hosted Nodes</h2>
    <p className="text-muted-foreground"><strong>Roadmap.</strong> Self-hosted attestation nodes are not currently available. This feature is planned for a future release.</p>
  </>
);

export default AttestationNode;
