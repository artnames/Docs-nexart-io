import CodeBlock from "@/components/docs/CodeBlock";

/**
 * Canonical end-to-end example reused across Getting Started, Quickstart, and SDK.
 *
 * Two explicit flows, never merged:
 *   Flow A - Certified execution (recommended): create + attest via node, then verify.
 *   Flow B - Local-only execution: create deterministically, no node interaction.
 *
 * This file is the single source of truth. Do not introduce variations on other pages.
 */
const MinimalExample = () => (
  <div className="not-prose my-6 space-y-6">
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
        How the SDK is split
      </div>
      <ul className="text-sm text-foreground/90 space-y-1 list-disc pl-5">
        <li>
          <span className="font-medium">Creation</span> is local and deterministic. It produces a
          bundle and a <code className="font-mono text-xs">certificateHash</code>. No network call.
        </li>
        <li>
          <span className="font-medium">Certification</span> is node-based. It returns a signed
          receipt, a verification envelope, and a public{" "}
          <code className="font-mono text-xs">verificationUrl</code>.
        </li>
        <li>
          <code className="font-mono text-xs">verificationUrl</code> exists ONLY after
          certification. It is not produced by local creation.
        </li>
      </ul>
    </div>

    <CodeBlock
      language="typescript"
      title="Flow A - Certified execution (recommended)"
      code={`import {
  certifyLangChainRun,
  verifyAiCerBundleDetailed,
} from "@nexart/ai-execution";

// Steps 1-3: capture execution, create the CER, certify via the node.
// certifyLangChainRun is async because it contacts the attestation node.
const { bundle, certificateHash, verificationUrl } = await certifyLangChainRun({
  provider: "openai",
  model: "gpt-4o-mini",
  input:  { messages: [{ role: "user", content: "Should this refund be approved?" }] },
  output: { decision: "approve", reason: "policy_passed" },
  nodeUrl: process.env.NEXART_NODE_URL!,
  apiKey:  process.env.NEXART_API_KEY!,
});

console.log(certificateHash);   // sha256:...
console.log(verificationUrl);   // https://verify.nexart.io/c/{certificateHash}

// Step 4: independent verification. No trust in your infrastructure required.
const report = await verifyAiCerBundleDetailed(bundle);
// report.integrity -> PASS  (Layer 1: certificateHash recomputed from snapshot)
// report.receipt   -> PASS  (Layer 2: node signature over the receipt)
// report.envelope  -> PASS  (Layer 3: envelope signature over the attestation projection)
`}
    />

    <CodeBlock
      language="typescript"
      title="Flow B - Local-only execution (no node interaction)"
      code={`import { createLangChainCer } from "@nexart/ai-execution";

// createLangChainCer is synchronous and deterministic.
// It produces a valid CER bundle and certificateHash WITHOUT contacting the node.
// There is no receipt, no envelope, and no verificationUrl in this flow.
const { bundle, certificateHash } = createLangChainCer({
  provider: "openai",
  model: "gpt-4o-mini",
  input:  { messages: [{ role: "user", content: "Should this refund be approved?" }] },
  output: { decision: "approve", reason: "policy_passed" },
});

console.log(certificateHash);   // sha256:...
// To obtain a signed receipt and a public verificationUrl, submit the bundle
// to the node (see Flow A) or POST it to /v1/cer/ai/certify.
`}
    />
  </div>
);

export default MinimalExample;
