import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt CLI

The NexArt CLI is a command-line tool for deterministic execution and verification.

## Purpose
- Run deterministic renders using canonical renderer rules
- Generate execution snapshots
- Verify outputs locally

## Installation
npx --yes @nexart/cli@0.2.3 --help

## Environment Variables
- NEXART_RENDERER_ENDPOINT: URL of the canonical renderer service
- NEXART_API_KEY: API key for authenticated renders

## Running a Render
npx --yes @nexart/cli@0.2.3 run ./examples/sketch.js \\
  --seed 12345 \\
  --vars "50,50,50,0,0,0,0,0,0,0" \\
  --include-code \\
  --out out.png

## Verification
npx --yes @nexart/cli@0.2.3 verify out.snapshot.json

Verification re-runs the execution using the same inputs and confirms the output hash matches.`;

const NexArtCLI = () => (
  <>
    <PageHeader
      title="NexArt CLI"
      summary="Command-line interface for deterministic rendering and verification workflows."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>The NexArt CLI is a command-line interface for deterministic rendering and verification workflows.</p>
    <p>It allows developers to run canonical renders, generate execution snapshots, and verify deterministic outputs without building custom tooling.</p>
    <p>The CLI is typically used for:</p>
    <ul>
      <li>Deterministic generative rendering</li>
      <li>Snapshot generation</li>
      <li>Local verification</li>
      <li>Reproducible builds</li>
    </ul>

    <h2 id="installation">Installation</h2>
    <p>The CLI can be run directly with npx. No global install is required.</p>
    <CodeBlock
      code={`npx --yes @nexart/cli@0.2.3 --help`}
      title="Install / Help"
    />

    <h2 id="environment">Environment Variables</h2>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NEXART_RENDERER_ENDPOINT</code> is the URL of the canonical renderer service.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NEXART_API_KEY</code> is the API key used for authenticated renders.</li>
    </ul>

    <h2 id="running">Running a Render</h2>
    <p>Use the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">run</code> command to execute a render with a specific seed and parameters.</p>
    <CodeBlock
      code={`npx --yes @nexart/cli@0.2.3 run ./examples/sketch.js \\
  --seed 12345 \\
  --vars "50,50,50,0,0,0,0,0,0,0" \\
  --include-code \\
  --out out.png`}
      title="Run a Render"
    />

    <h2 id="verification">Verification</h2>
    <p>Use the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verify</code> command to verify a snapshot. Verification re-runs the execution using the same inputs and confirms the output hash matches.</p>
    <CodeBlock
      code={`npx --yes @nexart/cli@0.2.3 verify out.snapshot.json`}
      title="Verify a Snapshot"
    />
  </>
);

export default NexArtCLI;
