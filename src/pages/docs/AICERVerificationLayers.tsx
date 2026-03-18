import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# AI CER Verification Layers

NexArt AI CER bundles support up to three independent verification layers:

## Layer 1: Bundle Integrity
certificateHash = SHA-256({ bundleType, version, createdAt, snapshot, context (if present) })
Protects: execution evidence and context signals.
Any change to snapshot fields, model, or context.signals causes verification to fail.

## Layer 2: Signed Attestation Receipt
Fields: meta.attestation.receipt, meta.attestation.signature, meta.attestation.kid
The receipt contains certificateHash, timestamp, nodeId, kid.
Signature is Ed25519 over the deterministically serialized receipt payload.
Protects: attestation receipt fields. Changing receipt or signature causes this check to fail.

## Layer 3: Verification Envelope
Fields: meta.verificationEnvelope, meta.verificationEnvelopeSignature
Signs the authoritative displayed verification surface for uploaded/newer AI CER bundles.
Protects: the rendered verification representation. Changing any envelope-covered field causes this check to fail.
Present in newer uploaded AI CER bundles. Historical artifacts may not include this layer.

## Backward Compatibility
- Historical artifacts may not include meta.verificationEnvelope
- Historical public artifacts may not hash-cover context
- The verifier applies compatibility fallback for older artifacts
- Newer uploaded bundles with verification envelope have stronger protection

## Tamper Behavior
- Changing snapshot.model → Bundle Integrity fails
- Changing context.signals → Bundle Integrity fails
- Changing meta.attestation.receipt or signature → Signed Attestation fails
- Changing meta.verificationEnvelope or its signature → Verification Envelope fails`;

const AICERVerificationLayers = () => (
  <>
    <PageHeader
      title="AI CER Verification Layers"
      summary="How NexArt verifies AI Certified Execution Records across three independent trust layers."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>
      NexArt AI CER bundles support up to three independent verification layers. Each layer protects a distinct part of the record, and each can be validated independently.
    </p>
    <ul>
      <li><strong>Bundle Integrity</strong> — protects execution evidence and context</li>
      <li><strong>Signed Attestation Receipt</strong> — protects attestation receipt fields</li>
      <li><strong>Verification Envelope</strong> — protects the authoritative displayed verification surface</li>
    </ul>
    <p>
      Not all layers are present on every artifact. Historical records may include only the first two layers. Newer uploaded AI CER bundles may include all three.
    </p>

    <h2 id="bundle-integrity">Layer 1: Bundle Integrity</h2>
    <p>
      The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is computed as a SHA-256 digest over the canonical fields of the CER bundle:
    </p>
    <CodeBlock
      code={`certificateHash = SHA-256({
  bundleType,
  version,
  createdAt,
  snapshot,
  context       // included when present
})`}
      title="certificateHash computation"
    />
    <p>
      This layer guarantees that the execution evidence — including model identifier, input/output hashes, metadata, and any <Link to="/docs/concepts/context-signals" className="text-primary hover:underline">context signals</Link> — has not been modified since the record was created.
    </p>
    <p><strong>What it protects:</strong> execution snapshot, context signals, bundle metadata.</p>

    <h2 id="signed-receipt">Layer 2: Signed Attestation Receipt</h2>
    <p>
      When a CER is attested by the <Link to="/docs/attestation-node" className="text-primary hover:underline">attestation node</Link>, the node returns a signed receipt stored at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code> in the bundle.
    </p>

    <h3 id="receipt-fields">Receipt Fields</h3>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.receipt</code> — the receipt payload containing <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">timestamp</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">nodeId</code>, and <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">kid</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.signature</code> — raw Ed25519 signature bytes over the deterministically serialized receipt payload</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.kid</code> — key identifier; resolves via the node's published metadata at <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">node.nexart.io/.well-known/nexart-node.json</code></li>
    </ul>
    <p><strong>What it protects:</strong> attestation receipt fields (certificateHash binding, timestamp, node identity, signature validity).</p>

    <h2 id="verification-envelope">Layer 3: Verification Envelope</h2>
    <p>
      Uploaded and newer AI CER bundles may include a verification envelope that protects the authoritative displayed verification surface.
    </p>

    <h3 id="envelope-fields">Envelope Fields</h3>
    <p>
      In the <Link to="/docs/ai-cer-package-format" className="text-primary hover:underline">official package format</Link>,
      verification envelope fields are at the package level:
    </p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelope</code> — metadata describing the v2 verification envelope</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelopeSignature</code> — signature over the v2 signable payload</li>
    </ul>
    <p>
      For legacy/raw bundle artifacts, these fields may appear inside <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta</code> as a compatibility fallback.
    </p>

    <h3 id="v2-signable-payload">Package-Path Signable Payload (v2)</h3>
    <p>
      For the official package format, verifiers reconstruct the v2 signable payload as:
    </p>
    <CodeBlock
      code={`{
  "attestation": package.verificationEnvelope.attestation,
  "bundle": package.cer,
  "envelopeType": package.verificationEnvelope.envelopeType
}`}
      title="v2 Signable Payload Construction"
    />
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundle</code> comes from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">package.cer</code> — the raw CER bundle, not the full package</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestation</code> comes from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">package.verificationEnvelope.attestation</code></li>
      <li>The full package object is NOT the signed payload</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelope</code> itself is NOT the signed payload</li>
      <li>For the package path, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> is used as-is — any mutation to <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> after signing will cause this check to fail</li>
    </ul>
    <p><strong>What it protects:</strong> the authoritative displayed verification surface via the reconstructed signable payload.</p>

    <h2 id="field-reference">Field-Level Reference</h2>
    <p>The following fields may be present on an uploaded AI CER bundle:</p>
    <CodeBlock
      code={`{
  "bundleType": "cer.ai.execution.v1",
  "version": "1.0",
  "createdAt": "2026-03-17T10:00:00.000Z",
  "snapshot": {
    "model": "gpt-4",
    "inputHash": "sha256:a1b2c3...",
    "outputHash": "sha256:d4e5f6...",
    "metadata": { "appId": "my-app" }
  },
  "context": {
    "signals": [
      { "type": "policy.check", "source": "compliance-engine", "payload": { "result": "pass" } }
    ]
  },
  "certificateHash": "sha256:9e8d7c...",
  "meta": {
    "attestation": {
      "receipt": {
        "certificateHash": "sha256:9e8d7c...",
        "timestamp": "2026-03-17T10:00:01.000Z",
        "nodeId": "nexart-node-primary",
        "kid": "key_01HXYZ..."
      },
      "signature": "<Ed25519 signature bytes>",
      "kid": "key_01HXYZ..."
    },
    "verificationEnvelope": { "...signed verification surface..." },
    "verificationEnvelopeSignature": "MEUCIQD..."
  }
}`}
      title="AI CER Bundle with All Three Verification Layers"
    />

    <h2 id="tamper-behavior">Tamper Behavior</h2>
    <p>Each verification layer independently detects specific types of modification:</p>
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-4 font-medium">Modification</th>
            <th className="text-left py-2 pr-4 font-medium">Layer Affected</th>
            <th className="text-left py-2 font-medium">Result</th>
          </tr>
        </thead>
        <tbody className="text-muted-foreground">
          <tr className="border-b border-border">
            <td className="py-2 pr-4">Change <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">snapshot.model</code></td>
            <td className="py-2 pr-4">Bundle Integrity</td>
            <td className="py-2">FAIL</td>
          </tr>
          <tr className="border-b border-border">
            <td className="py-2 pr-4">Change <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">context.signals</code></td>
            <td className="py-2 pr-4">Bundle Integrity</td>
            <td className="py-2">FAIL</td>
          </tr>
          <tr className="border-b border-border">
            <td className="py-2 pr-4">Change <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">meta.attestation.receipt</code> or <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">signature</code></td>
            <td className="py-2 pr-4">Signed Attestation Receipt</td>
            <td className="py-2">FAIL</td>
          </tr>
          <tr className="border-b border-border">
            <td className="py-2 pr-4">Change <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">meta.verificationEnvelope</code> or its signature</td>
            <td className="py-2 pr-4">Verification Envelope</td>
            <td className="py-2">FAIL</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 id="backward-compatibility">Backward Compatibility</h2>
    <ul>
      <li><strong>Historical artifacts may not include <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">meta.verificationEnvelope</code>.</strong> These records are verified using Bundle Integrity and Signed Attestation Receipt only. They remain valid.</li>
      <li><strong>Historical public artifacts may not hash-cover <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">context</code>.</strong> Older bundles that predate context signal support do not include <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">context</code> in the <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">certificateHash</code> computation.</li>
      <li><strong>The verifier applies compatibility fallback for older artifacts.</strong> The verification logic detects the bundle version and applies the appropriate checks.</li>
      <li><strong>Newer uploaded bundles with a verification envelope have stronger protection.</strong> The additional layer provides tamper detection over the displayed verification surface.</li>
    </ul>

    <h2 id="relationship">Relationship to Other Documentation</h2>
    <ul>
      <li>For the CER data model and bundle structure, see the <Link to="/docs/cer-protocol" className="text-primary hover:underline">CER Protocol specification</Link>.</li>
      <li>For verification checks and statuses, see <Link to="/docs/verification" className="text-primary hover:underline">Verification</Link>.</li>
      <li>For the attestation node contract, see <Link to="/docs/attestation-node" className="text-primary hover:underline">Attestation Node</Link>.</li>
      <li>For context signals, see <Link to="/docs/concepts/context-signals" className="text-primary hover:underline">Context Signals</Link>.</li>
    </ul>
  </>
);

export default AICERVerificationLayers;
