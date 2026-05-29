import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# UI Renderer SDK (@nexart/ui-renderer v0.9.1)

Deterministic UI rendering for verifiable interface artifacts. Same component
structure + data + parameters + seed -> identical UI output.

## Install
npm install @nexart/ui-renderer

## Exported functions
- createPreviewRuntime(options)         -> runtime
- createPreviewEngine(options)          -> engine
- compileSystem(systemSpec)             -> compiled system
- previewSystem(systemSpec, options)    -> { html, snapshot }
- renderCodeModeSystem(spec, options)   -> { png, snapshot }   bridge to CodeMode
- getCapabilities()                     -> { budget, canvas, features }
- SDK_VERSION                                                  string constant ('0.9.1')

## Capabilities (getCapabilities())
- budget:  per-render execution budget (CPU / time ceilings)
- canvas:  max render dimensions
- features: supported renderer features (codemode bridge, system primitives, etc.)

## Outputs
- HTML snapshots
- Rendered images (via the CodeMode bridge)
- Structured artifacts: { snapshot, outputHash }

## Verification
Rendering is deterministic. A verifier re-runs the same system spec and confirms
the output hash matches. Artifacts can be wrapped in a CER via @nexart/ai-execution.`;

const UIRendererSDK = () => (
  <>
    <DocsMeta
      title="UI Renderer SDK"
      description="@nexart/ui-renderer v0.9.1: deterministic UI rendering. Compile and preview systems, bridge to CodeMode, produce verifiable HTML and image artifacts."
    />
    <PageHeader
      title="UI Renderer SDK"
      summary="@nexart/ui-renderer v0.9.1 — deterministic UI rendering for verifiable interface artifacts."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ui-renderer</code>{" "}
      produces deterministic UI outputs that can be linked to Certified Execution Records.
      Identical inputs produce identical output, so a verifier can re-render a stored
      snapshot and confirm the result hash matches.
    </p>
    <p>Typical uses:</p>
    <ul>
      <li>AI-generated user interfaces</li>
      <li>Automated report and document generation</li>
      <li>Visual artifacts produced by agents</li>
    </ul>

    <h2 id="install">Install</h2>
    <CodeBlock language="bash" code={`npm install @nexart/ui-renderer`} title="Install" />
    <p className="text-sm text-muted-foreground">
      Current version: <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">@nexart/ui-renderer@0.9.1</code>.
    </p>

    <h2 id="quickstart">Quickstart</h2>
    <CodeBlock
      language="typescript"
      title="Preview a system deterministically"
      code={`import { previewSystem } from "@nexart/ui-renderer";

const { html, snapshot } = await previewSystem(
  {
    components: [/* component structure */],
    data:       { /* ... */ },
    parameters: { /* ... */ },
  },
  { seed: 12345 },
);

// 'html' is the rendered HTML snapshot.
// 'snapshot' is the canonical, hashable record of the render.`}
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
          <tr><td className="px-4 py-3 border-b border-border font-mono">createPreviewRuntime(options)</td><td className="px-4 py-3 border-b border-border">Build a long-lived preview runtime handle.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">createPreviewEngine(options)</td><td className="px-4 py-3 border-b border-border">Lower-level engine for advanced integrations.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">compileSystem(systemSpec)</td><td className="px-4 py-3 border-b border-border">Compile a system spec into a renderable form.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">previewSystem(systemSpec, options)</td><td className="px-4 py-3 border-b border-border">One-shot deterministic preview. Returns <code className="font-mono text-xs">{`{ html, snapshot }`}</code>.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">renderCodeModeSystem(spec, options)</td><td className="px-4 py-3 border-b border-border">Bridge to <Link to="/docs/codemode-sdk" className="text-primary hover:underline">CodeMode</Link>. Returns image output.</td></tr>
          <tr><td className="px-4 py-3 border-b border-border font-mono">getCapabilities()</td><td className="px-4 py-3 border-b border-border">Returns runtime <code className="font-mono text-xs">{`{ budget, canvas, features }`}</code>.</td></tr>
          <tr><td className="px-4 py-3 font-mono">SDK_VERSION</td><td className="px-4 py-3">Package version string constant (<code className="font-mono text-xs">'0.9.1'</code>).</td></tr>
        </tbody>
      </table>
    </div>

    <h2 id="capabilities">Capabilities and limits</h2>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">getCapabilities()</code>{" "}
      reports the runtime's hard ceilings. Renderers exceeding the budget or canvas
      limits are rejected before producing output, which keeps deterministic rendering
      bounded and reproducible.
    </p>
    <CodeBlock
      language="typescript"
      title="Inspect capabilities"
      code={`import { getCapabilities } from "@nexart/ui-renderer";

const caps = getCapabilities();
// caps.budget   -> per-render CPU / time ceiling
// caps.canvas   -> max render dimensions
// caps.features -> e.g. { codemodeBridge: true, systemPrimitives: true }`}
    />

    <h2 id="deterministic-rendering">Deterministic rendering</h2>
    <p>The renderer guarantees that identical inputs produce identical UI output. Inputs include:</p>
    <ul>
      <li>Component structure</li>
      <li>Data</li>
      <li>Parameters</li>
      <li>Seed</li>
    </ul>

    <h2 id="output-artifacts">Output artifacts</h2>
    <ul>
      <li>HTML snapshots (from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">previewSystem</code>)</li>
      <li>Rendered images (via <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">renderCodeModeSystem</code>)</li>
      <li>Structured snapshot artifacts (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{`{ snapshot, outputHash }`}</code>) suitable for embedding in a CER</li>
    </ul>

    <h2 id="verification">Verification</h2>
    <p>
      Because rendering is deterministic, a verifier can re-run the same system spec
      and confirm the output hash matches. This enables independent verification of UI
      artifacts without trusting the original rendering system. For end-to-end
      attestation, wrap the snapshot in a CER via the{" "}
      <Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link>.
    </p>

    <h2 id="related">Related</h2>
    <ul>
      <li><Link to="/docs/codemode-sdk" className="text-primary hover:underline">CodeMode SDK</Link> — the deterministic image renderer used by the bridge</li>
      <li><Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link> — wrap a UI snapshot in a CER</li>
      <li><Link to="/docs/verification" className="text-primary hover:underline">Verification</Link> — verification semantics</li>
    </ul>
  </>
);

export default UIRendererSDK;
