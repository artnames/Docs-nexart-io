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
          <dt className="font-semibold text-foreground">
            Local creation vs Node certification vs Public verification
          </dt>
          <dd className="text-foreground/90 mt-1 space-y-2">
            <p>
              <strong>Local creation</strong> — produced by the SDK or CLI (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                @nexart/ai-execution
              </code>{" "}
              /{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                nexart ai create
              </code>{" "}
              /{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                POST /v1/cer/ai/create
              </code>
              ). Builds a canonical CER bundle and computes the{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code>.
              No network call to the attestation node, no receipt, no signature, no public verification URL.
            </p>
            <p>
              <strong>Node certification</strong> — performed by the attestation node (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                POST /v1/cer/ai/certify
              </code>{" "}
              /{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                nexart ai certify
              </code>
              ). The node receives the bundle, validates it, and issues a signed receipt
              (Ed25519, identified by{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">kid</code>) referencing
              the bundle's{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code>.
              The receipt and signature are stored at{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                bundle.meta.attestation
              </code>
              . Certification adds an attestation layer; it does not change the{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code>.
            </p>
            <p>
              <strong>Public verification</strong> — performed independently by anyone, with no
              trust in NexArt infrastructure required. Available via{" "}
              <Link to="/docs/verify-nexart" className="text-primary hover:underline">
                verify.nexart.io
              </Link>
              , the SDK (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verifyCer</code>
              /
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verifyCerAsync</code>
              ), or the CLI (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                nexart ai verify
              </code>
              ). Up to four checks run, each returning PASS / FAIL / SKIPPED:
              Bundle Integrity, Node Signature, Receipt Consistency, and Verification Envelope.
              Verification statuses: VERIFIED, FAILED, NOT_FOUND.
            </p>
          </dd>
        </div>
      </dl>
    </section>
  );
};

export default TechnicalTruth;
