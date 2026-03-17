import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# NexArt CLI

The NexArt CLI (@nexart/cli@0.4.0) is a command-line tool for creating, certifying, and verifying Certified Execution Records (CERs).

## Tasks
- Create a CER locally (nexart ai create)
- Certify an execution with node attestation (nexart ai certify)
- Verify a CER bundle offline (nexart ai verify)
- Run deterministic renders (nexart run)

## Installation
npx @nexart/cli@0.4.0 --help

## Environment Variables
- NEXART_RENDERER_ENDPOINT: URL of the canonical renderer service
- NEXART_API_KEY: API key for authenticated operations`;

const NexArtCLI = () => (
  <>
    <PageHeader
      title="NexArt CLI"
      summary="Command-line interface for creating, certifying, and verifying Certified Execution Records."
      llmBlock={llmBlock}
    />

    <h2>Best For</h2>
    <ul>
      <li>Local development and testing</li>
      <li>Offline verification of CER bundles</li>
      <li>CI pipelines and automation scripts</li>
      <li>Engineers who prefer command-line workflows</li>
    </ul>

    <h2>Overview</h2>
    <p>
      The NexArt CLI supports three distinct operations for AI execution certification:
    </p>
    <ul>
      <li><strong>Local creation</strong>: generate a CER bundle and certificate hash without contacting the network</li>
      <li><strong>Node certification</strong>: send an execution to the NexArt node for attestation and receive a signed receipt</li>
      <li><strong>Local verification</strong>: verify a CER bundle offline by checking hash integrity and signature validity</li>
    </ul>
    <p>
      The CLI also supports deterministic rendering workflows for canvas-based executions.
    </p>

    <h2>Installation</h2>
    <CodeBlock code={`npx @nexart/cli@0.4.0 --help`} title="Install / Help" />

    <h2>Environment Variables</h2>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NEXART_API_KEY</code>: API key for node certification</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NEXART_RENDERER_ENDPOINT</code>: URL of the canonical renderer service (for rendering workflows)</li>
    </ul>

    <h2>Create a CER Locally</h2>
    <p>Generate a Certified Execution Record from a JSON execution input. No network call required.</p>
    <CodeBlock code={`npx @nexart/cli@0.4.0 ai create execution.json`} title="Create a CER" />
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
    <p>Save the bundle to a file:</p>
    <CodeBlock code={`npx @nexart/cli@0.4.0 ai create execution.json --out cer.json`} title="Save CER Bundle" />
    <p>This builds the canonical CER bundle, computes the certificate hash, and outputs the record.</p>

    <h2>Certify an Execution</h2>
    <p>Send an execution to the NexArt node for attestation. Returns a signed receipt and a public verification URL.</p>
    <CodeBlock code={`npx @nexart/cli@0.4.0 ai certify execution.json`} title="Certify" />
    <p>Example output:</p>
    <CodeBlock
      code={`CER certified\ncertificateHash: sha256:...\nverificationUrl: https://verify.nexart.io/e/demo-001`}
      title="Certify Result"
    />

    <h2>Verify a CER Bundle</h2>
    <p>Verify a CER bundle locally. Checks hash integrity, signature validity, and receipt consistency.</p>
    <CodeBlock code={`npx @nexart/cli@0.4.0 ai verify cer.json`} title="Verify CER" />
    <p>Example result:</p>
    <CodeBlock
      code={`status: VERIFIED\nbundleIntegrity: PASS\nnodeSignature: PASS\nreceiptConsistency: PASS`}
      title="Verification Result"
    />

    <h2>Use in Automation or CI</h2>
    <p>The CLI can be used in CI pipelines to certify and verify executions as part of automated workflows:</p>
    <CodeBlock language="bash" title="CI Example" code={`# Certify an execution and save the bundle
npx @nexart/cli@0.4.0 ai certify execution.json --out cer.json

# Verify the bundle in a later step
npx @nexart/cli@0.4.0 ai verify cer.json`} />

    <h2>Context Signals</h2>
    <p>Attach structured metadata to a CER using a signals file:</p>
    <CodeBlock code={`npx @nexart/cli@0.4.0 ai create execution.json --signals-file signals.json`} title="Create with Signals" />
    <CodeBlock code={`npx @nexart/cli@0.4.0 ai certify execution.json --signals-file signals.json`} title="Certify with Signals" />
    <p>
      Signals are included in the certificate hash. See{" "}
      <Link to="/docs/concepts/context-signals" className="text-primary hover:underline">Context Signals</Link> for
      the full specification.
    </p>

    <h2>Deterministic Rendering</h2>
    <p>The CLI also supports deterministic rendering workflows for canvas-based executions:</p>
    <CodeBlock
      code={`npx @nexart/cli@0.4.0 run ./examples/sketch.js \\
  --seed 12345 \\
  --vars "50,50,50,0,0,0,0,0,0,0" \\
  --include-code \\
  --out out.png`}
      title="Run a Render"
    />
    <CodeBlock code={`npx @nexart/cli@0.4.0 verify out.snapshot.json`} title="Verify a Snapshot" />

    <h2>Next Steps</h2>
    <ul>
      <li>
        <Link to="/docs/quickstart" className="text-primary hover:underline">Quickstart</Link>
        : create your first CER in three steps
      </li>
      <li>
        <Link to="/docs/verification" className="text-primary hover:underline">Verification</Link>
        : deep dive into verification semantics
      </li>
      <li>
        <Link to="/docs/examples" className="text-primary hover:underline">Examples</Link>
        : copy-ready API requests and response shapes
      </li>
      <li>
        <Link to="/docs/integrations/langchain" className="text-primary hover:underline">LangChain</Link>
        : certify AI chain and agent executions
      </li>
      <li>
        <Link to="/docs/integrations/n8n" className="text-primary hover:underline">n8n</Link>
        : certify workflow automation results
      </li>
    </ul>
  </>
);

export default NexArtCLI;
