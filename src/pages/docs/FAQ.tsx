import PageHeader from "@/components/docs/PageHeader";
import { Link } from "react-router-dom";

const llmBlock = `# NexArt FAQ Summary

## What is NexArt?
NexArt produces Certified Execution Records (CERs), portable, tamper-evident records of AI or deterministic system executions. CERs can be grouped into Project Bundles for multi-step workflows.

## Single CER vs Project Bundle
- Single CER: one execution, one verifiable record. Most common starting point. Project Bundles are NOT required.
- Project Bundle: multiple step CERs grouped into one verifiable unit for multi-step or multi-agent workflows.

## certificateHash vs executionId
- certificateHash: SHA-256 fingerprint of the canonical CER bundle. The canonical identity. Use it for lookup, sharing, and verification.
- executionId: a builder-supplied label. NOT a unique artifact identifier. Do not use it as the primary identity.

## Public verification URL
https://verify.nexart.io/c/{certificateHash}

## Why does it verify locally but not on verify.nexart.io?
Local SDK verification only checks the bundle you hold. Public verification requires the node to know about the record.
- For a single CER: the CER must be attested by the node (use certify).
- For a Project Bundle: the bundle must be REGISTERED on the node.

## Redacted reseals have a different hash
The public verifier may serve a redacted reseal artifact for privacy. The reseal has a NEW certificateHash covering the redacted content, and provenance pointing to the original. The original hash is reference-only in public context. This is by design and does not invalidate the original record.

## How verification works
Three checks: Bundle Integrity, Node Signature, Receipt Consistency.
Each check returns PASS, FAIL, or SKIPPED.
Verification statuses: VERIFIED | FAILED | NOT_FOUND.

## Context Signals
Optional structured metadata. May or may not be inside hash scope depending on artifact and verification context. Signals being outside hash scope does not invalidate core artifact integrity.

## Node key discovery
node.nexart.io/.well-known/nexart-node.json
Use attestorKeyId from the receipt to select the correct key.`;

const FAQ = () => (
  <>
    <PageHeader
      title="FAQ"
      summary="Common questions from builders integrating NexArt."
      llmBlock={llmBlock}
    />

    <h2 id="what-is-nexart">What is NexArt?</h2>
    <p>NexArt produces <strong>Certified Execution Records (CERs)</strong>, portable, tamper-evident records of AI or deterministic system executions. CERs capture what happened, when, and provide cryptographic proof that the record has not been altered. Multiple CERs can be grouped into a <Link to="/docs/concepts/project-bundles" className="text-primary hover:underline">Project Bundle</Link> for multi-step workflows.</p>

    <h2 id="bundles-required">Do I need Project Bundles for every use case?</h2>
    <p>No. Project Bundles are an additional capability, not a replacement for single CER flows. If you certify one execution at a time, a single CER is enough. Use a Project Bundle only when you have multiple steps or agents that should be verified as a single unit.</p>

    <h2 id="single-cer-enough">When is a single CER enough?</h2>
    <ul>
      <li>One LLM call you want to certify</li>
      <li>One automated decision (approve/deny, classify, route)</li>
      <li>One n8n step output you want to attest</li>
      <li>Any execution that stands alone as a verifiable artifact</li>
    </ul>

    <h2 id="when-bundle">When should I use a Project Bundle?</h2>
    <ul>
      <li>Multi-step agent workflows where step ordering and integrity matter</li>
      <li>Multi-agent systems where multiple actors contribute to a single outcome</li>
      <li>Pipelines where the audit unit is the whole workflow, not the individual step</li>
    </ul>
    <p>Each step still produces its own CER. The Project Bundle adds a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code> that covers all step <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> values.</p>

    <h2 id="cert-vs-exec">What is the difference between certificateHash and executionId?</h2>
    <p><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is the SHA-256 fingerprint of the canonical CER bundle. It is the <strong>canonical identity</strong> of the record and must be used for lookup, sharing, and verification.</p>
    <p><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">executionId</code> is a builder-supplied label. It is <strong>not</strong> a unique artifact identifier and must not be used as the primary identity model.</p>

    <h2 id="local-vs-public">Why does something verify locally but not appear on verify.nexart.io?</h2>
    <p>Local SDK verification only checks the bundle you hold. Public verification requires the record to be known to the node:</p>
    <ul>
      <li><strong>Single CER</strong>: the CER must have been attested by the node. Use the certify endpoint, or send a create-only bundle for attestation.</li>
      <li><strong>Project Bundle</strong>: the bundle must be <strong>registered</strong> on the node. Local verification of an unregistered bundle will pass, but the public verifier will return <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NOT_FOUND</code>.</li>
    </ul>
    <p>See <Link to="/docs/end-to-end-verification" className="text-primary hover:underline">End-to-End Verification</Link> for the registration flow.</p>

    <h2 id="reseal-hash">Why can public resealed artifacts have a different hash?</h2>
    <p>For privacy, the public verifier may serve a <strong>redacted reseal</strong>. The reseal removes sensitive fields and is re-signed by the node. Because the content changed, the reseal has a <strong>new</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> covering the redacted contents. Provenance fields point back to the original hash.</p>
    <p>This is intentional. The original record is unchanged. The reseal is a separate artifact suitable for public sharing. See <Link to="/docs/verification-semantics" className="text-primary hover:underline">Verification Semantics</Link> for details.</p>

    <h2 id="what-verify">What can NexArt verify?</h2>
    <p>Three checks: <strong>Bundle Integrity</strong> (the CER bundle hashes are internally consistent), <strong>Node Signature</strong> (the receipt signature is valid against the node's published Ed25519 key), and <strong>Receipt Consistency</strong> (the receipt references the correct <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>). Each check returns <strong>PASS</strong>, <strong>FAIL</strong>, or <strong>SKIPPED</strong>. Verification statuses are <strong>VERIFIED</strong>, <strong>FAILED</strong>, or <strong>NOT_FOUND</strong>, as defined by the <Link to="/docs/cer-protocol" className="text-primary hover:underline">CER Protocol</Link>.</p>

    <h2 id="receipts-vs-timestamps">What is the difference between signed receipts and hash-only timestamps?</h2>
    <p>A <strong>signed receipt</strong> supports full attestation of the CER bundle and can verify as VERIFIED. A <strong>hash-only timestamp</strong> signs only the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. It proves the hash existed at a specific time but does not attest the snapshot contents. Hash-only timestamps verify as <strong>VERIFIED</strong> when the applicable checks pass.</p>

    <h2 id="skipped">What does SKIPPED mean?</h2>
    <p>A SKIPPED check means the check is not applicable to the record. For example, a CER without attestation will have Node Signature and Receipt Consistency checks marked as SKIPPED. This does not indicate failure. The overall status can still be VERIFIED if all applicable checks pass.</p>

    <h2 id="signals-scope">Are Context Signals always part of the certificateHash?</h2>
    <p>Not always. Signals are optional. They MAY be inside the hash scope (tamper-evident as part of the certified record) or supplemental (recorded alongside the artifact but outside the hash). A signal being outside the hash scope does not invalidate core artifact integrity. See <Link to="/docs/concepts/context-signals" className="text-primary hover:underline">Context Signals</Link> and <Link to="/docs/verification-semantics" className="text-primary hover:underline">Verification Semantics</Link>.</p>

    <h2 id="redacted">What does a redacted export prove?</h2>
    <p>A redacted export contains a limited view of the original record with sensitive fields removed. A <strong>redacted reseal</strong> is signed again by the attestation node so the shared version remains verifiable. The signature covers exactly what is present in the exported record. The original full bundle is not recoverable from the redacted version.</p>

    <h2 id="legacy">What is a legacy record?</h2>
    <p>A legacy record is a historical record format that may lack full attestation data, a complete bundle structure, or a signed receipt. Legacy records may verify as <strong>VERIFIED</strong> or <strong>FAILED</strong> depending on available data.</p>

    <h2 id="store-data">Does NexArt always store the full original content?</h2>
    <p>Not always. Records may be full, redacted, hash-only, or legacy depending on the source and export path. Some records contain complete snapshot data, others contain only hashes, and redacted exports have sensitive fields removed. The record's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType</code> indicates what kind of data is present.</p>

    <h2 id="node-keys">Where do verifiers fetch node keys?</h2>
    <p>Node signing keys are published at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code>. Verifiers use the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestorKeyId</code> from the receipt to select the correct key for Ed25519 signature verification.</p>

    <h2 id="models">Which AI models are supported?</h2>
    <p>NexArt does not depend on a specific AI provider. Model identifiers can be recorded in CER metadata. NexArt can be used with many AI systems as long as valid execution records are produced.</p>

    <h2 id="self-hosted">Can I self-host an attestation node?</h2>
    <p>Self-hosted attestation nodes are on the roadmap but not currently available.</p>

    <h2 id="verify-where">Where can I verify a CER?</h2>
    <p>Public verification is available at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">https://verify.nexart.io/c/{`{certificateHash}`}</code>. Independent verification can also be performed locally using the CER bundle, signed receipt, and node keys from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code>.</p>

    <h2 id="see-also">See also</h2>
    <ul>
      <li><Link to="/docs/project-bundle-registration">Project Bundle Registration</Link> - how to make a bundle publicly verifiable.</li>
      <li><Link to="/docs/verification-statuses-and-errors">Verification Statuses & Errors</Link> - troubleshooting cheatsheet.</li>
      <li><Link to="/docs/multi-step-and-multi-agent-workflows">Multi-step & Multi-agent Workflows</Link> - applying NexArt to agents.</li>
      <li><Link to="/docs/public-reseals-and-redacted-verification">Public Reseals & Redacted Verification</Link> - why public hashes can differ.</li>
    </ul>
  </>
);

export default FAQ;
