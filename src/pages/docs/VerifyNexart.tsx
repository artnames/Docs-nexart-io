import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# verify.nexart.io

The public verification portal for NexArt records.

## Two flows

### Certificate Hash verification
Route: /c/:certificateHash
Verifies: bundle integrity, attestation (if present)

### Project Bundle verification
Route: /p/:projectHash
Verifies: project structure, per-step CERs, project hash, node receipt

## How it works
Verification runs locally in the browser using @nexart/ai-execution.
The node provides data (bundles, receipts, keys). Trust comes from cryptographic verification, not from the node.

## What is visible
- certificateHash or projectHash, timestamp, node identity, verification status
- Input/output content is hashed, not displayed
- Metadata may be included or redacted based on export settings`;

const VerifyNexart = () => (
  <>
    <PageHeader
      title="verify.nexart.io"
      summary="The public verification portal for CERs and Project Bundles."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p><a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a> is the public verification portal for NexArt records. It supports two verification flows: one for individual CERs and one for Project Bundles.</p>

    <div className="not-prose my-6 rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-sm font-medium text-foreground mb-1">Verification runs in the browser</div>
      <div className="text-sm text-muted-foreground">
        All cryptographic checks execute locally in the browser using <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">@nexart/ai-execution</code>.
        The node provides data (bundles, receipts, public keys). Trust comes from the cryptographic verification itself, not from the node serving the data.
      </div>
    </div>

    <h2 id="certificate-hash">Certificate Hash Verification</h2>
    <p>Route: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/c/:certificateHash</code></p>
    <p>Verifies a single Certified Execution Record by its certificateHash.</p>
    <CodeBlock
      code="https://verify.nexart.io/c/sha256%3A9e8d7c6b5a4f3210..."
      title="Example URL"
    />
    <p><strong>Checks performed:</strong></p>
    <ul>
      <li>Bundle integrity: recomputes the certificateHash and confirms it matches</li>
      <li>Node signature: validates the Ed25519 signature against the node's published key (if attestation is present)</li>
      <li>Receipt consistency: confirms the receipt references the correct certificateHash</li>
      <li>Verification envelope: validates the envelope signature (when present)</li>
    </ul>

    <h2 id="project-bundle">Project Bundle Verification</h2>
    <p>Route: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/p/:projectHash</code></p>
    <p>Verifies an entire Project Bundle by its projectHash.</p>
    <CodeBlock
      code="https://verify.nexart.io/p/sha256%3Aab12cd34ef56..."
      title="Example URL"
    />
    <p><strong>Checks performed:</strong></p>
    <ul>
      <li>Project hash integrity: recomputes the projectHash from all steps</li>
      <li>Per-step CER verification: each embedded CER is verified individually</li>
      <li>Step registry consistency: confirms step ordering and structure are intact</li>
      <li>Project-level node receipt: validates the project-level attestation (if present)</li>
    </ul>

    <h2 id="also-supported">Also Supported</h2>
    <ul>
      <li><strong>By execution ID:</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/e/:executionId</code> for records created through the certify API</li>
      <li><strong>By bundle upload:</strong> paste or drag-and-drop a CER JSON bundle for offline-style verification</li>
    </ul>

    <h2 id="what-is-visible">What Is Visible</h2>
    <ul>
      <li>Verification status, hash, timestamp, and node identity are always shown</li>
      <li>Raw input and output content is never exposed. The record contains SHA-256 hashes only.</li>
      <li>Metadata fields may be included or redacted based on the record's export settings</li>
    </ul>

    <h2 id="trust-model">Trust Model</h2>
    <p>The verifier does not ask you to trust the node. It fetches the CER data and the node's public keys, then runs all checks locally in the browser. If the hashes match and the signatures are valid, the record is verified. The node is an independent witness, not a trust authority.</p>
    <p>See <Link to="/docs/attestation-node" className="text-primary hover:underline">Attestation and Node Role</Link> for more on how the node fits into the trust model.</p>
  </>
);

export default VerifyNexart;
