import CodeBlock from "@/components/docs/CodeBlock";

/**
 * "Verify Your First Certified Execution (2 minutes)"
 *
 * One copy-paste script that exercises the full NexArt flow end-to-end using the
 * framework-agnostic primitives:
 *   certifyAndAttestDecision -> verifyAiCerBundleDetailed -> print PASS/FAIL per layer.
 *
 * Used at the top of Getting Started and Quickstart. Single source of truth.
 */
const TestHarness = () => (
  <section className="not-prose my-8">
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
        Verify Your First Certified Execution (2 minutes)
      </div>
      <div className="text-sm text-muted-foreground mb-4">
        Copy this script, set two environment variables, run it. If you see three PASS lines,
        NexArt is working end-to-end. No abstractions, no helpers, no partial snippets.
      </div>

      <div className="mb-4">
        <CodeBlock
          language="bash"
          title="1. Install"
          code={`npm install @nexart/ai-execution
export NEXART_NODE_URL="https://node.nexart.io"
export NEXART_API_KEY="<your-api-key>"`}
        />
      </div>

      <CodeBlock
        language="typescript"
        title="2. test-harness.ts (single file, copy as-is)"
        code={`import {
  certifyAndAttestDecision,
  verifyAiCerBundleDetailed,
} from "@nexart/ai-execution";

async function main() {
  // Seal + attest in one node round-trip.
  const { bundle, receipt } = await certifyAndAttestDecision(
    {
      provider:   "openai",
      model:      "gpt-4o-mini",
      prompt:     "Should this refund be approved?",
      input:      { messages: [{ role: "user", content: "Should this refund be approved?" }] },
      parameters: { temperature: 0 },
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

  // Independent verification of the returned bundle. No trust required.
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
          code={`npx tsx test-harness.ts`}
        />
      </div>
    </div>

    <div className="mt-6 rounded-lg border border-border bg-card p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-foreground mb-2">
        Expected output (success)
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
        Three PASS lines mean the bundle is byte-identical to what the node attested, the receipt
        signature validates against the node key, and the verification envelope binds the
        attestation projection to the bundle.
      </p>
    </div>

    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-foreground mb-2">
          Expected verification result — Sealed bundle (local, offline)
        </div>
        <dl className="text-sm font-mono space-y-1">
          <div className="flex gap-3">
            <dt className="w-24 text-foreground">integrity</dt>
            <dd className="text-foreground">: PASS</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 text-foreground">receipt</dt>
            <dd className="text-muted-foreground">: SKIPPED</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 text-foreground">envelope</dt>
            <dd className="text-muted-foreground">: SKIPPED</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground mt-3">
          Produced by <code className="font-mono">nexart ai seal</code> or the SDK
          <code className="font-mono ml-1">sealCer()</code>. No node call, no API key.
        </p>
      </div>

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
          Expected verification result — Certified bundle (node-attested)
        </div>
        <dl className="text-sm font-mono space-y-1">
          <div className="flex gap-3">
            <dt className="w-24 text-foreground">integrity</dt>
            <dd className="text-foreground">: PASS</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 text-foreground">receipt</dt>
            <dd className="text-foreground">: PASS</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-24 text-foreground">envelope</dt>
            <dd className="text-foreground">: PASS</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground mt-3">
          Produced by <code className="font-mono">nexart ai certify</code> or the SDK
          <code className="font-mono ml-1">certifyAndAttestDecision()</code>. Node returns receipt + envelope.
        </p>
      </div>
    </div>

    <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
      <p className="text-sm text-foreground font-medium">
        If any layer returns FAIL, the integration is incorrect. SKIPPED is expected for local
        (sealed) artifacts and MUST NOT be treated as a failure.
      </p>
    </div>

    <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-destructive mb-2">
        If something fails
      </div>
      <ul className="space-y-3 text-sm">
        <li className="rounded-md border border-border bg-card p-3">
          <div>
            <span className="font-medium text-destructive">Integrity FAIL</span>{" "}
            <span className="text-muted-foreground">(Layer 1)</span>
          </div>
          <div className="text-foreground/90 mt-1">
            Payload mismatch. The recomputed{" "}
            <code className="font-mono text-xs">certificateHash</code> does not match the bundle.
            Cause: the bundle was mutated, re-serialized with a different canonicalization, or the{" "}
            <code className="font-mono text-xs">version</code> field was changed. The bundle MUST
            be persisted byte-for-byte after certification.
          </div>
        </li>
        <li className="rounded-md border border-border bg-card p-3">
          <div>
            <span className="font-medium text-destructive">Receipt FAIL</span>{" "}
            <span className="text-muted-foreground">(Layer 2)</span>
          </div>
          <div className="text-foreground/90 mt-1">
            Node or auth issue. The receipt signature did not validate against the node key.
            Cause: wrong <code className="font-mono text-xs">NEXART_NODE_URL</code>, missing or
            invalid <code className="font-mono text-xs">NEXART_API_KEY</code>, or the node key
            published at <code className="font-mono text-xs">/.well-known/nexart-node.json</code>{" "}
            does not match the receipt <code className="font-mono text-xs">kid</code>.
          </div>
        </li>
        <li className="rounded-md border border-border bg-card p-3">
          <div>
            <span className="font-medium text-destructive">Envelope FAIL</span>{" "}
            <span className="text-muted-foreground">(Layer 3)</span>
          </div>
          <div className="text-foreground/90 mt-1">
            Bundle mutation after attestation. The envelope signature covers a 5-field attestation
            projection (<code className="font-mono text-xs">attestationId</code>,{" "}
            <code className="font-mono text-xs">attestedAt</code>,{" "}
            <code className="font-mono text-xs">kid</code>,{" "}
            <code className="font-mono text-xs">nodeRuntimeHash</code>,{" "}
            <code className="font-mono text-xs">protocolVersion</code>). If any of those fields
            were altered or stripped, the envelope cannot validate. Do not modify{" "}
            <code className="font-mono text-xs">meta.attestation</code> after sealing.
          </div>
        </li>
      </ul>
    </div>
  </section>
);

export default TestHarness;
