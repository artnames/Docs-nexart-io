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

## Canonical Hash Computation
certificateHash = SHA-256 of canonicalized bundle. Canonicalization: remove non-deterministic fields, sort keys, serialize as canonical JSON. Format: sha256:<hex digest>. Hash comparison is case-insensitive, whitespace-normalized. Excluded from hash: meta.attestation, meta.attestation.receipt, meta.attestation.signature (produced after hash).

## Verification Semantics
Three checks: Bundle Integrity, Node Signature, Receipt Consistency. Each check returns PASS, FAIL, or SKIPPED. Node attestation is optional — unattested CERs can still be verified for bundle integrity (signature/receipt checks are SKIPPED).

## Schema Versioning
Namespace identifies execution surface (cer.ai.execution, cer.codemode.render) allowing independent schema evolution. Minor updates (v1.0→v1.1) add optional fields. Breaking changes require new major version (v2).

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

## CER Lifecycle Model
Lifecycle states describe how records are managed, stored, or presented — not how the CER bundle behaves cryptographically. CER bundles are immutable protocol artifacts. Lifecycle states apply to record management systems.

States:
- Active — stored and available for normal operations, resolvable by execution ID or certificate hash
- Exported — included in an audit package or evidence bundle; export does not modify the CER
- Archived — moved to long-term storage; remains cryptographically verifiable; may be excluded from dashboard queries
- Hidden — stored and verifiable but not publicly resolvable; accessible to authorized organizational users
- Deleted — removed from NexArt storage per retention policy; does not invalidate cryptographic provenance; previously exported bundles remain verifiable

Transitions: Active → Archived, Active → Hidden, Archived → Active (restore), Active → Deleted. Transitions affect storage and visibility, not bundle contents.

Audit visibility: lifecycle states influence operational interfaces but must not alter verification integrity. Verification tools evaluate CER bundles independently of lifecycle state.

Immutability guarantee: lifecycle management never modifies the CER bundle, certificateHash, or attestation receipt. All lifecycle operations occur at the record management layer.

## Record Action Semantics
Management actions (hide, delete, revoke, export) operate at the storage, visibility, and governance layer. They do not modify the CER bundle, certificateHash, or signed receipt.

Actions:
- Hide — record remains stored and verifiable but no longer publicly resolvable; accessible to authorized organizational users
- Delete — removes stored bundle from NexArt storage per retention/governance rules; does not invalidate cryptographic provenance; prior exports and receipts remain verifiable
- Revoke — governance action indicating record should no longer be treated as operationally valid; does not alter or delete the original CER; preserves historical audit trace
- Export — creates external evidence package; does not modify the CER or change verification status

Revocation semantics: revocation must not mutate the original CER. The original record remains historically valid as evidence of what was certified. Revocation applies to operational trust, not historical existence. Future protocol revisions may represent revocation as a separate linked artifact.

Deletion semantics: deletion refers only to removal from managed storage. It does not erase prior exports, independently held bundles, signed receipts, or historical evidence. Deletion affects availability, not cryptographic history.

Public visibility semantics: hiding removes public resolution (verification URLs, certificate-hash lookup) but does not change the CER, certificateHash, or signed receipt. Authorized users may still access hidden records through internal control surfaces.

Audit trace preservation: all hide, revoke, delete, and export actions must preserve an audit trail at the management layer. Actions remain visible to authorized audit workflows even when the underlying record is hidden or removed.

Lifecycle interaction: these actions interact with lifecycle states defined in the CER Lifecycle Model. Hide may move a record into the Hidden state. Delete may move a record into Deleted. Export may record an Exported lifecycle event. Revoke may affect operational validity without mutating the CER.

## Protocol Surfaces
NexArt Node, NexArt CLI, NexArt Verifier, NexArt Dashboard, NexArt SDKs. All must follow verification semantics defined in this specification.

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

    <h2 id="canonical-hash">Canonical Hash Computation</h2>
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is computed by hashing the canonicalized CER bundle.</p>
    <p>Canonicalization ensures that equivalent bundles produce identical hashes regardless of JSON formatting.</p>
    <p>The canonicalization process:</p>
    <ul>
      <li>Removes non-deterministic fields</li>
      <li>Sorts object keys deterministically</li>
      <li>Serializes the bundle using canonical JSON encoding</li>
    </ul>
    <p>The hash algorithm used by the protocol is:</p>
    <CodeBlock code={`SHA-256`} language="text" />
    <p>The resulting certificate hash is formatted as:</p>
    <CodeBlock code={`sha256:<hex digest>`} language="text" />
    <p>Hash comparison must be performed on the normalized hexadecimal digest without whitespace or case differences.</p>
    <p>All NexArt-compatible verifiers must compute the certificate hash using this canonicalization process.</p>

    <h3>Hash Scope</h3>
    <p>The certificate hash is computed from the canonicalized CER bundle excluding attestation metadata.</p>
    <p>Fields under the following paths are excluded from the hash computation:</p>
    <CodeBlock code={`meta.attestation\nmeta.attestation.receipt\nmeta.attestation.signature`} language="text" />
    <p>These fields are excluded because they are produced after the certificate hash is computed.</p>
    <p>This ensures the bundle hash remains stable before and after node attestation.</p>

    <h2 id="verification-semantics">Verification Semantics</h2>
    <p>Verification confirms that a CER bundle is internally consistent and optionally attested by a NexArt node.</p>
    <p>Verification consists of three checks:</p>
    <h3>Bundle Integrity</h3>
    <p>The certificate hash must match the canonicalized bundle contents.</p>
    <h3>Node Signature</h3>
    <p>If a node attestation exists, the signature must validate against the node's public keys.</p>
    <h3>Receipt Consistency</h3>
    <p>The receipt <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> must match the bundle <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.</p>
    <p>Node attestation is optional. A CER bundle without attestation can still be verified for bundle integrity, but cannot prove that a NexArt node observed the execution.</p>

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
      title="Verification Result (with attestation)"
    />
    <p>Each check value must be one of:</p>
    <CodeBlock code={`PASS\nFAIL\nSKIPPED`} language="text" />
    <ul>
      <li><strong>PASS</strong> — check succeeded</li>
      <li><strong>FAIL</strong> — check failed</li>
      <li><strong>SKIPPED</strong> — check not applicable (e.g. no attestation present)</li>
    </ul>
    <p>Example verification result without attestation:</p>
    <CodeBlock
      code={`{
  "checks": {
    "bundleIntegrity": "PASS",
    "nodeSignature": "SKIPPED",
    "receiptConsistency": "SKIPPED"
  }
}`}
      title="Verification Result (without attestation)"
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
    <p>The namespace (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.ai.execution</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.codemode.render</code>) identifies the execution surface and ensures schema evolution can occur independently across surfaces.</p>
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

    <h2 id="lifecycle">CER Lifecycle Model</h2>
    <p>This section defines the operational lifecycle of a Certified Execution Record as a managed record inside the NexArt system.</p>
    <p>Lifecycle states describe how records are managed, stored, or presented — <strong>not</strong> how the CER bundle itself behaves cryptographically.</p>
    <p>CER bundles are immutable protocol artifacts. Lifecycle states apply to record management systems such as dashboards, storage layers, and audit workflows.</p>

    <h3>Lifecycle States</h3>

    <h4>Active</h4>
    <p>The CER is stored and available for normal operations. It can be resolved by execution ID or certificate hash and may appear in dashboard queries and exports.</p>

    <h4>Exported</h4>
    <p>The CER has been exported as part of an audit package or external evidence bundle. Export does not modify the CER or change its verification status.</p>

    <h4>Archived</h4>
    <p>The CER has been moved to long-term storage for retention purposes. Archived records remain cryptographically verifiable and may still be resolved through the verification system. Archived records may be excluded from normal dashboard queries but remain accessible through audit workflows.</p>

    <h4>Hidden</h4>
    <p>The CER remains stored and verifiable but is no longer publicly resolvable through public endpoints. Hidden records remain accessible to authorized organizational users and retain full verification capability.</p>

    <h4>Deleted (storage-level deletion)</h4>
    <p>The stored bundle may be removed from the NexArt storage layer according to retention policies. However, deletion does not invalidate the underlying cryptographic provenance of the CER. Any previously exported bundles or receipts remain independently verifiable.</p>

    <h3 id="lifecycle-transitions">Lifecycle Transitions</h3>
    <p>Lifecycle states may transition through operational actions:</p>
    <ul>
      <li>Active → Archived</li>
      <li>Active → Hidden</li>
      <li>Archived → Active (restore)</li>
      <li>Active → Deleted (storage-level removal)</li>
    </ul>
    <p>Transitions affect storage and visibility behavior, not the CER bundle contents.</p>

    <h3 id="audit-visibility">Audit Visibility</h3>
    <p>Lifecycle states influence how records appear in operational interfaces but must not alter their verification integrity.</p>
    <p>Verification tools must evaluate CER bundles independently of lifecycle state. Audit workflows must preserve historical visibility of lifecycle actions.</p>

    <h3 id="lifecycle-immutability">Interaction with Protocol Immutability</h3>
    <p>Lifecycle management never modifies the CER bundle, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, or attestation receipt. All lifecycle operations occur at the record management layer and do not affect the cryptographic validity of the record.</p>

    <h2 id="protocol-surfaces">Protocol Surfaces</h2>
    <p>The CER protocol is implemented across several NexArt system surfaces.</p>
    <p>These surfaces share the same schema and verification semantics.</p>
    <p>Current protocol implementations include:</p>
    <ul>
      <li><strong>NexArt Node</strong> — produces CER bundles and node attestations</li>
      <li><strong>NexArt CLI</strong> — local creation and verification of CER bundles</li>
      <li><strong>NexArt Verifier</strong> — public verification interface</li>
      <li><strong>NexArt Dashboard</strong> — storage, export, and audit reports</li>
      <li><strong>NexArt SDKs</strong> — developer libraries for generating and verifying CERs</li>
    </ul>
    <p>All implementations must follow the verification semantics defined in this specification.</p>
  </>
);

export default CERProtocol;
