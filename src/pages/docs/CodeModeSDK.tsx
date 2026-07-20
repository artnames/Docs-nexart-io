import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# CodeMode SDK (@nexart/codemode-sdk v1.10.2)

Deterministic generative execution environment for verifiable visual outputs.
Same code + same seed + same parameters -> bit-identical pixel output.

## Install
npm install @nexart/codemode-sdk

## Canonical execution rules
- Canvas is fixed at 1950 x 2400. Do NOT call createCanvas().
- Use setup() instead of animation loops.
- Use the provided random() for deterministic randomness (seeded).
- No wall-clock time, no Math.random, no network I/O.

## Exported functions
- executeCodeMode(code, options)        -> { png, snapshot }            high-level one-shot
- createP5Runtime(options)              -> runtime                      p5-flavored deterministic runtime
- createRuntime(options)                -> runtime                      framework-neutral deterministic runtime
- runStaticMode(code, options)          -> { png, snapshot }            static (setup-only) render
- runLoopMode(code, options)            -> { png, snapshot }            bounded-loop render
- renderSoundArtViaCodeMode(spec, opts) -> { png, snapshot }            SoundArt helper
- renderNoiseViaCodeMode(spec, opts)    -> { png, snapshot }            noise/texture helper
- verifyCodeModeSnapshotDetailed(snap)  -> { ok, checks }               independent verifier
- SDK_VERSION                                                           string constant ('1.10.2')

## Snapshot shape (input to the verifier)
{
  sdkVersion: '1.10.2',
  seed:        number,
  vars:        number[],
  code:        string | { hash: string },
  canvas:      { width: 1950, height: 2400 },
  outputHash:  'sha256:...'  // hash of the rendered PNG
}

## Verification
verifyCodeModeSnapshotDetailed re-runs the snapshot with the same code, seed, and vars
and recomputes outputHash. If the recomputed hash matches the stored outputHash the
snapshot is reproducible. CodeMode snapshots can be wrapped in a CER via
@nexart/ai-execution.`;

const CodeModeSDK = () => (
  <>
    <PageHeader
      title="CodeMode SDK — Deterministic Rendering"
      summary="@nexart/codemode-sdk v1.10.2 — deterministic generative execution environment for verifiable visual outputs."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/codemode-sdk</code>{" "}
      is the deterministic generative execution runtime inside NexArt. It executes
      code under canonical rules so that identical inputs always produce
      identical pixel output. Any verifier with the same code, seed, and parameters
      can re-render and confirm the result.
    </p>
    <ul>
      <li>Generative art and visual simulations</li>
      <li>Reproducible creative pipelines</li>
      <li>Snapshot-based verification of rendered artifacts</li>
    </ul>

    <h2 id="install">Install</h2>
    <CodeBlock language="bash" code={`npm install @nexart/codemode-sdk`} title="Install" />
    <p className="text-sm text-muted-foreground">
      Current version: <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">@nexart/codemode-sdk@1.12.0</code>.
    </p>

    <h2 id="execution-model">Execution model</h2>
    <p>The runtime enforces strict canonical rules. These MUST be honored for output to be reproducible:</p>
    <ul>
      <li>Canvas is fixed at <strong>1950 x 2400</strong>.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createCanvas()</code> MUST NOT be called.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">setup()</code> is the entry point. Animation loops are not part of the canonical mode.</li>
      <li>Use the runtime's seeded <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">random()</code>. Do NOT use <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">Math.random</code>, wall-clock time, or network I/O.</li>
    </ul>

    <h2 id="quickstart">Quickstart</h2>
    <CodeBlock
      language="typescript"
      title="One-shot deterministic render"
      code={`import { executeCodeMode } from "@nexart/codemode-sdk";

const code = \`
function setup() {
  background(50);
  circle(975, 1200, 300 + random(0, 200));
}
\`;

const { png, snapshot } = await executeCodeMode(code, {
  seed: 12345,
  vars: [50, 50, 50, 0, 0, 0, 0, 0, 0, 0],
});

// 'png' is the rendered image (Uint8Array / Buffer).
// 'snapshot' contains { sdkVersion, seed, vars, code, canvas, outputHash }.`}
    />

    <h2 id="exports">Exported functions</h2>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 font-medium border-b border-border">Symbol</th>
            <th className="text-left px-4 py-3 font-medium border-b border-border">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="px-4 py-3 border-b border-border font-mono">executeCodeMode(code, options)</td><td className="px-4 py-3 border-b border-border">High-level one-shot render. Returns <code className="font-mono text-xs">{`{ png, snapshot }`}</code>.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">createP5Runtime(options)</td><td className="px-4 py-3 border-b border-border">p5-flavored deterministic runtime. Use when you need to retain a runtime handle across renders.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">createRuntime(options)</td><td className="px-4 py-3 border-b border-border">Framework-neutral deterministic runtime.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">runStaticMode(code, options)</td><td className="px-4 py-3 border-b border-border">Static (setup-only) render. No loop.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">runLoopMode(code, options)</td><td className="px-4 py-3 border-b border-border">Bounded-loop render with deterministic frame budget.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">renderSoundArtViaCodeMode(spec, options)</td><td className="px-4 py-3 border-b border-border">SoundArt helper: deterministic audio-driven visual render.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">renderNoiseViaCodeMode(spec, options)</td><td className="px-4 py-3 border-b border-border">Noise/texture helper.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">verifyCodeModeSnapshotDetailed(snap)</td><td className="px-4 py-3 border-b border-border">Independent verifier. Re-runs the snapshot and recomputes <code className="font-mono text-xs">outputHash</code>.</td></tr>
          <tr><td className="px-4 py-3 font-mono">SDK_VERSION</td><td className="px-4 py-3">Package version string constant (<code className="font-mono text-xs">'1.10.2'</code>).</td></tr>
        </tbody>
      </table>
    </div>

    <h2 id="snapshot">Snapshot shape</h2>
    <p>Every render returns a <strong>snapshot</strong>, the canonical, portable record of a deterministic render. It is the input to the verifier.</p>
    <CodeBlock
      language="json"
      title="CodeMode snapshot"
      code={`{
  "sdkVersion": "1.10.2",
  "seed": 12345,
  "vars": [50, 50, 50, 0, 0, 0, 0, 0, 0, 0],
  "code": { "hash": "sha256:..." },
  "canvas": { "width": 1950, "height": 2400 },
  "outputHash": "sha256:..."
}`}
    />

    <h2 id="verification">Verification</h2>
    <p>
      A snapshot is independently verifiable. Given the same code, seed, and vars,
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"> verifyCodeModeSnapshotDetailed</code> re-runs
      the render and recomputes the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">outputHash</code>.
      If it matches the stored hash, the render is reproducible.
    </p>
    <CodeBlock
      language="typescript"
      title="Verify a snapshot"
      code={`import { verifyCodeModeSnapshotDetailed } from "@nexart/codemode-sdk";

const report = await verifyCodeModeSnapshotDetailed(snapshot);
// report.ok           -> boolean
// report.checks       -> per-check PASS / FAIL details
// report.outputHash   -> recomputed hash`}
    />

    <h2 id="cer-integration">Binding to a CER</h2>
    <p>
      CodeMode snapshots can be embedded in a Certified Execution Record so the
      rendered artifact participates in the same attestation and verification
      surface as any other AI execution. See the{" "}
      <Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link> for{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certifyDecision</code> /{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certifyAndAttestDecision</code>.
    </p>

    <h2 id="related">Related</h2>
    <ul>
      <li><Link to="/docs/ui-renderer-sdk" className="text-primary hover:underline">UI Renderer SDK</Link> — deterministic UI rendering</li>
      <li><Link to="/docs/cli" className="text-primary hover:underline">NexArt CLI</Link> — <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">run</code> and <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">verify</code> commands for snapshots</li>
      <li><Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link> — wrap a snapshot in a CER</li>
    </ul>
  </>
);

export default CodeModeSDK;
