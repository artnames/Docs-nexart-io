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
Independent verification proves:
  - INTEGRITY       (the bundle was not altered after sealing)
  - AUTHENTICITY    (a node holding the private key for receipt.kid signed it)
  - SIGNER VALIDITY (the signing key was valid and not revoked at verification time)
It does NOT prove:
  - node-issued timestamp providing ordering, not independent proof of existence
  - completeness of any external workflow
  - inclusion in a public transparency log (none currently enforced)
  - semantic correctness of the underlying AI execution`;

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
      The CLI is a thin wrapper around the four checks defined below. Any
      reimplementation in another language is equivalent, provided it follows
      the same rules. See{" "}
      <Link to="/docs/external-verification" className="text-primary hover:underline">
        External Verification
      </Link>{" "}
      for a reference pseudo-code implementation.
    </p>

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

    <h2 id="fail-closed">5. Fail-Closed Behaviour</h2>
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

    <h2 id="trust-boundaries">6. Trust Boundaries</h2>
    <p>Independent verification of a NexArt CER proves:</p>
    <ul>
      <li>
        <strong>Integrity</strong> — the bundle was not altered after sealing.
      </li>
      <li>
        <strong>Authenticity</strong> — a node holding the private key for{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">receipt.kid</code>{" "}
        signed it.
      </li>
    </ul>
    <p>It does not prove:</p>
    <ul>
      <li>
        <strong>Independent timestamp</strong> —{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestedAt</code>{" "}
        is issued by the node itself; it provides ordering, not third-party
        time-stamping.
      </li>
      <li>
        <strong>Completeness</strong> — the CER attests one execution snapshot,
        not the full surrounding workflow or any external state.
      </li>
      <li>
        <strong>Transparency log inclusion</strong> — NexArt does not currently
        publish a public Merkle log; absence from a public log is not a failure
        and presence cannot be asserted from a CER alone.
      </li>
      <li>
        <strong>Semantic correctness</strong> — verification proves what was
        executed, not whether the result was correct.
      </li>
    </ul>

    <h2 id="reproducibility">7. Reproducibility</h2>
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
  </>
);

export default IndependentVerification;
