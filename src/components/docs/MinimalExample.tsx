import CodeBlock from "@/components/docs/CodeBlock";

/**
 * Canonical end-to-end example reused across Getting Started, Quickstart, and SDK.
 *
 * Uses the framework-agnostic primitives from @nexart/ai-execution:
 *   Flow A - Certified execution (recommended): certifyAndAttestDecision (async, node).
 *   Flow B - Local-only execution:               certifyDecision         (sync, no network).
 *
 * LangChain-specific adapters (createLangChainCer / certifyLangChainRun) are intentionally
 * NOT used here. They live in @nexart/ai-execution/langchain and are appropriate only when
 * the caller already has data shaped as a LangChain Run / callback payload. For OpenAI,
 * Anthropic, raw HTTP, n8n, custom code, etc., use the primitives below.
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
          <span className="font-medium">Creation</span> is local and deterministic
          (<code className="font-mono text-xs">certifyDecision</code>). It produces a sealed
          bundle and a <code className="font-mono text-xs">certificateHash</code>. No network call.
        </li>
        <li>
          <span className="font-medium">Certification</span> is node-based
          (<code className="font-mono text-xs">certifyAndAttestDecision</code> or{" "}
          <code className="font-mono text-xs">attest(bundle, options)</code>). It returns an
          <code className="font-mono text-xs"> AttestationReceipt</code> and the bundle gains
          a verification envelope.
        </li>
        <li>
          A public verification URL exists ONLY after certification. Construct it as{" "}
          <code className="font-mono text-xs">https://verify.nexart.io/c/&#123;certificateHash&#125;</code>.
        </li>
        <li>
          <code className="font-mono text-xs">prompt</code> and{" "}
          <code className="font-mono text-xs">parameters</code> are REQUIRED fields on{" "}
          <code className="font-mono text-xs">CertifyDecisionParams</code>, alongside{" "}
          <code className="font-mono text-xs">provider</code>,{" "}
          <code className="font-mono text-xs">model</code>,{" "}
          <code className="font-mono text-xs">input</code>, and{" "}
          <code className="font-mono text-xs">output</code>.
        </li>
      </ul>
    </div>

    <CodeBlock
      language="typescript"
      title="Flow A - Certified execution (recommended)"
      code={`import {
  certifyAndAttestDecision,
  verifyAiCerBundleDetailed,
} from "@nexart/ai-execution";

// Steps 1-3: capture execution, seal the CER, attest via the node.
// certifyAndAttestDecision is async because it contacts the attestation node.
const { bundle, receipt } = await certifyAndAttestDecision(
  {
    provider:   "openai",
    model:      "gpt-4o-mini",
    prompt:     "Should this refund be approved?",
    input:      { messages: [{ role: "user", content: "Should this refund be approved?" }] },
    parameters: { temperature: 0, maxTokens: 1024, topP: null, seed: null },
    output:     { decision: "approve", reason: "policy_passed" },
  },
  {
    nodeUrl: process.env.NEXART_NODE_ENDPOINT!,
    apiKey:  process.env.NEXART_API_KEY!,
  },
);

const certificateHash = bundle.certificateHash;
const verificationUrl = \`https://verify.nexart.io/c/\${certificateHash}\`;

console.log(certificateHash);         // sha256:...
console.log(receipt.attestationId);   // node-issued id
console.log(verificationUrl);         // https://verify.nexart.io/c/sha256:...

// Step 4: independent verification. No trust in your infrastructure required.
const report = await verifyAiCerBundleDetailed(bundle);
// report.checks.bundleIntegrity    -> PASS  (Layer 1)
// report.checks.nodeSignature      -> PASS  (Layer 2)
// report.checks.receiptConsistency -> PASS  (Layer 3)
`}
    />

    <CodeBlock
      language="typescript"
      title="Flow B - Local-only execution (no node interaction)"
      code={`import { certifyDecision, verifyAiCerBundleDetailed } from "@nexart/ai-execution";

// certifyDecision is synchronous and deterministic.
// It produces a sealed CER bundle and certificateHash WITHOUT contacting the node.
// There is no receipt, no envelope, and no public verificationUrl in this flow.
const bundle = certifyDecision({
  provider:   "openai",
  model:      "gpt-4o-mini",
  prompt:     "Should this refund be approved?",
  input:      { messages: [{ role: "user", content: "Should this refund be approved?" }] },
  parameters: { temperature: 0, maxTokens: 1024, topP: null, seed: null },
  output:     { decision: "approve", reason: "policy_passed" },
});

const certificateHash = bundle.certificateHash;
console.log(certificateHash);   // sha256:...

// Local verification: Layer 1 PASS, Layers 2 & 3 SKIPPED.
const report = await verifyAiCerBundleDetailed(bundle);

// To obtain a signed receipt and a public verificationUrl, attest the bundle
// via certifyAndAttestDecision(...) or attest(bundle, options).
`}
    />

    <p className="text-xs text-muted-foreground">
      Using LangChain? See the dedicated{" "}
      <a href="/docs/integrations/langchain" className="text-primary hover:underline">
        LangChain integration
      </a>{" "}
      page for the optional adapters{" "}
      <code className="font-mono">createLangChainCer</code> /{" "}
      <code className="font-mono">certifyLangChainRun</code> imported from{" "}
      <code className="font-mono">@nexart/ai-execution/langchain</code>.
    </p>
  </div>
);

export default MinimalExample;
