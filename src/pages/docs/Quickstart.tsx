import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";
import GoldenPath from "@/components/docs/GoldenPath";
import MentalModel from "@/components/docs/MentalModel";
import MinimalExample from "@/components/docs/MinimalExample";
import CommonMistakes from "@/components/docs/CommonMistakes";
import FailureModes from "@/components/docs/FailureModes";
import CanonicalFlow from "@/components/docs/CanonicalFlow";


const llmBlock = `# Quickstart

NexArt supports two paths. Pick one. Canonical workflow: seal -> verify -> (optional) certify -> verify.

Terminology:
- Sealed   = integrity only. Produced offline by SDK certifyDecision() / sealCer() or CLI 'nexart ai seal'. Layer 1 PASS, Layers 2 & 3 SKIPPED.
- Certified = integrity + node attestation + envelope. Produced via certifyAndAttestDecision() / attest(bundle, options) / POST /v1/cer/ai/certify / 'nexart ai certify'. Layers 1, 2, 3 all PASS.
SKIPPED is not a failure.

## Path A - Single CER (one execution)
npm install @nexart/ai-execution      # SDK 0.16.2
import { certifyDecision, certifyAndAttestDecision, verifyAiCerBundleDetailed } from "@nexart/ai-execution";
1. Create input (provider, model, prompt, input, parameters, output - all required)
2. Seal locally        -> certifyDecision(params) returns a sealed CerAiExecutionBundle (sync)
3. Verify locally      -> verifyAiCerBundleDetailed(bundle) -> Layer 1 PASS, Layers 2/3 SKIPPED
4. (Optional) Certify  -> certifyAndAttestDecision(params, { nodeUrl, apiKey }) returns { bundle, receipt }
5. Verify again        -> Layers 1, 2, 3 all PASS
Public verification URL: https://verify.nexart.io/c/{bundle.certificateHash}

Note: certifyDecision in @nexart/ai-execution is synchronous. certifyDecision in @nexart/agent-kit is async (it dispatches through the workflow runner). They are not interchangeable.

Optional LangChain adapters live in @nexart/ai-execution/langchain (createLangChainCer, certifyLangChainRun). Use only when inputs are already shaped as LangChain Run / callback payloads.

## Path B - Project Bundle (multi-step workflow)
npm install @nexart/agent-kit
import { startWorkflow } from "@nexart/agent-kit";
const w = startWorkflow({ projectTitle });
await w.step("name", async () => {...});
const bundle = w.finish();
Then register the bundle on the node for public verification.

certificateHash is the canonical identity. Always verify by certificateHash, never by executionId.`;

const Quickstart = () => (
  <div className="prose prose-invert max-w-none">
    <DocsMeta
      title="Quickstart"
      description="Install @nexart/ai-execution, create your first Certified Execution Record, and verify it at verify.nexart.io in under 5 minutes."
    />
    <PageHeader
      title="Quickstart"
      summary="Two integration paths: single execution CER, or multi-step Project Bundle. Pick one."
      llmBlock={llmBlock}
    />
    <CanonicalFlow context="This is the fastest correct integration path." />

    <p>
      The fastest path from zero to a verified record. For a broader overview, see{" "}
      <Link to="/docs/getting-started" className="text-primary hover:underline">Getting Started</Link>.
    </p>

    <section className="not-prose my-8">
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
          Verify Your First Execution (2 minutes)
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          Local-first. No API key, no node call, no network access. Seal a CER and verify it
          locally with the SDK.
        </div>

        <div className="mb-4">
          <CodeBlock
            language="bash"
            title="1. Install"
            code={`npm install @nexart/ai-execution`}
          />
        </div>

        <CodeBlock
          language="typescript"
          title="2. seal-and-verify.ts (single file, copy as-is)"
          code={`import {
  certifyDecision,
  verifyAiCerBundleDetailed,
} from "@nexart/ai-execution";

async function main() {
  // Seal locally. Fully offline. certifyDecision is synchronous.
  const bundle = certifyDecision({
    provider:   "openai",
    model:      "gpt-4o-mini",
    prompt:     "Should this refund be approved?",
    input:      { messages: [{ role: "user", content: "Should this refund be approved?" }] },
    parameters: { temperature: 0, maxTokens: 1024, topP: null, seed: null },
    output:     { decision: "approve", reason: "policy_passed" },
  });

  console.log("certificateHash :", bundle.certificateHash);

  // Independent verification of the sealed bundle.
  const report = await verifyAiCerBundleDetailed(bundle);

  console.log("Integrity (Layer 1) :", report.checks.bundleIntegrity);
  console.log("Receipt   (Layer 2) :", report.checks.nodeSignature);
  console.log("Envelope  (Layer 3) :", report.checks.receiptConsistency);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});`}
        />

        <div className="mt-4">
          <CodeBlock
            language="bash"
            title="3. Run"
            code={`npx tsx seal-and-verify.ts`}
          />
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-foreground mb-2">
          Expected output (sealed bundle)
        </div>
        <CodeBlock
          language="text"
          code={`certificateHash : sha256:9f2b1c8e4a7d6f3b0c5e8a1d2f4b6c8e9a0d3f5b7c2e4a6d8f1b3c5e7a9d0f2b
Integrity (Layer 1) : PASS
Receipt   (Layer 2) : SKIPPED
Envelope  (Layer 3) : SKIPPED`}
        />
        <p className="text-sm text-foreground mt-3">
          Local sealing proves integrity. Certification adds an independent node attestation.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          <strong>SKIPPED</strong> for Receipt and Envelope is expected. Those layers only apply
          after a node certifies the bundle. SKIPPED is not a failure.
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-primary/30 bg-primary/5 p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
          Add node certification (optional)
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          Certification is optional. It submits the bundle to the attestation node, which adds an
          Ed25519 receipt and a verification envelope, and returns a public{" "}
          <code className="font-mono">verificationUrl</code>. The{" "}
          <code className="font-mono">certificateHash</code> does not change.
        </div>

        <div className="mb-4">
          <CodeBlock
            language="bash"
            title="1. Configure node access"
            code={`export NEXART_NODE_URL="https://node.nexart.io"
export NEXART_API_KEY="<your-api-key>"`}
          />
        </div>

        <CodeBlock
          language="typescript"
          title="2. certify-and-verify.ts"
          code={`import {
  certifyAndAttestDecision,
  verifyAiCerBundleDetailed,
} from "@nexart/ai-execution";

async function main() {
  // Seal + attest in one node round-trip. certifyAndAttestDecision is async.
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
      nodeUrl: process.env.NEXART_NODE_URL!,
      apiKey:  process.env.NEXART_API_KEY!,
    },
  );

  const certificateHash = bundle.certificateHash;
  const verificationUrl = \`https://verify.nexart.io/c/\${certificateHash}\`;

  console.log("certificateHash :", certificateHash);
  console.log("attestationId   :", receipt.attestationId);
  console.log("verificationUrl :", verificationUrl);

  const report = await verifyAiCerBundleDetailed(bundle);

  console.log("Integrity (Layer 1) :", report.checks.bundleIntegrity);
  console.log("Receipt   (Layer 2) :", report.checks.nodeSignature);
  console.log("Envelope  (Layer 3) :", report.checks.receiptConsistency);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});`}
        />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-foreground mb-2">
          Expected output (certified bundle)
        </div>
        <CodeBlock
          language="text"
          code={`certificateHash : sha256:9f2b1c8e4a7d6f3b0c5e8a1d2f4b6c8e9a0d3f5b7c2e4a6d8f1b3c5e7a9d0f2b
verificationUrl : https://verify.nexart.io/c/sha256:9f2b1c8e4a7d6f3b0c5e8a1d2f4b6c8e9a0d3f5b7c2e4a6d8f1b3c5e7a9d0f2b
Integrity (Layer 1) : PASS
Receipt   (Layer 2) : PASS
Envelope  (Layer 3) : PASS`}
        />
        <p className="text-xs text-muted-foreground mt-2">
          With node certification, all three layers return PASS. The{" "}
          <code className="font-mono">verificationUrl</code> is publicly resolvable at{" "}
          verify.nexart.io.
        </p>
      </div>
    </section>

    <MentalModel />

    <h2>Quick Implementation Flow</h2>
    <p>The four steps every NexArt integration must perform, in order.</p>
    <GoldenPath />

    <h2>Minimal working example</h2>
    <p>The canonical example. Reuse this shape in your own integration.</p>
    <MinimalExample />

    <h2>Choose a Path</h2>
    <ul>
      <li><strong>Path A - Single CER</strong>: certify one execution. The most common starting point.</li>
      <li><strong>Path B - Project Bundle</strong>: certify a multi-step or multi-agent workflow as a single verifiable unit.</li>
    </ul>
    <p>Project Bundles are <strong>not</strong> required for single-execution use cases.</p>

    <h2>Path A: Single CER</h2>

    <p>
      Canonical workflow: <strong>create input → seal locally → verify → (optional) certify → verify again</strong>.
      Sealing is offline and requires no API key. Certification is optional and adds node
      attestation.
    </p>

    <h3>1. Install the SDK</h3>
    <CodeBlock language="bash" code="npm install @nexart/ai-execution" />
    <p className="text-sm text-muted-foreground">Current version: <code>@nexart/ai-execution@0.22.0</code>.</p>

    <h3>2. Seal a CER locally (offline)</h3>
    <CodeBlock
      language="typescript"
      title="Seal a CER locally — no node, no API key"
      code={`import { certifyDecision, verifyAiCerBundleDetailed } from "@nexart/ai-execution";

// certifyDecision (from @nexart/ai-execution) is synchronous.
const bundle = certifyDecision({
  provider:   "openai",
  model:      "gpt-4o-mini",
  prompt:     "Should this report be approved?",
  input:      { messages: [{ role: "user", content: "Should this report be approved?" }] },
  parameters: { temperature: 0, maxTokens: 1024, topP: null, seed: null },
  output:     { decision: "approve", reason: "policy_passed" },
});

console.log(bundle.certificateHash);

// Verify locally
const report = await verifyAiCerBundleDetailed(bundle);
console.log(report.checks.bundleIntegrity);    // PASS
console.log(report.checks.nodeSignature);      // SKIPPED (no attestation yet)
console.log(report.checks.receiptConsistency); // SKIPPED (no envelope yet)`}
    />
    <p>
      A sealed bundle is a fully valid CER. <strong>SKIPPED</strong> for receipt and envelope is
      expected — those layers only apply after node certification.
    </p>

    <h3>3. (Optional) Certify via the node</h3>
    <CodeBlock
      language="typescript"
      title="Add node attestation"
      code={`import { certifyAndAttestDecision, verifyAiCerBundleDetailed } from "@nexart/ai-execution";

const { bundle, receipt } = await certifyAndAttestDecision(
  {
    provider:   "openai",
    model:      "gpt-4o-mini",
    prompt:     "Should this report be approved?",
    input:      { messages: [{ role: "user", content: "Should this report be approved?" }] },
    parameters: { temperature: 0, maxTokens: 1024, topP: null, seed: null },
    output:     { decision: "approve", reason: "policy_passed" },
  },
  {
    nodeUrl: process.env.NEXART_NODE_URL!,
    apiKey:  process.env.NEXART_API_KEY!,
  },
);

const verificationUrl = \`https://verify.nexart.io/c/\${bundle.certificateHash}\`;

const report = await verifyAiCerBundleDetailed(bundle);
console.log(report.checks.bundleIntegrity);    // PASS
console.log(report.checks.nodeSignature);      // PASS
console.log(report.checks.receiptConsistency); // PASS`}
    />
    <p>The <code>certificateHash</code> is identical whether the bundle is sealed or certified for the same input. Certification adds <code>meta.attestation</code> and <code>meta.verificationEnvelope</code>; it does not modify any hashed field.</p>

    <h3>4. Verify publicly</h3>
    <p>
      Open{" "}
      <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>{" "}
      and paste the <code>certificateHash</code>, or open the URL directly:
    </p>
    <CodeBlock language="bash" code="https://verify.nexart.io/c/{certificateHash}" />
    <p>
      Public resolution on <code>verify.nexart.io</code> requires the bundle to have been
      certified (or otherwise registered) by the attestation node. Sealed bundles can still be
      verified locally with the SDK.
    </p>
    <p>The verifier checks Bundle Integrity, Node Signature (if attested), Receipt Consistency, and Verification Envelope.</p>

    <h2>Path B: Project Bundle (Multi-Step Workflow)</h2>

    <h3>1. Install agent-kit</h3>
    <CodeBlock language="bash" code="npm install @nexart/agent-kit" />
    <p className="text-sm text-muted-foreground">Current version: <code>@nexart/agent-kit@0.5.3</code>. Wiring this up with an AI assistant? See the <Link to="/docs/agent-kit-instructions" className="text-primary hover:underline">Agent-Kit Instructions for AI Agents</Link> page.</p>

    <h3>2. Build a workflow</h3>
    <CodeBlock
      language="typescript"
      title="Linear workflow producing a Project Bundle"
      code={`import { startWorkflow } from "@nexart/agent-kit";

const workflow = startWorkflow({ projectTitle: "Refund decision" });

const policy = await workflow.step("Check policy", async () => {
  return { eligible: true, policyId: "ret-30d" };
});

const decision = await workflow.step("Final decision", async () => {
  return { decision: "approve_refund", policy };
});

const bundle = workflow.finish();
console.log(bundle.integrity.projectHash);`}
    />

    <h3>3. Register on the node and verify publicly</h3>
    <p>
      To make the bundle verifiable on <code>verify.nexart.io</code>, register it on the node. See{" "}
      <Link to="/docs/end-to-end-verification" className="text-primary hover:underline">End-to-End Verification</Link> for
      the registration flow and node behavior.
    </p>

    <h2>Important: certificateHash, not executionId</h2>
    <p>
      Always look up and share records by <code>certificateHash</code>. <code>executionId</code> is{" "}
      <strong>not</strong> a unique artifact identifier and must not be used as the primary identity for verification.
    </p>

    <h2>Common mistakes</h2>
    <CommonMistakes />

    <h2>What happens if it fails</h2>
    <FailureModes />

    <h2>Next Steps</h2>
    <ul>
      <li><Link to="/docs/integrations/langchain" className="text-primary hover:underline">LangChain Integration</Link>: certify chain and agent executions</li>
      <li><Link to="/docs/integrations/n8n" className="text-primary hover:underline">n8n Integration</Link>: certify workflow automation results</li>
      <li><Link to="/docs/concepts/project-bundles" className="text-primary hover:underline">Project Bundles</Link>: deeper look at multi-step verification</li>
      <li><Link to="/docs/cli" className="text-primary hover:underline">CLI</Link>: create and verify CERs from the command line</li>
      <li><Link to="/docs/verification" className="text-primary hover:underline">Verification</Link>: deep dive into verification semantics</li>
    </ul>
  </div>
);

export default Quickstart;
