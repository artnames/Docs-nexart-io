import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# CER Audit Workflows
How Certified Execution Records are packaged, exported, and consumed in audit, compliance, and review workflows.

Audit workflows operate at the evidence-packaging and record-management layer. They do not modify CER bundles, certificateHash values, signed receipts, or verification semantics.

## Evidence Pack
An evidence pack is a structured export of one or more CER records and their supporting verification materials. Evidence packs enable independent review, offline verification, and durable audit preservation.

Contents may include: CER bundle(s), signed receipt(s), verification result(s), node metadata snapshot, export manifest, human-readable evidence summary.

## Export Manifest
Every evidence pack should include a machine-readable manifest describing what was exported. Recommended fields: exportedAt, exportedBy, recordCount, exportScope, verificationTool, records[] (each with executionId, certificateHash, bundleType).

## Verification Snapshot
Evidence packs should include a verification result captured at export time. Fields: verifiedAt, status, checks (bundleIntegrity, nodeSignature, receiptConsistency), reasonCodes, verifier. Reviewers may independently re-run verification using exported artifacts.

## Node Metadata Snapshot
When node attestation is present, evidence packs should include a snapshot of node metadata: nodeId, activeKid, keys[], protocol version. This improves reproducibility of later receipt verification.

## Export Scope and Filters
Evidence packs may be generated for: a single execution, a project, an application, a time range, a certificate hash, or an execution surface.

## Offline Verification
Evidence packs support independent verification without live access to NexArt infrastructure. An auditor can verify using: the CER bundle, the signed receipt, the node public key material, and verification rules from the CER Protocol.

## Review-Oriented Outputs
Machine-readable: cer.json, receipt.json, verification-report.json, manifest.json. Human-readable: evidence-summary.html, reviewer notes, exported summary report.

## Relationship to CER Record Management
Audit workflows rely on lifecycle, archival, retention, and record-action semantics from CER Record Management. Archived records may be exported. Hidden records may remain accessible to authorized audit workflows. Deleted records may still be verifiable if previously exported.`;

const manifestExample = `{
  "exportedAt": "2025-06-15T10:30:00Z",
  "exportedBy": "org:acme-corp",
  "recordCount": 3,
  "exportScope": "project:compliance-review-q2",
  "verificationTool": "nexart-verify@1.2.0",
  "records": [
    {
      "executionId": "exec_abc123",
      "certificateHash": "sha256:9f86d08...",
      "bundleType": "full"
    },
    {
      "executionId": "exec_def456",
      "certificateHash": "sha256:a3c1e7b...",
      "bundleType": "full"
    },
    {
      "executionId": "exec_ghi789",
      "certificateHash": "sha256:e4d909c...",
      "bundleType": "full"
    }
  ]
}`;

const verificationSnapshotExample = `{
  "verifiedAt": "2025-06-15T10:30:12Z",
  "status": "VERIFIED",
  "checks": {
    "bundleIntegrity": "PASS",
    "nodeSignature": "PASS",
    "receiptConsistency": "PASS"
  },
  "reasonCodes": [],
  "verifier": "nexart-verify@1.2.0"
}`;

const nodeMetadataExample = `{
  "nodeId": "nexart-node-01",
  "activeKid": "key-2025-06",
  "keys": [
    {
      "kid": "key-2025-06",
      "algorithm": "Ed25519",
      "publicKey": "MCowBQYDK2VwAyEA..."
    }
  ],
  "protocolVersion": "1.0"
}`;

const CERAuditWorkflows = () => {
  return (
    <div className="prose-custom">
      <DocsMeta
        title="CER Audit Workflows"
        description="Export Evidence Packs of Certified Execution Records for auditors. Includes bundles, receipts, and verification reports."
      />
      <PageHeader
        title="CER Audit Workflows"
        summary="How Certified Execution Records are packaged, exported, and consumed in audit, compliance, and review workflows."
        llmBlock={llmBlock}
      />

      <p>
        Certified Execution Records can be used as durable execution evidence in audit, compliance, and review workflows.
        This page defines how CER evidence should be packaged, exported, and reviewed without changing the underlying protocol artifacts.
      </p>
      <p>
        Audit workflows operate at the <strong>evidence-packaging and record-management layer</strong>, not the cryptographic protocol layer.
        CER bundles, certificate hashes, signed receipts, and verification semantics remain unchanged.
      </p>

      {/* Evidence Pack */}
      <h2>Evidence Pack</h2>
      <p>
        An <strong>evidence pack</strong> is a structured export of one or more CER records and their supporting verification materials.
        The purpose of an evidence pack is to allow independent review, offline verification, and durable audit preservation.
      </p>
      <p>An evidence pack may include:</p>
      <ul>
        <li>CER bundle(s)</li>
        <li>Signed receipt(s)</li>
        <li>Verification result(s)</li>
        <li>Node metadata snapshot</li>
        <li>Export manifest</li>
        <li>Human-readable evidence summary</li>
      </ul>

      {/* Export Manifest */}
      <h2>Export Manifest</h2>
      <p>
        Every evidence pack should include a machine-readable manifest describing what was exported, when, and by whom.
        The manifest enables automated processing and audit trail tracking.
      </p>
      <p>Recommended manifest structure:</p>
      <div className="overflow-x-auto mb-6">
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>exportedAt</code></td><td>ISO 8601 timestamp of the export</td></tr>
            <tr><td><code>exportedBy</code></td><td>Identity or organization that triggered the export</td></tr>
            <tr><td><code>recordCount</code></td><td>Number of CER records included</td></tr>
            <tr><td><code>exportScope</code></td><td>Scope filter used (project, application, time range, etc.)</td></tr>
            <tr><td><code>verificationTool</code></td><td>Tool and version used for verification at export time</td></tr>
            <tr><td><code>records[]</code></td><td>Array of record entries</td></tr>
          </tbody>
        </table>
      </div>
      <p>Each record entry includes:</p>
      <div className="overflow-x-auto mb-6">
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>executionId</code></td><td>Unique execution identifier</td></tr>
            <tr><td><code>certificateHash</code></td><td>Deterministic hash of the CER bundle</td></tr>
            <tr><td><code>bundleType</code></td><td>Type of bundle included (e.g. <code>full</code>)</td></tr>
          </tbody>
        </table>
      </div>
      <CodeBlock code={manifestExample} language="json" title="Example: Export Manifest" />

      {/* Verification Snapshot */}
      <h2>Verification Snapshot</h2>
      <p>
        Evidence packs should include a <strong>verification result captured at the time of export</strong>.
        This allows reviewers to see the verification outcome that was observed when the package was generated.
      </p>
      <p>Suggested fields:</p>
      <div className="overflow-x-auto mb-6">
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>verifiedAt</code></td><td>Timestamp of the verification</td></tr>
            <tr><td><code>status</code></td><td>Overall result (<code>VERIFIED</code> or <code>FAILED</code>)</td></tr>
            <tr><td><code>checks</code></td><td>Individual check results (bundleIntegrity, nodeSignature, receiptConsistency)</td></tr>
            <tr><td><code>reasonCodes</code></td><td>Codes explaining any failures</td></tr>
            <tr><td><code>verifier</code></td><td>Tool and version used</td></tr>
          </tbody>
        </table>
      </div>
      <CodeBlock code={verificationSnapshotExample} language="json" title="Example: Verification Snapshot" />
      <p>
        Later reviewers may independently re-run verification using the exported artifacts and the{" "}
        <Link to="/docs/verification" className="text-primary hover:underline">verification rules</Link>{" "}
        defined in the CER Protocol.
      </p>

      {/* Node Metadata Snapshot */}
      <h2>Node Metadata Snapshot</h2>
      <p>
        When node attestation is present, evidence packs should include a snapshot of the node metadata used for verification at export time.
        This improves reproducibility of later receipt verification.
      </p>
      <p>Suggested contents:</p>
      <ul>
        <li><code>nodeId</code>: identifier of the attestation node</li>
        <li><code>activeKid</code>: key identifier active at export time</li>
        <li><code>keys[]</code>: public key material used for receipt verification</li>
        <li><code>protocolVersion</code>: protocol version if available</li>
      </ul>
      <CodeBlock code={nodeMetadataExample} language="json" title="Example: Node Metadata Snapshot" />
      <p>
        This is an audit packaging recommendation. It does not change the{" "}
        <Link to="/docs/attestation-node" className="text-primary hover:underline">attestation node</Link>{" "}
        protocol itself.
      </p>

      {/* Export Scope and Filters */}
      <h2>Export Scope and Filters</h2>
      <p>Evidence packs may be generated for a variety of scopes. Audits rarely export all records. Scoping ensures relevance and efficiency.</p>
      <p>Supported export scopes include:</p>
      <ul>
        <li>A single execution</li>
        <li>A project</li>
        <li>An application</li>
        <li>A time range</li>
        <li>A specific certificate hash</li>
        <li>An execution surface</li>
      </ul>
      <p>Multiple scopes may be combined to produce focused evidence packs suitable for specific review workflows.</p>

      {/* Offline Verification */}
      <h2>Offline Verification</h2>
      <p>
        Evidence packs should support <strong>independent verification without requiring live access to NexArt infrastructure</strong>.
      </p>
      <p>An auditor should be able to verify a record using:</p>
      <ul>
        <li>The CER bundle</li>
        <li>The signed receipt</li>
        <li>The node public key material</li>
        <li>The{" "}
          <Link to="/docs/cer-protocol" className="text-primary hover:underline">verification rules</Link>{" "}
          defined in the CER Protocol
        </li>
      </ul>
      <p>
        Online services may improve convenience (e.g. key discovery, status lookups), but they are not required for evidence validation.
      </p>

      {/* Review-Oriented Outputs */}
      <h2>Review-Oriented Outputs</h2>
      <p>Evidence packs may include both machine-readable and human-readable materials to support different review workflows.</p>

      <h3>Machine-Readable</h3>
      <ul>
        <li><code>cer.json</code>: CER bundle</li>
        <li><code>receipt.json</code>: signed attestation receipt</li>
        <li><code>verification-report.json</code>: verification result</li>
        <li><code>manifest.json</code>: export manifest</li>
      </ul>

      <h3>Human-Readable</h3>
      <ul>
        <li><code>evidence-summary.html</code>: formatted evidence overview</li>
        <li>Reviewer notes</li>
        <li>Exported summary report</li>
      </ul>

      {/* Relationship to CER Record Management */}
      <h2>Relationship to CER Record Management</h2>
      <p>
        Audit workflows rely on the lifecycle, archival, retention, and record-action semantics defined in{" "}
        <Link to="/docs/cer-record-management" className="text-primary hover:underline">CER Record Management</Link>.
      </p>
      <ul>
        <li>Archived records may still be exported into evidence packs</li>
        <li>Hidden records may remain accessible to authorized audit workflows</li>
        <li>Deleted records may still be verifiable if previously exported</li>
      </ul>
      <p>
        The audit workflow model builds on the governance and lifecycle controls defined at the record-management layer. It does not replace them.
      </p>
    </div>
  );
};

export default CERAuditWorkflows;
