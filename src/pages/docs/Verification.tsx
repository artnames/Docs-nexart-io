import PageHeader from "@/components/docs/PageHeader";
import MentalModel from "@/components/docs/MentalModel";
import FailureModes from "@/components/docs/FailureModes";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";
import TechnicalTruth from "@/components/docs/TechnicalTruth";
import SealedVsCertified from "@/components/docs/SealedVsCertified";
import CanonicalFlow from "@/components/docs/CanonicalFlow";
import { Link } from "react-router-dom";

const llmBlock = `# NexArt Verification
Verification confirms up to four things about a CER:
1. The bundle has not been modified (Bundle Integrity)
2. The receipt was signed by a valid attestation node (Node Signature)
3. The receipt references the correct certificateHash (Receipt Consistency)
4. The verification envelope has not been altered (Verification Envelope - when present)

## How to verify
Three ways to verify a record:
1. By executionId: https://verify.nexart.io/e/exec_abc123
2. By certificateHash: https://verify.nexart.io/c/sha256%3A7f83...
3. By uploading a CER bundle: drag and drop or paste the JSON bundle at verify.nexart.io

## Public verifier
verify.nexart.io is the public verification portal.
The verifier uses a redacted/public-safe representation. Raw inputs/outputs are not exposed.

## Checks
Each check returns PASS, FAIL, or SKIPPED.
1. Bundle Integrity: recompute certificateHash from bundle contents, confirm it matches
2. Node Signature: validate Ed25519 signature using key from node.nexart.io/.well-known/nexart-node.json (matched by kid). SKIPPED if no attestation.
3. Receipt Consistency: receipt (at meta.attestation.receipt) references same certificateHash as bundle. SKIPPED if no attestation.
4. Verification Envelope: validate meta.verificationEnvelopeSignature against meta.verificationEnvelope. SKIPPED if no envelope present.

## What is publicly visible
- certificateHash, timestamp, node identity, verification status
- Input/output content is hashed (SHA-256), not stored or displayed
- Metadata fields may be included or redacted based on export settings

## Verification statuses (per CER Protocol)
VERIFIED: all applicable checks pass
FAILED: one or more checks fail
NOT_FOUND: record not located

## Verification layers
AI CER bundles support up to three layers: Bundle Integrity, Signed Attestation Receipt, and Verification Envelope.
- Layer 1 (Integrity): SHA-256 over JCS-canonicalized whitelist projection (bundleType, version, createdAt, snapshot, context?, contextSummary?). Recomputes certificateHash.
- Layer 2 (Receipt): validates Ed25519 receipt over certificateHash. Independent of envelope.
- Layer 3 (Envelope, v0.16.1): Ed25519 over { attestation projection (attestationId, attestedAt, kid, nodeRuntimeHash, protocolVersion), bundle projection (bundleType, version, createdAt, snapshot, context?, contextSummary?) }. certificateHash, meta, and receipt are NOT signed by the envelope.

## Why envelope verification may fail
- Envelope FAIL with Integrity PASS: the bundle's hashed content is intact, but a signed-but-unhashed attestation field (attestationId, attestedAt, kid, nodeRuntimeHash, protocolVersion) was modified.
- Envelope SKIPPED: bundle does not include verificationEnvelope/verificationEnvelopeSignature, or the projection cannot be reconstructed (e.g. redacted public bundle).
- Re-serialization that breaks JCS canonicalization invalidates the envelope even when content is semantically equivalent.
- kid mismatch: the node key referenced by kid is not in the published key set at node.nexart.io/.well-known/nexart-node.json.
- v0.16.0 signals alignment bug: fixed in v0.16.1; affected executions can be re-certified via POST /v1/admin/recertify-batch.
- Pre-envelope artifacts predate v0.16.1; Layer 3 returns SKIPPED by compatibility fallback.

## Why public bundles cannot always verify the envelope
The public verifier consumes a redacted representation. Raw snapshot.input / snapshot.output are never exposed; only SHA-256 digests are. Layer 3 signs a strict whitelist projection that includes snapshot (and context/contextSummary when present), so a verifier without the original bytes cannot reconstruct the signed payload byte-for-byte. In that case Layer 3 returns SKIPPED while Layer 1 (against the public-safe representation) and Layer 2 still PASS. Full envelope verification requires the original non-redacted bundle.

Envelope FAIL is reported independently and MUST NOT be conflated with integrity failure.

## Independent verification
Verification can be performed without NexArt API access using the CER bundle (including meta.attestation) and the node's published public keys.`;

const Verification = () => (
  <>
    <DocsMeta
      title="Verification"
      description="How to verify a Certified Execution Record: locally, via the SDK, or publicly at verify.nexart.io/c/{certificateHash}."
    />
    <PageHeader
      title="Verification"
      summary="How to verify any NexArt record, with or without API access."
      llmBlock={llmBlock}
    />
    <CanonicalFlow context="All verification results derive from this model." />

    <TechnicalTruth />

    <MentalModel lines={["Integrity ≠ Stamp ≠ Envelope.", "Verification does not require trust.", "Failure of one layer is not failure of all."]} />

    <FailureModes />
    <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
      <p className="text-sm font-medium mb-1">Local verification is not public verification.</p>
      <p className="text-sm text-muted-foreground">
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verifyCer()</code> and
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono ml-1">verifyProjectBundle()</code> prove integrity only. To make an artifact resolvable on
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono ml-1">verify.nexart.io</code>, you MUST register it on the attestation node. See the
        <Link to="/docs/end-to-end-verification" className="text-primary hover:underline ml-1">End-to-End Verification Flow</Link>.
      </p>
    </div>

    <h2 id="overview">How Verification Works</h2>
    <p>Verification confirms the integrity and authenticity of a Certified Execution Record or Project Bundle. The canonical flow is:</p>
    <ol>
      <li>An execution happens.</li>
      <li>A CER is <strong>sealed</strong> locally (SDK <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">sealCer()</code> or CLI <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">nexart ai seal</code>), binding execution metadata to a deterministic <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. This is fully offline.</li>
      <li>The sealed bundle can be verified immediately. Layer 1 (integrity) returns PASS; Layers 2 and 3 return SKIPPED because no node attestation is present.</li>
      <li>Optionally, the CER is <strong>certified</strong> by an attestation node, which adds a signed receipt and a verification envelope.</li>
      <li>A certified bundle can be verified against all three layers (PASS/PASS/PASS) and is resolvable at <Link to="/docs/verify-nexart" className="text-primary hover:underline">verify.nexart.io</Link>.</li>
      <li>Optionally, multiple CERs are collected into a <Link to="/docs/concepts/project-bundles" className="text-primary hover:underline">Project Bundle</Link> with a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code>.</li>
    </ol>

    <SealedVsCertified />

    <h2 id="three-layers">The Three Verification Layers</h2>
    <p>Verification is split into three independent layers. Each layer protects a distinct property and reports its result independently. Envelope failure MUST NOT be reported as integrity failure.</p>

    <h3 id="layer-1">Layer 1 — Integrity (certificateHash)</h3>
    <p>Recomputes the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> from the strict whitelist projection of the bundle, canonicalized with JCS (RFC 8785). Proves the bundle has not been modified across covered fields.</p>
    <p><strong>Hashed fields:</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">bundleType</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">version</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">createdAt</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">snapshot</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">context</code> (if present), <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">contextSummary</code> (if present).</p>
    <p><strong>Not hashed:</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">certificateHash</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">meta</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">declaration</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">verificationEnvelope</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">verificationEnvelopeSignature</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">receipt</code>, any unknown fields.</p>

    <h3 id="layer-2">Layer 2 — Receipt (Node stamp)</h3>
    <p>Validates the Ed25519 signed receipt over the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. Proves the node attested the bundle at a specific time. Receipt verification is independent of envelope verification.</p>

    <h3 id="layer-3">Layer 3 — Verification Envelope (v0.16.1, v2)</h3>
    <p>Ed25519 signature over <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{`{ attestation, bundle }`}</code> using a strict whitelist projection. Proves full bundle integrity under the node's signature beyond the certificateHash.</p>
    <ul>
      <li><strong>Attestation projection (5 fields, exact):</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">attestationId</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">attestedAt</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">kid</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">nodeRuntimeHash</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">protocolVersion</code>.</li>
      <li><strong>Bundle projection:</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">bundleType</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">version</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">createdAt</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">snapshot</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">context</code> (if present), <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">contextSummary</code> (if present).</li>
      <li><code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">certificateHash</code> is NOT part of the signed payload.</li>
      <li><code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">meta</code> is NOT signed by the envelope.</li>
      <li><code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">receipt</code> is NOT signed by the envelope.</li>
    </ul>
    <p className="text-sm text-muted-foreground">Envelope failure indicates the signed bundle projection has been altered. It is reported separately from Layer 1 and MUST NOT be conflated with integrity failure.</p>

    <div className="not-prose my-6 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
      <div className="text-sm font-medium text-foreground mb-1">Public verification limitation</div>
      <div className="text-sm text-muted-foreground">
        When using public endpoints, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">snapshot.input</code> and <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">snapshot.output</code> are redacted. Therefore:
        <ul className="list-disc pl-5 mt-2">
          <li>Full envelope verification is NOT possible from public data alone.</li>
          <li>Receipt verification IS possible.</li>
          <li>certificateHash verification IS possible (against the public-safe representation).</li>
        </ul>
      </div>
    </div>

    <h2 id="why-envelope-may-fail">Why Envelope Verification May Fail</h2>
    <p>
      Envelope verification (Layer 3) is independent of integrity (Layer 1) and receipt (Layer 2).
      A bundle can be fully intact and properly attested while the envelope check returns
      <strong> FAIL</strong> or <strong>SKIPPED</strong>. The two outcomes carry different meaning and
      MUST NOT be conflated with integrity failure.
    </p>

    <h3 id="envelope-skipped-vs-failed">SKIPPED vs FAIL</h3>
    <ul>
      <li>
        <strong>SKIPPED</strong> — the envelope check is not applicable. The bundle does not include
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono ml-1">meta.verificationEnvelope</code>{" "}
        and/or <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">meta.verificationEnvelopeSignature</code>,
        OR the verifier cannot reconstruct the signed projection (for example, fields required by
        the projection are not present in the received bundle). SKIPPED is NOT a failure.
      </li>
      <li>
        <strong>FAIL</strong> — the envelope is present and reconstructable, but the Ed25519
        signature does not validate against the projected payload using the node key matched by
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono ml-1">kid</code>.
      </li>
    </ul>

    <h3 id="envelope-fail-causes">Reasons Layer 3 returns FAIL while Layers 1 and 2 PASS</h3>
    <ol>
      <li>
        <strong>Mutation of a signed-but-unhashed field.</strong> The envelope signs an attestation
        projection (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">attestationId</code>,{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">attestedAt</code>,{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">kid</code>,{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">nodeRuntimeHash</code>,{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">protocolVersion</code>) that
        is NOT covered by <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">certificateHash</code>.
        Editing one of those fields breaks Layer 3 while Layer 1 still passes.
      </li>
      <li>
        <strong>Re-serialization that breaks JCS.</strong> Layer 3 requires the exact JCS (RFC 8785)
        canonicalization of the whitelist projection. Tools that pretty-print, reorder keys, change
        number formatting, or alter Unicode escaping invalidate the signature even when content is
        semantically identical.
      </li>
      <li>
        <strong>Key mismatch (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">kid</code>).</strong>{" "}
        The verifier resolves the public key by <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">kid</code>{" "}
        from <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">node.nexart.io/.well-known/nexart-node.json</code>.
        If the published key set has rotated or the <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">kid</code>{" "}
        is unknown, the signature cannot be validated.
      </li>
      <li>
        <strong>Partial / redacted bundle.</strong> Public-safe representations may strip fields
        from <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">snapshot</code> or omit
        attestation projection fields. The envelope payload cannot be reconstructed bit-for-bit, so
        Layer 3 returns <strong>SKIPPED</strong> (or <strong>FAIL</strong> if the verifier
        attempts strict reconstruction). See "Why public bundles cannot always verify the envelope" below.
      </li>
      <li>
        <strong>v0.16.0 signals payload alignment bug.</strong> Bundles created with
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono ml-1">@nexart/ai-execution@0.22.0</code>{" "}
        that include signals MAY fail envelope verification due to a payload alignment issue fixed
        in <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">v0.16.1</code>. Operators
        SHOULD re-certify affected executions via{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">POST /v1/admin/recertify-batch</code>.
      </li>
      <li>
        <strong>Pre-envelope artifact.</strong> Bundles produced before v0.16.1 may not include any
        envelope at all. Layer 3 returns <strong>SKIPPED</strong> by compatibility fallback.
        This is NOT a failure of integrity or attestation.
      </li>
    </ol>

    <h3 id="envelope-failure-vs-integrity">Envelope FAIL does not imply Integrity FAIL</h3>
    <p>
      Because <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>{" "}
      and the envelope cover different projections (the envelope additionally signs the attestation
      projection and excludes <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>{" "}
      itself), a Layer 3 <strong>FAIL</strong> with Layer 1 <strong>PASS</strong> indicates the bundle's
      hashed content is intact, but the node's signed surface around it has been altered. Verifiers
      MUST report each layer independently. The aggregate verification status follows the rules in{" "}
      <Link to="/docs/verification-statuses-and-errors" className="text-primary hover:underline">
        Verification Statuses and Errors
      </Link>.
    </p>

    <h3 id="public-bundle-envelope-limit">Why public bundles cannot always verify the envelope</h3>
    <p>
      The public verifier consumes a redacted representation of the record. Raw{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot.input</code> and{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot.output</code> are
      never exposed publicly; only their SHA-256 digests are. Some metadata fields may also be
      withheld depending on export settings. Because Layer 3 signs a strict whitelist projection
      that includes <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot</code>{" "}
      (and, when present, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">context</code>{" "}
      / <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">contextSummary</code>), a
      verifier without the exact source bytes cannot reconstruct the signed payload byte-for-byte.
    </p>
    <p>
      In that case the public verifier returns <strong>SKIPPED</strong> for Layer 3 and still
      reports <strong>PASS</strong> for Layer 1 (against the public-safe representation) and
      Layer 2 (receipt validation against <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>).
      Full envelope verification requires the original, non-redacted CER bundle — typically held by
      the producer or an authorized auditor.
    </p>

    <h2 id="what-it-proves">What Verification Proves</h2>
    <p>Verification answers up to four questions about a Certified Execution Record:</p>
    <ol>
      <li>Has the CER bundle been modified since it was created?</li>
      <li>Was the receipt signed by a valid NexArt attestation node?</li>
      <li>Does the receipt reference the correct <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>?</li>
      <li>Has the verification envelope been altered? (when present)</li>
    </ol>
    <p>If all applicable checks pass, the record is intact and its attestation is trustworthy. For a detailed breakdown, see <Link to="/docs/ai-cer-verification-layers" className="text-primary hover:underline">AI CER Verification Layers</Link>.</p>

    <div className="not-prose my-6 rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-sm font-medium text-foreground mb-1">v0.16.0 → v0.16.1 compatibility</div>
      <div className="text-sm text-muted-foreground">
        Bundles created with <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">@nexart/ai-execution@0.22.0</code> that include signals may fail envelope verification due to a payload alignment issue. <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">v0.16.1</code> fixes this. Re-certification may be required. Operators can use <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">POST /v1/admin/recertify-batch</code> to re-seal affected executions.
      </div>
    </div>

    <h2 id="how-to-verify">How to Verify a Record</h2>
    <p>There are three ways to verify a CER through the public verifier at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>. <strong>Prefer <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> for any persisted reference</strong> — it is the canonical identity of the artifact. <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">executionId</code> is convenience metadata only.</p>

    <h3 id="by-certificate-hash">1. By Certificate Hash (canonical)</h3>
    <p>If you have the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, use the hash-based URL. The colon in the hash must be URL-encoded:</p>
    <CodeBlock
      code={`https://verify.nexart.io/c/sha256%3A7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`}
      title="Verify by Certificate Hash"
    />

    <h3 id="by-execution-id">2. By Execution ID (convenience only)</h3>
    <p><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">executionId</code> is a convenience identifier returned by the certify API. It MUST NOT be used as a primary key for storage or deduplication. Use it for ad-hoc lookup only:</p>
    <CodeBlock
      code={`https://verify.nexart.io/e/exec_abc123`}
      title="Verify by Execution ID"
    />

    <h3 id="by-bundle-upload">3. By Uploading a CER Bundle</h3>
    <p>You can also verify a record by uploading or pasting the full CER JSON bundle at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>. The verifier will recompute the hash and check the signature locally.</p>
    <p>This is useful when you have the CER file but not the execution ID or verification URL.</p>

    <h2 id="public-vs-private">What Is Publicly Visible?</h2>
    <p>The public verifier uses a <strong>redacted, public-safe representation</strong> of the record:</p>
    <ul>
      <li>Verification status, certificateHash, timestamp, and node identity are visible.</li>
      <li>Raw input and output content is <strong>never exposed</strong>. The record contains SHA-256 hashes of these fields, not the original text.</li>
      <li>Metadata fields (like appId) may be included or redacted depending on the record's export settings.</li>
    </ul>
    <p>Anyone can verify that a record is intact and properly signed without seeing the private data that produced it.</p>

    <h2 id="what-gets-stored">What Gets Stored for Public Verification?</h2>
    <p>When a record is certified:</p>
    <ul>
      <li>The attestation node returns a <strong>signed receipt</strong> containing the certificateHash, timestamp, node identity, and Ed25519 signature. This is stored at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code> in the CER bundle.</li>
      <li>A <strong>redacted, public-safe version</strong> of the record is persisted for verification.</li>
      <li>Input and output content is hashed (SHA-256). The hashes appear in the record, but the original content is not stored by the node or verifier.</li>
      <li>You control which metadata fields are included when you create the record.</li>
    </ul>

    <h2 id="checks">Verification Checks</h2>
    <p>Each check returns <strong>PASS</strong>, <strong>FAIL</strong>, or <strong>SKIPPED</strong>:</p>
    <ol>
      <li><strong>Bundle Integrity.</strong> Recompute the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> from the bundle contents. If the hash differs, the bundle has been modified.</li>
      <li><strong>Node Signature.</strong> Validate the Ed25519 signature using the public key published at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code>, matched by the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> in the receipt. <strong>SKIPPED</strong> if no attestation is present.</li>
      <li><strong>Receipt Consistency.</strong> Confirm the receipt at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.receipt</code> references the same <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> as the bundle and that the node identity matches. <strong>SKIPPED</strong> if no attestation is present.</li>
      <li><strong>Verification Envelope.</strong> When present, validate <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.verificationEnvelopeSignature</code> against <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.verificationEnvelope</code>. This confirms the authoritative displayed verification surface has not been altered. <strong>SKIPPED</strong> if the bundle does not include a verification envelope.</li>
    </ol>
    <p className="text-sm text-muted-foreground">For a detailed breakdown of what each layer protects, see <Link to="/docs/ai-cer-verification-layers" className="text-primary hover:underline">AI CER Verification Layers</Link>.</p>

    <h2 id="outcomes">Verification Statuses</h2>
    <p>The verification status reflects the overall outcome, as defined by the <Link to="/docs/cer-protocol" className="text-primary hover:underline">CER Protocol</Link>:</p>
    <CodeBlock
      code={`VERIFIED      All applicable checks pass. The CER is intact and,
              if attested, has a valid signed receipt.

FAILED        One or more checks fail. The record may have been
              modified or the signature does not match.

NOT_FOUND     The requested execution record was not located.`}
      title="Verification Statuses"
    />

    <h2 id="result-classes">Reading Verification Results</h2>
    <p>The verifier reports four distinct outcome classes. They are not all failures:</p>
    <ul>
      <li><strong>VERIFIED</strong>: all applicable checks pass.</li>
      <li><strong>VERIFIED (supplemental)</strong>: core integrity passes, but supplemental context (e.g. <Link to="/docs/concepts/context-signals" className="text-primary hover:underline">signals</Link> outside the hash scope) is present. This is NOT a failure; supplemental fields are simply not cryptographically bound.</li>
      <li><strong>FAILED</strong>: one or more applicable checks fail.</li>
      <li><strong>NOT_FOUND</strong>: the artifact was never registered on the node. See <Link to="/docs/end-to-end-verification" className="text-primary hover:underline">End-to-End Verification</Link>.</li>
    </ul>
    <p>For the precise semantics of each result class, reseal handling, and the canonical role of <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> vs <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">executionId</code>, see <Link to="/docs/verification-semantics" className="text-primary hover:underline">Verification Semantics</Link>.</p>

    <h2 id="by-bundle-type">Expected Outcomes by Bundle Type</h2>
    <ul>
      <li><strong>cer.ai.execution.v1</strong> (with attestation): all checks PASS → <strong>VERIFIED</strong></li>
      <li><strong>cer.ai.execution.v1</strong> (without attestation): bundleIntegrity PASS, attestation checks SKIPPED → <strong>VERIFIED</strong></li>
      <li><strong>signed-redacted-reseal</strong>: redacted reseal returned by the public verifier; validated against the NEW resealed <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> → <strong>VERIFIED</strong></li>
      <li><strong>hash-only-timestamp</strong>: only certificateHash is attested → <strong>VERIFIED</strong></li>
      <li><strong>legacy</strong>: older format, limited coverage → <strong>VERIFIED</strong> or <strong>FAILED</strong> depending on data</li>
    </ul>

    <h2 id="project-bundle-verification">Project Bundle Verification</h2>
    <p>For multi-step workflows, verification covers the entire Project Bundle:</p>
    <ul>
      <li><strong>projectHash integrity</strong>: recomputed from canonical content using <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">sha256-canonical-json</code></li>
      <li><strong>Per-step CER verification</strong>: each embedded CER's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is checked independently</li>
      <li><strong>Project-level node receipt</strong>: validated if present</li>
    </ul>
    <p>Use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyProjectBundle()</code> (Node) or <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyProjectBundleAsync()</code> (browser) from the SDK, or verify at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a> via <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/p/:projectHash</code>.</p>

    <h2 id="independent">Independent Verification (No API Required)</h2>
    <p>You can verify a CER without calling any NexArt API. No trust in NexArt infrastructure is required. All you need is the CER bundle (including <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code>) and access to the node's published keys:</p>
    <ol>
      <li>Recompute the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> from the CER bundle (SHA-256 over the JCS-canonicalized whitelist projection)</li>
      <li>Compare it with the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> in <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.receipt</code></li>
      <li>Fetch the node's public key from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code></li>
      <li>Find the key matching the receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code></li>
      <li>Verify the Ed25519 signature over the receipt payload</li>
    </ol>
    <p>If all steps pass, you can trust the attestation independently of NexArt infrastructure. No account, API key, or network call to NexArt is required beyond fetching the node's public key. For a from-scratch implementation guide in any language, see <Link to="/docs/external-verification" className="text-primary hover:underline">External Verification</Link>.</p>

    <h2 id="protocol-version">protocolVersion and Canonicalization</h2>
    <p>
      Every attested bundle declares its canonicalization profile in{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.protocolVersion</code>.
      Verifiers MUST select the profile by this field and MUST fail closed on unknown values.
    </p>
    <CodeBlock
      language="text"
      title="Supported profiles"
      code={`protocolVersion = "1.2.0"   profile = "nexart-v1"   default  (custom canonicalization)
protocolVersion = "1.3.0"   profile = "jcs-v1"      opt-in   (RFC 8785, standards-based)`}
    />
    <p>
      <strong>Canonicalisation is protocol-bound.</strong> There is no universal default. Verifiers
      MUST use the canonicalisation corresponding to the bundle's{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code>{" "}
      or hash recomputation will fail. Do NOT assume RFC 8785 universally.
    </p>
    <p>
      <strong>1.2.0 → nexart-v1</strong> is the current default canonicalization profile. All SDK
      and CLI calls produce 1.2.0 bundles unless the producer explicitly opts into a different
      version.
    </p>
    <p>
      <strong>1.3.0 → jcs-v1</strong> is opt-in. It uses JSON Canonicalization Scheme (RFC 8785)
      for both hashing and signing, providing a published, standards-based deterministic byte
      representation. Producers select it via{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createSnapshot({"{ protocolVersion: \"1.3.0\" }"})</code>{" "}
      or the CLI flag{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">--protocol-version 1.3.0</code>.
    </p>
    <p>
      Both profiles are accepted indefinitely. Verifiers MUST support both to remain compliant.
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code> is
      part of the attestation projection signed by the verification envelope, so it cannot be
      silently retargeted to a different profile without breaking Layer 3.
    </p>


    <h2 id="fail-closed">Fail-closed Behavior</h2>
    <p>
      Verification MUST fail closed. Any condition where a verifier cannot determine the correct
      rule to apply is reported as <strong>FAILED</strong>, never silently passed. SKIPPED is
      reserved for layers that are not applicable to the bundle as received (for example, an
      unsigned sealed bundle has no Layer 2 to run).
    </p>
    <ul>
      <li>Unknown <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">protocolVersion</code> → <strong>FAILED</strong>.</li>
      <li>Unknown <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">bundleType</code> → <strong>FAILED</strong>.</li>
      <li>Receipt <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">kid</code> not present in the published node key set → <strong>FAILED</strong> (Layer 2).</li>
      <li>Envelope present but a required projection field is missing or cannot be canonicalized → <strong>FAILED</strong> (Layer 3).</li>
      <li>Envelope absent → <strong>SKIPPED</strong> (Layer 3). Not a failure; the bundle simply does not carry that proof.</li>
    </ul>

    <h2 id="not-guaranteed">What Verification Does NOT Guarantee</h2>
    <p>
      A PASS result asserts exactly what the protocol attests, and nothing more. The following
      properties are explicitly out of scope:
    </p>
    <ul>
      <li>
        <strong>Completeness.</strong> Verification does not prove that the bundle represents every
        step of a larger workflow. Whether all relevant executions were captured is an integration
        concern.
      </li>
      <li>
        <strong>Semantic correctness.</strong> NexArt proves the bundle was produced as recorded.
        It does not assert that the model output was correct, appropriate, or compliant.
      </li>
      <li>
        <strong>Trusted timestamping.</strong>{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">attestedAt</code> is
        asserted by the signing node and bound by the receipt signature. It is node-attested time,
        not third-party anchored time. External anchoring (RFC 3161, transparency log, blockchain)
        is on the roadmap and is not part of v1.3.0.
      </li>
      <li>
        <strong>Deterministic replay.</strong> Recomputing the same model output from the same
        inputs is only meaningful in controlled environments (fixed model version, seed,
        temperature 0, deterministic decoding). NexArt attests the recorded I/O; it does not assert
        reproducibility of the upstream model.
      </li>
    </ul>

    <h2 id="cli-usage">CLI Usage</h2>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/cli@0.11.0</code>{" "}
      provides a verifier that runs offline against a CER bundle file. It fetches the node key set
      only when the bundle declares an attestation.
    </p>
    <CodeBlock
      language="bash"
      title="Install"
      code={`npm install -g @nexart/cli@0.11.0`}
    />
    <CodeBlock
      language="bash"
      title="Verify a bundle"
      code={`nexart ai verify ./cer.json`}
    />
    <CodeBlock
      language="text"
      title="Expected output — certified bundle"
      code={`certificateHash : sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
protocolVersion : 1.3.0  (profile: jcs-v1)
Integrity (L1)  : PASS
Receipt   (L2)  : PASS
Envelope  (L3)  : PASS
status          : VERIFIED`}
    />
    <CodeBlock
      language="text"
      title="Expected output — sealed (offline) bundle"
      code={`certificateHash : sha256:9f2b1c8e4a7d6f3b0c5e8a1d2f4b6c8e9a0d3f5b7c2e4a6d8f1b3c5e7a9d0f2b
protocolVersion : 1.3.0  (profile: jcs-v1)
Integrity (L1)  : PASS
Receipt   (L2)  : SKIPPED  (no attestation present)
Envelope  (L3)  : SKIPPED  (no envelope present)
status          : VERIFIED`}
    />
    <CodeBlock
      language="text"
      title="Error handling"
      code={`exit 0   status = VERIFIED
exit 1   status = FAILED      (any applicable layer failed)
exit 2   status = NOT_FOUND   (referenced record could not be located)
exit 3   usage error          (missing file, malformed JSON, unknown flag)

Failures print a machine-readable JSON report to stderr:
  { "status": "FAILED", "checks": { "bundleIntegrity": "FAIL", ... }, "reason": "..." }`}
    />
    <p>For the full verification contract, see the <Link to="/docs/cer-protocol" className="text-primary hover:underline">CER Protocol specification</Link>. For SDK functions, see <Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link> (sync and async modes). For browser-specific usage, see <Link to="/docs/browser-verification" className="text-primary hover:underline">Browser Verification</Link>.</p>
  </>
);

export default Verification;
