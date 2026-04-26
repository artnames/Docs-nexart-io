import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# Signals SDK (@nexart/signals v0.8.0)

Protocol-agnostic structured execution context SDK. Captures ordered NexArtSignal[] for binding into Certified Execution Records (CERs).

## Install
npm install @nexart/signals

## Quickstart
import { createContext } from '@nexart/signals';
const ctx = createContext();
ctx.step('fetch', { url });
ctx.step('transform');
ctx.step('store');
await ctx.certify({ provider: 'openai', model: 'gpt-4o-mini', input, output });

## Capability tiers
- v0.1 Core: createSignal, createSignalCollector
- v0.2 Deterministic mode + lock + validate
- v0.3 hashSignals, validateSignals, exportWithHash
- v0.4 findByType, findByStep, filter, diffSignals
- v0.5 createExecutionContext (frozen, validate, equals, toJSON)
- v0.6 exportContext, importContext (tamper-detection), compareContexts
- v0.7 assertContextDeterministic, freezeContext, signaturePayload, summary
- v0.8 createContext() builder: step, wrap, start, input, output, tool, decision, certify, debug, print

## Signal shape
{ type, source, step, timestamp, actor, status, payload }

## Integrity
- contextHash = sha256 over canonical JSON of signals (sorted by step, sorted keys, undefined stripped)
- signals are passive; never influence execution
- deterministic mode requires explicit step + timestamp
- wrap/start are disabled in deterministic mode

## Integration with @nexart/ai-execution
NexArtSignal[] is structurally identical to CerContextSignal[]. Pass collector.export().signals into certifyDecision({ ..., signals }).`;

const SignalsSDK = () => (
  <div className="prose prose-invert max-w-none">
    <PageHeader
      title="Signals SDK"
      summary="@nexart/signals v0.8.0 — protocol-agnostic structured execution context with deterministic capture, integrity hashing, replay-safe diffing, and a builder API."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/signals</code>{" "}
      captures structured execution context as an ordered, hashable, replay-safe array of signals.
      It is protocol-agnostic, fully optional, and independent of{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ai-execution</code>.
    </p>
    <ul>
      <li>Does not define governance semantics or enforce policy.</li>
      <li>Does not interpret the meaning of signals.</li>
      <li>Validates structure, normalizes to safe defaults, and (optionally) hashes for tamper-detection.</li>
    </ul>
    <p>
      For how signals attach to a CER, see{" "}
      <Link to="/docs/concepts/execution-context" className="text-primary hover:underline">
        Execution Context and Signals
      </Link>{" "}
      and{" "}
      <Link to="/docs/concepts/context-signals" className="text-primary hover:underline">
        Context Signals
      </Link>
      .
    </p>

    <h2 id="install">Install</h2>
    <CodeBlock language="bash" title="Install" code={`npm install @nexart/signals`} />

    <h2 id="quickstart">2-minute quickstart</h2>
    <CodeBlock
      language="typescript"
      title="Builder quickstart"
      code={`import { createContext } from '@nexart/signals';

const ctx = createContext();

ctx.step('fetch', { url });
ctx.step('transform');
ctx.step('store');

await ctx.certify({
  provider: 'openai',
  model:    'gpt-4o-mini',
  input,
  output,
});`}
    />
    <p>
      Auto-step, auto-timestamp, signals injected into the CER for you.{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ai-execution</code>{" "}
      is a peer dependency for{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ctx.certify()</code>.
    </p>

    <h2 id="capability-tiers">Capability tiers</h2>
    <p>All layers are additive. v0.1 code keeps working unchanged.</p>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 font-medium border-b border-border">Version</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Layer</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">What it adds</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="px-4 py-3 border-b border-border font-mono">v0.1</td><td className="px-4 py-3 border-b border-border">Core</td><td className="px-4 py-3 border-b border-border"><code className="font-mono text-xs">createSignal</code>, <code className="font-mono text-xs">createSignalCollector</code>, normalization, defaults, ordered export</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">v0.2</td><td className="px-4 py-3 border-b border-border">Deterministic mode</td><td className="px-4 py-3 border-b border-border"><code className="font-mono text-xs">deterministic: true</code>, <code className="font-mono text-xs">lock()</code>, <code className="font-mono text-xs">validate()</code></td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">v0.3</td><td className="px-4 py-3 border-b border-border">Context integrity</td><td className="px-4 py-3 border-b border-border"><code className="font-mono text-xs">hashSignals()</code>, <code className="font-mono text-xs">validateSignals()</code>, <code className="font-mono text-xs">exportWithHash()</code></td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">v0.4</td><td className="px-4 py-3 border-b border-border">Structured context</td><td className="px-4 py-3 border-b border-border"><code className="font-mono text-xs">findByType</code>, <code className="font-mono text-xs">findByStep</code>, <code className="font-mono text-xs">filter</code>, <code className="font-mono text-xs">diffSignals()</code></td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">v0.5</td><td className="px-4 py-3 border-b border-border">Execution Context object</td><td className="px-4 py-3 border-b border-border"><code className="font-mono text-xs">createExecutionContext()</code> with <code className="font-mono text-xs">validate</code>, <code className="font-mono text-xs">equals</code>, <code className="font-mono text-xs">toJSON</code></td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">v0.6</td><td className="px-4 py-3 border-b border-border">Snapshot + replay</td><td className="px-4 py-3 border-b border-border"><code className="font-mono text-xs">exportContext</code>, <code className="font-mono text-xs">importContext</code> (tamper-detection), <code className="font-mono text-xs">compareContexts</code></td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">v0.7</td><td className="px-4 py-3 border-b border-border">Integrity contract</td><td className="px-4 py-3 border-b border-border"><code className="font-mono text-xs">assertContextDeterministic</code>, <code className="font-mono text-xs">freezeContext</code>, <code className="font-mono text-xs">signaturePayload()</code>, <code className="font-mono text-xs">summary()</code></td></tr>
          <tr><td className="px-4 py-3 font-mono">v0.8</td><td className="px-4 py-3">Builder DX layer</td><td className="px-4 py-3"><code className="font-mono text-xs">createContext()</code> + <code className="font-mono text-xs">step</code>, <code className="font-mono text-xs">wrap</code>, <code className="font-mono text-xs">start</code>, <code className="font-mono text-xs">input</code>, <code className="font-mono text-xs">output</code>, <code className="font-mono text-xs">tool</code>, <code className="font-mono text-xs">decision</code>, <code className="font-mono text-xs">certify</code></td></tr>
        </tbody>
      </table>
    </div>

    <h2 id="signal-shape">Signal shape</h2>
    <p>Every <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NexArtSignal</code> has exactly these fields. All fields are always present, no <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">undefined</code> values.</p>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 font-medium border-b border-border">Field</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Type</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Default</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="px-4 py-3 border-b border-border font-mono">type</td><td className="px-4 py-3 border-b border-border">string</td><td className="px-4 py-3 border-b border-border">required</td><td className="px-4 py-3 border-b border-border">Signal category, free-form (e.g. "approval", "deploy")</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">source</td><td className="px-4 py-3 border-b border-border">string</td><td className="px-4 py-3 border-b border-border">required</td><td className="px-4 py-3 border-b border-border">Upstream system or protocol, free-form</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">step</td><td className="px-4 py-3 border-b border-border">number</td><td className="px-4 py-3 border-b border-border">0 / auto</td><td className="px-4 py-3 border-b border-border">Position in sequence. Auto-assigned in insertion order</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">timestamp</td><td className="px-4 py-3 border-b border-border">string</td><td className="px-4 py-3 border-b border-border">current time</td><td className="px-4 py-3 border-b border-border">ISO 8601</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">actor</td><td className="px-4 py-3 border-b border-border">string</td><td className="px-4 py-3 border-b border-border">"unknown"</td><td className="px-4 py-3 border-b border-border">Who produced this signal, free-form</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">status</td><td className="px-4 py-3 border-b border-border">string</td><td className="px-4 py-3 border-b border-border">"ok"</td><td className="px-4 py-3 border-b border-border">Outcome, free-form (e.g. "ok", "error", "pending")</td></tr>
          <tr><td className="px-4 py-3 font-mono">payload</td><td className="px-4 py-3">Record&lt;string, unknown&gt;</td><td className="px-4 py-3">{`{}`}</td><td className="px-4 py-3">Opaque upstream data, NexArt does not interpret this</td></tr>
        </tbody>
      </table>
    </div>

    <h2 id="v01-core">v0.1 Core — createSignalCollector</h2>
    <p>The original capture API. Still works unchanged.</p>
    <CodeBlock
      language="typescript"
      title="Core collector"
      code={`import { createSignal, createSignalCollector } from '@nexart/signals';

const collector = createSignalCollector({ defaultSource: 'my-pipeline' });

collector.add({ type: 'fetch',     payload: { url: '...' } });
collector.add({ type: 'transform', actor: 'etl-bot' });
collector.add({ type: 'store',     status: 'ok' });

const collection = collector.export();
// { signals: [...], count: 3, exportedAt: '2026-...' }`}
    />

    <h2 id="v02-deterministic">v0.2 Deterministic mode</h2>
    <p>Same code, same inputs, bit-identical signals every run.</p>
    <CodeBlock
      language="typescript"
      title="Deterministic collector"
      code={`const collector = createSignalCollector({ deterministic: true });

collector.add({
  type: 'approval',
  source: 'ci',
  step: 0,                                  // required in deterministic mode
  timestamp: '2026-03-17T00:00:00.000Z',    // required in deterministic mode
});`}
    />
    <p>In deterministic mode:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">step</code> MUST be supplied explicitly on every <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">add()</code>. No insertion-index fallback.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">timestamp</code> MUST be supplied explicitly on every <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">add()</code>. No <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">Date.now()</code> fallback.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">add()</code> throws synchronously when these constraints are violated.</li>
    </ul>

    <h3 id="lock"><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">collector.lock()</code></h3>
    <p>Freeze the collector to guarantee immutability before hashing or export. Idempotent.</p>
    <CodeBlock
      language="typescript"
      title="Lock"
      code={`collector.lock();
collector.add({ /* ... */ });   // throws: 'cannot add() after lock()'

collector.export();             // still works
collector.exportWithHash();     // still works
collector.validate();           // still works
collector.locked;               // true`}
    />

    <h3 id="validate"><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">collector.validate()</code></h3>
    <p>Check the current buffer for structural integrity. Returns <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{`{ ok, errors }`}</code>. Verifies required fields, finite <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">step</code>, parseable <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">timestamp</code>, plain-object <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">payload</code>, no duplicate steps.</p>

    <h2 id="v03-integrity">v0.3 Context integrity</h2>
    <p>Make signal collections tamper-evident before certification.</p>
    <CodeBlock
      language="typescript"
      title="Hashing and validation"
      code={`import { hashSignals, validateSignals } from '@nexart/signals';

const contextHash = hashSignals(collection.signals);
// 'sha256:9f3c...' — stable across environments

const { ok, errors } = validateSignals(restoredSignals);
if (!ok) throw new Error(errors.join('; '));

// Or both at once:
const { signals, count, exportedAt, contextHash: h } = collector.exportWithHash();`}
    />
    <p>Hash algorithm:</p>
    <ol>
      <li>Sort signals by <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">step</code> (ascending, stable).</li>
      <li>Canonicalize each signal: object keys sorted alphabetically at every level.</li>
      <li>Serialize as canonical JSON.</li>
      <li>sha256 to <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">sha256:&lt;64-hex&gt;</code>.</li>
    </ol>
    <p>The hash excludes <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">exportedAt</code> and any wall-clock metadata.</p>

    <h2 id="v04-structured">v0.4 Structured context</h2>
    <p>Signals as a queryable, diffable execution context.</p>
    <CodeBlock
      language="typescript"
      title="Query helpers"
      code={`collector.findByType('approval');
collector.findByStep(2);
collector.filter({ type: 'deploy', status: 'ok' });
collector.filter((s) => s.payload.severity === 'high');`}
    />
    <p>The predicate-object form matches strict equality on top-level fields only. For payload-aware matching, use the function form.</p>
    <CodeBlock
      language="typescript"
      title="diffSignals"
      code={`import { diffSignals } from '@nexart/signals';

const { added, removed, changed } = diffSignals(before, after);
// added:   signals in 'b' whose step is not in 'a'
// removed: signals in 'a' whose step is not in 'b'
// changed: signals at the same step whose canonical content differs`}
    />

    <h2 id="v05-execution-context">v0.5 Execution Context object</h2>
    <p>A first-class wrapper: sorted, hashed, validatable, portable, immutable by default.</p>
    <CodeBlock
      language="typescript"
      title="createExecutionContext"
      code={`import { createExecutionContext } from '@nexart/signals';

const ctx = createExecutionContext({ signals: collector.export().signals });

ctx.signals;        // sorted by step, frozen array
ctx.contextHash;    // 'sha256:...' — stable across runs and machines
ctx.createdAt;      // ISO 8601 of construction
ctx.validate();     // { ok, errors }
ctx.equals(other);  // hash-based equality
ctx.toJSON();       // canonical, portable snapshot`}
    />

    <h3 id="binding-pattern">How context binds to execution</h3>
    <ol>
      <li>Capture signals via <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createSignalCollector({`{ deterministic: true }`})</code>.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">collector.lock()</code> and build an <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ExecutionContext</code> from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">collector.export().signals</code>.</li>
      <li>Optional: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">freezeContext(ctx)</code> for deep-immutability.</li>
      <li>Bind <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ctx.contextHash</code> (or <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ctx.signaturePayload()</code>) into your execution record.</li>
      <li>To verify: reconstruct from stored signals and check <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">hashSignals(signals) === storedContextHash</code>.</li>
    </ol>

    <h2 id="v06-snapshot">v0.6 Snapshot and replay</h2>
    <CodeBlock
      language="typescript"
      title="Snapshot, import, compare"
      code={`import { exportContext, importContext, compareContexts } from '@nexart/signals';

// Persist
const snapshot = exportContext(ctx);
fs.writeFileSync('ctx.json', JSON.stringify(snapshot));

// Replay (tamper-detection runs automatically)
const restored = importContext(fs.readFileSync('ctx.json', 'utf8'));
restored.equals(ctx);     // true

// Compare
const r = compareContexts(ctx, restored);
// { equal, hashEqual, diff: { added, removed, changed } }`}
    />
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">importContext</code>{" "}
      recomputes the hash from the snapshot's signals and throws{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">contextHash mismatch</code>{" "}
      if it does not match the stored hash.
    </p>

    <h2 id="v07-integrity-contract">v0.7 Integrity contract</h2>
    <CodeBlock
      language="typescript"
      title="Integrity primitives"
      code={`import {
  assertContextDeterministic,
  freezeContext,
} from '@nexart/signals';

// Throws on validation errors or hash mismatch
assertContextDeterministic(ctx);

// Deep-freeze signals + payloads (recursive). Idempotent.
const frozen = freezeContext(ctx);

// Canonical signing payload — excludes createdAt
const payload = ctx.signaturePayload();

// Lightweight overview for UI surfaces
ctx.summary();
// { count, types: { approval: 1, deploy: 1 }, stepRange: { min, max } }`}
    />

    <h2 id="v08-builder">v0.8 Builder API — createContext()</h2>
    <p>The high-level entry point. Backward-compatible with everything below.</p>

    <h3 id="capture-step">Capture with <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">step()</code></h3>
    <CodeBlock
      language="typescript"
      title="step"
      code={`const ctx = createContext();

// Convenience form
ctx.step('approval', { actor: 'alice', approved: true });
ctx.step('deploy',   { env: 'prod' });
ctx.step('verify');

// Power-user form (full CreateSignalInput)
ctx.step({
  type:   'review',
  source: 'github',
  actor:  'bob',
  status: 'pending',
  payload: { pr: 42 },
});

ctx.signals     // current signal array, sorted by step
ctx.hash        // canonical contextHash
ctx.size        // count
ctx.locked      // boolean
ctx.lock()      // freeze the underlying collector
ctx.snapshot()  // → immutable ExecutionContext (v0.5)`}
    />

    <h3 id="auto-instrumentation">Auto-instrumentation: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">wrap()</code> and <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">start()</code></h3>
    <CodeBlock
      language="typescript"
      title="wrap and start"
      code={`const result = await ctx.wrap('llm_call', async () => {
  return await openai.chat(...);
});
// emits llm_call.start, then llm_call.end with { status, duration_ms }
// re-throws errors after emitting end with status='error'

// Manual span
const span = ctx.start('tool_call', { name: 'search' });
try {
  const results = await search(query);
  span.end({ status: 'ok', payload: { count: results.length } });
} catch (e) {
  span.end({ status: 'error' });
  throw e;
}`}
    />
    <div className="not-prose my-6 rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-sm font-medium text-foreground mb-1">Not available in deterministic mode</div>
      <div className="text-sm text-muted-foreground">
        <code className="font-mono">wrap()</code> and <code className="font-mono">start()</code> record wall-clock duration and are disabled in deterministic mode. Use <code className="font-mono">step()</code> with explicit <code className="font-mono">step</code> + <code className="font-mono">timestamp</code> instead.
      </div>
    </div>

    <h3 id="semantic-helpers">Agent-friendly helpers</h3>
    <p>Lightweight wrappers around <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">step()</code>. They do not enforce meaning.</p>
    <CodeBlock
      language="typescript"
      title="Semantic helpers"
      code={`ctx.input({ q: 'who is the user' });
ctx.tool('search', { query: 'foo' });
ctx.decision('route', { selected: 'fraud-check' });
ctx.output({ answer: '...' });`}
    />

    <h3 id="certify">Direct certification: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ctx.certify()</code></h3>
    <CodeBlock
      language="typescript"
      title="ctx.certify"
      code={`const bundle = await ctx.certify({
  provider:   'openai',
  model:      'gpt-4o-mini',
  input,
  output,
  parameters: { temperature: 0 },
});

// For tests or full decoupling, inject a custom certifier
await ctx.certify(
  { provider, model, input, output },
  { certifier: (params) => myCustomCertify(params) },
);

// Optional pre-freeze for tamper-evident handoff
await ctx.certify(decisionInput, { freeze: true });`}
    />
    <p>
      Internally, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ctx.certify()</code>{" "}
      lazily imports{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ai-execution</code>{" "}
      and calls{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certifyDecision({`{ ...input, signals: ctx.signals }`})</code>.
      Install <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ai-execution</code> as a peer when you need certification.
    </p>

    <h3 id="debug">Debugging</h3>
    <CodeBlock
      language="typescript"
      title="debug() and print()"
      code={`const view = ctx.debug();
// {
//   count, hash, types: { fetch: 1, ... },
//   timeline: [{ step, type, timestamp, status, actor, source }, ...]
// }

ctx.print();
// ExecutionContext (3 signals)
//   hash: sha256:...
//   types: fetch=1, transform=1, store=1
//   timeline:
//     [  0] 2026-04-26T...  fetch      status=ok  actor=agent  source=agent`}
    />

    <h2 id="full-example">Replay-safe signals — full example</h2>
    <CodeBlock
      language="typescript"
      title="End-to-end replay-safe capture"
      code={`import {
  createSignalCollector,
  hashSignals,
  validateSignals,
  diffSignals,
} from '@nexart/signals';

// ── Capture ────────────────────────────────────────────────
const c = createSignalCollector({ deterministic: true });

c.add({ type: 'approval', source: 'gh', step: 0, timestamp: '2026-03-17T00:00:00.000Z', actor: 'alice', payload: { pr: 42 } });
c.add({ type: 'deploy',   source: 'ci', step: 1, timestamp: '2026-03-17T00:01:00.000Z', actor: 'ci-bot', payload: { env: 'prod' } });

c.lock();

const v = c.validate();
if (!v.ok) throw new Error(v.errors.join('; '));

const { signals, contextHash } = c.exportWithHash();

// ── Persist 'signals' and 'contextHash' somewhere ──────────

// ── Later: verify nothing was tampered with ────────────────
if (hashSignals(signals) !== contextHash) {
  throw new Error('Signal collection has been tampered with');
}

// ── Compare against a prior run ────────────────────────────
const diff = diffSignals(previousSignals, signals);
console.log(\`+\${diff.added.length} -\${diff.removed.length} ~\${diff.changed.length}\`);`}
    />

    <h2 id="ai-execution-integration">Integration with @nexart/ai-execution</h2>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NexArtSignal[]</code> is structurally identical to{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">CerContextSignal[]</code> in{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ai-execution</code>. No casting needed.
    </p>
    <CodeBlock
      language="typescript"
      title="Direct interop"
      code={`import { createSignalCollector } from '@nexart/signals';
import { certifyDecision, verifyCer } from '@nexart/ai-execution';

const collector = createSignalCollector({ defaultSource: 'github-actions' });
collector.add({ type: 'approval', actor: 'alice', status: 'ok', payload: { pr: 42 } });
collector.add({ type: 'deploy',   actor: 'ci-bot', status: 'ok', payload: { env: 'prod' } });

const { signals } = collector.export();

const bundle = certifyDecision({
  provider: 'openai',
  model: 'gpt-4o-mini',
  prompt: 'Summarise.',
  input: userQuery,
  output: llmResponse,
  parameters: { temperature: 0, maxTokens: 512, topP: null, seed: null },
  signals,
});

verifyCer(bundle).ok;            // true
bundle.context?.signals.length;  // 2`}
    />
    <p>
      The CER's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>{" "}
      covers the signals in canonical form, identical to (and independently checkable with){" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">hashSignals(signals)</code>.
    </p>

    <h2 id="api-reference">API reference</h2>

    <h3>Functions</h3>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 font-medium border-b border-border">Symbol</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Since</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="px-4 py-3 border-b border-border font-mono">createSignal(input)</td><td className="px-4 py-3 border-b border-border font-mono">v0.1</td><td className="px-4 py-3 border-b border-border">Normalize a single CreateSignalInput</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">createSignalCollector(options?)</td><td className="px-4 py-3 border-b border-border font-mono">v0.1</td><td className="px-4 py-3 border-b border-border">Build a SignalCollector</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">hashSignals(signals)</td><td className="px-4 py-3 border-b border-border font-mono">v0.3</td><td className="px-4 py-3 border-b border-border">Deterministic sha256 over a signal array</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">canonicalJson(value)</td><td className="px-4 py-3 border-b border-border font-mono">v0.3</td><td className="px-4 py-3 border-b border-border">Sorted-key, undefined-stripped JSON</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">canonicalize(value)</td><td className="px-4 py-3 border-b border-border font-mono">v0.3</td><td className="px-4 py-3 border-b border-border">Recursive key-sorted clone</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">sortSignals(signals)</td><td className="px-4 py-3 border-b border-border font-mono">v0.3</td><td className="px-4 py-3 border-b border-border">Stable sort by step (does not mutate)</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">validateSignals(signals)</td><td className="px-4 py-3 border-b border-border font-mono">v0.3</td><td className="px-4 py-3 border-b border-border">Structural integrity check</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">diffSignals(a, b)</td><td className="px-4 py-3 border-b border-border font-mono">v0.4</td><td className="px-4 py-3 border-b border-border">Step-keyed diff</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">createExecutionContext(input)</td><td className="px-4 py-3 border-b border-border font-mono">v0.5</td><td className="px-4 py-3 border-b border-border">Build a frozen ExecutionContext</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">exportContext(ctx)</td><td className="px-4 py-3 border-b border-border font-mono">v0.6</td><td className="px-4 py-3 border-b border-border">Canonical snapshot</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">importContext(json)</td><td className="px-4 py-3 border-b border-border font-mono">v0.6</td><td className="px-4 py-3 border-b border-border">Reconstruct with hash tamper-detection</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">compareContexts(a, b)</td><td className="px-4 py-3 border-b border-border font-mono">v0.6</td><td className="px-4 py-3 border-b border-border">{`{ equal, hashEqual, diff }`}</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">assertContextDeterministic(ctx)</td><td className="px-4 py-3 border-b border-border font-mono">v0.7</td><td className="px-4 py-3 border-b border-border">Throws on invalid signals or hash mismatch</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">freezeContext(ctx)</td><td className="px-4 py-3 border-b border-border font-mono">v0.7</td><td className="px-4 py-3 border-b border-border">Deep-freeze signals + payloads</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">createContext(options?)</td><td className="px-4 py-3 border-b border-border font-mono">v0.8</td><td className="px-4 py-3 border-b border-border">Builder-friendly mutable context</td></tr>
          <tr><td className="px-4 py-3 font-mono">SIGNALS_VERSION</td><td className="px-4 py-3 font-mono">v0.1</td><td className="px-4 py-3">Package version string constant</td></tr>
        </tbody>
      </table>
    </div>

    <h3>ContextBuilder methods (v0.8)</h3>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 font-medium border-b border-border">Method / property</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="px-4 py-3 border-b border-border font-mono">step(type, payload?) / step(input)</td><td className="px-4 py-3 border-b border-border">Add a signal. Auto-step + auto-timestamp by default.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">wrap(type, fn)</td><td className="px-4 py-3 border-b border-border">Auto-instrument an async fn. Disabled in deterministic mode.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">start(type, payload?) → Span</td><td className="px-4 py-3 border-b border-border">Open a span. Disabled in deterministic mode.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">input(data) / output(data)</td><td className="px-4 py-3 border-b border-border">Convenience for step('input'/'output', {`{ data }`}).</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">tool(name, payload?)</td><td className="px-4 py-3 border-b border-border">Convenience for step('tool', {`{ name, ...payload }`}).</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">decision(name, payload?)</td><td className="px-4 py-3 border-b border-border">Convenience for step('decision', {`{ name, ...payload }`}).</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">certify(input, options?)</td><td className="px-4 py-3 border-b border-border">Lazily calls @nexart/ai-execution.certifyDecision, injecting signals.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">signals / hash / size / locked</td><td className="px-4 py-3 border-b border-border">Live read-only views of the underlying collector.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">lock()</td><td className="px-4 py-3 border-b border-border">Lock the collector.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">snapshot() → ExecutionContext</td><td className="px-4 py-3 border-b border-border">Build the immutable v0.5 ExecutionContext.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">debug() → ContextDebugView</td><td className="px-4 py-3 border-b border-border">{`{ count, hash, types, timeline }`}</td></tr>
          <tr><td className="px-4 py-3 font-mono">print() → string</td><td className="px-4 py-3">Pretty-print the timeline.</td></tr>
        </tbody>
      </table>
    </div>

    <h3>ExecutionContext methods</h3>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 font-medium border-b border-border">Method</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Since</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="px-4 py-3 border-b border-border font-mono">validate()</td><td className="px-4 py-3 border-b border-border font-mono">v0.5</td><td className="px-4 py-3 border-b border-border">validateSignals() over the underlying signals</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">equals(other)</td><td className="px-4 py-3 border-b border-border font-mono">v0.5</td><td className="px-4 py-3 border-b border-border">Hash-based equality</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">toJSON()</td><td className="px-4 py-3 border-b border-border font-mono">v0.5</td><td className="px-4 py-3 border-b border-border">Canonical ContextSnapshot</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">signaturePayload()</td><td className="px-4 py-3 border-b border-border font-mono">v0.7</td><td className="px-4 py-3 border-b border-border">Canonical signing payload, excludes createdAt</td></tr>
          <tr><td className="px-4 py-3 font-mono">summary()</td><td className="px-4 py-3 font-mono">v0.7</td><td className="px-4 py-3">{`{ count, types, stepRange }`}</td></tr>
        </tbody>
      </table>
    </div>

    <h2 id="integrity-model">Integrity model</h2>
    <ul>
      <li><strong>Passive.</strong> Signals describe execution. They never influence it.</li>
      <li><strong>Deterministic-capable.</strong> With <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">deterministic: true</code> and pinned timestamps, same input produces identical signals and identical hash.</li>
      <li><strong>Protocol-agnostic.</strong> No business meaning, no policy engine, no framework coupling.</li>
      <li><strong>Composable.</strong> Works with any pipeline, agent, or workflow that produces or consumes a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NexArtSignal[]</code>.</li>
      <li><strong>Tamper-evident.</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">contextHash</code> changes if any signal field changes anywhere.</li>
      <li><strong>Stable serialization.</strong> Canonical JSON (sorted keys at every level), <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">undefined</code> stripped, no whitespace.</li>
    </ul>

    <h2 id="backward-compat">Backward compatibility</h2>
    <p>Every v0.1 API and behavior is preserved exactly:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createSignal()</code> and <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createSignalCollector()</code> signatures unchanged.</li>
      <li>All v0.1 fields (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">type</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">source</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">step</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">timestamp</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">actor</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">status</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">payload</code>) unchanged.</li>
      <li>All defaults unchanged.</li>
      <li>New methods are pure additions on the same returned object.</li>
    </ul>

    <h2 id="related">Related</h2>
    <ul>
      <li><Link to="/docs/concepts/execution-context" className="text-primary hover:underline">Execution Context and Signals</Link>: how signals attach to a CER.</li>
      <li><Link to="/docs/concepts/context-signals" className="text-primary hover:underline">Context Signals</Link>: protocol-level concept.</li>
      <li><Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link>: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certifyDecision</code> and the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signals</code> parameter.</li>
      <li><Link to="/docs/verification-semantics" className="text-primary hover:underline">Verification Semantics</Link>: how hash-bound vs supplemental signals are reported.</li>
    </ul>
  </div>
);

export default SignalsSDK;
