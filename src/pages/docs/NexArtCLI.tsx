import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# NexArt CLI

The NexArt CLI is a command-line tool for deterministic execution, verification, and AI execution certification.

## Deterministic Rendering
- Run deterministic renders using canonical renderer rules
- Generate execution snapshots
- Verify outputs locally

## Installation
npx @nexart/cli --help

## Environment Variables
- NEXART_RENDERER_ENDPOINT: URL of the canonical renderer service
- NEXART_API_KEY: API key for authenticated renders

## Running a Render
npx --yes @nexart/cli@0.2.3 run ./examples/sketch.js --seed 12345 --vars "50,50,50,0,0,0,0,0,0,0" --include-code --out out.png

## Verification
npx --yes @nexart/cli@0.2.3 verify out.snapshot.json

## AI Execution Certification
Commands: nexart ai create, nexart ai certify, nexart ai verify
These commands create, certify, and verify Certified Execution Records (CERs) from JSON execution inputs.`;

const NexArtCLI = () => (
  <>
    <PageHeader
      title="NexArt CLI"
      summary="Command-line interface for deterministic rendering, verification, and AI execution certification."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>The NexArt CLI is a command-line interface for deterministic rendering, verification, and AI execution certification.</p>
    <p>It supports two primary capabilities:</p>
    <ol>
      <li><strong>Deterministic rendering workflows</strong> — run canonical renders, generate execution snapshots, and verify deterministic outputs.</li>
      <li><strong>AI execution certification</strong> — create, certify, and verify Certified Execution Records (CERs) from JSON execution inputs.</li>
    </ol>
    <p>NexArt CLI is commonly used in local development environments, CI pipelines, and automation systems where executions must be certified or verified without building custom API integrations.</p>

    <h2 id="installation">Installation</h2>
    <p>The CLI can be run directly with npx. No global install is required.</p>
    <CodeBlock
      code={`npx @nexart/cli --help`}
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

    <h2 id="ai-certification">AI Execution Certification</h2>
    <p>The NexArt CLI also supports creating and certifying AI execution records.</p>
    <p>These commands generate Certified Execution Records (CERs) that can be verified publicly or offline.</p>
    <p>The AI command group:</p>
    <CodeBlock
      code={`nexart ai create\nnexart ai certify\nnexart ai verify`}
      title="AI Commands"
    />
    <CodeBlock
      code={`nexart ai\n\nCommands:\n  nexart ai create [file]   Create a Certified Execution Record (CER) bundle\n  nexart ai certify [file]  Certify an execution and request node attestation\n  nexart ai verify [file]   Verify a CER bundle locally`}
      title="CLI Help"
    />
    <p>These commands operate on execution JSON files that describe the AI input, output, and metadata for the run.</p>

    <h3 id="ai-create">Create a CER Bundle</h3>
    <p>Create a Certified Execution Record locally.</p>
    <CodeBlock code={`npx @nexart/cli ai create execution.json`} title="Create a CER" />
    <p>Example execution input:</p>
    <CodeBlock
      language="json"
      title="execution.json"
      code={`{
  "executionId": "demo-001",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "input": {
    "messages": [
      {
        "role": "user",
        "content": "Should this automated report be approved?"
      }
    ]
  },
  "output": {
    "decision": "approve",
    "reason": "policy_passed"
  }
}`}
    />
    <p>Save the generated CER bundle:</p>
    <CodeBlock code={`npx @nexart/cli ai create execution.json --out cer.json`} title="Save CER Bundle" />
    <p>This command:</p>
    <ul>
      <li>Builds the canonical CER bundle</li>
      <li>Computes the certificate hash</li>
      <li>Prepares the record for certification</li>
    </ul>

    <h3 id="ai-certify">Certify an Execution</h3>
    <p>Request certification and node attestation.</p>
    <CodeBlock code={`npx @nexart/cli ai certify execution.json`} title="Certify" />
    <p>Example output:</p>
    <CodeBlock
      code={`CER certified\ncertificateHash: sha256:...\nverificationUrl: https://verify.nexart.io/e/demo-001`}
      title="Certify Result"
    />
    <p>This command sends the execution to the NexArt node for certification.</p>

    <h3 id="ai-verify">Verify a CER Bundle</h3>
    <p>Verify a Certified Execution Record locally.</p>
    <CodeBlock code={`npx @nexart/cli ai verify cer.json`} title="Verify CER" />
    <p>Example result:</p>
    <CodeBlock
      code={`Verification result: PASS\nbundleIntegrity: PASS\nnodeAttestation: PRESENT`}
      title="Verification Result"
    />
    <p>Local verification confirms that the bundle contents match the certificate hash.</p>

    <h2 id="related">Related Guides</h2>
    <ul>
      <li><Link to="/docs/quickstart" className="text-primary hover:underline">Quickstart</Link></li>
      <li><Link to="/docs/integrations/n8n" className="text-primary hover:underline">n8n Integration</Link></li>
      <li><Link to="/docs/verification" className="text-primary hover:underline">Verification</Link></li>
      <li><Link to="/docs/concepts/cer" className="text-primary hover:underline">CER Anatomy</Link></li>
      <li><Link to="/docs/concepts/signed-receipts" className="text-primary hover:underline">Signed Receipts</Link></li>
    </ul>
  </>
);

export default NexArtCLI;
