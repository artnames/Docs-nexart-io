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

Immutability: archival never mutates the CER bundle or its cryptographic evidence.

## Retention Policy Model
Retention policies define how long CER records remain stored and accessible inside NexArt-managed systems. Retention policies affect storage behavior but never modify CER artifacts, certificateHash, or verification semantics.

Retention classes: Short-term (temporary operational logs), Standard (default retention), Long-term (regulated/compliance workflows), Permanent (stored indefinitely). Class definitions may vary by organization.

Policy scope: retention policies may apply at organization, project, application, or execution surface level. Lower-level scopes may override higher-level defaults.

Expiry behavior: when a retention period expires the system may archive the record, delete the stored bundle, require manual review, or trigger export before deletion. Expiry must not invalidate cryptographic evidence.

Legal and audit hold: retention policies must support suspension of deletion for legal investigation, regulatory review, or internal audit. Under hold, deletion is blocked; archival may still occur.

Lifecycle interaction: retention policies influence transitions such as Active → Archived and Archived → Deleted. Policies never mutate the CER bundle.

Record action interaction: retention policies interact with hide, delete, archive, and export actions but must not remove historical audit traces.

## Evidence and Auditability Guarantees
Certified Execution Records are designed to function as durable execution evidence. A CER captures a verifiable record of a computation or AI execution and binds it to a deterministic certificate hash. When node attestation is present, the record also includes a signed receipt proving that the record existed at a specific point in time.

Evidence guarantees: Immutability — CER bundles and certificate hashes cannot be modified after creation without invalidating verification. Independent verification — verification does not require access to NexArt infrastructure; anyone with the CER bundle and the node's public keys can verify the record. Historical verifiability — records remain verifiable even if archived, hidden, or deleted from NexArt-managed storage. Audit trace preservation — management-layer actions (archive, hide, revoke, delete, export) must preserve an audit trail visible to authorized workflows. Protocol stability — verification semantics are versioned and must remain compatible with earlier protocol versions.

Scope of evidence: CERs provide cryptographic evidence of execution records and attestations. They do not prove that an execution result was correct or desirable. They prove that a specific execution artifact existed and can be verified. This distinction is important for audit clarity.

## Operational and Sensitive Actions
Record-management actions do not all have the same governance significance. Some affect normal storage and operational workflows. Others affect visibility, trust posture, or governance and require stronger controls. This classification operates only at the management layer — it does not modify the CER bundle, certificateHash, or signed receipt.

Operational actions: normal management actions that organize, store, or surface CER records without changing their trust meaning. Examples: export, archive, restore from archive, ordinary record lookup, ordinary internal search, retention-driven archival. These actions may affect where or how a record is surfaced but do not alter public trust semantics or cryptographic validity.

Sensitive actions: management actions that affect public visibility, operational trust, long-term availability, or governance posture. Examples: hide from public resolution, delete stored bundle, revoke operational validity, override standard retention behavior, apply or release legal/audit hold. These actions require stronger governance controls because they affect how records are relied upon, discovered, or preserved.

Why the distinction matters: separating operational from sensitive actions helps organizations apply stronger controls where record visibility, trust posture, or long-term evidence preservation may be affected. This distinction also supports future work on permissions, approval workflows, audit review processes, and enterprise governance controls.

Lifecycle and retention interaction: operational and sensitive actions interact with lifecycle states and retention policies. Archive is generally operational. Delete is sensitive. Hide is sensitive. Export is operational. Retention expiry may trigger operational or sensitive actions depending on policy. The classification helps determine how actions should later be controlled, reviewed, and audited.

Protocol immutability: neither operational nor sensitive actions mutate the CER bundle or its cryptographic evidence. The distinction concerns governance significance, not protocol behavior.

## Roles and Permissions Model
Organizations using NexArt may need to control who can view, manage, export, or modify the operational state of CER records. Roles and permissions apply only to management-layer operations such as lifecycle transitions, export actions, and governance controls. Access control does not modify the CER artifact itself. Verification and cryptographic integrity remain independent of access permissions.

Common role categories: Viewer (read-only access to CER records and verification results), Operator (operational access for day-to-day record management tasks), Auditor (read and export access for compliance and review workflows), Administrator (full management access including lifecycle, policy, and governance controls). Organizations may implement custom roles; these categories represent typical governance structures.

Permission categories: Read Permissions (view CER metadata, verification results, and record details), Export Permissions (generate evidence packs or export verification artifacts), Lifecycle Permissions (archive, restore, or hide records), Sensitive Permissions (delete records, revoke operational validity, or change retention behavior), Policy Permissions (modify retention policies or apply legal/audit holds). Permissions apply only to record management behavior.

Example permission matrix: Viewer — Read ✓, Export ✗, Archive ✗, Hide ✗, Revoke ✗, Delete ✗, Policy ✗. Operator — Read ✓, Export ✓, Archive ✓, Hide ✓, Revoke ✗, Delete ✗, Policy ✗. Auditor — Read ✓, Export ✓, Archive ✗, Hide ✗, Revoke ✗, Delete ✗, Policy ✗. Administrator — Read ✓, Export ✓, Archive ✓, Hide ✓, Revoke ✓, Delete ✓, Policy ✓. This is an example governance model; organizations may customize their permission structure.

Interaction with lifecycle and retention: permissions determine who can trigger lifecycle transitions (Active → Archived, Active → Hidden, Archived → Active, Archived → Deleted) and policy actions (define retention classes, apply retention overrides, place records under legal or audit hold).

Interaction with audit workflows: auditors may require controlled export permissions to generate evidence packs, verification snapshots, and export manifests. Audit workflows must not require modification of CER bundles or attestation artifacts.

Interaction with protocol immutability: access control and permissions never modify the CER bundle or its cryptographic evidence. Permissions govern operational access and management actions only. CER bundles, certificateHash values, signed receipts, and verification rules remain independent of organizational access control.

## Policy Control Layer
Organizations may require formal governance rules for how CER records are stored, surfaced, retained, exported, and controlled over time. The policy control layer provides a way to define those rules without modifying the CER protocol itself. Policies apply only to management-layer behavior such as lifecycle transitions, archival, export, retention, visibility, and record actions. Policies do not alter the CER artifact, certificateHash, signed receipt, or verification semantics.

Policy categories: Retention Policies (control how long records remain stored and when they transition to archival or deletion), Visibility Policies (control whether records are publicly resolvable, hidden, or restricted to internal access), Export Policies (control when evidence packs should be generated, what scope is allowed, and whether exports are required before archival or deletion), Action Policies (control whether actions such as delete, hide, revoke, or restore are allowed under normal operation), Audit Policies (control requirements for audit trace preservation, export logging, and evidence retention), Sensitive Action Policies (define additional controls around actions classified as governance-sensitive).

Policy scope: policies may apply at organization, project, application, execution surface, or record class level. Lower-level scopes may override higher-level defaults. Example: organization default archives after 90 days; project override retains active for 1 year.

Example policy expressions: policies may be represented in implementation-specific ways, but the governance model typically includes policy name, scope, trigger condition, resulting action, and exceptions or overrides. Example 1: archive all AI execution CERs after 90 days and retain them for 5 years. Example 2: require evidence export before deleting records classified as long-term or permanent.

Interaction with lifecycle and record actions: policies may trigger lifecycle transitions (Active → Archived, Archived → Deleted) and may constrain or require management actions (export before deletion, hide by default, prevent deletion when legal hold exists, prevent revoke except by authorized governance workflows). Policies govern how actions are applied, not what the CER artifact is.

Interaction with roles and permissions: policies and permissions are related but not identical. Permissions define who is allowed to attempt an action. Policies define whether the action is allowed or required under governance rules. An administrator may have permission to delete a record, but policy may still require export and hold checks before deletion is allowed.

Interaction with audit workflows: policies may require that certain records remain exportable, preserve audit trace, trigger evidence pack creation, or remain retained for a specified period. Audit workflows must continue to operate within policy constraints while preserving independent verification.

Interaction with protocol immutability: policies do not mutate the CER bundle, certificateHash, signed receipt, or verification result semantics. Policy controls only govern management-layer operations applied to stored records. The CER protocol remains stable and independently verifiable regardless of policy configuration.`;


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
    <p>Exported indicates that a CER has been included in one or more evidence exports. Export does not modify the CER or change its verification status. Exported is an event marker, not a storage state — a CER may be exported while remaining Active, Archived, or in any other lifecycle state.</p>

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
    <p>Revocation affects operational reliance, not historical existence or cryptographic validity. A revoked CER still proves that a specific execution was certified — it simply indicates that the record should no longer be relied upon for current operational purposes.</p>
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

    {/* ── Retention Policy Model ── */}
    <h2 id="retention-policy">Retention Policy Model</h2>
    <p>Retention policies define how long CER records remain stored and accessible inside NexArt-managed systems.</p>
    <p>Retention policies affect storage behavior but never modify CER artifacts, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, or verification semantics.</p>

    <h3 id="retention-classes">Retention Classes</h3>
    <p>Organizations may define retention classes to categorize how long records are kept:</p>

    <h4>Short-term</h4>
    <p>Used for temporary operational logs or transient execution records that do not require long-term preservation.</p>

    <h4>Standard</h4>
    <p>The default retention period for most CER records. Suitable for general operational use.</p>

    <h4>Long-term</h4>
    <p>Used for regulated workflows or compliance-sensitive systems where extended retention is required.</p>

    <h4>Permanent</h4>
    <p>Records intended to remain stored indefinitely. Suitable for critical audit evidence or records subject to permanent regulatory requirements.</p>

    <p>Retention class definitions may vary by organization. The classes listed here are examples — organizations may define custom classes aligned with their governance requirements.</p>

    <h3 id="retention-scope">Policy Scope</h3>
    <p>Retention policies may apply at multiple levels:</p>
    <ul>
      <li><strong>Organization</strong> — default retention for all records</li>
      <li><strong>Project</strong> — override for a specific project</li>
      <li><strong>Application</strong> — override for a specific app within a project</li>
      <li><strong>Execution surface</strong> — override based on bundle type (e.g. AI execution vs. Code Mode)</li>
    </ul>
    <p>Lower-level scopes may override higher-level defaults. For example, an organization default of 5 years may be overridden by a project-level policy of 1 year.</p>

    <h3 id="retention-expiry">Expiry Behavior</h3>
    <p>When a retention period expires, the system may take one or more of the following actions:</p>
    <ul>
      <li>Archive the record</li>
      <li>Delete the stored bundle</li>
      <li>Require manual review before deletion</li>
      <li>Trigger an export before deletion</li>
    </ul>
    <p>Retention expiry must not invalidate cryptographic evidence. Previously exported bundles and signed receipts remain independently verifiable regardless of whether the stored record has been removed.</p>

    <h3 id="retention-hold">Legal Hold and Audit Hold</h3>
    <p>Retention policies must support suspension of scheduled deletion when records are subject to:</p>
    <ul>
      <li>Legal investigation</li>
      <li>Regulatory review</li>
      <li>Internal audit</li>
    </ul>
    <p>When a record is under hold, deletion must be blocked. Archival may still occur during a hold period, but storage-level removal must be prevented until the hold is released.</p>

    <h3 id="retention-lifecycle">Interaction with Lifecycle States</h3>
    <p>Retention policies influence lifecycle transitions such as:</p>
    <ul>
      <li>Active → Archived (when a retention period triggers archival)</li>
      <li>Archived → Deleted (when a retention period expires for archived records)</li>
    </ul>
    <p>Retention policies never mutate the CER bundle, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, or attestation receipt. They govern <em>when</em> lifecycle transitions occur, not <em>what</em> happens to the CER artifact itself.</p>

    <h3 id="retention-actions">Interaction with Record Actions</h3>
    <p>Retention policies interact with record actions including hide, delete, archive, and export. For example, a policy may trigger an automatic export before a scheduled deletion.</p>
    <p>However, retention rules must not remove historical audit traces. All retention-driven actions must be logged and remain visible to authorized audit workflows.</p>

    {/* ── Evidence and Auditability Guarantees ── */}
    <h2 id="evidence-auditability">Evidence and Auditability Guarantees</h2>
    <p>Certified Execution Records are designed to function as durable execution evidence.</p>
    <p>A CER captures a verifiable record of a computation or AI execution and binds it to a deterministic certificate hash. When node attestation is present, the record also includes a signed receipt proving that the record existed at a specific point in time.</p>

    <h3 id="evidence-guarantees">Evidence Guarantees</h3>

    <h4>Immutability</h4>
    <p>CER bundles and certificate hashes cannot be modified after creation without invalidating verification. Any alteration to the bundle will produce a different hash, making tampering detectable.</p>

    <h4>Independent Verification</h4>
    <p>Verification does not require access to NexArt infrastructure. Anyone with the CER bundle and the node's public keys can verify the record independently.</p>

    <h4>Historical Verifiability</h4>
    <p>Records remain verifiable even if they are archived, hidden, or deleted from NexArt-managed storage. Verification depends on the CER artifact and receipt, not on storage state.</p>

    <h4>Audit Trace Preservation</h4>
    <p>Management-layer actions (archive, hide, revoke, delete, export) must preserve an audit trail visible to authorized workflows. No management action may silently remove evidence of prior record state.</p>

    <h4>Protocol Stability</h4>
    <p>Verification semantics are versioned and must remain compatible with earlier protocol versions. Records certified under an earlier version must remain verifiable under future verification implementations.</p>

    <h3 id="scope-of-evidence">Scope of Evidence</h3>
    <p>CERs provide cryptographic evidence of execution records and attestations.</p>
    <p>They do not prove that an execution result was correct, desirable, or appropriate. They prove that a specific execution artifact existed and can be verified against its certificate hash and, when present, its attestation receipt.</p>
    <p>This distinction is important for audit clarity. A CER demonstrates <em>what was executed and certified</em>, not <em>whether the outcome was good</em>.</p>

    {/* ── Operational and Sensitive Actions ── */}
    <h2 id="operational-sensitive-actions">Operational and Sensitive Actions</h2>
    <p>Record-management actions in NexArt do not all have the same governance significance. Some actions affect normal storage and operational workflows. Other actions affect visibility, trust posture, or governance and therefore require stronger controls.</p>
    <p>This classification operates only at the management layer. It does not modify the CER bundle, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, or signed receipt.</p>

    <h3 id="operational-actions">Operational Actions</h3>
    <p>Operational actions are normal management actions that organize, store, or surface CER records without changing their trust meaning.</p>
    <p>Examples of operational actions include:</p>
    <ul>
      <li>Export</li>
      <li>Archive</li>
      <li>Restore from archive</li>
      <li>Ordinary record lookup</li>
      <li>Ordinary internal search</li>
      <li>Retention-driven archival</li>
    </ul>
    <p>These actions may affect where or how a record is surfaced, but they do not alter public trust semantics or cryptographic validity.</p>

    <h3 id="sensitive-actions">Sensitive Actions</h3>
    <p>Sensitive actions are management actions that affect public visibility, operational trust, long-term availability, or governance posture.</p>
    <p>Examples of sensitive actions include:</p>
    <ul>
      <li>Hide from public resolution</li>
      <li>Delete stored bundle</li>
      <li>Revoke operational validity</li>
      <li>Override standard retention behavior</li>
      <li>Apply or release legal/audit hold</li>
    </ul>
    <p>These actions require stronger governance controls because they affect how records are relied upon, discovered, or preserved.</p>
    <p>This section defines the classification only. It does not introduce formal permissions, roles, or approval workflows.</p>

    <h3 id="why-distinction-matters">Why the Distinction Matters</h3>
    <p>Separating operational actions from sensitive actions helps organizations apply stronger controls where record visibility, trust posture, or long-term evidence preservation may be affected.</p>
    <p>This distinction also supports future work on:</p>
    <ul>
      <li>Permissions</li>
      <li>Approval workflows</li>
      <li>Audit review processes</li>
      <li>Enterprise governance controls</li>
    </ul>

    <h3 id="action-split-lifecycle">Interaction with Lifecycle and Retention</h3>
    <p>Operational and sensitive actions interact with lifecycle states and retention policies:</p>
    <ul>
      <li><strong>Archive</strong> — generally operational</li>
      <li><strong>Delete</strong> — sensitive</li>
      <li><strong>Hide</strong> — sensitive</li>
      <li><strong>Export</strong> — operational</li>
      <li><strong>Retention expiry</strong> — may trigger operational or sensitive actions depending on policy</li>
    </ul>
    <p>The classification helps determine how actions should later be controlled, reviewed, and audited.</p>

    <h3 id="action-split-immutability">Interaction with Protocol Immutability</h3>
    <p>Neither operational nor sensitive actions mutate the CER bundle or its cryptographic evidence.</p>
    <p>The distinction concerns governance significance, not protocol behavior. The CER bundle, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, and signed receipt remain immutable regardless of how an action is classified.</p>

    {/* ── Roles and Permissions Model ── */}
    <h2 id="roles-permissions">Roles and Permissions Model</h2>
    <p>Organizations using NexArt may need to control who can view, manage, export, or modify the operational state of CER records.</p>
    <p>Roles and permissions apply only to management-layer operations such as lifecycle transitions, export actions, and governance controls. Access control does not modify the CER artifact itself. Verification and cryptographic integrity remain independent of access permissions.</p>

    <h3 id="common-roles">Common Role Categories</h3>
    <p>The following role categories represent typical organizational governance structures for CER management. Organizations may implement custom roles aligned with their own requirements.</p>

    <h4>Viewer</h4>
    <p>Read-only access to CER records and verification results. Viewers can browse record metadata and view verification outcomes but cannot modify records or trigger management actions.</p>

    <h4>Operator</h4>
    <p>Operational access for day-to-day record management tasks. Operators can perform routine lifecycle actions such as archiving, restoring, and exporting records.</p>

    <h4>Auditor</h4>
    <p>Read and export access intended for compliance and review workflows. Auditors can view records and generate evidence packs but cannot modify lifecycle state or governance controls.</p>

    <h4>Administrator</h4>
    <p>Full management access including lifecycle transitions, policy configuration, and governance controls such as hide, revoke, and delete.</p>

    <h3 id="permission-categories">Permission Categories</h3>
    <p>The following categories define the main types of actions that may require permission controls. These permissions apply only to record management behavior.</p>

    <h4>Read Permissions</h4>
    <p>View CER metadata, verification results, and record details.</p>

    <h4>Export Permissions</h4>
    <p>Generate evidence packs or export verification artifacts.</p>

    <h4>Lifecycle Permissions</h4>
    <p>Archive, restore, or hide records.</p>

    <h4>Sensitive Permissions</h4>
    <p>Delete records, revoke operational validity, or change retention behavior.</p>

    <h4>Policy Permissions</h4>
    <p>Modify retention policies or apply legal/audit holds.</p>

    <h3 id="permission-matrix">Example Permission Matrix</h3>
    <p>The following table illustrates how roles may map to permission categories. This is an example governance model — organizations may customize their permission structure.</p>

    <div className="relative w-full overflow-auto my-4">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          <tr className="border-b">
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Read</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Export</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Archive</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Hide</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Revoke</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Delete</th>
            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Policy</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b"><td className="p-4 align-middle">Viewer</td><td className="p-4 align-middle">✓</td><td className="p-4 align-middle">✗</td><td className="p-4 align-middle">✗</td><td className="p-4 align-middle">✗</td><td className="p-4 align-middle">✗</td><td className="p-4 align-middle">✗</td><td className="p-4 align-middle">✗</td></tr>
          <tr className="border-b"><td className="p-4 align-middle">Operator</td><td className="p-4 align-middle">✓</td><td className="p-4 align-middle">✓</td><td className="p-4 align-middle">✓</td><td className="p-4 align-middle">✓</td><td className="p-4 align-middle">✗</td><td className="p-4 align-middle">✗</td><td className="p-4 align-middle">✗</td></tr>
          <tr className="border-b"><td className="p-4 align-middle">Auditor</td><td className="p-4 align-middle">✓</td><td className="p-4 align-middle">✓</td><td className="p-4 align-middle">✗</td><td className="p-4 align-middle">✗</td><td className="p-4 align-middle">✗</td><td className="p-4 align-middle">✗</td><td className="p-4 align-middle">✗</td></tr>
          <tr className="border-b"><td className="p-4 align-middle">Administrator</td><td className="p-4 align-middle">✓</td><td className="p-4 align-middle">✓</td><td className="p-4 align-middle">✓</td><td className="p-4 align-middle">✓</td><td className="p-4 align-middle">✓</td><td className="p-4 align-middle">✓</td><td className="p-4 align-middle">✓</td></tr>
        </tbody>
      </table>
    </div>

    <h3 id="permissions-lifecycle">Interaction with Lifecycle and Retention</h3>
    <p>Permissions determine who can trigger lifecycle transitions such as:</p>
    <ul>
      <li>Active → Archived</li>
      <li>Active → Hidden</li>
      <li>Archived → Active (restore)</li>
      <li>Archived → Deleted</li>
    </ul>
    <p>Policy permissions may also control who can:</p>
    <ul>
      <li>Define retention classes</li>
      <li>Apply retention overrides</li>
      <li>Place records under legal or audit hold</li>
    </ul>

    <h3 id="permissions-audit">Interaction with Audit Workflows</h3>
    <p>Auditors may require controlled export permissions to generate evidence packs. Export permissions should allow authorized users to create:</p>
    <ul>
      <li>CER evidence packs</li>
      <li>Verification snapshots</li>
      <li>Export manifests</li>
    </ul>
    <p>Audit workflows must not require modification of CER bundles or attestation artifacts.</p>

    <h3 id="permissions-immutability">Interaction with Protocol Immutability</h3>
    <p>Access control and permissions never modify the CER bundle or its cryptographic evidence.</p>
    <p>Permissions govern operational access and management actions only. CER bundles, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> values, signed receipts, and verification rules remain independent of organizational access control.</p>

    {/* ── Policy Control Layer ── */}
    <h2 id="policy-control-layer">Policy Control Layer</h2>
    <p>Organizations may require formal governance rules for how CER records are stored, surfaced, retained, exported, and controlled over time.</p>
    <p>The policy control layer provides a way to define those rules without modifying the CER protocol itself. Policies apply only to management-layer behavior such as lifecycle transitions, archival, export, retention, visibility, and record actions.</p>
    <p>Policies do not alter the CER artifact, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, signed receipt, or verification semantics.</p>

    <h3 id="policy-categories">Policy Categories</h3>
    <p>Organizations may apply policies across the following governance categories:</p>

    <h4>Retention Policies</h4>
    <p>Control how long records remain stored and when they transition to archival or deletion. Retention policies interact with the <a href="#retention-policy" className="text-primary hover:underline">Retention Policy Model</a> defined earlier on this page.</p>

    <h4>Visibility Policies</h4>
    <p>Control whether records are publicly resolvable, hidden from external access, or restricted to internal organizational users. Visibility policies may set default visibility for new records or enforce hiding based on record class.</p>

    <h4>Export Policies</h4>
    <p>Control when evidence packs should be generated, what export scope is allowed, and whether exports are required before archival or deletion. Export policies support audit readiness by ensuring evidence is preserved before lifecycle transitions.</p>

    <h4>Action Policies</h4>
    <p>Control whether specific management actions — such as delete, hide, revoke, or restore — are allowed under normal operation. Action policies may block or constrain actions that would otherwise be permitted by role-based permissions.</p>

    <h4>Audit Policies</h4>
    <p>Control requirements for audit trace preservation, export logging, and evidence retention. Audit policies help organizations maintain accountability and traceability across record management operations.</p>

    <h4>Sensitive Action Policies</h4>
    <p>Define additional controls around actions classified as <a href="#operational-sensitive-actions" className="text-primary hover:underline">governance-sensitive</a>. These policies may require additional review, approval, or documentation before sensitive actions are executed.</p>

    <h3 id="policy-scope">Policy Scope</h3>
    <p>Policies may apply at multiple organizational scopes:</p>
    <ul>
      <li><strong>Organization-wide</strong> — default governance rules for all records</li>
      <li><strong>Project</strong> — override for a specific project</li>
      <li><strong>Application</strong> — override for a specific app within a project</li>
      <li><strong>Execution surface</strong> — override based on bundle type</li>
      <li><strong>Record class or workflow type</strong> — override based on record classification</li>
    </ul>
    <p>Lower-level scopes may override higher-level defaults, consistent with the <a href="#retention-scope" className="text-primary hover:underline">retention policy scope model</a>.</p>
    <p>For example:</p>
    <ul>
      <li><strong>Organization default:</strong> archive after 90 days</li>
      <li><strong>Project override:</strong> retain active for 1 year</li>
    </ul>

    <h3 id="policy-expressions">Example Policy Expressions</h3>
    <p>Policies may be represented in implementation-specific ways. The governance model typically includes:</p>
    <ul>
      <li>Policy name</li>
      <li>Scope</li>
      <li>Trigger condition</li>
      <li>Resulting action</li>
      <li>Exceptions or overrides</li>
    </ul>
    <p>This section does not introduce a formal policy schema. These are conceptual examples of how governance rules may be expressed.</p>

    <h4>Example 1</h4>
    <p className="text-muted-foreground italic">Archive all AI execution CERs after 90 days and retain them for 5 years.</p>

    <h4>Example 2</h4>
    <p className="text-muted-foreground italic">Require evidence export before deleting records classified as long-term or permanent.</p>

    <h3 id="policy-lifecycle">Interaction with Lifecycle and Record Actions</h3>
    <p>Policies may trigger lifecycle transitions such as:</p>
    <ul>
      <li>Active → Archived</li>
      <li>Archived → Deleted</li>
    </ul>
    <p>Policies may also constrain or require management actions such as:</p>
    <ul>
      <li>Export before deletion</li>
      <li>Hide by default</li>
      <li>Prevent deletion when legal hold exists</li>
      <li>Prevent revoke except by authorized governance workflows</li>
    </ul>
    <p>Policies govern <em>how</em> actions are applied, not <em>what</em> the CER artifact is.</p>

    <h3 id="policy-permissions">Interaction with Roles and Permissions</h3>
    <p>Policies and permissions are related but not identical:</p>
    <ul>
      <li><strong>Permissions</strong> define <em>who</em> is allowed to attempt an action.</li>
      <li><strong>Policies</strong> define <em>whether</em> the action is allowed or required under governance rules.</li>
    </ul>
    <p>For example, an administrator may have permission to delete a record, but policy may still require export and hold checks before deletion is allowed.</p>
    <p>This distinction is important for enterprise governance where role-based access alone is not sufficient to enforce organizational rules.</p>

    <h3 id="policy-audit">Interaction with Audit Workflows</h3>
    <p>Policies may require that certain records:</p>
    <ul>
      <li>Remain exportable</li>
      <li>Preserve audit trace</li>
      <li>Trigger evidence pack creation</li>
      <li>Remain retained for a specified period</li>
    </ul>
    <p>Audit workflows must continue to operate within policy constraints while preserving independent verification. Policies support audit readiness but do not override the ability to verify CER artifacts independently.</p>

    <h3 id="policy-immutability">Interaction with Protocol Immutability</h3>
    <p>Policies do not mutate the CER bundle, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, signed receipt, or verification result semantics.</p>
    <p>Policy controls only govern management-layer operations applied to stored records. The CER protocol remains stable and independently verifiable regardless of policy configuration.</p>
  </>
);

export default CERRecordManagement;
