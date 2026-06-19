import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const llmBlock = `# Verification Semantics

This page resolves common ambiguities about NexArt verification results.

## certificateHash is the source of truth
certificateHash is the canonical identity of any CER. Always store and resolve
artifacts by certificateHash. executionId is a convenience identifier returned
by the certify API and is NOT a unique artifact identifier.

## Resealed (redacted) artifacts have a NEW hash
The public verifier MAY return a redacted reseal of the original CER. A reseal
is a new bundle (bundleType: signed-redacted-reseal) with:
- a NEW certificateHash covering the redacted content
- a provenance pointer to the ORIGINAL certificateHash (reference only)
- a fresh node signature over the resealed content

Rules:
- The original certificateHash is reference-only in public context.
- The resealed hash is what the public verifier validates.
- Both can coexist; they describe the same execution at different visibility levels.

## Optional context.signals
Signals MAY be inside or outside the certificateHash scope:
- Inside the hash: signals are part of the canonical bundle and any change
  invalidates verification.
- Outside the hash: signals are transported as supplemental metadata. They
  are recorded but their absence or modification does NOT invalidate the
  core certificateHash.

The verifier reports signals scope in the verification report. Treat
"signals outside hash scope" as a supplemental result, not a failure.

## Verification result classes
- VERIFIED                : All applicable checks PASS, no supplemental notes.
- VERIFIED (supplemental) : Core integrity PASS; supplemental context (e.g.
                            unbound signals) is present but not covered by
                            certificateHash. This is NOT a failure.
- FAILED                  : One or more applicable checks FAIL.
- NOT_FOUND               : Artifact not registered on the node.

## Common pitfalls
- Using executionId instead of certificateHash for lookup.
- Sending undefined values that break canonical JSON serialization.
- Assuming all signals are hash-bound.
- Confusing the original certificateHash with the public resealed hash.`;

const VerificationSemantics = () => (
  <>
    <PageHeader
      title="Verification Semantics"
      summary="How to read verification results correctly: identity, reseal behavior, signals scope, and common pitfalls."
      llmBlock={llmBlock}
    />

    <p>
      This page resolves the ambiguities builders most often hit when integrating
      NexArt verification. Read it once before shipping.
    </p>

    <h2 id="canonical-identity">certificateHash Is the Source of Truth</h2>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is the
      canonical identity of any Certified Execution Record. Always store and
      resolve artifacts by{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.
    </p>
    <ul>
      <li>Public verification URL: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">https://verify.nexart.io/c/&#123;certificateHash&#125;</code></li>
      <li>SDK lookup, deduplication, audit trails: keyed on <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code></li>
      <li>For Project Bundles: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code> plays the same role at the bundle level</li>
    </ul>
    <Alert className="my-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>executionId is not a unique artifact identifier</AlertTitle>
      <AlertDescription>
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">executionId</code> is a
        convenience identifier returned by the certify API. It MUST NOT be used as
        the primary key for storage, deduplication, or public verification URLs.
        Use <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">certificateHash</code>.
      </AlertDescription>
    </Alert>

    <h2 id="reseal">Resealed Artifacts Have a New Hash</h2>
    <p>
      The public verifier MAY return a <strong>redacted reseal</strong> instead of
      the original CER. A reseal exists so that artifacts containing sensitive
      metadata can still be publicly verified after redaction.
    </p>
    <p>A reseal is a new bundle:</p>
    <ul>
      <li><strong>bundleType:</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signed-redacted-reseal</code></li>
      <li><strong>NEW certificateHash:</strong> covers the resealed (redacted) content</li>
      <li><strong>Provenance pointer:</strong> references the ORIGINAL <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> (reference only, not validated)</li>
      <li><strong>Fresh node signature:</strong> covers the resealed content</li>
    </ul>

    <CodeBlock
      title="Reseal provenance shape (illustrative)"
      language="json"
      code={`{
  "bundleType": "signed-redacted-reseal",
  "certificateHash": "sha256:<NEW resealed hash>",
  "provenance": {
    "originalCertificateHash": "sha256:<ORIGINAL hash>",
    "reason": "public-redaction",
    "resealedAt": "2026-04-19T10:12:00.000Z"
  },
  "snapshot": { "...redacted snapshot...": true },
  "meta": {
    "attestation": {
      "receipt": { "certificateHash": "sha256:<NEW resealed hash>" },
      "signature": "...",
      "kid": "key_..."
    }
  }
}`}
    />

    <p>Rules to apply when you receive a reseal:</p>
    <ul>
      <li>The <strong>resealed</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is what the verifier validates.</li>
      <li>The <strong>original</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is reference-only in public context. Do not validate against it.</li>
      <li>Both hashes can legitimately coexist. They describe the same execution at different visibility levels.</li>
      <li>If your application stores the original hash, also store the resealed hash returned by the verifier; treat them as a pair.</li>
    </ul>

    <h2 id="signals-scope">Context Signals: Inside vs Outside Hash Scope</h2>
    <p>
      <Link to="/docs/concepts/context-signals" className="text-primary hover:underline">Context signals</Link>{" "}
      MAY be transported either inside or outside the{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> scope:
    </p>
    <ul>
      <li><strong>Inside the hash.</strong> Signals are part of the canonical bundle. Any change invalidates the hash. This is the strongest binding.</li>
      <li><strong>Outside the hash.</strong> Signals are transported as supplemental metadata. They are recorded and visible, but their absence or modification does NOT invalidate <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.</li>
    </ul>
    <p>
      The verification report distinguishes the two. Signals outside the hash
      scope are reported as supplemental, not as a failure. <strong>Do not treat
      "signals outside hash scope" as a verification failure.</strong>
    </p>

    <h2 id="result-classes">Verification Result Classes</h2>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 font-medium border-b border-border">Status</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Meaning</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-3 font-medium border-b border-border">VERIFIED</td>
            <td className="px-4 py-3 border-b border-border">All applicable checks PASS. No supplemental notes.</td>
            <td className="px-4 py-3 border-b border-border">Trust the artifact.</td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-medium border-b border-border">VERIFIED (supplemental)</td>
            <td className="px-4 py-3 border-b border-border">Core integrity PASS. Supplemental context present but outside hash scope (e.g. unbound signals).</td>
            <td className="px-4 py-3 border-b border-border">Trust the artifact. Note that supplemental fields are not cryptographically bound.</td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-medium border-b border-border">FAILED</td>
            <td className="px-4 py-3 border-b border-border">One or more applicable checks FAIL.</td>
            <td className="px-4 py-3 border-b border-border">Do not trust. Inspect the per-pillar report.</td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-medium">NOT_FOUND</td>
            <td className="px-4 py-3">Artifact not registered on the node.</td>
            <td className="px-4 py-3">Register on the node, then re-resolve.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      See <Link to="/docs/concepts/verification-reports" className="text-primary hover:underline">Verification Reports</Link>{" "}
      for the full per-pillar semantics.
    </p>

    <h2 id="pitfalls">Common Pitfalls</h2>
    <ul>
      <li>
        <strong>Using <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">executionId</code> instead of <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> for lookup.</strong>{" "}
        The execution id is API convenience metadata; only certificateHash is the
        canonical identity.
      </li>
      <li>
        <strong>Sending <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">undefined</code> values inside metadata or signals.</strong>{" "}
        Some runtimes drop undefined keys before serialization, others coerce them.
        Either omit the key or use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">null</code> to keep canonical JSON deterministic.
      </li>
      <li>
        <strong>Assuming all signals are hash-bound.</strong> They MAY be supplemental.
        Treat the verifier's "supplemental" status as a normal result.
      </li>
      <li>
        <strong>Confusing the original <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> with the public resealed hash.</strong>{" "}
        Validate against whichever hash the verifier returns. Store both as a pair.
      </li>
      <li>
        <strong>Treating local <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyProjectBundle()</code> as proof of public verifiability.</strong>{" "}
        It only proves integrity. See <Link to="/docs/end-to-end-verification" className="text-primary hover:underline">End-to-End Verification</Link>.
      </li>
    </ul>

    <h2 id="next">Next</h2>
    <ul>
      <li><Link to="/docs/end-to-end-verification" className="text-primary hover:underline">End-to-End Verification</Link>: the full pipeline.</li>
      <li><Link to="/docs/verification" className="text-primary hover:underline">How Verification Works</Link>: per-pillar checks.</li>
      <li><Link to="/docs/attestation-node" className="text-primary hover:underline">Attestation Node</Link>: reseal behavior at the node level.</li>
    </ul>
  </>
);

export default VerificationSemantics;
