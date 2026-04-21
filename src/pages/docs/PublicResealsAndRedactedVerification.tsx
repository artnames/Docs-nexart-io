import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const llmBlock = `# Public Reseals & Redacted Verification

Why a publicly verifiable artifact may have a different certificateHash than
the original artifact, and what that means for trust.

## Why public reseals exist
- The original CER may contain content the publisher does not want public
  (PII, prompts, internal context).
- The public verifier MAY return a redacted reseal: a new bundle covering the
  redacted content only.
- The reseal is a separate, independently verifiable artifact. The original
  record is NOT broken.

## Reseal artifact shape
{
  "bundleType": "signed-redacted-reseal",
  "certificateHash": "sha256:<NEW_RESEALED_HASH>",
  "provenance": {
    "originalCertificateHash": "sha256:<ORIGINAL_HASH>",
    "reason": "public-redaction"
  },
  "receipt": { "alg": "Ed25519", "kid": "...", "sig": "..." }
}

## Hash semantics
- Requested hash : the hash you looked up (often the original).
- Returned hash  : the certificateHash of the resealed artifact actually shown.
- The two MAY differ. The verifier MUST display both with their roles.

## What is verified
- The PUBLIC artifact's integrity (the reseal) is what verify.nexart.io
  cryptographically validates.
- The original certificateHash is preserved as a reference-only provenance
  pointer. It is NOT re-verified by the public verifier.
- Holders of the original (unredacted) bundle can still verify it locally
  with verifyCer().

## Supplemental signals
- Reseals MAY include supplemental context.signals outside the new
  certificateHash scope. Treat as VERIFIED (supplemental). See Verification
  Semantics.`;

const PublicResealsAndRedactedVerification = () => (
  <>
    <PageHeader
      title="Public Reseals & Redacted Verification"
      summary="Why a publicly verifiable artifact can have a different certificateHash than the original. The reseal is a separate verifiable artifact. The original record is not broken."
      llmBlock={llmBlock}
    />

    <Alert className="mb-6">
      <Info className="h-4 w-4" />
      <AlertTitle>Reseal in one sentence</AlertTitle>
      <AlertDescription>
        A reseal is a new, independently signed CER covering a redacted view of
        an original execution. It has a new certificateHash and a provenance
        pointer back to the original.
      </AlertDescription>
    </Alert>

    <h2>Why reseals exist</h2>
    <p>
      Original CERs often contain content the publisher cannot expose publicly:
      raw prompts, customer data, internal tool calls. The public verifier
      cannot show that content. Instead, it returns a <em>redacted reseal</em>:
      a new bundle that covers only what is safe to publish, signed by the node.
    </p>
    <p>
      This preserves three properties at once: the original record stays intact
      and locally verifiable, the public artifact is independently verifiable,
      and sensitive content never appears in the public surface.
    </p>

    <h2>Reseal artifact shape</h2>
    <CodeBlock language="json" code={`{
  "bundleType": "signed-redacted-reseal",
  "certificateHash": "sha256:<NEW_RESEALED_HASH>",
  "provenance": {
    "originalCertificateHash": "sha256:<ORIGINAL_HASH>",
    "reason": "public-redaction"
  },
  "receipt": {
    "alg": "Ed25519",
    "kid": "node-key-2026-01",
    "sig": "base64..."
  }
}`} />

    <h2>Requested hash vs returned public hash</h2>
    <ul>
      <li>
        <strong>Requested hash:</strong> the hash you put in the URL or query
        (often the original certificateHash).
      </li>
      <li>
        <strong>Returned public hash:</strong> the <code>certificateHash</code> of
        the artifact the verifier actually displays. For redacted resources, this
        is the resealed hash, not the original.
      </li>
      <li>
        These two hashes MAY differ. The verifier surfaces both, with their
        roles labelled. A difference is expected behavior, not a failure.
      </li>
    </ul>

    <h2>What is being verified in the public verifier</h2>
    <ul>
      <li>
        The <strong>public artifact's integrity</strong>: the resealed bundle's
        certificateHash, signature, and node receipt are cryptographically
        validated.
      </li>
      <li>
        The <strong>original certificateHash</strong> is preserved as a
        provenance pointer. The verifier does <em>not</em> re-verify the original
        bundle, because the original content is not present.
      </li>
      <li>
        Anyone who holds the original (unredacted) bundle can still verify it
        locally with <code>verifyCer()</code>.
      </li>
    </ul>

    <h2>What provenance preserves</h2>
    <ul>
      <li>The original certificateHash, so the reseal is traceable to its source.</li>
      <li>The reason for redaction (e.g. <code>"public-redaction"</code>).</li>
      <li>A clear bundleType (<code>signed-redacted-reseal</code>) so verifiers do not confuse it with an original.</li>
    </ul>

    <h2>Supplemental signals</h2>
    <p>
      A reseal MAY carry supplemental <code>context.signals</code> that are not
      bound by the new certificateHash. This is reported as{" "}
      <code>VERIFIED (supplemental)</code> and is not a failure. See{" "}
      <Link to="/docs/verification-semantics">Verification Semantics</Link>.
    </p>

    <h2>What this is NOT</h2>
    <ul>
      <li>Not a failure of the original artifact. The original is still valid for any holder.</li>
      <li>Not a hash collision or re-signing of the original. It is a new artifact.</li>
      <li>Not a way to alter execution history. Reseals can only redact, not modify.</li>
    </ul>

    <h2>Related</h2>
    <ul>
      <li><Link to="/docs/verification-semantics">Verification Semantics</Link></li>
      <li><Link to="/docs/verify-nexart">verify.nexart.io</Link></li>
      <li><Link to="/docs/verification-statuses-and-errors">Verification Statuses & Errors</Link></li>
      <li><Link to="/docs/attestation-node">Attestation Node</Link></li>
    </ul>
  </>
);

export default PublicResealsAndRedactedVerification;
