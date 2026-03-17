import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# Context Signals

Context Signals are structured metadata recorded alongside an execution to capture external context.

## Key Properties
- Optional: signals are not required for CER creation
- Protocol-agnostic: any structured metadata can be recorded
- Immutable once certified: signals become part of the certificate hash
- Hash-included: signals are included in the certificateHash computation

## SDK Usage
import { createSignal, createSignalCollector, certifyDecision } from "@nexart/ai-execution";
const signal = createSignal({ type: "policy.check", source: "compliance-engine", payload: { policyId: "ret-30d", result: "pass" } });
const collector = createSignalCollector();
collector.add(signal);
const result = await certifyDecision({ ..., signals: collector.signals() });

## CLI Usage
nexart ai create execution.json --signals-file signals.json

## Verification
Signals are included in the certificate hash. If any signal is modified after certification, the hash will not match and verification will fail.

## Important
NexArt records signals but does not interpret or enforce them.`;

const ContextSignals = () => (
  <div className="prose prose-invert max-w-none">
    <PageHeader
      title="Context Signals"
      summary="Structured metadata recorded alongside an execution to capture external context."
      llmBlock={llmBlock}
    />

    <h2>What are Context Signals</h2>
    <p>
      Context Signals are structured metadata recorded alongside an execution to capture
      external context. They allow builders to attach additional evidence — such as policy
      check results, environment state, or authorization decisions — directly to a Certified
      Execution Record.
    </p>

    <h2>Why They Exist</h2>
    <ul>
      <li>
        <strong>Logs are not verifiable.</strong> Traditional logging systems record events but
        provide no cryptographic proof that the logged data has not been modified.
      </li>
      <li>
        <strong>Governance systems lack proof.</strong> Compliance workflows often depend on
        assertions without evidence that specific checks actually occurred at execution time.
      </li>
      <li>
        <strong>Signals provide cryptographic evidence.</strong> By including structured metadata
        in the certificate hash, Context Signals become tamper-evident and independently verifiable.
      </li>
    </ul>

    <h2>Key Properties</h2>
    <ul>
      <li>
        <strong>Optional.</strong> Signals are not required for CER creation. A record without
        signals is valid.
      </li>
      <li>
        <strong>Protocol-agnostic.</strong> Any structured metadata can be recorded as a signal.
        The protocol does not prescribe specific signal types.
      </li>
      <li>
        <strong>Immutable once certified.</strong> Once a CER is created, the signals included
        in it cannot be changed without invalidating the certificate hash.
      </li>
      <li>
        <strong>Included in certificate hash.</strong> Signals are part of the data used to
        compute the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.
        Any modification to a signal after certification will cause verification to fail.
      </li>
    </ul>

    <h2>Example</h2>
    <p>
      Create a signal, collect it, and pass it into a certified execution:
    </p>
    <CodeBlock
      language="typescript"
      title="Creating and attaching signals"
      code={`import {
  createSignal,
  createSignalCollector,
  certifyDecision
} from "@nexart/ai-execution";

// Create a signal capturing a policy check result
const signal = createSignal({
  type: "policy.check",
  source: "compliance-engine",
  payload: {
    policyId: "ret-30d",
    result: "pass"
  }
});

// Collect signals for the execution
const collector = createSignalCollector();
collector.add(signal);

// Certify a decision with attached signals
const result = await certifyDecision({
  provider: "openai",
  model: "gpt-4o-mini",
  input: { messages: [{ role: "user", content: "Approve this request?" }] },
  output: { decision: "approve", reason: "policy_passed" },
  signals: collector.signals(),
  nodeUrl: "https://your-nexart-node.example",
  apiKey: process.env.NEXART_API_KEY
});

console.log(result.certificateHash);
// The certificateHash now includes the signal data`}
    />

    <h2>CLI Usage</h2>
    <p>
      The NexArt CLI supports attaching signals from a JSON file when creating or certifying a CER:
    </p>
    <CodeBlock
      language="bash"
      title="Attach signals via CLI"
      code={`nexart ai create execution.json --signals-file signals.json`}
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
      Signals are included in the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> computation.
      If any signal is modified after certification, the hash will not match and bundle integrity
      verification will fail. This makes signals part of the same tamper-evidence chain as the
      execution inputs and outputs.
    </p>

    <div className="not-prose my-6 rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-sm font-medium text-foreground mb-1">Important</div>
      <div className="text-sm text-muted-foreground">
        NexArt records signals but does not interpret or enforce them. The protocol treats signals
        as opaque metadata. Any semantic meaning or enforcement logic is the responsibility of the
        consuming application.
      </div>
    </div>

    <h2>Next Steps</h2>
    <ul>
      <li>
        <Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link>
        : API reference for the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signals</code> parameter
      </li>
      <li>
        <Link to="/docs/cli" className="text-primary hover:underline">NexArt CLI</Link>
        : use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">--signals-file</code> from the command line
      </li>
      <li>
        <Link to="/docs/verification" className="text-primary hover:underline">Verification</Link>
        : how signals affect integrity checks
      </li>
      <li>
        <Link to="/docs/concepts/cer" className="text-primary hover:underline">Certified Execution Records</Link>
        : the core record that signals attach to
      </li>
    </ul>
  </div>
);

export default ContextSignals;
