import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# Independent Verification of a NexArt CER
A NexArt Certified Execution Record (CER) MAY be verified WITHOUT any NexArt
runtime, SDK, or hosted service. The only requirements are:
  - the CER bundle (JSON)
  - the issuing node's public key set
  - a SHA-256 implementation
  - an Ed25519 signature verifier
  - a JSON canonicalizer matching the bundle's protocolVersion

## Canonicalization profile (protocolVersion -> profile)
"1.2.0" -> nexart-v1   (DEFAULT, custom canonicalization)
"1.3.0" -> jcs-v1      (RFC 8785, opt-in, standards-based)
unknown -> FAIL (fail-closed; no fallback, no coercion)

## Steps
1. Fetch the record:
   curl "https://node.nexart.io/v1/cer/public?certificate_hash=<hash>" > record.json
2. Fetch the node key set:
   curl "https://node.nexart.io/.well-known/nexart-node.json"        > keys.json
3. Verify:
   npx @nexart/cli verify-bundle record.json --public-key keys.json
   The verifier MUST also resolve receipt.kid against the node key set,
   enforce key lifecycle (validity window, revocation status), and fail
   closed on unknown or invalid keys.

## What the verifier does
A. Reads snapshot.protocolVersion (source of truth) and selects the canonicalization
   profile. MUST assert meta.attestation.protocolVersion == snapshot.protocolVersion;
   mismatch -> FAIL.
B. Recomputes certificateHash:
     projection = pick(bundle, [bundleType, version, createdAt, snapshot,
                                context?, contextSummary?, policyEvaluation?])
     recomputed = "sha256:" + hex(sha256(canonicalize(projection, profile)))
   Assert recomputed == bundle.certificateHash.
C. Verifies the Ed25519 signature over the canonicalized receipt payload
   (meta.attestation.receipt.payload) using meta.attestation.receiptSignature and
   the node public key matched by receipt.kid. Asserts
   payload.certificateHash == bundle.certificateHash.
D. Validates signer key lifecycle:
     - resolves receipt.kid against published keys
     - enforces validFrom / validTo window
     - rejects revoked keys
     - rejects unknown key identifiers
E. (Optional) Verifies the Ed25519 signature on the verificationEnvelope when
   present. The envelope signature is independent from the receipt signature.

## Signer model and key lifecycle
The signer is independent of the execution system. The node acts as an
attestation authority and signs the receipt over the certificateHash.
Each published key carries: kid, algorithm, status (active|deprecated|revoked),
validFrom, validTo (optional), publicKey, publicKeyJwk, publicKeySpkiB64.
No fallback key resolution is allowed.

## Data model
snapshot              - execution data (or SHA-256 digests when public/redacted)
certificateHash       - integrity anchor over the whitelist projection
meta.attestation      - node attestation: receipt, kid, attestedAt, protocolVersion
verificationEnvelope  - additional signed metadata layer (optional)

## Fail-closed rules
Unknown protocolVersion -> FAIL
Hash mismatch           -> FAIL
Missing kid in key set  -> FAIL
Key revoked             -> FAIL
Key outside validity    -> FAIL
Invalid signature       -> FAIL
No fallback. No coercion. No silent downgrade.

## Trust boundaries
NexArt proves:
  - what executed              (the canonical snapshot)
  - that it was not modified   (SHA-256 integrity)
  - when it existed            (only if an RFC 3161 TSA token is present and verifies)
NexArt does NOT prove:
  - correctness of output
  - legal validity
  - identity authenticity (identity fields are claims, not independently verifiable yet)
  - completeness of any external workflow
  - inclusion in a public transparency log (none currently enforced)

## Trusted timestamps (RFC 3161, node v0.18.1+)
External RFC 3161 timestamps are obtained from a third-party TSA (default FreeTSA)
and bound to certificateHash via the message imprint. The TSA token is:
  - stored alongside the bundle
  - NOT in certificateHash
  - NOT in the signed receipt payload
  - NOT part of canonicalization (nexart-v1 or jcs-v1 / RFC 8785)
Time anchoring is an OPTIONAL third verification layer. Base verification
(integrity + attestation) does not depend on the TSA. TSA failure does NOT
invalidate the CER.

## Timestamp types
Node-issued (attestedAt)     - deterministic, ordering only, always available
RFC 3161 (external)          - non-deterministic, proves existence in time,
                               requires trusted TSA roots

## Versioning
"1.3.0" - DEFAULT for new CERs; jcs-v1 (RFC 8785) required
"1.2.0" - supported for backward compatibility; nexart-v1 custom profile
other   - FAIL

## CLI verification
The NexArt CLI verifier supports:
  - bundle integrity
  - signature verification (with signer key lifecycle)
  - (soon) RFC 3161 TSA token verification`;

const IndependentVerification = () => (
  <>
    <DocsMeta
      title="Independent Verification"
      description="Verify any NexArt CER without NexArt SDKs using only the bundle, the node public keys, SHA-256, and Ed25519."
    />
    <PageHeader
      title="Independent Verification"
      summary="Reproduce the full verification of a NexArt CER using only the bundle, the node's public keys, SHA-256, Ed25519, and a protocol-matched JSON canonicalizer. No NexArt runtime required."
      llmBlock={llmBlock}
    />

    <h2 id="overview">1. Overview</h2>
    <p>
      A NexArt Certified Execution Record (CER) is a self-contained
      cryptographic artifact. Any party in possession of the bundle and the
      issuing node's public key set can verify it independently. The NexArt
      infrastructure is not in the trust path.
    </p>
    <p>The verifier requires only:</p>
    <ul>
      <li>the CER bundle (JSON);</li>
      <li>the issuing node's public key set;</li>
      <li>SHA-256;</li>
      <li>an Ed25519 signature verifier;</li>
      <li>
        a JSON canonicalizer matching the bundle's{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion</code>{" "}
        (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">nexart-v1</code> for
        1.2.0; <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">jcs-v1</code> /
        RFC 8785 for 1.3.0).
      </li>
    </ul>
    <p>
      No NexArt runtime or SDK is required for verification. The record and
      public keys can be obtained once and verified offline.
    </p>

    <h2 id="steps">2. Verification Steps</h2>

    <h3 id="step-1">Step 1 — Fetch the record</h3>
    <CodeBlock
      language="bash"
      title="Fetch the public CER bundle"
      code={`curl -fsS "https://node.nexart.io/v1/cer/public?certificate_hash=<hash>" > record.json`}
    />

    <h3 id="step-2">Step 2 — Fetch the node public keys</h3>
    <CodeBlock
      language="bash"
      title="Fetch the node key set"
      code={`curl -fsS "https://node.nexart.io/.well-known/nexart-node.json" > keys.json`}
    />
    <p className="text-sm text-muted-foreground">
      See <Link to="/docs/security/key-management" className="text-primary hover:underline">Key Management</Link> for the
      key set schema, <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">kid</code> resolution, and rotation policy.
    </p>

    <h3 id="step-3">Step 3 — Verify locally</h3>
    <CodeBlock
      language="bash"
      title="Verify using the NexArt CLI"
      code={`npx @nexart/cli verify-bundle record.json --public-key keys.json`}
    />
    <p>
      The CLI is a thin wrapper around the checks defined below. Any
      reimplementation in another language is equivalent, provided it follows
      the same rules. See{" "}
      <Link to="/docs/external-verification" className="text-primary hover:underline">
        External Verification
      </Link>{" "}
      for a reference pseudo-code implementation.
    </p>
    <p>The verifier must also:</p>
    <ul>
      <li>
        Resolve{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt.kid</code>{" "}
        against the node key set;
      </li>
      <li>Enforce key lifecycle (validity window, revocation status);</li>
      <li>Fail closed on unknown or invalid keys.</li>
    </ul>

    <h2 id="what-the-verifier-does">3. What the Verifier Does</h2>
    <ol>
      <li>
        <strong>Selects the canonicalization profile</strong> from{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          snapshot.protocolVersion
        </code>{" "}
        (the source of truth). The verifier MUST also assert that{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          meta.attestation.protocolVersion
        </code>{" "}
        equals{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          snapshot.protocolVersion
        </code>; any mismatch fails closed. Anchoring on the attestation alone
        would mean trusting the signer instead of verifying the record.
      </li>
    </ol>
    <CodeBlock
      language="text"
      code={`"1.2.0" -> profile "nexart-v1" (DEFAULT, custom canonicalization)
"1.3.0" -> profile "jcs-v1"    (opt-in, RFC 8785 / JCS)
other   -> FAIL`}
    />
    <p className="text-sm text-destructive">
      Canonicalization is protocol-bound. RFC 8785 is not universal. A 1.2.0
      bundle canonicalized under <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">jcs-v1</code>{" "}
      (or vice versa) will not recompute to the same hash.
    </p>
    <ol start={2}>
      <li>
        <strong>Recomputes the SHA-256 over the whitelist projection</strong>{" "}
        and compares with{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundle.certificateHash</code>.
        The canonicalized byte sequence must be identical: any variation in
        field order, encoding, or whitespace produces a different hash.
      </li>
    </ol>
    <CodeBlock
      language="text"
      title="Whitelist projection (fields covered by certificateHash)"
      code={`bundleType
version
createdAt
snapshot
context           (only when present)
contextSummary    (only when present)
policyEvaluation  (only when present)`}
    />
    <ol start={3}>
      <li>
        <strong>Verifies the Ed25519 signature</strong> over the canonicalized{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          meta.attestation.receipt.payload
        </code>{" "}
        using{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          meta.attestation.receiptSignature
        </code>{" "}
        and the public key whose{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code>{" "}
        matches{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt.kid</code>,
        and confirms{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          receipt.payload.certificateHash == bundle.certificateHash
        </code>.
      </li>
      <li>
        <strong>Validates signer key lifecycle.</strong> Resolves{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt.kid</code>{" "}
        against the published key set, enforces the{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">validFrom</code> /{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">validTo</code>{" "}
        window, rejects revoked keys, and rejects unknown key identifiers.
      </li>
      <li>
        <strong>(Optional)</strong> Verifies the Ed25519 signature on the
        verification envelope when present. The envelope signature is
        independent from the receipt signature and covers a different field
        set. If the envelope is absent, the layer is{" "}
        <strong>SKIPPED</strong>, not failed.
      </li>
    </ol>

    <h2 id="data-model">4. Data Model</h2>
    <ul>
      <li>
        <strong>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot</code>
        </strong>{" "}
        — the execution data. On public/redacted bundles,{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">snapshot.input</code>{" "}
        and{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">snapshot.output</code>{" "}
        are SHA-256 digests rather than raw payloads.
      </li>
      <li>
        <strong>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>
        </strong>{" "}
        — the integrity anchor; a SHA-256 over the canonicalized whitelist
        projection, formatted as{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">sha256:&lt;hex&gt;</code>.
      </li>
      <li>
        <strong>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
            meta.attestation.receipt
          </code>
        </strong>{" "}
        — the node attestation: an Ed25519-signed payload that binds{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">certificateHash</code>,{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">attestedAt</code>,{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">kid</code>, and{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">protocolVersion</code>.
      </li>
      <li>
        <strong>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
            meta.verificationEnvelope
          </code>
        </strong>{" "}
        — an optional signed metadata layer combining attestation fields with
        the bundle whitelist projection, signed independently from the receipt.
      </li>
    </ul>

    <h2 id="signer-model">5. Signer Model and Key Lifecycle</h2>
    <p>
      A NexArt CER is signed by an attestation node using an Ed25519 key. The
      node publishes its public key set at{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
        https://node.nexart.io/.well-known/nexart-node.json
      </code>.
    </p>
    <p>Each key includes:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> — key identifier;</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">algorithm</code> — signing algorithm (Ed25519);</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">status</code> — <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">active</code> | <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">deprecated</code> | <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">revoked</code>;</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">validFrom</code> — start of validity window;</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">validTo</code> — end of validity window (if present);</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">publicKey</code> — raw base64url key;</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">publicKeyJwk</code> — JWK representation;</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">publicKeySpkiB64</code> — SPKI representation.</li>
    </ul>
    <p>Verification MUST enforce key lifecycle:</p>
    <ul>
      <li>
        The{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt.kid</code>{" "}
        must exist in the published key set;
      </li>
      <li>The key must not be revoked;</li>
      <li>
        The verification timestamp must be within{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">[validFrom, validTo]</code>{" "}
        (if <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">validTo</code> is present);
      </li>
      <li>Unknown or invalid keys MUST fail verification.</li>
    </ul>
    <p>No fallback key resolution is allowed.</p>
    <p>
      The signer is independent of the execution system. The node acts as an
      attestation authority and signs the receipt over the{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.
    </p>

    <h2 id="fail-closed">6. Fail-Closed Behaviour</h2>
    <p>
      Every check fails closed. There is no fallback, no coercion, and no
      silent downgrade.
    </p>
    <CodeBlock
      language="text"
      code={`Unknown / missing snapshot.protocolVersion                     -> FAIL
meta.attestation.protocolVersion != snapshot.protocolVersion   -> FAIL
Canonicalization profile mismatch                              -> FAIL (hash will not match)
Recomputed certificateHash != bundle value                     -> FAIL
receipt.kid not in published key set                           -> FAIL
Unknown key identifier (receipt.kid not found)                 -> FAIL
Key revoked                                                    -> FAIL
Key outside validity window                                    -> FAIL
Invalid Ed25519 signature on receipt                           -> FAIL
receipt.payload.certificateHash != bundle hash                 -> FAIL
Invalid Ed25519 signature on envelope (if present)             -> FAIL`}
    />
    <p>
      See{" "}
      <Link to="/docs/verification-statuses-and-errors" className="text-primary hover:underline">
        Verification Statuses and Errors
      </Link>{" "}
      for the full status table.
    </p>

    <h2 id="trust-boundaries">7. Trust Boundaries</h2>
    <p>Independent verification of a NexArt CER proves:</p>
    <ul>
      <li>
        <strong>Integrity</strong> — the bundle was not altered after sealing.
      </li>
      <li>
        <strong>Authenticity</strong> — a node holding the private key
        corresponding to{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt.kid</code>{" "}
        signed the record.
      </li>
      <li>
        <strong>Signer validity</strong> — the signing key was valid and not
        revoked at verification time.
      </li>
    </ul>
    <p>It does not prove:</p>
    <ul>
      <li>
        <strong>Independent timestamp</strong> —{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestedAt</code>{" "}
        is a node-issued timestamp providing ordering, not independent proof
        of existence.
      </li>
      <li>
        <strong>Completeness</strong> — only the recorded execution is
        attested; the surrounding workflow and external state are not.
      </li>
      <li>
        <strong>Transparency log inclusion</strong> — no public append-only log
        is currently enforced.
      </li>
      <li>
        <strong>Semantic correctness</strong> — verification proves what
        executed, not whether it was correct.
      </li>
    </ul>

    <h2 id="reproducibility">8. Reproducibility</h2>
    <p>
      Every operation specified on this page is deterministic and uses only
      standard cryptographic primitives. A developer can implement an
      independent verifier in any language from this page alone; see{" "}
      <Link to="/docs/external-verification" className="text-primary hover:underline">
        External Verification
      </Link>{" "}
      for a worked reference and{" "}
      <Link to="/docs/verification-model" className="text-primary hover:underline">
        Verification Model
      </Link>{" "}
      for the normative rules.
    </p>

    <h2 id="trusted-timestamps">9. Trusted Timestamps (RFC 3161)</h2>
    <p>
      As of node v0.18.1, NexArt supports external <strong>RFC 3161</strong>{" "}
      timestamps in addition to the node-issued timestamp. External timestamps
      are obtained from a third-party Time Stamp Authority (TSA). The current
      default TSA is{" "}
      <a href="https://freetsa.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FreeTSA</a>.
    </p>
    <p>
      The timestamp is cryptographically bound to the{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>{" "}
      via the RFC 3161 <em>message imprint</em>. The TSA token is:
    </p>
    <ul>
      <li>stored and returned alongside the bundle in the certify response;</li>
      <li><strong>NOT</strong> included in the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>;</li>
      <li><strong>NOT</strong> part of the signed receipt payload;</li>
      <li><strong>NOT</strong> part of canonicalization (neither <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">nexart-v1</code> nor <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">jcs-v1</code> / RFC 8785).</li>
    </ul>
    <p>
      This preserves determinism, reproducibility, and backward compatibility.
      External timestamps are an <strong>additive</strong> verification layer,
      not part of the signed record. A verifier that does not implement RFC
      3161 still produces the same integrity and authenticity result.
    </p>

    <h3 id="verification-layers">9.1 Verification layers</h3>
    <p>Independent verification is composed of three layers:</p>
    <ol>
      <li><strong>Integrity</strong> — recompute SHA-256 over the canonicalized whitelist projection (sections 3 and 4).</li>
      <li><strong>Attestation</strong> — verify the Ed25519 signature on the receipt and validate the signer key lifecycle (section 5).</li>
      <li><strong>Time anchoring (optional)</strong> — verify the RFC 3161 TSA token against trusted TSA roots and confirm the message imprint equals the bundle <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.</li>
    </ol>
    <p>
      Base verification (Layers 1 and 2) does <strong>not</strong> depend on
      the TSA. Layer 3 is optional and additive. Failure to verify the TSA
      token does <strong>not</strong> invalidate the CER; it only means the
      external time anchor could not be confirmed.
    </p>

    <h3 id="timestamp-types">9.2 Timestamp types</h3>
    <ul>
      <li>
        <strong>Node-issued</strong> (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestedAt</code>) —
        deterministic, always available, proves ordering only. Not independent proof of existence.
      </li>
      <li>
        <strong>RFC 3161 (external)</strong> — non-deterministic, proves
        existence in time via a third party, requires the verifier to maintain
        a set of trusted TSA roots.
      </li>
    </ul>

    <h2 id="what-proves">10. What NexArt Proves vs Does Not Prove</h2>
    <p>NexArt proves:</p>
    <ul>
      <li><strong>what executed</strong> — the canonical snapshot;</li>
      <li><strong>that it was not modified</strong> — integrity via SHA-256;</li>
      <li><strong>when it existed</strong> — only if an RFC 3161 TSA token is present and verifies against trusted roots.</li>
    </ul>
    <p>NexArt does NOT prove:</p>
    <ul>
      <li><strong>correctness of output</strong> — verification is not validation;</li>
      <li><strong>legal validity</strong> — no jurisdictional claims are made;</li>
      <li>
        <strong>identity authenticity</strong> — identity fields are claims
        captured at execution time, not independently verifiable (see{" "}
        <Link to="/docs/concepts/cer#identity-binding" className="text-primary hover:underline">Identity Binding</Link>).
      </li>
    </ul>

    <h2 id="versioning">11. Versioning</h2>
    <ul>
      <li>
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion: "1.3.0"</code>{" "}
        is the <strong>default</strong> for all new CERs. RFC 8785 JCS
        (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">jcs-v1</code>) is required for canonicalization.
      </li>
      <li>
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">protocolVersion: "1.2.0"</code>{" "}
        remains supported for backward compatibility and uses the{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">nexart-v1</code> custom canonicalization profile.
      </li>
      <li>Any other value MUST fail closed.</li>
    </ul>

    <h2 id="cli-verification">12. CLI Verification</h2>
    <p>The NexArt CLI verifier supports:</p>
    <ul>
      <li>bundle integrity (Layer 1);</li>
      <li>signature verification, including signer key lifecycle (Layer 2);</li>
      <li><strong>(soon)</strong> RFC 3161 TSA token verification (Layer 3).</li>
    </ul>
    <p>
      Until TSA verification ships in the CLI, Layer 3 can be verified
      out-of-band using any RFC 3161-compatible tool (for example{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">openssl ts -verify</code>)
      against the stored TSA token and the bundle{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">certificateHash</code>{" "}
      as the message imprint.
    </p>
  </>
);

export default IndependentVerification;
