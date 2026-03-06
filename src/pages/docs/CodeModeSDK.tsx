import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# CodeMode SDK

CodeMode is the deterministic generative execution environment inside NexArt.

## Purpose
- Produce deterministic visual outputs that can be certified and verified
- Same code + same seed = same output

## Execution Rules
- Canvas size is fixed: 1950 x 2400
- createCanvas() must not be called
- setup() is used instead of animation loops
- random() must be used for deterministic randomness

## Example
function setup() {
  background(50);
  circle(975, 1200, 300);
}

## Deterministic Output
If the same code, seed, and parameters are used, the renderer produces the exact same output. This property allows verification of rendered artifacts.`;

const CodeModeSDK = () => (
  <>
    <PageHeader
      title="CodeMode SDK"
      summary="Deterministic generative execution environment for verifiable visual outputs."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>The CodeMode SDK is used for deterministic generative execution inside NexArt.</p>
    <p>It allows developers to produce deterministic visual outputs that can later be certified and verified. CodeMode enforces canonical execution rules so the same code and seed always produce the same output.</p>
    <p>Typical uses:</p>
    <ul>
      <li>Generative art</li>
      <li>Reproducible visual simulations</li>
      <li>Deterministic creative systems</li>
    </ul>

    <h2 id="execution-model">Execution Model</h2>
    <p>CodeMode uses a fixed canvas environment with deterministic randomness. The following rules apply:</p>
    <ul>
      <li>Canvas size is fixed at <strong>1950 x 2400</strong>.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createCanvas()</code> must not be called.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">setup()</code> is used instead of animation loops.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">random()</code> must be used for deterministic randomness.</li>
    </ul>

    <h2 id="example">Example</h2>
    <CodeBlock
      code={`function setup() {
  background(50);
  circle(975, 1200, 300);
}`}
      title="CodeMode Example"
    />

    <h2 id="deterministic-output">Deterministic Output</h2>
    <p>If the same code, seed, and parameters are used, the renderer produces the exact same output. This property allows verification of rendered artifacts.</p>
    <p>Any change to the inputs produces a different output, making it possible to detect modifications.</p>
  </>
);

export default CodeModeSDK;
