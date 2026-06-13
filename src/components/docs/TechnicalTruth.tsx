import { Link } from "react-router-dom";

/**
 * TechnicalTruth
 *
 * Server-rendered (no client-only state) precise summary of NexArt's
 * core technical contract. Placed at the top of high-traffic pages
 * so crawlers and LLMs can extract correct terminology immediately.
 *
 * Content is intentionally normative and uses canonical terminology.
 * Do not simplify in ways that break correctness.
 */
const TechnicalTruth = () => {
  return (
    <section
      aria-labelledby="technical-truth-heading"
      className="not-prose my-6 rounded-lg border border-border bg-muted/20 p-5"
    >
      <h2
        id="technical-truth-heading"
        className="text-xs font-semibold uppercase tracking-wide text-primary mb-3"
      >
        Technical truth
      </h2>

      <dl className="space-y-4 text-sm leading-relaxed">
        <div>
          <dt className="font-semibold text-foreground">What a CER is</dt>
          <dd className="text-foreground/90 mt-1">
            A Certified Execution Record (CER) is a canonical, tamper-evident
            bundle representing one execution. It has{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
              bundleType: "cer.ai.execution.v1"
            </code>
            , a <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">version</code>,
            a <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">createdAt</code>{" "}
            ISO-8601 timestamp, a <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">snapshot</code>{" "}
            (model, inputHash, outputHash, metadata), and an optional{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">context</code>{" "}
            /{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">contextSummary</code>.
            The CER is identified by its{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code>{" "}
            (SHA-256). Inputs and outputs are stored as hashes; raw payloads are not part of the bundle.
          </dd>
        </div>

        <div>
          <dt className="font-semibold text-foreground">Fields covered by certificateHash (whitelist)</dt>
          <dd className="text-foreground/90 mt-1">
            The hash is computed using{" "}
            <strong>JCS canonicalization (RFC 8785)</strong> over a strict whitelist projection:
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono ml-1">bundleType</code>,{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">version</code>,{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">createdAt</code>,{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">snapshot</code>,{" "}
            and (only when present){" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">context</code>,{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">contextSummary</code>.
            Any modification to a covered field changes the hash.
          </dd>
        </div>

        <div>
          <dt className="font-semibold text-foreground">Fields excluded from hashing</dt>
          <dd className="text-foreground/90 mt-1">
            The following are explicitly excluded from the hash payload and may be added,
            updated, or removed without invalidating the{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code>:{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code> itself,{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">meta</code>{" "}
            (including <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">meta.attestation</code>{" "}
            and the receipt),{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">declaration</code>,{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verificationEnvelope</code>,{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verificationEnvelopeSignature</code>,{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">receipt</code>,
            and any unknown fields not in the whitelist. Verifiers MUST apply the whitelist
            projection to the bundle as received; no reconstruction or normalization beyond JCS.
          </dd>
        </div>

        <div>
          <dt className="font-semibold text-foreground">The three verification layers</dt>
          <dd className="text-foreground/90 mt-1">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>certificateHash (integrity)</strong> — recompute SHA-256 over the
                JCS-canonicalized whitelist projection and compare with the bundle's{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code>.
              </li>
              <li>
                <strong>receipt signature (node attestation)</strong> — validate the Ed25519
                receipt at{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">meta.attestation</code>{" "}
                using the node key matched by{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">kid</code>, and
                confirm it references the bundle's{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code>.
              </li>
              <li>
                <strong>verification envelope (full bundle signature, v0.16.1)</strong> — validate{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">meta.verificationEnvelopeSignature</code>{" "}
                against{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">meta.verificationEnvelope</code>.
                When absent, this layer returns SKIPPED.
              </li>
            </ul>
            <p className="mt-2">
              Each layer reports independently as PASS, FAIL, or SKIPPED. Verification statuses:
              VERIFIED, FAILED, NOT_FOUND.
            </p>
          </dd>
        </div>

        <div>
          <dt className="font-semibold text-foreground">
            Independence model: local sealing, optional node certification, independent verification
          </dt>
          <dd className="text-foreground/90 mt-1 space-y-2">
            <p>
              <strong>Local sealing</strong> — produced by the SDK (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                @nexart/ai-execution@0.22.0
              </code>{" "}
              via <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">sealCer()</code>) or the
              CLI (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                @nexart/cli@0.11.0
              </code>{" "}
              via <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">nexart ai seal</code>).
              Builds a canonical CER bundle and computes the{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code>{" "}
              fully offline. No API key, no network call, no receipt, no verification envelope.
              The result is a <strong>sealed</strong> bundle: integrity only.
            </p>
            <p>
              <strong>Optional node certification</strong> — performed by the attestation node (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                POST /v1/cer/ai/certify
              </code>{" "}
              /{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                nexart ai certify
              </code>
              ). The node validates the bundle and issues an Ed25519-signed receipt (identified by{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">kid</code>) referencing
              the bundle's{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code>,
              plus a verification envelope. Receipt and signatures are stored at{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                bundle.meta.attestation
              </code>{" "}
              and <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">meta.verificationEnvelope</code>.
              Certification adds attestation layers; it does not change the{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code>.
              The result is a <strong>certified</strong> bundle.
            </p>
            <p>
              <strong>Independent verification</strong> — performed by anyone, with no trust in
              NexArt infrastructure required. Available via{" "}
              <Link to="/docs/verify-nexart" className="text-primary hover:underline">
                verify.nexart.io
              </Link>
              , the SDK, or the CLI. The bundle plus the node's published public keys are sufficient.
              For sealed bundles, only Layer 1 (integrity) is applicable; Layers 2 and 3 return SKIPPED.
              For certified bundles, all three layers return PASS.
            </p>
          </dd>
        </div>
      </dl>
    </section>
  );
};

export default TechnicalTruth;
