import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";
import MentalModel from "@/components/docs/MentalModel";
import TestHarness from "@/components/docs/TestHarness";
import SealedVsCertified from "@/components/docs/SealedVsCertified";
import CanonicalFlow from "@/components/docs/CanonicalFlow";
import { Link } from "react-router-dom";

const llmBlock = `# NexArt Architecture (Canonical Reference)

NexArt provides cryptographic proof of execution integrity. It does not validate semantic correctness.
This page is the normative reference for the end-to-end flow, the CER payload contract, the
verification layers, and the system-wide invariants.

## End-to-End Flow
1. Execution capture - producer runs an AI or deterministic execution and captures inputs, outputs, and parameters.
2. CER creation - producer builds a canonical Certified Execution Record (CER) bundle with bundleType "cer.ai.execution.v1".
3. Hash computation - certificateHash = SHA-256 over JCS-canonicalized whitelist projection.
4. Node attestation (optional) - attestation node issues an Ed25519-signed receipt referencing certificateHash, stored at meta.attestation.
5. Verification - any party recomputes the hash, validates the receipt signature, checks receipt consistency, and (when present) validates the verification envelope.

## certificateHash whitelist (hashed fields)
- bundleType
- version
- createdAt (ISO 8601, UTC)
- snapshot
- context (only if present)
- contextSummary (only if present)

## Excluded from certificateHash
- certificateHash itself
- meta (including meta.attestation, meta.verificationEnvelope, meta.verificationEnvelopeSignature)
- declaration
- receipt
- any unknown fields not in the whitelist

## Verification Layers
- Layer 1: certificateHash (Bundle Integrity) - recompute SHA-256 over whitelist projection.
- Layer 2: Receipt signature (Node Signature + Receipt Consistency) - validate Ed25519 signature with the node's public key (matched by kid via /.well-known/nexart-node.json) and confirm receipt.certificateHash equals bundle certificateHash.
- Layer 3: Verification envelope (v0.16.1+) - validate meta.verificationEnvelopeSignature against meta.verificationEnvelope.

## System invariants
- No mutation: a CER bundle MUST NOT be mutated after creation. Lifecycle state changes (Active, Archived, Hidden, Deleted) are stored outside the bundle.
- Idempotency: identical inputs to the canonicalization and hashing pipeline MUST produce the same certificateHash.
- Canonicalization is protocol-bound: profile is selected by protocolVersion (1.2.0 -> nexart-v1, default; 1.3.0 -> jcs-v1 / RFC 8785, opt-in). Verifiers MUST apply the whitelist projection to the bundle as received and use the matching profile. No reconstruction.
- Independence: verification MUST be possible without trusting NexArt infrastructure, using only the bundle and the node's published public keys.`;

const Architecture = () => (
  <>
    <DocsMeta
      title="NexArt Architecture"
      description="Canonical reference for the NexArt architecture: end-to-end flow, CER payload contract, hash whitelist, verification layers, and system invariants."
      breadcrumbs={[
        { name: "Docs", path: "/docs" },
        { name: "Architecture", path: "/docs/architecture" },
      ]}
    />
    <PageHeader
      title="NexArt Architecture"
      summary="Canonical, normative reference for the NexArt protocol pipeline: capture, create, hash, attest, verify."
      llmBlock={llmBlock}
    />
    <CanonicalFlow context="This flow reflects the system boundaries (SDK, CLI, Node)." />

    <MentalModel
      lines={[
        "Capture is producer-side. Hashing is deterministic. Verification is independent.",
        "certificateHash binds the whitelist. Everything else is mutable metadata.",
        "Bundles are immutable. State transitions live outside the bundle.",
      ]}
    />

    <h2 id="copy-paste-test-harness">Copy-Paste Test Harness</h2>
    <p>
      The fastest way to validate an integration against the canonical pipeline. One script,
      one set of environment variables, one expected output: three PASS lines for Integrity,
      Receipt, and Envelope.
    </p>
    <TestHarness />

    <h2 id="audience">Audience and scope</h2>
    <p>
      This page is the developer reference for the NexArt protocol. It defines the exact
      structure of a Certified Execution Record (CER), the inputs to the certificateHash, the
      verification layers, and the invariants that all producers, attestation nodes, and
      verifiers MUST honor. It is intentionally precise and aligned with the protocol. Where
      RFC keywords (MUST, MUST NOT, SHOULD) appear, they carry their normal protocol meaning.
    </p>

    <h2 id="ownership">Component ownership boundaries</h2>
    <p>
      The system has three components with strict, non-overlapping responsibilities. The CLI
      contains <strong>zero CER cryptographic logic</strong>. All hashing, canonicalization,
      and verification is implemented in the SDK.
    </p>
    <ul>
      <li>
        <strong>SDK</strong> (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ai-execution@0.22.0</code>) owns:
        snapshot creation (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">createSnapshot</code>),
        local sealing (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">sealCer</code>),
        protocol-bound canonicalization (nexart-v1 / jcs-v1), SHA-256 hashing, and verification logic
        (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">verifyAiCerBundleDetailed</code>).
      </li>
      <li>
        <strong>CLI</strong> (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/cli@0.11.0</code>) owns:
        the command surface (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">ai seal</code>,{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">ai certify</code>,{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">ai verify</code>),
        file I/O, argument parsing, and output formatting. It delegates every cryptographic
        operation to the SDK.
      </li>
      <li>
        <strong>Node</strong> (attestation node) owns: bundle attestation (
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">POST /v1/cer/ai/certify</code>),
        Ed25519 receipt signing, verification envelope signature, and public key publication at{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">/.well-known/nexart-node.json</code>.
      </li>
    </ul>

    <h2 id="end-to-end-flow">End-to-end flow</h2>
    <p>
      The pipeline has five stages. Stages 1 to 3 are local to the producer (SDK or CLI). Stage 4
      is optional and adds node attestation. Stage 5 is independent and may be performed by anyone.
      The canonical workflow is: <strong>create input → seal → verify → (optional) certify → verify</strong>.
    </p>

    <h3 id="stage-1">1. Execution capture</h3>
    <p>
      The producer executes an AI call or a deterministic computation and captures the
      observable evidence: model identity, inputs, outputs, parameters, and any contextual
      signals. Inputs and outputs are not stored in the bundle directly; they are reduced to
      SHA-256 digests (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">inputHash</code>,{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">outputHash</code>) inside
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">snapshot</code>.
    </p>
    <p>
      Capture is the producer's responsibility. NexArt does not guarantee completeness of what
      was captured. It guarantees that what was captured cannot be altered without detection.
    </p>

    <h3 id="stage-2">2. CER creation (local sealing)</h3>
    <p>
      The producer assembles the canonical CER bundle and computes the{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.
      This stage is fully offline: it requires no network access and no API key. In SDK form
      this is <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">sealCer()</code>;
      in CLI form it is <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">nexart ai seal</code>.
      The output is a <strong>sealed</strong> CER bundle (integrity only; no attestation).
      Required top-level fields:
    </p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType</code> - constant string <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">"cer.ai.execution.v1"</code> for AI executions.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">version</code> - protocol version of the bundle (currently <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">"0.1"</code>).</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createdAt</code> - ISO 8601 timestamp in UTC.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot</code> - object containing <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">model</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">inputHash</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">outputHash</code>, and <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">metadata</code> (e.g. <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">appId</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectId</code>).</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">context</code> - optional. Structured signals included in the hash when present. See <Link to="/docs/concepts/context-signals" className="text-primary hover:underline">Context Signals</Link>.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">contextSummary</code> - optional, summary of context. Included in the hash when present.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">policyEvaluation</code> - optional. Captured policy decision result. Included in the hash when present.</li>
    </ul>

    <h3 id="stage-3">3. Hash computation (whitelist + protocol-bound canonicalization)</h3>
    <p>
      The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is
      computed as SHA-256 over the canonicalized projection of the bundle to a strict whitelist.
      The canonicalization profile is selected by{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code>
      (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">1.2.0</code> →{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">nexart-v1</code> (default);{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">1.3.0</code> →{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">jcs-v1</code> (RFC 8785, opt-in)).
      The result is written into the bundle as
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">certificateHash</code>.
      The hash field itself is excluded from its own input.
    </p>
    <p>
      Producers and verifiers MUST use identical canonicalization. Implementations MUST NOT
      reconstruct, normalize, strip, or add fields beyond the whitelist projection and JCS.
    </p>

    <h3 id="stage-4">4. Node certification (optional)</h3>
    <p className="text-sm text-muted-foreground">
      A sealed bundle (Stage 2) is already a valid CER. Certification is optional and adds
      independently verifiable node attestation. After certification, the bundle is
      <strong> certified</strong> rather than only sealed.
    </p>
    <p>
      The producer may submit the bundle to an attestation node (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /v1/cer/ai/certify</code>).
      The node validates the bundle and issues a deterministic, Ed25519-signed receipt that
      references the bundle's
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">certificateHash</code>.
      The receipt and signature are stored at
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">bundle.meta.attestation</code>{" "}
      with fields <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt</code>,{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signature</code>, and{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code>.
    </p>
    <p>
      Attestation does not modify any field covered by the whitelist. The
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">certificateHash</code>{" "}
      MUST remain unchanged after attestation.
    </p>

    <h3 id="stage-5">5. Verification</h3>
    <p>
      Any party with the bundle and the node's published public keys can verify. The verifier
      runs up to four checks; each returns <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">PASS</code>,{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">FAIL</code>, or{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">SKIPPED</code>. The overall
      verification status is <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">VERIFIED</code>,{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">FAILED</code>, or{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NOT_FOUND</code>.
    </p>

    <h2 id="payload-contract">Exact payload contract</h2>
    <p>The canonical AI CER bundle shape:</p>
    <CodeBlock
      language="json"
      title="CER bundle (cer.ai.execution.v1)"
      code={`{
  "bundleType": "cer.ai.execution.v1",
  "version": "0.1",
  "createdAt": "2026-04-30T10:15:32.000Z",
  "snapshot": {
    "model": "gpt-4o-mini",
    "inputHash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    "outputHash": "sha256:9c56cc51b374c3ba189210d5b6d4bf57790d351c96c47c02190ecf1e430635ab",
    "metadata": {
      "appId": "app_01HX...",
      "projectId": "proj_01HX..."
    }
  },
  "context": {
    "user": "anon",
    "policy": "approve_v1"
  },
  "contextSummary": "Policy review of automated report.",
  "certificateHash": "sha256:...",
  "meta": {
    "attestation": {
      "receipt": {
        "certificateHash": "sha256:...",
        "timestamp": "2026-04-30T10:15:32.500Z",
        "nodeId": "node_nexart_prod_01",
        "kid": "key_01HX..."
      },
      "signature": "<raw Ed25519 bytes / base64url>",
      "kid": "key_01HX..."
    },
    "verificationEnvelope": { },
    "verificationEnvelopeSignature": "<base64url>"
  }
}`}
    />

    <h3 id="field-rules">Field rules</h3>
    <ul>
      <li><strong>bundleType</strong> - REQUIRED. Constant. Identifies the bundle schema. For AI executions, exactly <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">"cer.ai.execution.v1"</code>. Hashed.</li>
      <li><strong>version</strong> - REQUIRED. Bundle schema version. Hashed. Verifiers MUST refuse to upgrade or downgrade the value.</li>
      <li><strong>createdAt</strong> - REQUIRED. ISO 8601 UTC timestamp at the moment of CER creation. Hashed.</li>
      <li><strong>snapshot</strong> - REQUIRED. Hashed. Carries <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">model</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">inputHash</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">outputHash</code>, and <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">metadata</code>. Sub-fields are stable; producers MUST NOT inject mutable runtime data into snapshot.</li>
      <li><strong>context</strong> - OPTIONAL. Hashed when present. Used for structured signals that bind to the certificateHash.</li>
      <li><strong>contextSummary</strong> - OPTIONAL. Hashed when present. Human-readable companion to <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">context</code>.</li>
      <li><strong>certificateHash</strong> - REQUIRED in the persisted bundle. Excluded from its own hash input.</li>
      <li><strong>meta</strong> - OPTIONAL. Excluded from hash. Carries attestation, verification envelope, declaration, and any non-normative metadata.</li>
    </ul>

    <h2 id="hash-whitelist">Hash whitelist (normative)</h2>
    <p>The certificateHash input is the JCS canonicalization of an object containing only:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">version</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createdAt</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">context</code> (only if present in bundle)</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">contextSummary</code> (only if present in bundle)</li>
    </ul>

    <h3 id="hash-exclusions">Excluded from the hash input</h3>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta</code> and all subfields, including <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.verificationEnvelope</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.verificationEnvelopeSignature</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">declaration</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt</code> (top-level convenience copy, when present)</li>
      <li>any unknown fields not in the whitelist</li>
    </ul>

    <h2 id="verification-layers">Verification layers</h2>

    <h3 id="layer-1">Layer 1 - certificateHash (Bundle Integrity)</h3>
    <p>
      The verifier projects the received bundle to the whitelist, canonicalizes with JCS, and
      computes SHA-256. The result MUST equal the bundle's
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">certificateHash</code>.
      Any difference is <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">FAIL</code>.
      This layer is always evaluated.
    </p>

    <h3 id="layer-2">Layer 2 - Receipt signature (Node Signature + Receipt Consistency)</h3>
    <p>
      When <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code>{" "}
      is present, the verifier:
    </p>
    <ol>
      <li>Resolves the node public key by <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code>.</li>
      <li>Validates the Ed25519 signature over the canonical receipt payload.</li>
      <li>Confirms <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt.certificateHash</code> equals the bundle's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.</li>
    </ol>
    <p>
      If <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code>{" "}
      is absent, both checks return
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">SKIPPED</code>.
      Skipping is not a failure of integrity.
    </p>

    <h3 id="layer-3">Layer 3 - Verification envelope (v0.16.1)</h3>
    <p>
      Newer bundles MAY include
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">meta.verificationEnvelope</code>{" "}
      and
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">meta.verificationEnvelopeSignature</code>.
      The verifier validates the signature against the envelope content. Failure of the
      envelope MUST NOT be reported as failure of bundle integrity. Historical artifacts
      without an envelope return
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">SKIPPED</code> for
      this layer (compatibility fallback).
    </p>

    <p className="text-sm text-muted-foreground">
      For the full layer specification and edge cases, see{" "}
      <Link to="/docs/ai-cer-verification-layers" className="text-primary hover:underline">
        AI CER Verification Layers
      </Link>{" "}
      and{" "}
      <Link to="/docs/verification-statuses-and-errors" className="text-primary hover:underline">
        Verification Statuses and Errors
      </Link>.
    </p>

    <h2 id="invariants">Critical constraints</h2>

    <h3 id="no-mutation">No mutation</h3>
    <p>
      A CER bundle MUST NOT be mutated after creation. Lifecycle state changes (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">Active</code>,{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">Archived</code>,{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">Hidden</code>,{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">Deleted</code>) are recorded
      in registry state external to the bundle. Republishing a modified bundle produces a new
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">certificateHash</code>{" "}
      and is a different record.
    </p>

    <h3 id="idempotency">Idempotency</h3>
    <p>
      Given identical inputs to the canonicalization and hashing pipeline, every conformant
      implementation MUST produce the same
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">certificateHash</code>.
      Re-issuing the same execution capture MUST yield bit-identical hashes. Producers SHOULD
      treat <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>{" "}
      as the deduplication key for downstream systems.
    </p>

    <h3 id="canonicalization">Canonicalization (protocol-bound)</h3>
    <p>
      Canonicalization is bound to the bundle's{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code>.{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">1.2.0</code> uses{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">nexart-v1</code> (current
      default, custom canonicalization).{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">1.3.0</code> uses{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">jcs-v1</code> (RFC 8785,
      opt-in, standards-based). Verifiers MUST select the profile by{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">protocolVersion</code>, apply
      the whitelist projection to the bundle as received, and canonicalize without further
      normalization. There is no tolerant parsing and no universal default.
    </p>

    <h3 id="independence">Independence of verification</h3>
    <p>
      Verification MUST be possible without contacting NexArt's APIs. The bundle plus the
      node's published public keys are sufficient. The
      <Link to="/docs/verify-nexart" className="text-primary hover:underline ml-1">verify.nexart.io</Link>{" "}
      portal is a convenience layer; it runs the same checks any client can run.
    </p>

    <h2 id="sealed-vs-certified">Sealed vs Certified</h2>
    <p>
      Two valid CER states. <strong>Sealed</strong> is produced offline by the SDK or CLI and
      proves integrity only. <strong>Certified</strong> adds an Ed25519 receipt and a verification
      envelope from the attestation node, making the bundle independently verifiable end-to-end.
      Certification does not change the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.
    </p>
    <SealedVsCertified />

    <h2 id="guarantees">What NexArt guarantees</h2>
    <ul>
      <li><strong>Execution integrity</strong> — the recorded execution cannot be modified after sealing without breaking the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.</li>
      <li><strong>Tamper detection</strong> — any change to a hashed field is detectable by recomputation against the JCS-canonicalized whitelist projection.</li>
      <li><strong>Independent verification</strong> — any party can verify a bundle using only the bundle and the node's published public keys. No NexArt API access required.</li>
    </ul>

    <h2 id="non-goals">What NexArt does not guarantee</h2>
    <ul>
      <li><strong>Output correctness</strong> — NexArt does not validate whether the captured output is right, useful, or safe.</li>
      <li><strong>Model validity</strong> — NexArt does not certify the model, its weights, or its behavior.</li>
      <li><strong>Deterministic replay</strong> — NexArt does not guarantee that re-running the same input produces the same output. It records what happened; it does not reproduce it.</li>
    </ul>

    <h2 id="references">Authoritative references</h2>
    <ul>
      <li><Link to="/docs/concepts/cer" className="text-primary hover:underline">Certified Execution Records</Link> - bundle definition.</li>
      <li><Link to="/docs/concepts/hashes" className="text-primary hover:underline">certificateHash vs projectHash</Link> - hash scope and algorithm.</li>
      <li><Link to="/docs/cer-protocol" className="text-primary hover:underline">CER Protocol</Link> - normative protocol specification.</li>
      <li><Link to="/docs/ai-cer-verification-layers" className="text-primary hover:underline">AI CER Verification Layers</Link> - layer-by-layer semantics.</li>
      <li><Link to="/docs/ai-cer-package-format" className="text-primary hover:underline">AI CER Package Format</Link> - transport envelope.</li>
      <li><Link to="/docs/attestation-node" className="text-primary hover:underline">Attestation Node</Link> - node contract and key publication.</li>
      <li><Link to="/docs/verification-semantics" className="text-primary hover:underline">Verification Semantics</Link> - status mapping and error codes.</li>
    </ul>
  </>
);

export default Architecture;
