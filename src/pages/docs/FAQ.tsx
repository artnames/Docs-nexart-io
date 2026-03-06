import PageHeader from "@/components/docs/PageHeader";

const llmBlock = `# NexArt FAQ

## What can NexArt verify?
NexArt verifies bundle integrity, node signature (Ed25519), and receipt consistency. Outcomes: VERIFIED, PARTIAL, INVALID, UNAVAILABLE.

## Signed receipts vs hash-only timestamps?
Signed receipts attest the full CER (snapshot + certificateHash). Hash-only timestamps sign only the certificateHash — no snapshot attestation.

## What does PARTIAL mean?
Some checks pass but attestation scope is limited. Typical for hash-only timestamps and redacted reseals.

## What does a redacted export prove?
A signed-redacted-reseal proves the record existed and was attested, but sensitive fields have been removed. The reseal signature covers the redacted version.

## What is a legacy record?
An older record from an earlier version of the system. May not be fully verifiable.

## Where do verifiers fetch node keys?
node.nexart.io/.well-known/nexart-node.json`;

const FAQ = () => (
  <>
    <PageHeader
      title="FAQ"
      summary="Frequently asked questions about NexArt."
      llmBlock={llmBlock}
    />

    <h2 id="what-is-nexart">What is NexArt?</h2>
    <p>NexArt is an AI execution attestation platform. It creates Certified Execution Records (CERs) — portable, tamper-proof records of AI operations. CERs can be independently verified to prove what ran, when, and that the record is intact.</p>

    <h2 id="what-verify">What can NexArt verify?</h2>
    <p>Verification checks three things: <strong>bundle integrity</strong> (is the CER untampered?), <strong>node signature</strong> (was it signed by a known node using Ed25519?), and <strong>receipt consistency</strong> (does the receipt match the CER?). Results are VERIFIED, PARTIAL, INVALID, or UNAVAILABLE.</p>

    <h2 id="receipts-vs-timestamps">What is the difference between signed receipts and hash-only timestamps?</h2>
    <p>A <strong>signed receipt</strong> attests the full CER including snapshot contents. It verifies as VERIFIED. A <strong>hash-only timestamp</strong> signs only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> — it proves the hash existed at a point in time but does not attest what the hash represents. It verifies as PARTIAL.</p>

    <h2 id="partial">What does PARTIAL mean?</h2>
    <p>A PARTIAL verification result means some checks pass but the attestation scope is limited. This is expected for hash-only timestamps (no snapshot attestation) and redacted reseals (some fields removed). The signature and hash are valid, but the node did not attest the full contents.</p>

    <h2 id="redacted">What does a redacted export prove?</h2>
    <p>A <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signed-redacted-reseal</code> proves the record existed and was originally attested, but sensitive fields have been removed. The attestation node re-signs the redacted version, so the reseal signature covers exactly what is present in the export.</p>

    <h2 id="legacy">What is a legacy record?</h2>
    <p>A legacy record is an older CER from an earlier version of the NexArt system. It may not contain all the fields needed for full verification. Legacy records may verify as PARTIAL or UNAVAILABLE depending on what data is present.</p>

    <h2 id="node-keys">Where do verifiers fetch node keys?</h2>
    <p>Node signing keys are published at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code>. This allows anyone to independently verify Ed25519 signatures without trusting a third party.</p>

    <h2 id="models">Which AI models are supported?</h2>
    <p>NexArt is model-agnostic. It works with any AI model — the model identifier is recorded in the CER but NexArt does not require a specific provider or model type.</p>

    <h2 id="self-hosted">Can I self-host an attestation node?</h2>
    <p>Self-hosted attestation nodes are on the roadmap but not currently available.</p>

    <h2 id="verify-where">Where can I verify a CER?</h2>
    <p>Use the public verifier at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>, or verify independently by checking the Ed25519 signature against the node's published key.</p>
  </>
);

export default FAQ;
