import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# External Verification (no NexArt SDK)
Verify any CER using only:
  - HTTPS client
  - JSON canonicalizer matching the bundle's protocolVersion
      (1.2.0 -> nexart-v1, default; 1.3.0 -> jcs-v1 / RFC 8785, opt-in)
  - SHA-256
  - Ed25519 signature verifier

NOTE: Canonicalization is protocol-bound. RFC 8785 (JCS) is NOT universal.
Use the profile that matches meta.attestation.protocolVersion, or recomputation will fail.

## Steps
1. Fetch the public record:
   GET https://node.nexart.io/v1/cer/public/<certificateHash>
   -> returns the CER bundle JSON (redacted; snapshot.input/output are SHA-256 digests)

2. Fetch the node key set:
   GET https://node.nexart.io/.well-known/nexart-node.json
   -> returns { keys: [ { kid, alg: "Ed25519", publicKeyJwk | publicKeyMultibase, ... } ] }

3. Select canonicalization profile from meta.attestation.protocolVersion:
   "1.2.0" -> nexart-v1 (default)
   "1.3.0" -> jcs-v1    (RFC 8785, opt-in)
   Unknown -> FAIL.

4. Recompute certificateHash (Integrity):
   projection = pick(bundle, [bundleType, version, createdAt, snapshot,
                              context?, contextSummary?, policyEvaluation?])
   bytes      = canonicalize(projection, profile)
   recomputed = "sha256:" + hex(sha256(bytes))
   Assert recomputed == bundle.certificateHash. Else FAIL (Integrity).

5. Verify receipt signature (Authenticity):
   receipt = bundle.meta.attestation.receipt
   key     = keys.find(k => k.kid == receipt.kid)   // FAIL if not found
   payload = canonicalize(receipt.payload, profile)
   Assert Ed25519.verify(key.public, payload, base64url_decode(receipt.signature)).
   Assert receipt.payload.certificateHash == bundle.certificateHash.
   Else FAIL.

6. Verify envelope signature (optional layer, when present):
   env = bundle.meta.verificationEnvelope
   sig = bundle.meta.verificationEnvelopeSignature
   projection = {
     attestation: pick(env.attestation, [attestationId, attestedAt, kid, nodeRuntimeHash, protocolVersion]),
     bundle:      pick(bundle, [bundleType, version, createdAt, snapshot,
                                context?, contextSummary?, policyEvaluation?]),
   }
   bytes = canonicalize(projection, profile)
   Assert Ed25519.verify(key.public, bytes, base64url_decode(sig)).
   If env absent -> SKIPPED. Else FAIL.

Integrity and Authenticity are independent properties. An unsigned bundle MAY still be
verified for integrity (Layer 1 PASS, Layers 2/3 SKIPPED). Authenticity requires BOTH a
valid signature AND the correct public key for the receipt's kid.

Aggregate status: VERIFIED if every applicable layer is PASS, else FAILED.`;

const ExternalVerification = () => (
  <>
    <PageHeader
      title="External Verification"
      summary="Verify any NexArt Certified Execution Record from scratch, without the NexArt SDK or CLI."
      llmBlock={llmBlock}
    />

    <p>
      This guide is for implementers building a verifier in a language NexArt
      does not ship an SDK for, or for auditors who require an independent
      reference implementation. It uses only standard cryptographic primitives:
      SHA-256, Ed25519, and a JSON canonicalizer matching the bundle's{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code>.
    </p>

    <h2 id="prereq">Prerequisites</h2>
    <ul>
      <li>An HTTPS client.</li>
      <li>
        A JSON canonicalizer matching the bundle's{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code>
        (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">nexart-v1</code> for 1.2.0,{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">jcs-v1</code> / RFC 8785 for 1.3.0).
      </li>
      <li>SHA-256.</li>
      <li>An Ed25519 signature verifier.</li>
      <li>
        The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>{" "}
        of the record to verify (format:{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">sha256:&lt;hex&gt;</code>).
      </li>
    </ul>


    <h2 id="step-1">Step 1 — Fetch the Public Record</h2>
    <p>
      The public endpoint returns a redacted CER bundle.{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot.input</code> and{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot.output</code> are
      SHA-256 digests, not raw payloads.
    </p>
    <CodeBlock
      language="bash"
      title="Fetch public CER"
      code={`curl -fsS \\
  "https://node.nexart.io/v1/cer/public/sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069" \\
  -o cer.json`}
    />

    <h2 id="step-2">Step 2 — Fetch the Node Key Set</h2>
    <p>
      The node publishes its current and historical public keys at a stable
      well-known location. Keys are identified by{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code>.
    </p>
    <CodeBlock
      language="bash"
      title="Fetch node public keys"
      code={`curl -fsS https://node.nexart.io/.well-known/nexart-node.json -o node-keys.json`}
    />
    <p className="text-sm text-muted-foreground">
      See{" "}
      <Link to="/docs/security/key-management" className="text-primary hover:underline">
        Key Management
      </Link>{" "}
      for the key set schema and rotation policy.
    </p>

    <h2 id="step-3">Step 3 — Select the Canonicalization Profile</h2>
    <p>
      Read{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
        meta.attestation.protocolVersion
      </code>{" "}
      and select the canonicalization profile. Unknown values MUST fail closed.
    </p>
    <CodeBlock
      language="text"
      code={`"1.2.0" -> profile "nexart-v1" (default, custom canonicalization)
"1.3.0" -> profile "jcs-v1"    (opt-in, RFC 8785 / JCS, standards-based)
other   -> FAILED`}
    />
    <p className="text-sm text-destructive">
      Canonicalization is protocol-bound. Do NOT assume RFC 8785 universally; records produced with
      1.2.0 use <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">nexart-v1</code> and
      will not recompute to the same hash under JCS.
    </p>

    <h2 id="step-4">Step 4 — Recompute certificateHash (Integrity)</h2>
    <p>
      Project the bundle to the hashed whitelist, canonicalize with the profile
      selected in Step 3, and SHA-256. Compare with the bundle's declared{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.
    </p>
    <CodeBlock
      language="text"
      title="Hashed projection (whitelist)"
      code={`bundleType
version
createdAt
snapshot
context           (only when present)
contextSummary    (only when present)
policyEvaluation  (only when present)`}
    />
    <CodeBlock
      language="javascript"
      title="Reference (pseudo-code) — example assumes a 1.3.0 (jcs-v1) bundle"
      code={`import { canonicalize as jcs } from "rfc8785";       // for protocolVersion 1.3.0
import { canonicalize as nexart } from "./nexart-v1";  // for protocolVersion 1.2.0
import { createHash } from "node:crypto";

const cer = JSON.parse(fs.readFileSync("cer.json", "utf8"));
const profile = cer.meta?.attestation?.protocolVersion === "1.3.0" ? jcs
              : cer.meta?.attestation?.protocolVersion === "1.2.0" ? nexart
              : (() => { throw new Error("Unknown protocolVersion — FAILED"); })();

const whitelist = ["bundleType", "version", "createdAt", "snapshot",
                   "context", "contextSummary", "policyEvaluation"];
const projection = Object.fromEntries(
  whitelist.filter(k => cer[k] !== undefined).map(k => [k, cer[k]])
);

const bytes      = profile(projection);
const recomputed = "sha256:" + createHash("sha256").update(bytes).digest("hex");

if (recomputed !== cer.certificateHash) throw new Error("Integrity FAILED");`}
    />

    <h2 id="step-5">Step 5 — Verify the Receipt Signature (Layer 2)</h2>
    <ol>
      <li>
        Locate the receipt at{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          cer.meta.attestation.receipt
        </code>.
      </li>
      <li>
        Resolve the public key from the node key set by{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt.kid</code>.
        If not present, fail closed.
      </li>
      <li>
        Canonicalize{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt.payload</code>{" "}
        using the selected profile and verify the Ed25519 signature against the
        canonicalized bytes.
      </li>
      <li>
        Confirm{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          receipt.payload.certificateHash
        </code>{" "}
        equals{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.certificateHash</code>.
      </li>
    </ol>

    <h2 id="step-6">Step 6 — Verify the Envelope Signature (Layer 3, when present)</h2>
    <p>
      Reconstruct the strict whitelist projection and verify the Ed25519
      signature. If the envelope is absent, report{" "}
      <strong>SKIPPED</strong>; this is not a failure.
    </p>
    <CodeBlock
      language="text"
      title="Envelope signed projection"
      code={`{
  attestation: { attestationId, attestedAt, kid, nodeRuntimeHash, protocolVersion },
  bundle:      { bundleType, version, createdAt, snapshot,
                 context?, contextSummary?, policyEvaluation? }
}`}
    />

    <h2 id="aggregate">Aggregate Status</h2>
    <CodeBlock
      language="text"
      code={`VERIFIED   every applicable layer = PASS
FAILED     any layer = FAIL
NOT_FOUND  the record does not exist on the node`}
    />
    <p>
      An aggregate <strong>VERIFIED</strong> with one or more{" "}
      <strong>SKIPPED</strong> layers is valid and expected for sealed (local)
      bundles and for public, redacted bundles where Layer 3 cannot be
      reconstructed. See{" "}
      <Link to="/docs/verification-statuses-and-errors" className="text-primary hover:underline">
        Verification Statuses and Errors
      </Link>.
    </p>
  </>
);

export default ExternalVerification;
