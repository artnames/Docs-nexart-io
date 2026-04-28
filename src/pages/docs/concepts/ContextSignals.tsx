import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# Context Signals

Context Signals are optional structured metadata recorded alongside an execution to capture external context (policy checks, environment state, authorization decisions).

## Key Properties
- Optional: signals are not required for CER creation
- Protocol-agnostic: any structured metadata can be recorded
- Scope varies: signals MAY be included in the certificateHash (hash-bound) or recorded as supplemental context (outside hash scope), depending on the artifact and how the CER was produced
- A signal being outside the hash scope does NOT invalidate core artifact integrity

## SDK Usage
import { createSignal, createSignalCollector, certifyDecision } from "@nexart/ai-execution";

## CLI Usage
nexart ai create execution.json --signals-file signals.json

## Verification
- Hash-bound signals: any modification breaks bundleIntegrity (FAIL)
- Supplemental signals: recorded for context. Their absence or modification does NOT cause core verification to fail. The verifier may surface them as supplemental evidence.

## Important
NexArt records signals but does not interpret or enforce them.`;

const ContextSignals = () => (
  <div className="prose prose-invert max-w-none">
    <DocsMeta
      title="Context Signals"
      description="Immutable contextual metadata bound into certificateHash. Capture upstream evidence, decisions, and tool calls into a CER."
    />
    <PageHeader
      title="Context Signals"
      summary="Optional structured metadata recorded alongside an execution. May be hash-bound or supplemental."
      llmBlock={llmBlock}
    />

    <h2>What are Context Signals</h2>
    <p>
      Context Signals are structured metadata recorded alongside an execution to capture external context.
      They let builders attach additional evidence such as policy check results, environment state, or
      authorization decisions to a Certified Execution Record.
    </p>

    <h2>Why They Exist</h2>
    <ul>
      <li>
        <strong>Logs are not verifiable.</strong> Traditional logging systems record events but provide
        no cryptographic proof that the logged data has not been modified.
      </li>
      <li>
        <strong>Governance systems lack structured evidence.</strong> Compliance workflows often depend on
        assertions without machine-readable evidence of what actually happened at execution time.
      </li>
      <li>
        <strong>Signals attach structured evidence to the record.</strong> They become part of the
        verifiable artifact (or are recorded alongside it) so reviewers can inspect what context was
        available when the execution ran.
      </li>
    </ul>

    <h2>Key Properties</h2>
    <ul>
      <li>
        <strong>Optional.</strong> Signals are not required for CER creation. A record without signals
        is fully valid.
      </li>
      <li>
        <strong>Protocol-agnostic.</strong> Any structured metadata can be recorded. The protocol does
        not prescribe specific signal types.
      </li>
      <li>
        <strong>Scope varies.</strong> A signal MAY be included in the{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>{" "}
        (hash-bound) or recorded as supplemental context (outside the hash scope). Which mode applies
        depends on the artifact type and how the CER was produced.
      </li>
      <li>
        <strong>Hash-bound signals are tamper-evident.</strong> Modifying them breaks{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleIntegrity</code>.
      </li>
      <li>
        <strong>Supplemental signals do not block core verification.</strong> Their absence or
        modification does not cause core artifact verification to fail. The verifier may surface them as
        supplemental evidence.
      </li>
    </ul>

    <div className="not-prose my-6 rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-sm font-medium text-foreground mb-1">Hash-bound vs supplemental</div>
      <div className="text-sm text-muted-foreground">
        Both modes are valid. A signal being outside the hash scope does NOT mean core artifact
        integrity has failed. It means that signal is recorded for context, not as part of the
        cryptographic commitment. See{" "}
        <Link to="/docs/verification-semantics" className="text-primary hover:underline">
          Verification Semantics
        </Link>{" "}
        for how this is reflected in verification reports.
      </div>
    </div>

    <h2>Example</h2>
    <p>Create a signal, collect it, and pass it into a certified execution:</p>
    <CodeBlock
      language="typescript"
      title="Creating and attaching signals"
      code={`import {
  createSignal,
  createSignalCollector,
  certifyDecision
} from "@nexart/ai-execution";

const signal = createSignal({
  type: "policy.check",
  source: "compliance-engine",
  payload: {
    policyId: "ret-30d",
    result: "pass"
  }
});

const collector = createSignalCollector();
collector.add(signal);

const result = await certifyDecision({
  provider: "openai",
  model: "gpt-4o-mini",
  input: { messages: [{ role: "user", content: "Approve this request?" }] },
  output: { decision: "approve", reason: "policy_passed" },
  signals: collector.signals(),
  nodeUrl: "https://your-nexart-node.example",
  apiKey: process.env.NEXART_API_KEY
});

console.log(result.certificateHash);`}
    />

    <h2>CLI Usage</h2>
    <p>The NexArt CLI supports attaching signals from a JSON file when creating or certifying a CER:</p>
    <CodeBlock
      language="bash"
      title="Attach signals via CLI"
      code={`npx @nexart/cli@0.7.0 ai create execution.json --signals-file signals.json`}
    />
    <p>Example <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signals.json</code>:</p>
    <CodeBlock
      language="json"
      title="signals.json"
      code={`[
  {
    "type": "policy.check",
    "source": "compliance-engine",
    "payload": {
      "policyId": "ret-30d",
      "result": "pass"
    }
  }
]`}
    />

    <h2>Verification</h2>
    <p>
      How signals affect verification depends on whether they are hash-bound or supplemental:
    </p>
    <ul>
      <li>
        <strong>Hash-bound signals</strong> are part of the data covered by the{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.
        Any modification causes <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleIntegrity</code> to FAIL.
      </li>
      <li>
        <strong>Supplemental signals</strong> are recorded alongside the artifact but outside the hash.
        Their absence or modification does NOT cause core verification to fail. They may be surfaced
        by the verifier as supplemental evidence.
      </li>
    </ul>
    <p>
      Refer to <Link to="/docs/verification-semantics" className="text-primary hover:underline">Verification Semantics</Link> for
      how signal scope is reported in verification results.
    </p>

    <div className="not-prose my-6 rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-sm font-medium text-foreground mb-1">Important</div>
      <div className="text-sm text-muted-foreground">
        NexArt records signals but does not interpret or enforce them. The protocol treats signals as
        opaque metadata. Any semantic meaning or enforcement logic is the responsibility of the
        consuming application.
      </div>
    </div>

    <h2>Next Steps</h2>
    <ul>
      <li>
        <Link to="/docs/signals-sdk" className="text-primary hover:underline">Signals SDK</Link>
        : full <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/signals</code> reference (collector, ExecutionContext, snapshots, builder)
      </li>
      <li>
        <Link to="/docs/concepts/execution-context" className="text-primary hover:underline">Execution Context and Signals</Link>
        : builder API using <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/signals</code> (createContext, ctx.input, ctx.tool, ctx.decision, ctx.output, ctx.wrap)
      </li>
      <li>
        <Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link>
        : API reference for the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signals</code> parameter
      </li>
      <li>
        <Link to="/docs/cli" className="text-primary hover:underline">NexArt CLI</Link>
        : use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">--signals-file</code> from the command line
      </li>
      <li>
        <Link to="/docs/verification-semantics" className="text-primary hover:underline">Verification Semantics</Link>
        : how hash-bound vs supplemental signals are reported
      </li>
      <li>
        <Link to="/docs/concepts/cer" className="text-primary hover:underline">Certified Execution Records</Link>
        : the core record that signals attach to
      </li>
    </ul>
  </div>
);

export default ContextSignals;
