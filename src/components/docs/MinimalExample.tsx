import CodeBlock from "@/components/docs/CodeBlock";

/**
 * Canonical end-to-end example reused across Getting Started, Quickstart, and SDK.
 * One execution -> one CER -> one certification -> one verification.
 * Keep this file as the single source of truth.
 */
const MinimalExample = () => (
  <div className="not-prose my-6">
    <CodeBlock
      language="typescript"
      title="Minimal working example: capture, certify, verify"
      code={`import {
  createLangChainCer,
  verifyAiCerBundleDetailed,
} from "@nexart/ai-execution";

// Step 1 + 2: capture execution and create the CER
const { bundle, certificateHash, verificationUrl } = await createLangChainCer({
  provider: "openai",
  model: "gpt-4o-mini",
  input:  { messages: [{ role: "user", content: "Should this refund be approved?" }] },
  output: { decision: "approve", reason: "policy_passed" },
  // Step 3: certify via the node (one call handles attestation)
  certify: true,
});

console.log(certificateHash);   // sha256:...
console.log(verificationUrl);   // https://verify.nexart.io/c/{certificateHash}

// Step 4: verify independently (no trust in your infrastructure required)
const report = await verifyAiCerBundleDetailed(bundle);
// report.integrity   -> PASS  (Layer 1: certificateHash recomputed from snapshot)
// report.receipt     -> PASS  (Layer 2: node signature over receipt)
// report.envelope    -> PASS  (Layer 3: envelope signature over attestation projection)
`}
    />
  </div>
);

export default MinimalExample;
