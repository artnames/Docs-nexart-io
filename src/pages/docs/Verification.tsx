import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";
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
Historical artifacts may not include the verification envelope. The verifier applies compatibility fallback for older artifacts.
See AI CER Verification Layers for details.

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
    <p>Verification confirms the integrity and authenticity of a Certified Execution Record or Project Bundle. The process is:</p>
    <ol>
      <li>An execution happens.</li>
      <li>A CER is created, binding execution metadata to a deterministic <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.</li>
      <li>Optionally, the CER is attested by a node, which adds a signed receipt.</li>
      <li>Optionally, multiple CERs are collected into a <Link to="/docs/concepts/project-bundles" className="text-primary hover:underline">Project Bundle</Link> with a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code>.</li>
      <li>Verification can happen offline (using the SDK) or at <Link to="/docs/verify-nexart" className="text-primary hover:underline">verify.nexart.io</Link>.</li>
    </ol>

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
        Bundles created with <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">@nexart/ai-execution@0.16.0</code> that include signals may fail envelope verification due to a payload alignment issue. <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">v0.16.1</code> fixes this. Re-certification may be required. Operators can use <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">POST /v1/admin/recertify-batch</code> to re-seal affected executions.
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
      <li>Recompute the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> from the CER bundle (SHA-256)</li>
      <li>Compare it with the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> in <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.receipt</code></li>
      <li>Fetch the node's public key from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code></li>
      <li>Find the key matching the receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code></li>
      <li>Verify the Ed25519 signature over the receipt payload</li>
    </ol>
    <p>If all steps pass, you can trust the attestation independently of NexArt infrastructure. No account, API key, or network call to NexArt is required beyond fetching the node's public key.</p>
    <p>For the full verification contract, see the <Link to="/docs/cer-protocol" className="text-primary hover:underline">CER Protocol specification</Link>. For SDK functions, see <Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link> (sync and async modes). For browser-specific usage, see <Link to="/docs/browser-verification" className="text-primary hover:underline">Browser Verification</Link>.</p>
  </>
);

export default Verification;
