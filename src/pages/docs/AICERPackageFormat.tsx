import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# AI CER Package Format
Version: 1.0 | Status: Normative Specification

The official NexArt AI CER package format defines the exact JSON structure that third-party builders MUST produce and consume when transporting, storing, or verifying AI Certified Execution Records.

## Package vs. Bundle
The top-level package is the transport/export object. It is NOT the signed CER bundle. The CER bundle is contained in the "cer" field of the package. "cer" MUST be the exact bundle object that was sent to and signed by the attestation node. Builders MUST NOT mutate "cer" after node signing.

## Official Package Format (top-level)
Six fields: cer (exact node-signed CER bundle), receipt (attestation receipt), signature (base64url node signature), attestation (attestation summary), verificationEnvelope (verification envelope metadata), verificationEnvelopeSignature (base64url envelope signature).

## CER Bundle Format (inside cer)
Top-level fields: bundleType (REQUIRED), certificateHash (REQUIRED), createdAt (REQUIRED), version (REQUIRED), snapshot (REQUIRED), context (OPTIONAL), meta (OPTIONAL).
JSON key order is not semantically important; canonicalization handles ordering.

## cer Immutability
cer MUST be the exact bundle object sent to and signed by the attestation node. Builders MUST NOT mutate cer after signing. Builders MUST NOT add package-level attestation or verification fields into cer after signing.

## meta inside cer
Used for normal bundle metadata such as source and tags. MUST NOT contain package-level verification artifacts such as verificationEnvelope, verificationEnvelopeSignature, verificationEnvelopeVerification, or verificationEnvelopeType. MUST NOT receive post-signing package-level attestation injection.

## Verification Envelope Signable Payload
For v2, verifiers MUST reconstruct: { "attestation": package.verificationEnvelope.attestation, "bundle": package.cer, "envelopeType": package.verificationEnvelope.envelopeType }. The bundle comes from package.cer. The attestation comes from package.verificationEnvelope.attestation. The cer object is used as-is.

## Builder Rules
Builders MUST package AI CER artifacts using the top-level cer wrapper format. Builders MUST NOT mutate cer after node signing. Builders MUST keep verification artifacts at package level. Builders MUST NOT merge verification envelope fields into cer.meta. Builders MUST verify against cer, not the whole package. Builders SHOULD preserve the package structure unchanged when storing, exporting, or forwarding artifacts.`;

const AICERPackageFormat = () => (
  <>
    <DocsMeta
      title="AI CER Package Format"
      description="The 6-field normative transport specification for AI Certified Execution Records: structure, encoding, and field semantics."
    />
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
  "cer": { /* exact node-signed CER bundle */ },
  "receipt": { /* attestation receipt */ },
  "signature": "base64url...",
  "attestation": { /* attestation summary */ },
  "verificationEnvelope": { /* verification envelope metadata */ },
  "verificationEnvelopeSignature": "base64url..."
}`}
      title="Official AI CER Package (top-level shape)"
    />
    <p>
      The top-level package is the transport/export object. It is not itself the signed CER bundle.
      For the official AI CER package format, verifiers MUST extract{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> as the bundle input.
      For Verification Envelope v2, verifiers MUST reconstruct the signable payload from{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelope.attestation</code>,{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code>, and{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">envelopeType</code>,
      rather than from the full package object.
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
          {[
            ["bundleType", "REQUIRED", <>Namespace identifier. For AI execution: <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">cer.ai.execution.v1</code></>],
            ["certificateHash", "REQUIRED", <>Deterministic hash of the canonicalized bundle. Format: <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">sha256:&lt;hex&gt;</code></>],
            ["createdAt", "REQUIRED", "ISO-8601 timestamp of bundle creation."],
            ["version", "REQUIRED", "Schema version string."],
            ["snapshot", "REQUIRED", "Execution data: inputs, outputs, provider, model, hashes."],
            ["context", "OPTIONAL", <>Structured context signals. Included in <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">certificateHash</code> when present.</>],
            ["meta", "OPTIONAL", "Normal bundle metadata such as source and tags. See section 2c."],
          ].map(([field, req, desc], i, arr) => (
            <tr key={String(field)} className={i < arr.length - 1 ? "border-b border-border" : ""}>
              <td className="px-4 py-2 font-mono text-sm">{field}</td>
              <td className="px-4 py-2">{req}</td>
              <td className="px-4 py-2 text-muted-foreground">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p>
      JSON key order is not semantically important. Canonicalization handles deterministic ordering
      before hash computation.
    </p>

    {/* ── 2b. cer immutability ── */}
    <h3 id="cer-immutability">2b. <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> Immutability</h3>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> MUST be the
      exact bundle object that was sent to and signed by the attestation node.
    </p>
    <ul>
      <li>Builders MUST NOT mutate <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> after node signing.</li>
      <li>Builders MUST NOT add package-level attestation or verification fields into <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> after signing.</li>
      <li>Any mutation to <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> after signing will cause verification envelope failure, because the signable payload includes <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> as-is.</li>
    </ul>

    {/* ── 2c. meta inside cer ── */}
    <h3 id="meta-inside-cer">2c. <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta</code> inside <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code></h3>
    <p>
      The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.meta</code> object
      is used for normal bundle metadata. Allowed contents include:
    </p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">source</code> &mdash; origin identifier (e.g. application name)</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">tags</code> &mdash; array of classification tags</li>
      <li>Other fields explicitly defined by the current schema version</li>
    </ul>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.meta</code> MUST NOT
      contain package-level verification artifacts. See section 3.
    </p>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.meta</code> MUST NOT
      receive post-signing package-level attestation injection.
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
      the CER bundle. Embedding them inside the bundle after signing mutates{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code>,
      which breaks verification envelope verification because the signable payload
      includes <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> as-is.
    </p>

    {/* ── 4. Package-level verification artifacts ── */}
    <h2 id="package-verification">4. Package-Level Verification Artifacts</h2>
    <p>
      These fields remain outside <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> at
      the package level:
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

    <h3 id="field-attestation"><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestation</code></h3>
    <p>
      Attestation summary object containing attestation metadata such as node identifier,
      timestamp, and key identifier.
    </p>

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
          {[
            ["algorithm", <>Signature algorithm (e.g. <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">Ed25519</code>)</>],
            ["attestation", "Attestation metadata: attestationId, attestedAt, kid, nodeRuntimeHash, protocolVersion"],
            ["canonicalization", <>Canonicalization method (e.g. <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">jcs</code>)</>],
            ["envelopeType", <>Envelope version identifier (e.g. <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">nexart.verification.envelope.v2</code>)</>],
            ["excludedFields", "Array of field paths excluded from the signed payload"],
            ["kid", "Key identifier used for signing"],
            ["scope", <>Signing scope (e.g. <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">full_bundle</code>)</>],
            ["signedFields", <>Indicator of which fields are signed (e.g. <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">*</code> for all)</>],
          ].map(([field, desc], i, arr) => (
            <tr key={String(field)} className={i < arr.length - 1 ? "border-b border-border" : ""}>
              <td className="px-4 py-2 font-mono text-sm">{field}</td>
              <td className="px-4 py-2 text-muted-foreground">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h3 id="field-verification-envelope-signature"><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelopeSignature</code></h3>
    <p>
      Base64url-encoded signature over the v2 signable payload reconstructed from the package.
      This signature covers the payload built from{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelope.attestation</code>,{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code>, and{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelope.envelopeType</code>.
    </p>

    {/* ── 5. Verification Envelope Signable Payload ── */}
    <h2 id="signable-payload">5. Verification Envelope Signable Payload</h2>
    <p>
      For Verification Envelope v2, verifiers MUST reconstruct the signable payload as follows:
    </p>
    <CodeBlock
      code={`{
  "attestation": package.verificationEnvelope.attestation,
  "bundle": package.cer,
  "envelopeType": package.verificationEnvelope.envelopeType
}`}
      title="v2 Signable Payload Construction"
    />
    <p>Key rules for payload reconstruction:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundle</code> comes from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">package.cer</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestation</code> comes from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">package.verificationEnvelope.attestation</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">envelopeType</code> comes from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">package.verificationEnvelope.envelopeType</code></li>
      <li>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> object used in the signable payload is the raw CER bundle, not the full package wrapper</li>
      <li>For the package path, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> is used as-is</li>
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
      <li>Builders MUST NOT mutate <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> after node signing.</li>
      <li>Builders MUST NOT add package-level attestation or verification fields into <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> after signing.</li>
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
  "cer": {
    "bundleType": "cer.ai.execution.v1",
    "certificateHash": "sha256:...",
    "createdAt": "2026-03-18T00:26:11.619Z",
    "version": "0.1",
    "snapshot": { "...": "..." },
    "context": { "...": "..." },
    "meta": {
      "source": "example-app",
      "tags": ["demo"],
      "attestation": { "nodeId": "...", "attestedAt": "..." },
      "verificationEnvelope": { "...": "..." },
      "verificationEnvelopeSignature": "base64url..."
    }
  },
  "receipt": { "...": "..." },
  "signature": "base64url..."
}`}
      title="❌ Invalid: cer mutated after signing"
    />
    <p>This format is invalid because:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code> was injected into <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> after the node signed the bundle. This changes <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code>.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelope</code> and <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelopeSignature</code> were merged into <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.meta</code> instead of remaining at the package level.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> no longer matches the exact bundle that was sent to and signed by the node.</li>
      <li>Verification Envelope v2 will fail because the signable payload uses <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> as-is, and the mutated bundle does not match the original signed bundle.</li>
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
      "tags": ["demo"]
    }
  },
  "receipt": {
    "certificateHash": "sha256:a1b2c3d4e5f6...",
    "timestamp": "2026-03-18T00:26:12.000Z",
    "nodeId": "nexart-node-primary",
    "kid": "k1"
  },
  "signature": "base64url...",
  "attestation": {
    "nodeId": "nexart-node-primary",
    "attestedAt": "2026-03-18T00:26:12.000Z",
    "kid": "k1"
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
  "verificationEnvelopeSignature": "base64url..."
}`}
      title="✅ Valid: official AI CER package"
    />

    {/* ── 9. Legacy Compatibility ── */}
    <h2 id="legacy-compatibility">9. Legacy Compatibility</h2>
    <ul>
      <li>Legacy raw bundle artifacts (without the package wrapper) remain supported by the NexArt verifier.</li>
      <li>Existing raw bundle verification behavior is unchanged.</li>
      <li>The package format defined in this document is the recommended format for new builder integrations.</li>
      <li>Historical artifacts that store verification envelope fields inside <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.meta</code> are accepted by the verifier as a compatibility fallback when no package-level envelope is present.</li>
      <li>Historical public artifacts MAY not include <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">context</code> in the certificate hash computation. The verifier detects this and validates using the hash rules active at the time the artifact was created.</li>
    </ul>

    {/* ── 10. Related Documentation ── */}
    <h2 id="related">10. Related Documentation</h2>
    <ul>
      <li><a href="/docs/ai-cer-verification-layers" className="text-primary hover:underline">AI CER Verification Layers</a> &mdash; the three-layer verification model</li>
      <li><a href="/docs/cer-protocol" className="text-primary hover:underline">CER Protocol</a> &mdash; protocol governance, verification semantics, and schema versioning</li>
      <li><a href="/docs/verification" className="text-primary hover:underline">Verification</a> &mdash; how to verify CER artifacts</li>
      <li><a href="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</a> &mdash; programmatic CER creation and verification</li>
      <li><a href="/docs/attestation-node" className="text-primary hover:underline">Attestation Node</a> &mdash; node contract and key publication</li>
      <li><a href="/docs/concepts/cer" className="text-primary hover:underline">Certified Execution Records</a> &mdash; conceptual overview of CERs</li>
    </ul>
  </>
);

export default AICERPackageFormat;
