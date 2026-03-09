import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# Certified Execution Record (CER) Protocol
Version: Draft v1 | Status: Public Specification Draft

The NexArt protocol defines a standardized structure for Certified Execution Records (CERs) and the rules for verifying and evolving those records.

## Protocol Scope
Supports multiple execution surfaces:
- AI execution certification: cer.ai.execution.v1
- Deterministic rendering (Code Mode): cer.codemode.render.v1

Governs: CER bundle structure, verification semantics, schema versioning, compatibility rules, deprecation policies.

## Canonical CER Structure
Three logical layers: Snapshot (execution data), Certificate Hash (deterministic hash of canonicalized bundle), Attestation (optional node receipt and signature).

## Verification Semantics
Three checks: Bundle Integrity, Node Signature, Receipt Consistency.

## Verification Status Values
VERIFIED — all checks passed
FAILED — one or more checks failed
NOT_FOUND — record not located

## Reason Codes (stable across versions)
BUNDLE_HASH_MISMATCH, NODE_SIGNATURE_INVALID, NODE_SIGNATURE_MISSING, RECEIPT_HASH_MISMATCH, SCHEMA_VERSION_UNSUPPORTED, RECORD_NOT_FOUND, BUNDLE_CORRUPTED

## Schema Versioning
Minor updates (v1.0→v1.1) add optional fields. Breaking changes require new major version (v2).

## Compatibility Rules
Readers must: ignore unknown optional fields, preserve unknown metadata, support earlier revisions within same major version.

## Deprecation Policy
Deprecated fields remain readable ≥12 months, must be documented, removal requires new major version.

## Conformance
A compliant verifier must: compute canonical bundle hash, validate node attestation signatures, confirm receipt consistency, produce standardized verification result.

## AIEF Alignment
CER Snapshot → AIEF Execution Artifact, certificateHash → Execution Fingerprint, Node Attestation Receipt → Integrity Proof, Verification Report → Audit Evidence.`;

const CERProtocol = () => (
  <>
    <PageHeader
      title="Certified Execution Record (CER) Protocol"
      summary="Governance, verification semantics, and schema rules for the NexArt protocol."
      llmBlock={llmBlock}
    />

    <div className="inline-flex items-center gap-2 mb-6">
      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">Version: Draft v1</span>
      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">Status: Public Specification Draft</span>
    </div>

    <p>The NexArt protocol defines a standardized structure for Certified Execution Records (CERs) and the rules for verifying and evolving those records.</p>
    <p>CERs allow AI executions and deterministic computations to produce portable, verifiable execution artifacts.</p>
    <p>A CER contains:</p>
    <ul>
      <li>Execution snapshot</li>
      <li>Deterministic certificate hash</li>
      <li>Optional node attestation</li>
      <li>Verification metadata</li>
    </ul>
    <p>These artifacts can be verified by any NexArt-compatible verifier.</p>

    <h2 id="scope">Protocol Scope</h2>
    <p>The CER protocol defines the structure and verification semantics for execution records produced by NexArt-compatible systems.</p>
    <p>The protocol currently supports multiple execution surfaces, including:</p>
    <ul>
      <li>AI execution certification</li>
      <li>Deterministic rendering (Code Mode)</li>
    </ul>
    <p>Each surface defines its own namespace. Examples:</p>
    <CodeBlock code={`cer.ai.execution.v1\ncer.codemode.render.v1`} language="text" />
    <p>The protocol governs:</p>
    <ul>
      <li>CER bundle structure</li>
      <li>Verification semantics</li>
      <li>Schema versioning</li>
      <li>Compatibility rules</li>
      <li>Deprecation policies</li>
    </ul>

    <h2 id="structure">Canonical CER Structure</h2>
    <p>A CER bundle is a structured JSON object.</p>
    <CodeBlock
      code={`{
  "bundleType": "cer.ai.execution.v1",
  "version": "0.1",
  "createdAt": "2026-03-08T20:30:00Z",
  "certificateHash": "sha256:...",
  "snapshot": {
    "type": "ai.execution.v1",
    "executionId": "demo-001",
    "provider": "openai",
    "model": "gpt-4o-mini",
    "inputHash": "sha256:...",
    "outputHash": "sha256:..."
  },
  "meta": {
    "attestation": {
      "receipt": {
        "certificateHash": "sha256:...",
        "timestamp": "2026-03-08T20:30:00Z",
        "nodeId": "nexart-node-primary",
        "kid": "k1"
      },
      "signature": "BASE64_SIGNATURE"
    }
  }
}`}
      title="Example CER Bundle"
    />
    <p>A CER bundle contains three logical layers:</p>
    <h3>Snapshot</h3>
    <p>Execution data describing the inputs and outputs of a run.</p>
    <h3>Certificate Hash</h3>
    <p>A deterministic hash of the canonicalized bundle.</p>
    <h3>Attestation</h3>
    <p>An optional node receipt and signature confirming observation of the execution.</p>

    <h2 id="verification-semantics">Verification Semantics</h2>
    <p>Verification confirms that a CER bundle is internally consistent and optionally attested by a NexArt node.</p>
    <p>Verification consists of three checks:</p>
    <h3>Bundle Integrity</h3>
    <p>The certificate hash must match the canonicalized bundle contents.</p>
    <h3>Node Signature</h3>
    <p>If a node attestation exists, the signature must validate against the node's public keys.</p>
    <h3>Receipt Consistency</h3>
    <p>The receipt <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> must match the bundle <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.</p>

    <h2 id="result-schema">Verification Result Schema</h2>
    <p>All NexArt-compatible verifiers should produce a standardized verification result.</p>
    <CodeBlock
      code={`{
  "status": "VERIFIED",
  "checks": {
    "bundleIntegrity": "PASS",
    "nodeSignature": "PASS",
    "receiptConsistency": "PASS"
  },
  "reasonCodes": [],
  "certificateHash": "sha256:...",
  "bundleType": "cer.ai.execution.v1",
  "verifiedAt": "2026-03-08T20:40:00Z",
  "verifier": "nexart-verifier/1.0.0"
}`}
      title="Verification Result"
    />
    <p>This structure allows verification results to be consumed consistently across:</p>
    <ul>
      <li>CLI verification</li>
      <li>Public verifier</li>
      <li>Dashboard verification reports</li>
      <li>Exported audit packages</li>
    </ul>

    <h2 id="status-values">Verification Status Values</h2>
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">status</code> field indicates the overall verification outcome.</p>
    <p>Allowed values:</p>
    <CodeBlock code={`VERIFIED\nFAILED\nNOT_FOUND`} language="text" />
    <ul>
      <li><strong>VERIFIED.</strong> All verification checks passed.</li>
      <li><strong>FAILED.</strong> One or more verification checks failed.</li>
      <li><strong>NOT_FOUND.</strong> The requested execution record was not located.</li>
    </ul>

    <h2 id="reason-codes">Reason Codes</h2>
    <p>Reason codes provide machine-readable explanations for verification failures.</p>
    <p>Current codes include:</p>
    <CodeBlock
      code={`BUNDLE_HASH_MISMATCH\nNODE_SIGNATURE_INVALID\nNODE_SIGNATURE_MISSING\nRECEIPT_HASH_MISMATCH\nSCHEMA_VERSION_UNSUPPORTED\nRECORD_NOT_FOUND\nBUNDLE_CORRUPTED`}
      language="text"
    />
    <p>Reason codes must remain stable across protocol versions. Human-readable messages may change, but reason codes must remain consistent.</p>

    <h2 id="schema-versioning">Schema Versioning</h2>
    <p>CER bundles include a namespace and schema version. Example:</p>
    <CodeBlock code={`cer.ai.execution.v1`} language="text" />
    <p>Minor schema updates may introduce new optional fields without breaking compatibility.</p>
    <p>Example: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">v1.0 → v1.1</code></p>
    <p>Breaking changes require a new namespace version.</p>
    <p>Example: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.ai.execution.v2</code></p>

    <h2 id="compatibility">Compatibility Rules</h2>
    <p>CER readers must support forward compatibility. Readers should:</p>
    <ul>
      <li>Ignore unknown optional fields</li>
      <li>Preserve unknown metadata</li>
      <li>Support verification of earlier revisions within the same major version</li>
    </ul>
    <p>These rules allow the protocol to evolve without breaking existing integrations.</p>

    <h2 id="deprecation">Deprecation Policy</h2>
    <p>Fields may be deprecated but must remain readable for a minimum period. Standard policy:</p>
    <ul>
      <li>Deprecated fields remain readable for at least 12 months.</li>
      <li>Deprecated fields must be documented in the protocol specification.</li>
      <li>Removal of deprecated fields requires a new major version.</li>
    </ul>

    <h2 id="conformance">Conformance Requirements</h2>
    <p>A NexArt-compliant verifier must:</p>
    <ol>
      <li>Compute the canonical bundle hash</li>
      <li>Validate node attestation signatures</li>
      <li>Confirm receipt consistency</li>
      <li>Produce a standardized verification result</li>
    </ol>
    <p>Systems implementing these steps can be considered CER-compatible verifiers.</p>

    <h2 id="aief">Alignment with AIEF</h2>
    <p>The CER protocol aligns with the AI Execution Integrity Framework (AIEF).</p>
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">AIEF Concept</th>
            <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">CER Equivalent</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="px-4 py-2 text-muted-foreground">Execution Artifact</td>
            <td className="px-4 py-2">CER Snapshot</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-2 text-muted-foreground">Execution Fingerprint</td>
            <td className="px-4 py-2"><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code></td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-2 text-muted-foreground">Integrity Proof</td>
            <td className="px-4 py-2">Node Attestation Receipt</td>
          </tr>
          <tr>
            <td className="px-4 py-2 text-muted-foreground">Audit Evidence</td>
            <td className="px-4 py-2">Verification Report</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>This alignment allows CERs to serve as verifiable execution artifacts within AIEF-compliant systems.</p>
  </>
);

export default CERProtocol;
