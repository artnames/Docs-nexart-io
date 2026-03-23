import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# @nexart/agent-kit

A thin convenience layer for producing verifiable Certified Execution Records from agent tool calls and decisions.

## Package
@nexart/agent-kit@0.1.1

## Exports
- wrapTool(opts): returns a callable that wraps an async tool function; when invoked, executes it and produces a cer.ai.execution.v1 bundle
- certifyDecision(opts): certifies a final agent decision or workflow outcome as a standard CER bundle

## Built on
- @nexart/ai-execution (CER creation and attestation)
- @nexart/signals (structured context signals)

## Not
- Not an agent framework
- Not orchestration, planning, or memory
- Not a multi-agent runtime

## Verification
Bundles produced by @nexart/agent-kit are standard cer.ai.execution.v1 artifacts. They verify exactly like any other NexArt AI CER. No special verifier is needed.`;

const AgentKit = () => (
  <>
    <PageHeader
      title="Agent Kit"
      summary="A thin convenience layer for producing verifiable execution records from agent tool calls and decisions."
      llmBlock={llmBlock}
    />

    <h2 id="what-it-is">What It Is</h2>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/agent-kit</code> is
      a thin convenience layer for builders who want agent tool calls and final decisions to produce
      tamper-evident, verifiable execution records with minimal integration work.
    </p>
    <p>
      Use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/agent-kit</code> when
      you want agent steps to emit standard NexArt CERs without wiring the lower-level SDKs manually.
    </p>
    <p>It sits on top of two existing packages:</p>
    <ul>
      <li><Link to="/docs/sdk" className="text-primary hover:underline">@nexart/ai-execution</Link> for CER creation and attestation</li>
      <li><Link to="/docs/concepts/context-signals" className="text-primary hover:underline">@nexart/signals</Link> for structured context signals</li>
    </ul>

    <div className="not-prose my-6 rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-sm font-medium text-foreground mb-1">What it is not</div>
      <div className="text-sm text-muted-foreground">
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">@nexart/agent-kit</code> is
        not an agent framework. It does not provide orchestration, planning, memory, or multi-agent
        runtime capabilities. It only handles CER production for agent workflows.
      </div>
    </div>

    <h2 id="installation">Installation</h2>
    <CodeBlock language="bash" code="npm install @nexart/agent-kit" />
    <p className="text-sm text-muted-foreground">Current version: 0.1.1</p>

    <h2 id="exports">Exports</h2>

    <h3 id="wrap-tool">wrapTool()</h3>
    <p>
      Use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">wrapTool()</code> when
      you want an individual tool call to produce its own standard CER.
    </p>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">wrapTool(opts)</code> returns
      a callable. When invoked with arguments, it executes
      the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">run</code> function and
      returns the tool result alongside a
      standard <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.ai.execution.v1</code> bundle.
      Signals and node attestation are optional.
    </p>

    <CodeBlock
      language="typescript"
      title="wrapTool()"
      code={`import { wrapTool } from "@nexart/agent-kit";

const lookupCustomer = wrapTool({
  name: "lookup_customer",
  model: "gpt-4o",
  run: async (input) => {
    // your tool logic
    return { customerId: "cust_123", tier: "enterprise" };
  },
  // optional
  signals: collector.export().signals,
  attestOptions: {
    nodeUrl: "https://your-node.nexart.io",
    apiKey: process.env.NEXART_API_KEY
  }
});

const { result, bundle } = await lookupCustomer({ email: "user@example.com" });

// result = { customerId: "cust_123", tier: "enterprise" }
// bundle = standard cer.ai.execution.v1 bundle`}
    />

    <h3 id="certify-decision">certifyDecision()</h3>
    <p>
      Use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certifyDecision()</code> when
      you want to certify the final decision or outcome of an agent workflow.
    </p>
    <p>It is a thin wrapper over the AI Execution SDK. It supports optional signals and optional node attestation,
      and returns a standard <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.ai.execution.v1</code> bundle.
      It does not change hashing or verification semantics.</p>

    <CodeBlock
      language="typescript"
      title="certifyDecision()"
      code={`import { certifyDecision } from "@nexart/agent-kit";

const { bundle } = await certifyDecision({
  model: "gpt-4o",
  input: { query: "Should we approve this refund?" },
  output: { decision: "approve", reason: "within policy" },
  // optional
  signals: collector.export().signals,
  attestOptions: {
    nodeUrl: "https://your-node.nexart.io",
    apiKey: process.env.NEXART_API_KEY
  }
});`}
    />

    <h2 id="when-to-use">When to Use Which</h2>
    <ul>
      <li>Use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">wrapTool()</code> when you want one CER per tool invocation.</li>
      <li>Use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certifyDecision()</code> when you want one CER for the final decision or workflow outcome.</li>
    </ul>
    <p>Both can be used together in a single workflow. For example, wrap individual tools to certify each step, then certify the final decision separately.</p>

    <h2 id="full-example">Example</h2>
    <CodeBlock
      language="typescript"
      title="Full workflow example"
      code={`import { wrapTool, certifyDecision } from "@nexart/agent-kit";
import { createSignalCollector } from "@nexart/signals";

const collector = createSignalCollector();

// 1. Define and invoke a wrapped tool
const checkPolicy = wrapTool({
  name: "check_policy",
  model: "gpt-4o",
  run: async (input) => ({ eligible: true, policyId: "ret-30d" }),
  signals: collector.export().signals
});

const { result } = await checkPolicy({ orderId: "order_456" });

// 2. Add a signal based on the tool result
collector.add({
  type: "policy.check",
  source: "refund-agent",
  payload: { policyId: result.policyId, result: "pass" }
});

// 3. Certify the final decision
const { bundle } = await certifyDecision({
  model: "gpt-4o",
  input: { orderId: "order_456", policyResult: result },
  output: { decision: "approve_refund" },
  signals: collector.export().signals,
  attestOptions: {
    nodeUrl: "https://your-node.nexart.io",
    apiKey: process.env.NEXART_API_KEY
  }
});`}
    />

    <h2 id="verification">Verification</h2>
    <p>
      Bundles produced by <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/agent-kit</code> are
      standard <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.ai.execution.v1</code> artifacts.
      They verify exactly like any other NexArt AI CER at{" "}
      <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">verify.nexart.io</a>.
      No special verifier is needed.
    </p>

    <h2 id="compatibility">Backward Compatibility</h2>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/agent-kit</code> does
      not change CER hashing, attestation, or verification semantics. It is additive only. Previously
      created CERs continue to verify identically.
    </p>

    <h2 id="related">Related</h2>
    <ul>
      <li><Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link> — the underlying CER creation and attestation API</li>
      <li><Link to="/docs/concepts/context-signals" className="text-primary hover:underline">Context Signals</Link> — structured metadata recorded alongside executions</li>
      <li><Link to="/docs/verification" className="text-primary hover:underline">Verification</Link> — how CER verification works</li>
      <li><Link to="/docs/ai-cer-package-format" className="text-primary hover:underline">AI CER Package Format</Link> — the normative package structure for AI CER artifacts</li>
    </ul>
  </>
);

export default AgentKit;
