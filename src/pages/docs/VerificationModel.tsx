import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# NexArt Verification Model
Verification of a Certified Execution Record (CER) does NOT require NexArt.
A record is verifiable by anyone in possession of:
  1. The CER bundle (JSON, as produced by the SDK/CLI/node)
  2. The signing node's public key set (published at /.well-known/nexart-node.json)
  3. SHA-256, Ed25519, and a canonicalizer matching the bundle's protocolVersion

## Two independent properties
- Integrity   = SHA-256 hash recomputation over the whitelist projection.
                Proves the covered fields have not been modified.
- Authenticity = Ed25519 signature verification against the node's public key.
                 Proves a specific node attested this specific certificateHash.
A bundle MAY have integrity without authenticity (sealed, unsigned). Integrity
is verifiable on its own. Authenticity requires BOTH a valid signature AND the
correct public key for the receipt's kid.

## Aggregate status is additive, not authoritative
\`status: VERIFIED\` from the SDK reports the aggregate of applicable layers.
Integrity and signature MUST be evaluated as independent checks; the SDK
provides classification, not the primary verdict. The attestation node
recomputes verification independently for every certified record.

## Four verification surfaces
1. CLI            — \`nexart ai verify <bundle.json>\` (@nexart/cli@0.11.0)
2. SDK            — \`verifyCer\` / \`verifyCerAsync\` (@nexart/ai-execution@0.22.0)
3. Public endpoint — https://verify.nexart.io/c/<certificateHash>
4. External impl   — any implementation conformant to the AI CER Package Format spec

All four MUST produce identical PASS/FAIL/SKIPPED outcomes for the same bundle
and the same node key set. NexArt's hosted infrastructure is not in the trust path.

## protocolVersion → canonicalization profile (protocol-bound)
\`meta.attestation.protocolVersion\` declares the canonicalization profile used
for hashing and signing. Canonicalization is protocol-bound: there is no
universal default. Verifiers MUST use the profile corresponding to the
bundle's protocolVersion or hash recomputation WILL fail.
  - "1.2.0" -> profile "nexart-v1" (default, custom canonicalization)
  - "1.3.0" -> profile "jcs-v1"    (opt-in, RFC 8785 / JCS, standards-based)

Default is 1.2.0. 1.3.0 is opt-in via \`createSnapshot({ protocolVersion: "1.3.0" })\`
or the CLI \`--protocol-version 1.3.0\` flag. Both profiles are accepted
indefinitely. Verifiers MUST support both. Unknown protocolVersion MUST FAIL.

## certificateHash whitelist
SHA-256 over the canonicalized projection of:
  bundleType, version, createdAt, snapshot,
  context           (optional, only when present),
  contextSummary    (optional, only when present),
  policyEvaluation  (optional, only when present)
All other fields are excluded and MAY change without invalidating the hash.

## Fail-closed
- Unknown protocolVersion         -> FAILED
- Unknown bundleType              -> FAILED
- Unresolvable kid                -> FAILED (signature layer)
- Missing required projection field with envelope present -> FAILED (envelope layer)
- Envelope absent                                         -> SKIPPED (envelope layer)
Verification never silently passes when a required input is missing or unknown.`;

const VerificationModel = () => (
  <>
    <PageHeader
      title="Verification Model"
      summary="What NexArt verification proves, who can perform it, and the canonical rules every implementation must follow."
      llmBlock={llmBlock}
    />

    <h2 id="independence">Verification Does Not Require NexArt</h2>
    <p>
      A Certified Execution Record (CER) is a self-contained cryptographic
      artifact. Verification is a pure function of the bundle and the signing
      node's published public keys. NexArt's hosted services, runtime, and
      account system are not part of the trust path. The SDK is an optional
      convenience; any party with the bundle, the node key set, SHA-256, and
      Ed25519 can produce the same PASS/FAIL/SKIPPED outcome.
    </p>

    <h2 id="properties">Two Independent Properties: Integrity and Authenticity</h2>
    <p>
      NexArt verification reports two distinct cryptographic properties. They
      are evaluated independently and MUST NOT be conflated.
    </p>
    <ul>
      <li>
        <strong>Integrity</strong> — SHA-256 hash recomputation over the
        canonicalized whitelist projection of the bundle, compared with the
        declared{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.
        Proves that the covered fields have not been modified. Requires no
        keys, no network, and no node.
      </li>
      <li>
        <strong>Authenticity</strong> — Ed25519 signature verification against
        the public key resolved from the receipt's{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code>.
        Proves that a specific node attested this specific{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.
        Authenticity requires BOTH a valid signature AND the correct public
        key for that <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code>.
      </li>
    </ul>
    <p>
      <strong>Unsigned bundles can still be verified (integrity only).</strong>{" "}
      A sealed bundle with no attestation is a valid CER and has a valid
      integrity proof; the signature layer correctly reports SKIPPED, not
      FAILED. The aggregate{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">status: VERIFIED</code>{" "}
      reported by the SDK is an additive classification over the applicable
      layers; integrity and signature MUST be evaluated as independent checks.
      The attestation node recomputes verification independently for every
      certified record. The SDK provides classification, not the primary
      verdict.
    </p>

    <h2 id="surfaces">Four Verification Surfaces</h2>
    <p>
      The protocol defines four interchangeable verification surfaces. They
      MUST produce identical results for the same bundle.
    </p>
    <ol>
      <li>
        <strong>CLI</strong> —{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          nexart ai verify &lt;bundle.json&gt;
        </code>{" "}
        from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/cli@0.11.0</code>.
        Runs offline; only fetches the node key set when the bundle declares an
        attestation.
      </li>
      <li>
        <strong>SDK</strong> —{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyCer</code>{" "}
        (Node) or{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyCerAsync</code>{" "}
        (browser / Edge) from{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ai-execution@0.22.0</code>.
      </li>
      <li>
        <strong>Public endpoint</strong> —{" "}
        <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">
          verify.nexart.io
        </a>{" "}
        and the JSON API at{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          /v1/cer/public/&lt;certificateHash&gt;
        </code>.
        Convenience surface; not a trust anchor.
      </li>
      <li>
        <strong>External implementation</strong> — any conformant verifier
        built directly against the{" "}
        <Link to="/docs/ai-cer-package-format" className="text-primary hover:underline">
          AI CER Package Format
        </Link>{" "}
        using only SHA-256, Ed25519, and a canonicalizer matching the bundle's{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code>.
      </li>
    </ol>

    <h2 id="independent-verification">Independent Verification Requirements</h2>
    <p>
      To verify any CER end-to-end, an implementer needs exactly:
    </p>
    <ul>
      <li>The CER bundle.</li>
      <li>The signing node's public key for the receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> (published at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/.well-known/nexart-node.json</code>).</li>
      <li>SHA-256.</li>
      <li>Ed25519.</li>
      <li>A canonicalizer matching the bundle's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code>.</li>
    </ul>
    <p>
      No NexArt account is required. No NexArt runtime is required. The SDK is
      optional. See{" "}
      <Link to="/docs/external-verification" className="text-primary hover:underline">
        External Verification
      </Link>{" "}
      for a from-scratch reference implementation.
    </p>

    <h2 id="protocol-version">protocolVersion → Canonicalization Profile</h2>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
        meta.attestation.protocolVersion
      </code>{" "}
      declares which canonicalization profile MUST be used to recompute the{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>{" "}
      and reconstruct the envelope signing payload.{" "}
      <strong>Canonicalization is protocol-bound: there is no universal default.</strong>
    </p>

    <CodeBlock
      language="text"
      title="Supported protocolVersion values"
      code={`protocolVersion = "1.2.0"   profile = "nexart-v1"   status = default (custom canonicalization)
protocolVersion = "1.3.0"   profile = "jcs-v1"      status = opt-in  (RFC 8785, standards-based)`}
    />

    <div className="not-prose my-4 rounded-lg border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm">
      <strong>Warning.</strong> Verifiers MUST use the canonicalization
      corresponding to the bundle's{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">protocolVersion</code>{" "}
      or hash recomputation will fail. Do NOT assume RFC 8785 universally;
      records produced with <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">1.2.0</code>{" "}
      use the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">nexart-v1</code>{" "}
      profile and will not hash to the same value under JCS.
    </div>

    <h3 id="defaults-and-opt-in">Defaults and Opt-in</h3>
    <ul>
      <li>
        <strong>1.2.0 (nexart-v1)</strong> is the current default. All SDK and
        CLI calls produce 1.2.0 bundles unless the producer explicitly opts
        in to a different version.
      </li>
      <li>
        <strong>1.3.0 (jcs-v1)</strong> is opt-in. Producers select it via{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createSnapshot({"{ protocolVersion: \"1.3.0\" }"})</code>{" "}
        in the SDK or the CLI flag{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">--protocol-version 1.3.0</code>.
        It is standards-based (RFC 8785 / JCS) and intended for environments
        that require a published canonicalization specification.
      </li>
      <li>
        Both profiles are accepted indefinitely. Verifiers MUST support both
        to remain compliant.{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code>{" "}
        is part of the attestation projection signed by the verification
        envelope; it cannot be silently retargeted to a different profile.
      </li>
    </ul>

    <h2 id="signature-model">Signature Model</h2>
    <p>
      Authenticity is asserted with an Ed25519 signature produced by the
      attestation node. The signed payload is NOT the raw bundle. It is a
      derived canonical payload (the SDK exposes this as{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">deriveSignablePayload</code>):
      the strict whitelist projection of the bundle and the attestation
      projection of the receipt, canonicalized per the bundle's{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code>.
    </p>
    <p>
      Authenticity therefore requires <strong>both</strong>:
    </p>
    <ul>
      <li>A valid Ed25519 signature over the canonical signed payload.</li>
      <li>
        The correct public key — resolved from the node key set by the
        receipt's{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code>.
        An unresolvable <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code>{" "}
        MUST fail closed.
      </li>
    </ul>

    <h2 id="fail-closed">Fail-closed Behavior</h2>
    <p>
      Verification MUST fail closed. Any condition where a verifier cannot
      determine the correct rule to apply is reported as{" "}
      <strong>FAILED</strong>, never as PASS. SKIPPED is reserved for layers
      that are not applicable to the bundle as received (for example, an
      unsigned sealed bundle has no signature layer to run).
    </p>
    <ul>
      <li>
        Unknown <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code>{" "}
        → <strong>FAILED</strong>.
      </li>
      <li>
        Unknown <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType</code>{" "}
        → <strong>FAILED</strong>.
      </li>
      <li>
        Receipt <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> not
        present in the node key set → <strong>FAILED</strong> (signature layer).
      </li>
      <li>
        Envelope present but a required projection field is missing or cannot
        be canonicalized → <strong>FAILED</strong> (envelope layer).
      </li>
      <li>
        Envelope absent → <strong>SKIPPED</strong>. Not a failure; the bundle
        does not carry that proof.
      </li>
    </ul>

    <h2 id="trust-boundaries">Trust Boundaries</h2>
    <p>
      NexArt proves a narrow, precisely-defined set of properties. Anything
      not listed below is out of scope and MUST NOT be inferred from a PASS
      result.
    </p>
    <p><strong>NexArt proves:</strong></p>
    <ul>
      <li>Integrity of the covered whitelist fields (SHA-256 recomputation).</li>
      <li>Authenticity of the attestation, if a valid signature is present (Ed25519 against the node's published key).</li>
    </ul>
    <p><strong>NexArt does NOT prove:</strong></p>
    <ul>
      <li>
        <strong>Independent time of existence.</strong>{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestedAt</code>{" "}
        is a node-issued timestamp bound to the{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>{" "}
        by the receipt signature. It provides an ordering guarantee relative
        to other records signed by the same node; it is NOT independent proof
        of existence at that wall-clock time. An external TSA (e.g. RFC 3161
        via DigiCert) MAY be integrated alongside the receipt without
        modifying existing records.
      </li>
      <li>
        <strong>Completeness of execution.</strong> Verification does not
        prove that the bundle represents every step of a larger workflow.
        Capture coverage is an integration concern.
      </li>
      <li>
        <strong>Public log inclusion.</strong> The current attestation log is
        node-internal. There is no public Merkle tree, no external witness,
        and no transparency-log inclusion proof at this protocol version.
      </li>
      <li>
        <strong>Semantic correctness.</strong> NexArt proves the bundle was
        produced as recorded. It does not assert that the model output was
        correct, appropriate, or compliant.
      </li>
      <li>
        <strong>Deterministic replay.</strong> Recomputing the same model
        output from the same inputs only applies in controlled environments
        (fixed model version, seed, temperature 0, deterministic decoding).
      </li>
    </ul>

    <h2 id="not-guaranteed">What Verification Does NOT Guarantee</h2>
    <p>
      A PASS result asserts what the protocol provably attests, and nothing
      more. The following properties are explicitly out of scope:
    </p>
    <ul>
      <li>
        <strong>Completeness</strong>. Verification does not prove that the
        bundle represents every step of a larger workflow. Whether all
        relevant executions were captured is an integration concern.
      </li>
      <li>
        <strong>Semantic correctness</strong>. NexArt proves the bundle was
        produced as recorded, not that the model output was correct,
        appropriate, or compliant.
      </li>
      <li>
        <strong>Trusted timestamping</strong>.{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestedAt</code>{" "}
        is asserted by the signing node and bound by the receipt signature. It
        is node-attested time, not third-party anchored time. External
        anchoring (RFC 3161, transparency log, blockchain) is on the roadmap
        and is not part of v1.3.0.
      </li>
      <li>
        <strong>Deterministic replay</strong>. Recomputing the same model
        output from the same inputs is only meaningful in controlled
        environments (fixed model version, seed, temperature 0, deterministic
        decoding). NexArt attests the recorded I/O; it does not assert
        reproducibility of the upstream model.
      </li>
    </ul>

    <h2 id="see-also">See Also</h2>
    <ul>
      <li>
        <Link to="/docs/external-verification" className="text-primary hover:underline">
          External Verification Guide
        </Link>{" "}
        — step-by-step verification using only public primitives.
      </li>
      <li>
        <Link to="/docs/ai-cer-package-format" className="text-primary hover:underline">
          AI CER Package Format
        </Link>{" "}
        — normative specification.
      </li>
      <li>
        <Link to="/docs/ai-cer-verification-layers" className="text-primary hover:underline">
          AI CER Verification Layers
        </Link>{" "}
        — per-layer detail.
      </li>
    </ul>
  </>
);

export default VerificationModel;
