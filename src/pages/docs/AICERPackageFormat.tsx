import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# AI CER Package Format
Version: 1.0 | Status: Normative Specification

The official NexArt AI CER package format defines the exact JSON structure that third-party builders MUST produce and consume when transporting, storing, or verifying AI Certified Execution Records.

## Package vs. Bundle
The top-level package is the transport/export object. It is NOT the signed CER bundle. The CER bundle is contained in the "cer" field of the package. For the official AI CER package format, verifiers MUST extract "cer" as the bundle input. For Verification Envelope v2, verifiers MUST reconstruct the signable payload from verificationEnvelope.attestation, cer, and envelopeType, rather than from the full package object.

## Official Package Format (top-level)
Five fields: cer (CER bundle object), verificationEnvelope (verification envelope metadata), verificationEnvelopeSignature (base64url signature), receipt (attestation receipt), signature (base64url node signature).

## CER Bundle Format (inside cer)
Top-level fields: bundleType (REQUIRED), certificateHash (REQUIRED), createdAt (REQUIRED), version (REQUIRED), snapshot (REQUIRED), context (OPTIONAL), meta (OPTIONAL).
JSON key order is not semantically important; canonicalization handles ordering.

## meta inside cer
Used for source metadata, tags, and bundle-level metadata. MUST NOT contain package-level verification artifacts such as verificationEnvelope, verificationEnvelopeSignature, verificationEnvelopeVerification, or verificationEnvelopeType.

## Verification Envelope Signable Payload
For v2, verifiers MUST reconstruct: { "attestation": verificationEnvelope.attestation, "bundle": cer, "envelopeType": "nexart.verification.envelope.v2" }. The bundle comes from package.cer. The attestation comes from package.verificationEnvelope.attestation.

## Builder Rules
Builders MUST package AI CER artifacts using the top-level cer wrapper format. Builders MUST keep verification artifacts at package level. Builders MUST NOT merge verification envelope fields into cer.meta. Builders MUST verify against cer, not the whole package. Builders SHOULD preserve the package structure unchanged when storing, exporting, or forwarding artifacts.`;

const AICERPackageFormat = () => (
  <>
    <PageHeader
      title="AI CER Package Format"
      summary="Normative specification for the official NexArt AI CER package and bundle structure."
      llmBlock={llmBlock}
      breadcrumbs={[
        { name: "Docs", path: "/docs/getting-started" },
        { name: "Protocol", path: "/docs/cer-protocol" },
        { name: "AI CER Package Format", path: "/docs/ai-cer-package-format" },
      ]}
    />

    <div className="inline-flex items-center gap-2 mb-6">
      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">Version: 1.0</span>
      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">Status: Normative</span>
    </div>

    <p>
      This document defines the official JSON structure for NexArt AI CER artifacts.
      It is normative: third-party builders, verifiers, and integrations MUST conform to this specification
      when producing, consuming, or transporting AI CER packages.
    </p>

    {/* ── 1. Official Package Format ── */}
    <h2 id="package-format">1. Official Package Format</h2>
    <p>
      The official exported or transported AI CER artifact MUST use the following top-level shape.
      This object is the <strong>package</strong>. It is the transport and export envelope.
      It is NOT the signed CER bundle.
    </p>
    <CodeBlock
      code={`{
  "cer": { /* CER bundle object */ },
  "verificationEnvelope": { /* Verification Envelope metadata */ },
  "verificationEnvelopeSignature": "base64url...",
  "receipt": { /* Attestation receipt */ },
  "signature": "base64url..."
}`}
      title="Official AI CER Package (top-level shape)"
    />
    <p>Key rules:</p>
    <ul>
      <li>The top-level package is the transport/export object.</li>
      <li>The top-level package is NOT itself the signed CER bundle.</li>
      <li>Verifiers MUST extract <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> as the bundle input for integrity verification.</li>
    </ul>
    <p>
      An <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestation</code> field
      MAY be included separately at the package level only if needed for backward compatibility,
      but the preferred format uses the five fields above.
    </p>

    {/* ── 2. CER Bundle Format ── */}
    <h2 id="cer-bundle">2. CER Bundle Format</h2>
    <p>
      The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> field
      MUST contain the canonical CER bundle object. For AI execution records
      (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.ai.execution.v1</code>),
      the bundle MUST use this top-level structure:
    </p>
    <CodeBlock
      code={`{
  "bundleType": "cer.ai.execution.v1",
  "certificateHash": "sha256:...",
  "createdAt": "2026-03-18T00:26:11.619Z",
  "version": "0.1",
  "snapshot": { ... },
  "context": { ... },
  "meta": { ... }
}`}
      title="Canonical AI CER Bundle"
    />

    <h3 id="bundle-fields">2a. Top-level fields inside <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code></h3>
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">Field</th>
            <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">Required</th>
            <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="px-4 py-2 font-mono text-sm">bundleType</td>
            <td className="px-4 py-2">REQUIRED</td>
            <td className="px-4 py-2 text-muted-foreground">Namespace identifier. For AI execution: <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">cer.ai.execution.v1</code></td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-2 font-mono text-sm">certificateHash</td>
            <td className="px-4 py-2">REQUIRED</td>
            <td className="px-4 py-2 text-muted-foreground">Deterministic hash of the canonicalized bundle. Format: <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">sha256:&lt;hex&gt;</code></td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-2 font-mono text-sm">createdAt</td>
            <td className="px-4 py-2">REQUIRED</td>
            <td className="px-4 py-2 text-muted-foreground">ISO-8601 timestamp of bundle creation.</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-2 font-mono text-sm">version</td>
            <td className="px-4 py-2">REQUIRED</td>
            <td className="px-4 py-2 text-muted-foreground">Schema version string.</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-2 font-mono text-sm">snapshot</td>
            <td className="px-4 py-2">REQUIRED</td>
            <td className="px-4 py-2 text-muted-foreground">Execution data: inputs, outputs, provider, model, hashes.</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-2 font-mono text-sm">context</td>
            <td className="px-4 py-2">OPTIONAL</td>
            <td className="px-4 py-2 text-muted-foreground">Structured context signals. Included in <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">certificateHash</code> when present.</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-mono text-sm">meta</td>
            <td className="px-4 py-2">OPTIONAL</td>
            <td className="px-4 py-2 text-muted-foreground">Source metadata, tags, and bundle-level metadata. See section 2b.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      JSON key order is not semantically important. Canonicalization handles deterministic ordering
      before hash computation.
    </p>

    <h3 id="meta-inside-cer">2b. <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta</code> inside <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code></h3>
    <p>
      The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.meta</code> object
      is used for bundle-level metadata that describes the execution context or origin.
      Allowed contents include:
    </p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">source</code> &mdash; origin identifier (e.g. application name)</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">tags</code> &mdash; array of classification tags</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestation</code> &mdash; attestation summary (if the core spec allows it within the bundle)</li>
      <li>Other bundle-level metadata as defined by the schema version</li>
    </ul>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.meta</code> MUST NOT
      contain package-level verification artifacts. See section 3.
    </p>

    {/* ── 3. Prohibited fields inside cer.meta ── */}
    <h2 id="prohibited-meta-fields">3. Fields That MUST NOT Appear Inside <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.meta</code></h2>
    <p>
      The following fields are package-level verification artifacts. They MUST NOT be embedded
      inside <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.meta</code> in
      the official format:
    </p>
    <CodeBlock
      code={`meta.verificationEnvelope
meta.verificationEnvelopeSignature
meta.verificationEnvelopeVerification
meta.verificationEnvelopeType`}
      title="Prohibited cer.meta fields"
      language="text"
    />
    <p>
      These fields belong at the package level (top-level siblings of{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code>), not inside
      the CER bundle. Embedding them inside the bundle conflates the transport envelope with the
      signed execution record, which breaks verification semantics.
    </p>

    {/* ── 4. Package-level verification artifacts ── */}
    <h2 id="package-verification">4. Package-Level Verification Artifacts</h2>
    <p>Each top-level package field serves a specific verification purpose:</p>

    <h3 id="field-verification-envelope"><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelope</code></h3>
    <p>
      An object containing metadata describing the v2 verification envelope. Fields include:
    </p>
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">Field</th>
            <th className="px-4 py-2 text-left font-medium text-foreground border-b border-border">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="px-4 py-2 font-mono text-sm">algorithm</td>
            <td className="px-4 py-2 text-muted-foreground">Signature algorithm (e.g. <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">Ed25519</code>)</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-2 font-mono text-sm">attestation</td>
            <td className="px-4 py-2 text-muted-foreground">Attestation metadata: attestationId, attestedAt, kid, nodeRuntimeHash, protocolVersion</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-2 font-mono text-sm">canonicalization</td>
            <td className="px-4 py-2 text-muted-foreground">Canonicalization method (e.g. <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">jcs</code>)</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-2 font-mono text-sm">envelopeType</td>
            <td className="px-4 py-2 text-muted-foreground">Envelope version identifier (e.g. <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">nexart.verification.envelope.v2</code>)</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-2 font-mono text-sm">excludedFields</td>
            <td className="px-4 py-2 text-muted-foreground">Array of field paths excluded from the signed payload</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-2 font-mono text-sm">kid</td>
            <td className="px-4 py-2 text-muted-foreground">Key identifier used for signing</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-2 font-mono text-sm">scope</td>
            <td className="px-4 py-2 text-muted-foreground">Signing scope (e.g. <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">full_bundle</code>)</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-mono text-sm">signedFields</td>
            <td className="px-4 py-2 text-muted-foreground">Indicator of which fields are signed (e.g. <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">*</code> for all)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 id="field-verification-envelope-signature"><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelopeSignature</code></h3>
    <p>
      Base64url-encoded signature over the v2 signable payload. This signature protects the
      authoritative displayed verification surface.
    </p>

    <h3 id="field-receipt"><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt</code></h3>
    <p>
      The attestation receipt object returned by the NexArt attestation node. Contains the
      certificate hash, timestamp, node identifier, and key identifier.
    </p>

    <h3 id="field-signature"><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signature</code></h3>
    <p>
      Base64url-encoded node signature for the attestation receipt. Used for independent
      attestation receipt verification.
    </p>

    {/* ── 5. Verification Envelope Signable Payload ── */}
    <h2 id="signable-payload">5. Verification Envelope Signable Payload</h2>
    <p>
      For Verification Envelope v2, verifiers MUST reconstruct the signable payload as follows:
    </p>
    <CodeBlock
      code={`{
  "attestation": verificationEnvelope.attestation,
  "bundle": cer,
  "envelopeType": "nexart.verification.envelope.v2"
}`}
      title="v2 Signable Payload Construction"
    />
    <p>Key rules for payload reconstruction:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundle</code> comes from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">package.cer</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestation</code> comes from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">package.verificationEnvelope.attestation</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelope</code> itself is NOT the signed payload</li>
      <li>The whole package object is NOT the signed payload</li>
    </ul>
    <p>
      The reconstructed payload is canonicalized (using the method specified in{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelope.canonicalization</code>)
      and then verified against{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelopeSignature</code>.
    </p>

    {/* ── 6. Builder Rules ── */}
    <h2 id="builder-rules">6. Builder Rules</h2>
    <ol>
      <li>Builders MUST package AI CER artifacts using the top-level <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> wrapper format.</li>
      <li>Builders MUST keep verification artifacts at the package level.</li>
      <li>Builders MUST NOT merge verification envelope fields into <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.meta</code>.</li>
      <li>Builders MUST verify against <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code>, not against the whole package.</li>
      <li>Builders SHOULD preserve the package structure unchanged when storing, exporting, or forwarding artifacts.</li>
    </ol>

    {/* ── 7. Invalid Format Example ── */}
    <h2 id="invalid-format">7. Invalid Package Format</h2>
    <p>The following is an <strong>invalid</strong> official package format:</p>
    <CodeBlock
      code={`{
  "bundleType": "cer.ai.execution.v1",
  "certificateHash": "sha256:...",
  "createdAt": "2026-03-18T00:26:11.619Z",
  "version": "0.1",
  "snapshot": { "...": "..." },
  "context": { "...": "..." },
  "meta": {
    "source": "example-app",
    "tags": ["demo"],
    "verificationEnvelope": { "...": "..." },
    "verificationEnvelopeSignature": "base64url..."
  }
}`}
      title="❌ Invalid: verification artifacts merged into bundle"
    />
    <p>This format is invalid because:</p>
    <ul>
      <li>Verification artifacts (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelope</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelopeSignature</code>) were merged into the bundle's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta</code> field.</li>
      <li>The package and bundle were conflated into a single object.</li>
      <li>The CER bundle is not wrapped in a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> field.</li>
      <li>A verifier cannot extract the bundle without first removing package-level fields, which is error-prone and not supported.</li>
    </ul>

    {/* ── 8. Valid Format Example ── */}
    <h2 id="valid-format">8. Valid Package Format</h2>
    <p>The following is a complete, valid AI CER package:</p>
    <CodeBlock
      code={`{
  "cer": {
    "bundleType": "cer.ai.execution.v1",
    "certificateHash": "sha256:a1b2c3d4e5f6...",
    "createdAt": "2026-03-18T00:26:11.619Z",
    "version": "0.1",
    "snapshot": {
      "type": "ai.execution.v1",
      "executionId": "exec-001",
      "provider": "openai",
      "model": "gpt-4o-mini",
      "inputHash": "sha256:...",
      "outputHash": "sha256:..."
    },
    "context": {
      "signals": [
        {
          "type": "policy.check",
          "payload": { "result": "pass" }
        }
      ]
    },
    "meta": {
      "source": "audiot-demonstrator",
      "tags": ["demo"],
      "attestation": {
        "nodeId": "nexart-node-primary",
        "attestedAt": "2026-03-18T00:26:12.000Z"
      }
    }
  },
  "verificationEnvelope": {
    "algorithm": "Ed25519",
    "attestation": {
      "attestationId": "att-uuid-001",
      "attestedAt": "2026-03-18T00:26:12.000Z",
      "kid": "k1",
      "nodeRuntimeHash": "sha256:...",
      "protocolVersion": "1.2.0"
    },
    "canonicalization": "jcs",
    "envelopeType": "nexart.verification.envelope.v2",
    "excludedFields": [
      "meta.verificationEnvelopeSignature",
      "meta.verificationEnvelopeVerification"
    ],
    "kid": "k1",
    "scope": "full_bundle",
    "signedFields": "*"
  },
  "verificationEnvelopeSignature": "base64url...",
  "receipt": {
    "certificateHash": "sha256:a1b2c3d4e5f6...",
    "timestamp": "2026-03-18T00:26:12.000Z",
    "nodeId": "nexart-node-primary",
    "kid": "k1"
  },
  "signature": "base64url..."
}`}
      title="✅ Valid: official AI CER package"
    />

    {/* ── 9. Backward Compatibility ── */}
    <h2 id="backward-compatibility">9. Backward Compatibility</h2>
    <p>
      Historical AI CER artifacts may not conform to this package format. The following
      compatibility considerations apply:
    </p>
    <ul>
      <li>Historical artifacts MAY embed verification envelope fields inside <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.meta</code>. Verifiers SHOULD support these artifacts using a compatibility fallback path.</li>
      <li>Historical public artifacts MAY not include <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">context</code> in the certificate hash computation.</li>
      <li>Artifacts without a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelope</code> can still be verified for bundle integrity and attestation receipt, but the Verification Envelope check will be SKIPPED.</li>
      <li>New artifacts produced by conforming builders MUST use the official package format defined in this document.</li>
    </ul>

    {/* ── 10. Related Documentation ── */}
    <h2 id="related">10. Related Documentation</h2>
    <ul>
      <li><a href="/docs/cer-protocol" className="text-primary hover:underline">CER Protocol</a> &mdash; protocol governance, verification semantics, and schema versioning</li>
      <li><a href="/docs/ai-cer-verification-layers" className="text-primary hover:underline">AI CER Verification Layers</a> &mdash; the three-layer verification model</li>
      <li><a href="/docs/verification" className="text-primary hover:underline">Verification</a> &mdash; how to verify CER artifacts</li>
      <li><a href="/docs/concepts/cer" className="text-primary hover:underline">Certified Execution Records</a> &mdash; conceptual overview of CERs</li>
      <li><a href="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</a> &mdash; programmatic CER creation and verification</li>
      <li><a href="/docs/attestation-node" className="text-primary hover:underline">Attestation Node</a> &mdash; node contract and key publication</li>
    </ul>
  </>
);

export default AICERPackageFormat;
