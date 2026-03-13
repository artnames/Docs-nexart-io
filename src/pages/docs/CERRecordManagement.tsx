import PageHeader from "@/components/docs/PageHeader";
import { Link } from "react-router-dom";

const llmBlock = `# CER Record Management
Operational lifecycle and enterprise control semantics for CER records.

CER bundles are immutable protocol artifacts. Record management defines how organizations store, surface, and govern CER records over time. This page defines management-layer behavior only — it does not modify the CER protocol schema, certificateHash computation, or verification semantics.

## CER Lifecycle Model
Lifecycle states describe how records are managed, stored, or presented — not how the CER bundle behaves cryptographically.

States:
- Active — stored and available for normal operations, resolvable by execution ID or certificate hash
- Exported — included in an audit package or evidence bundle; export does not modify the CER
- Archived — moved to long-term storage; remains cryptographically verifiable; may be excluded from dashboard queries
- Hidden — stored and verifiable but not publicly resolvable; accessible to authorized organizational users
- Deleted — removed from NexArt storage per retention policy; does not invalidate cryptographic provenance; previously exported bundles remain verifiable

Transitions: Active → Archived, Active → Hidden, Archived → Active (restore), Active → Deleted. Transitions affect storage and visibility, not bundle contents.

Audit visibility: lifecycle states influence operational interfaces but must not alter verification integrity. Verification tools evaluate CER bundles independently of lifecycle state.

Immutability guarantee: lifecycle management never modifies the CER bundle, certificateHash, or attestation receipt.

## Record Action Semantics
Management actions (hide, delete, revoke, export) operate at the storage, visibility, and governance layer. They do not modify the CER bundle, certificateHash, or signed receipt.

Actions:
- Hide — record remains stored and verifiable but no longer publicly resolvable; accessible to authorized organizational users
- Delete — removes stored bundle from NexArt storage per retention/governance rules; does not invalidate cryptographic provenance
- Revoke — governance action indicating record should no longer be treated as operationally valid; does not alter or delete the original CER
- Export — creates external evidence package; does not modify the CER or change verification status

Revocation semantics: revocation must not mutate the original CER. The original record remains historically valid. Revocation applies to operational trust, not historical existence.

Deletion semantics: deletion refers only to removal from managed storage. It does not erase prior exports, independently held bundles, signed receipts, or historical evidence.

Public visibility semantics: hiding removes public resolution but does not change the CER, certificateHash, or signed receipt.

Audit trace preservation: all hide, revoke, delete, and export actions must preserve an audit trail at the management layer.

## Archival Behavior Model
Archival is a record-management behavior, not a change to the CER bundle itself.

Storage behavior: archived CERs move from active to long-term managed storage. May be excluded from dashboard lists and operational queries but remain retrievable for audit, restore, or verification.

Public resolvability: archival does not automatically remove a record from public verification surfaces unless separate visibility rules (Hidden) apply.

Verification persistence: archived records remain cryptographically verifiable. Archival does not affect certificateHash validity, signed receipt validity, or verifier interpretation.

Searchable metadata: core metadata (executionId, certificateHash, bundleType, createdAt) may remain searchable for authorized users.

Restore behavior: archived records may be restored to Active state. Restoration affects storage and visibility only — not the CER bundle or receipt.

Immutability: archival never mutates the CER bundle or its cryptographic evidence.`;

const CERRecordManagement = () => (
  <>
    <PageHeader
      title="CER Record Management"
      summary="Operational lifecycle and enterprise control semantics for CER records."
      llmBlock={llmBlock}
    />

    <p>CER bundles are immutable protocol artifacts. Record management defines how organizations store, surface, and govern CER records over time.</p>
    <p>This page defines management-layer behavior only. It does not modify the <Link to="/docs/cer-protocol" className="text-primary hover:underline">CER protocol schema</Link>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> computation, or verification semantics.</p>

    {/* ── CER Lifecycle Model ── */}
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

    {/* ── Record Action Semantics ── */}
    <h2 id="record-action-semantics">Record Action Semantics</h2>
    <p>This section defines the management actions that may apply to stored CER records.</p>
    <p>These actions operate at the storage, visibility, and governance layer. They do not modify the CER bundle, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, or signed receipt.</p>

    <h3>Hide</h3>
    <p>A hidden record remains stored and cryptographically verifiable but is no longer publicly resolvable through public verification endpoints. Hidden records remain accessible to authorized organizational users and retain full verification capability.</p>

    <h3>Delete (storage-level deletion)</h3>
    <p>Deletion removes the stored bundle from the NexArt-managed storage layer according to retention or governance rules. Deletion does not invalidate the underlying cryptographic provenance of the record. Previously exported bundles, receipts, and verification artifacts remain independently verifiable.</p>

    <h3>Revoke</h3>
    <p>Revocation does not alter or delete the original CER. Instead, revocation is a governance action indicating that the original record should no longer be treated as operationally valid for current workflows. A revocation must preserve the historical audit trace of the original CER.</p>

    <h3>Export</h3>
    <p>Export creates an external evidence package or bundle copy for audit or archival use. Export does not modify the CER or change its verification status.</p>

    <h3 id="revocation-semantics">Revocation Semantics</h3>
    <p>Revocation must not mutate the original CER. The original record remains historically valid as evidence of what was certified at the time.</p>
    <p>Revocation applies to operational trust or workflow use, not to historical existence. A revoked CER still proves that a specific execution was certified — it simply indicates that the record should no longer be relied upon for current operational purposes.</p>
    <p>Future protocol revisions may represent revocation as a separate linked artifact. This documentation defines revocation semantics without extending the current schema.</p>

    <h3 id="deletion-semantics">Deletion Semantics</h3>
    <p>Deletion refers only to removal from managed storage layers. Deletion does not erase:</p>
    <ul>
      <li>Prior exports</li>
      <li>Independently held CER bundles</li>
      <li>Signed receipts</li>
      <li>Historical evidence that a record once existed</li>
    </ul>
    <p>Deletion therefore affects availability, not cryptographic history.</p>

    <h3 id="public-visibility-semantics">Public Visibility Semantics</h3>
    <p>A hidden record may no longer resolve through public verification URLs or public certificate-hash lookup. However, hiding does not change the CER itself, its <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, or its signed receipt.</p>
    <p>Organizationally authorized users may still access hidden records through internal control surfaces, subject to permissions and policy.</p>

    <h3 id="audit-trace-preservation">Audit Trace Preservation</h3>
    <p>All hide, revoke, delete, and export actions must preserve an audit trail at the management layer.</p>
    <p>Management actions must remain visible to authorized audit workflows even when the underlying record is hidden or removed from primary storage. Historical accountability is preserved even when operational visibility changes.</p>

    <h3 id="action-lifecycle-interaction">Interaction with Lifecycle Model</h3>
    <p>Record actions interact with lifecycle states defined in the <a href="#lifecycle" className="text-primary hover:underline">CER Lifecycle Model</a>. Hide may move a record into the Hidden state. Delete may move a record into Deleted (storage-level deletion). Export may record an Exported lifecycle event. Revoke may affect operational validity without mutating the CER or its lifecycle state.</p>

    {/* ── Archival Behavior Model ── */}
    <h2 id="archival-behavior">Archival Behavior Model</h2>
    <p>This section defines what it means for a Certified Execution Record to be archived inside the NexArt system.</p>
    <p>Archival is a record-management behavior, not a change to the CER bundle itself. Archiving must not modify the CER, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, attestation receipt, or verification semantics.</p>

    <h3 id="archival-storage">Storage Behavior</h3>
    <p>An archived CER is moved from active operational storage into long-term managed storage.</p>
    <p>Archived records may be excluded from normal dashboard lists, high-frequency operational queries, or default application views.</p>
    <p>However, archival must preserve the ability to retrieve the record for audit, restore, or verification purposes according to organizational policy.</p>

    <h3 id="archival-resolvability">Public Resolvability</h3>
    <p>Archival does not automatically remove a record from public verification surfaces unless separate visibility rules (such as Hidden) apply.</p>
    <p>An archived record may remain publicly resolvable by execution ID or certificate hash if public visibility is still allowed by policy.</p>
    <p>If a record is both archived and hidden, public resolution may be disabled while internal audit access remains preserved.</p>

    <h3 id="archival-verification">Verification Persistence</h3>
    <p>Archived records remain cryptographically verifiable. Archival does not affect:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> validity</li>
      <li>Signed receipt validity</li>
      <li>Independent verification of previously exported bundles</li>
      <li>Verifier interpretation of the record</li>
    </ul>
    <p>Verification depends on the CER artifact and receipt, not on whether the record is active or archived.</p>

    <h3 id="archival-metadata">Searchable Metadata</h3>
    <p>Archived records may be excluded from default operational search results.</p>
    <p>However, core metadata may remain searchable for authorized users, such as:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">executionId</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createdAt</code></li>
      <li>Project and app identifiers where applicable</li>
    </ul>
    <p>This allows organizations to locate archived records without restoring them to active state.</p>

    <h3 id="archival-restore">Restore Behavior</h3>
    <p>Archived records may be restored to the Active state through management-layer actions.</p>
    <p>Restoration affects storage and operational visibility only. It does not modify the CER bundle, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, or signed receipt.</p>
    <p>Archived → Active is a lifecycle management transition, not a new certification event.</p>

    <h3 id="archival-immutability">Interaction with Protocol Immutability</h3>
    <p>Archival never mutates the CER bundle or its cryptographic evidence. The same CER must remain verifiable before, during, and after archival.</p>
    <p>Archival changes how the record is stored and surfaced, not what the record is.</p>

    <h3 id="archival-lifecycle">Relationship to Lifecycle and Actions</h3>
    <p>Archival is one lifecycle state within the <a href="#lifecycle" className="text-primary hover:underline">CER Lifecycle Model</a>. It is distinct from Hide (which affects public resolvability) and Delete (which removes the stored bundle). Archival preserves audit trace and verification continuity as defined in the <a href="#record-action-semantics" className="text-primary hover:underline">Record Action Semantics</a>.</p>
  </>
);

export default CERRecordManagement;
