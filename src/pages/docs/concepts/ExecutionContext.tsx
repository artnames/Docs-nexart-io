import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# Execution Context and Signals

Execution context is a sequence of structured signals captured during execution: input, tool calls, decisions, output. Context is optional; when present it is included in the certificate hash.

## SDKs
- @nexart/signals: capture and structure signals (createContext, ctx.input, ctx.tool, ctx.decision, ctx.output, ctx.step, ctx.wrap)
- @nexart/ai-execution: certify execution and accept signals as part of the payload

## Minimal flow
1. const ctx = createContext()
2. ctx.input(...), ctx.tool(...), ctx.decision(...), ctx.output(...) (or ctx.step / ctx.wrap)
3. Pass ctx.signals into the certification call

## Hashing
Signals are canonicalized and included in the certificateHash when present. The certificate hash always reflects the exact bundle that is returned and verified.

## v0.16.1
- Context is constructed before hashing
- Context is included in the certificate hash when present
- Bundle is immutable after hashing
- Verification uses the bundle as-is

## Compatibility
Bundles created with v0.16.0 that include signals may fail verification. Re-seal using v0.16.1.`;

const ExecutionContext = () => (
  <div className="prose prose-invert max-w-none">
    <PageHeader
      title="Execution Context and Signals"
      summary="How to capture structured execution signals with @nexart/signals and certify them with @nexart/ai-execution."
      llmBlock={llmBlock}
    />

    <h2 id="overview">1. Overview</h2>
    <p>
      Execution context is a sequence of structured signals captured during execution.
    </p>
    <p>Signals represent steps such as:</p>
    <ul>
      <li>input</li>
      <li>tool calls</li>
      <li>decisions</li>
      <li>output</li>
    </ul>
    <p>Context is optional.</p>
    <p>
      If included, it becomes part of the Certified Execution Record and is included in the{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.
    </p>
    <p>If not included, the record remains valid.</p>

    <h2 id="sdks">2. SDKs involved</h2>
    <h3><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/signals</code></h3>
    <ul>
      <li>Used to capture and structure execution signals.</li>
      <li>
        Provides the builder API:{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createContext</code>,{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">step</code>,{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">wrap</code>, and the
        typed helpers below.
      </li>
      <li>
        Full reference:{" "}
        <Link to="/docs/signals-sdk" className="text-primary hover:underline">
          Signals SDK
        </Link>
        .
      </li>
    </ul>

    <h3><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ai-execution</code></h3>
    <ul>
      <li>Used to certify execution.</li>
      <li>Accepts signals as part of the execution payload.</li>
      <li>Produces CER bundles.</li>
    </ul>
    <p>The two SDKs have separate responsibilities and should not be mixed.</p>

    <h2 id="basic-implementation">3. Basic implementation</h2>

    <h3>Step 1. Create context</h3>
    <p>
      Use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createContext()</code> to
      initialize signal collection.
    </p>
    <CodeBlock
      language="typescript"
      title="Create a context"
      code={`import { createContext } from "@nexart/signals";

const ctx = createContext();`}
    />

    <h3>Step 2. Capture signals</h3>
    <p>Use the typed helpers:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ctx.input()</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ctx.tool()</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ctx.decision()</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ctx.output()</code></li>
    </ul>
    <p>
      Or use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ctx.step()</code> for
      custom signals.
    </p>

    <h3>Step 3. Optional auto-instrumentation</h3>
    <p>
      Use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ctx.wrap(type, fn)</code>{" "}
      to capture start and end spans automatically.
    </p>

    <h3>Step 4. Certify execution</h3>
    <p>
      Pass <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ctx.signals</code> into
      the certification call. Signals are automatically included in the CER.
    </p>
    <CodeBlock
      language="typescript"
      title="Certify with signals"
      code={`import { createContext } from "@nexart/signals";
import { certifyExecution } from "@nexart/ai-execution";

const ctx = createContext();

ctx.input({ prompt: "Summarize this contract" });
ctx.tool({ name: "vector-search", args: { query: "termination clause" } });
ctx.decision({ id: "policy.allow", result: "pass" });
ctx.output({ text: "The contract states that..." });

const result = await certifyExecution({
  model: "gpt-4o-mini",
  input: { prompt: "Summarize this contract" },
  output: { text: "The contract states that..." },
  signals: ctx.signals,
  nodeUrl: "https://your-nexart-node.example",
  apiKey: process.env.NEXART_API_KEY,
});

console.log(result.certificateHash);`}
    />

    <h2 id="example-flow">4. Example flow</h2>
    <p>A simple execution captures the following ordered signals:</p>
    <ol>
      <li>capture input</li>
      <li>call tool</li>
      <li>compute decision</li>
      <li>produce output</li>
      <li>certify with signals attached</li>
    </ol>
    <p>Signals are ordered and deterministic.</p>

    <h2 id="determinism-and-hashing">5. Determinism and hashing</h2>
    <p>Signals must be deterministic if reproducibility is required.</p>
    <ul>
      <li>step ordering must be stable</li>
      <li>timestamps should be controlled if needed</li>
      <li>payload should not contain non-deterministic values</li>
    </ul>
    <p>The context is canonicalized and included in the certificate hash.</p>
    <div className="not-prose my-6 rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-sm text-foreground">
        The certificate hash always reflects the exact bundle that is returned and verified.
      </div>
    </div>

    <h2 id="v0-16-1-changes">6. What changed in v0.16.1</h2>
    <p>Previous versions could mutate the context after hashing. This caused mismatches between the hash and the bundle.</p>
    <p>In v0.16.1:</p>
    <ul>
      <li>Context is constructed before hashing.</li>
      <li>Context is included in the certificate hash when present.</li>
      <li>The bundle is immutable after hashing.</li>
      <li>Verification uses the bundle as-is.</li>
    </ul>

    <h2 id="verification-behavior">7. Verification behavior</h2>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyCer</code> validates
      the full bundle.
    </p>
    <p>If signals are present, they are part of the verification boundary.</p>
    <p>Any modification to:</p>
    <ul>
      <li>signals</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">contextHash</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">contextSummary</code></li>
    </ul>
    <p>invalidates the certificate.</p>

    <h2 id="when-to-use">8. When to use signals</h2>
    <p>Use signals when:</p>
    <ul>
      <li>execution trace matters</li>
      <li>workflows involve multiple steps</li>
      <li>decisions need to be reviewed</li>
    </ul>
    <p>Do not require signals for simple executions.</p>

    <h2 id="compatibility">9. Compatibility note</h2>
    <p>
      Bundles created with v0.16.0 that include signals may fail verification. Re-seal using v0.16.1.
    </p>

    <h2 id="related">Related</h2>
    <ul>
      <li>
        <Link to="/docs/signals-sdk" className="text-primary hover:underline">
          Signals SDK
        </Link>
        : full <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/signals</code> reference
      </li>
      <li>
        <Link to="/docs/concepts/cer" className="text-primary hover:underline">
          Certified Execution Records
        </Link>
      </li>
      <li>
        <Link to="/docs/sdk" className="text-primary hover:underline">
          AI Execution SDK
        </Link>
      </li>
      <li>
        <Link to="/docs/concepts/context-signals" className="text-primary hover:underline">
          Context Signals
        </Link>
      </li>
      <li>
        <Link to="/docs/verification-semantics" className="text-primary hover:underline">
          Verification Semantics
        </Link>
      </li>
    </ul>
  </div>
);

export default ExecutionContext;
