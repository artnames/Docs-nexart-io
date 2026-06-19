import PageHeader from "@/components/docs/PageHeader";
import MentalModel from "@/components/docs/MentalModel";
import FailureModes from "@/components/docs/FailureModes";
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
In the official package format, verificationEnvelope and verificationEnvelopeSignature are at package level.
For v2, the signable payload is reconstructed from package.verificationEnvelope.attestation, package.cer, and package.verificationEnvelope.envelopeType.
The cer object is used as-is. Any mutation to cer after signing causes this check to fail.
Legacy artifacts may store envelope fields inside meta as a compatibility fallback.

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

    <MentalModel lines={["Integrity ≠ Stamp ≠ Envelope.", "Each layer has one job and fails for one reason.", "Public/redacted records cannot satisfy Layer 3."]} />

    <h2 id="overview">Overview</h2>
    <p>
      NexArt AI CER bundles support up to three independent verification layers. Each layer protects a distinct part of the record, and each can be validated independently.
    </p>
    <ul>
      <li><strong>Bundle Integrity</strong> - protects execution evidence and context</li>
      <li><strong>Signed Attestation Receipt</strong> - protects attestation receipt fields</li>
      <li><strong>Verification Envelope</strong> - protects the authoritative displayed verification surface</li>
    </ul>
    <p>
      Not all layers are present on every artifact. Historical records may include only the first two layers. Newer uploaded AI CER bundles may include all three.
    </p>

    <h2 id="bundle-integrity">Layer 1: Integrity (certificateHash)</h2>
    <p>
      The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is computed as a SHA-256 digest over a strict whitelist projection of the CER bundle, canonicalized per the profile selected by <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code> (1.2.0 → nexart-v1, default; 1.3.0 → jcs-v1 / RFC 8785, opt-in).
    </p>
    <p><strong>Hashed fields (whitelist):</strong></p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">version</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createdAt</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">context</code> (only if present)</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">contextSummary</code> (only if present)</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">policyEvaluation</code> (only if present)</li>
    </ul>
    <p><strong>NOT hashed:</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">certificateHash</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">meta</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">declaration</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">verificationEnvelope</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">verificationEnvelopeSignature</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">receipt</code>, and any unknown fields.</p>
    <p>Canonicalization is protocol-bound. Verifiers MUST apply the whitelist projection to the bundle exactly as received and use the canonicalization profile corresponding to the bundle's <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">protocolVersion</code>. No reconstruction. No field stripping.</p>
    <p><strong>What it protects:</strong> execution snapshot, context signals (when included in <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">context</code>), and bundle metadata fields covered by the whitelist.</p>

    <h2 id="signed-receipt">Layer 2: Signed Attestation Receipt</h2>
    <p>
      When a CER is attested by the <Link to="/docs/attestation-node" className="text-primary hover:underline">attestation node</Link>, the node returns a signed receipt stored at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code> in the bundle.
    </p>

    <h3 id="receipt-fields">Receipt Fields</h3>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.receipt</code> - the receipt payload containing <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">timestamp</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">nodeId</code>, and <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">kid</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.signature</code> - raw Ed25519 signature bytes over the deterministically serialized receipt payload</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.kid</code> - key identifier; resolves via the node's published metadata at <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">node.nexart.io/.well-known/nexart-node.json</code></li>
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
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelope</code> - metadata describing the v2 verification envelope</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelopeSignature</code> - signature over the v2 signable payload</li>
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
      <li><strong>Attestation projection — exactly 5 fields:</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">attestationId</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">attestedAt</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">kid</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">nodeRuntimeHash</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">protocolVersion</code>.</li>
      <li><strong>Bundle projection (whitelist):</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">bundleType</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">version</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">createdAt</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">snapshot</code>, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">context</code> (if present), <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">contextSummary</code> (if present).</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is NOT part of the signed payload.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta</code> is NOT signed by the envelope.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt</code> is NOT signed by the envelope.</li>
      <li>The full package object is NOT the signed payload.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelope</code> itself is NOT the signed payload.</li>
      <li>For the package path, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer</code> is used as-is. Any mutation after signing will cause this check to fail.</li>
    </ul>
    <p><strong>What it protects:</strong> full bundle integrity under the node's signature, beyond the certificateHash. Envelope failure indicates the signed bundle projection has been altered. It MUST NOT be reported as integrity (Layer 1) failure.</p>

    <h2 id="field-reference">Field-Level Reference</h2>
    <p>The following fields may be present on an uploaded AI CER bundle:</p>
    <CodeBlock
      code={`{
  "bundleType": "cer.ai.execution.v1",
  "version": "0.1",
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
      <li>For the official package format and bundle immutability rules, see <Link to="/docs/ai-cer-package-format" className="text-primary hover:underline">AI CER Package Format</Link>.</li>
      <li>For the CER data model and bundle structure, see the <Link to="/docs/cer-protocol" className="text-primary hover:underline">CER Protocol specification</Link>.</li>
      <li>For verification checks and statuses, see <Link to="/docs/verification" className="text-primary hover:underline">Verification</Link>.</li>
      <li>For the attestation node contract, see <Link to="/docs/attestation-node" className="text-primary hover:underline">Attestation Node</Link>.</li>
      <li>For context signals, see <Link to="/docs/concepts/context-signals" className="text-primary hover:underline">Context Signals</Link>.</li>
    </ul>
  </>
);

export default AICERVerificationLayers;
