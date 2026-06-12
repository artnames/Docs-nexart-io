import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# NexArt Verification Model
Verification of a Certified Execution Record (CER) does NOT require NexArt.
A record is verifiable by anyone in possession of:
  1. The CER bundle (JSON, as produced by the SDK/CLI/node)
  2. The signing node's public key set (published at /.well-known/nexart-node.json)
  3. A JCS (RFC 8785) JSON canonicalizer and an Ed25519 verifier

## Four verification surfaces
1. CLI            — \`nexart ai verify <bundle.json>\` (@nexart/cli)
2. SDK            — \`verifyCer\` / \`verifyCerAsync\` (@nexart/ai-execution)
3. Public endpoint — https://verify.nexart.io/c/<certificateHash>
4. External impl   — any implementation conformant to the AI CER Package Format spec

All four MUST produce identical PASS/FAIL/SKIPPED outcomes for the same bundle
and the same node key set. NexArt's hosted infrastructure is not in the trust path.

## protocolVersion
\`meta.attestation.protocolVersion\` declares the canonicalization profile used
for hashing and signing.
  - "1.2.0" -> profile "nexart-v1" (frozen, legacy, accepted for historical records)
  - "1.3.0" -> profile "jcs-v1"    (RFC 8785, current default)

Verifiers MUST select the canonicalization profile by protocolVersion and MUST
fail-closed on unknown versions. There is no implicit fallback.

## Fail-closed
- Unknown protocolVersion         -> FAILED
- Unknown bundleType              -> FAILED
- Unresolvable kid                -> FAILED (receipt layer)
- Missing required projection field with envelope present -> FAILED (envelope layer)
- Missing optional projection field with envelope absent  -> SKIPPED (envelope layer)
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
      node's published public keys. NexArt's hosted services are not part of
      the trust path. Any party with the bundle and access to the node's key
      set can produce the same PASS/FAIL/SKIPPED outcome.
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
        from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/cli@0.8.1</code>.
        Runs offline; only fetches the node key set when the bundle declares an
        attestation.
      </li>
      <li>
        <strong>SDK</strong> —{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyCer</code>{" "}
        (Node) or{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyCerAsync</code>{" "}
        (browser / Edge) from{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ai-execution@0.16.2</code>.
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
        and the canonicalization profile selected by{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code>.
      </li>
    </ol>

    <h2 id="protocol-version">protocolVersion</h2>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
        meta.attestation.protocolVersion
      </code>{" "}
      declares which canonicalization profile MUST be used to recompute the{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>{" "}
      and reconstruct the envelope signing payload.
    </p>

    <CodeBlock
      language="text"
      title="Supported protocolVersion values"
      code={`protocolVersion = "1.2.0"   profile = "nexart-v1"   status = frozen, accepted (legacy)
protocolVersion = "1.3.0"   profile = "jcs-v1"      status = current default (RFC 8785)`}
    />

    <h3 id="why-canonicalization">Why Canonicalization Matters</h3>
    <p>
      Two JSON documents can be semantically identical but byte-different
      (key order, whitespace, number formatting, Unicode escaping). A hash or
      signature computed over the raw bytes of one will not match the other.
      JCS (RFC 8785) defines a single deterministic byte representation for a
      given JSON value: sorted keys, no insignificant whitespace, a fixed
      number representation, and a fixed string escaping. Every verifier that
      applies JCS to the same projection produces the same hash, on any
      platform, in any language.
    </p>

    <h3 id="backward-compat">Backward Compatibility</h3>
    <ul>
      <li>
        <strong>1.2.0 (nexart-v1)</strong> remains accepted indefinitely for
        records produced before the JCS migration. The profile is frozen: no
        new fields, no new rules.
      </li>
      <li>
        <strong>1.3.0 (jcs-v1)</strong> is the default for all newly produced
        records. Verifiers MUST support both profiles to remain compliant.
      </li>
      <li>
        A bundle's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code>{" "}
        is part of the attestation projection signed by the verification
        envelope. It cannot be silently retargeted to a different profile.
      </li>
    </ul>

    <h2 id="fail-closed">Fail-closed Behavior</h2>
    <p>
      Verification MUST fail closed. Any condition where a verifier cannot
      determine the correct rule to apply is reported as{" "}
      <strong>FAILED</strong>, never as PASS. SKIPPED is reserved for layers
      that are not applicable to the bundle as received (for example, an
      unsigned sealed bundle has no Layer 2 to run).
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
        present in the node key set → <strong>FAILED</strong> (Layer 2).
      </li>
      <li>
        Envelope present but a required projection field is missing or cannot
        be canonicalized → <strong>FAILED</strong> (Layer 3).
      </li>
      <li>
        Envelope absent → <strong>SKIPPED</strong> (Layer 3). This is not a
        failure; it accurately reports that the bundle does not carry that
        proof.
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
