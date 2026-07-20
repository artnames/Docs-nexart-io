import { Link } from "react-router-dom";
import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Python Bridge

NexArt's canonical SDK is JavaScript. Python support is provided by a thin
bridge shipped inside @nexart/agent-kit (>=0.5.2) that invokes the JS SDK
through a Node.js subprocess. All hashing, canonicalization, and signing
remain in the canonical implementation.

## Why a bridge, not a native SDK
- Vendor-independent verification requires a single canonical hash and
  signature surface. Two parallel implementations (JS + Python) would risk
  cross-language hash drift and break "verify with any tool, anywhere".
- The bridge keeps Python ergonomic while keeping verification trustworthy.
- Tradeoff: Python users carry a Node.js runtime dependency.

## Requirements
- Node.js >= 18
- Python >= 3.10
- @nexart/agent-kit >= 0.5.2 installed via npm
- Python-only Docker images must add Node to the image

## Performance
- BridgeOneShot: ~130ms per call (cold subprocess, conservative default)
- BridgePersistent: ~0.4ms per call (long-lived worker, ~300x speedup)

## Distribution
- The bridge is NOT on PyPI.
- Two files ship inside the npm package at
  node_modules/@nexart/agent-kit/python-bridge/
    - nexart_bridge.mjs
    - nexart_bridge.py
- Copy both files into a nexart_bridge/ folder in your Python project.
- Follow PYTHON_BRIDGE_INSTRUCTIONS.md (also shipped in python-bridge/)
  for full setup.

## API
All functions take the bridge instance as their first positional argument.

  from nexart_bridge.nexart_bridge import (
      BridgeOneShot,
      certify_decision,
      verify_cer,
  )

  br = BridgeOneShot()
  bundle = certify_decision(
      br,
      decision="Recommend product X",
      output="product_x",
      provider="openai",
      model="gpt-4o",
  )
  result = verify_cer(br, bundle, verificationMode="detailed")

## Verification parity
CERs produced through the bridge are byte-identical to CERs produced by the
JS SDK. Verify them with verify.nexart.io, the JS SDK, the CLI, or the
bridge itself - all paths agree.`;

const PythonBridge = () => (
  <>
    <PageHeader
      title="Python Bridge — Use NexArt from Python"
      summary="Use NexArt from Python via a thin bridge to the canonical JavaScript SDK, shipped inside @nexart/agent-kit (>=0.5.2)."
      llmBlock={llmBlock}
    />

    <h2 id="why-a-bridge">Why a bridge and not a native SDK</h2>
    <p>
      NexArt's core promise is vendor-independent verification: a Certified
      Execution Record produced by any NexArt tool MUST be verifiable by any
      other NexArt tool, by an independent third party, and by the public
      <code> verify.nexart.io</code> endpoint, all producing byte-identical
      hashes. That guarantee depends on a single canonical implementation of
      hashing, canonicalization, and signing. Maintaining a parallel native
      Python SDK would introduce two implementations of the same cryptographic
      surface, and the smallest divergence between them - one library
      sorting object keys differently, one floating point edge case, one
      Unicode normalization choice - silently breaks cross-tool verification.
    </p>
    <p>
      The bridge resolves this by keeping the JavaScript SDK as the single
      source of truth and exposing a Python-shaped surface on top of it. The
      tradeoff is explicit and honest: Python users must carry a Node.js
      runtime dependency. In exchange, every CER produced from Python is
      byte-identical to one produced from JavaScript, and the verification
      story stays unified.
    </p>

    <h2 id="requirements">Requirements</h2>
    <ul>
      <li>Node.js {`>=`} 18</li>
      <li>Python {`>=`} 3.10</li>
      <li><code>@nexart/agent-kit</code> {`>=`} 0.5.2 installed via npm</li>
      <li>
        Python-only Docker images need Node added to the base image. Full
        deployment guidance lives in <code>PYTHON_BRIDGE_INSTRUCTIONS.md</code>
        inside the npm package.
      </li>
    </ul>

    <h2 id="performance">Performance</h2>
    <p>
      The bridge ships two transports. Pick by call volume.
    </p>
    <ul>
      <li>
        <strong><code>BridgeOneShot</code></strong> — spawns a fresh Node
        subprocess per call. Roughly 130ms per invocation. Conservative
        default. Use for scripts, batch jobs, low-frequency certification.
      </li>
      <li>
        <strong><code>BridgePersistent</code></strong> — keeps a long-lived
        Node worker alive and dispatches calls over its stdio. Roughly 0.4ms
        per invocation - about a 300x speedup. Use for servers, hot loops,
        and per-request certification.
      </li>
    </ul>
    <p>
      Start with <code>BridgeOneShot</code> until you measure that the
      subprocess cost matters. Switching is a one-line change.
    </p>

    <h2 id="api">API</h2>
    <p>
      Every bridge function takes the bridge instance as its first
      positional argument. Without it, the function has no Node process to
      dispatch to. The shape mirrors <code>@nexart/agent-kit</code>'s JS API,
      with Python casing.
    </p>
    <CodeBlock
      language="python"
      title="certify_decision_example.py"
      code={`from nexart_bridge.nexart_bridge import (
    BridgeOneShot,
    certify_decision,
    verify_cer,
)

br = BridgeOneShot()

bundle = certify_decision(
    br,
    decision="Recommend product X to user 123",
    output="product_x",
    provider="openai",
    model="gpt-4o",
)

result = verify_cer(br, bundle, verificationMode="detailed")
if result["status"] != "VERIFIED":
    raise RuntimeError(f"CER verification failed: {result['reasonCodes']}")

print("Certified:", bundle["certificateHash"])
print("Status:   ", result["status"])`}
    />
    <p>
      For default (non-detailed) verification, omit{" "}
      <code>verificationMode</code>:
    </p>
    <CodeBlock
      language="python"
      code={`ok = verify_cer(br, bundle)  # returns boolean-shaped result`}
    />

    <h2 id="where-the-bridge-lives">Where the bridge lives</h2>
    <p>
      The bridge is <strong>not published on PyPI</strong>. It is shipped as
      two files inside the <code>@nexart/agent-kit</code> npm package, at:
    </p>
    <CodeBlock
      language="bash"
      code={`node_modules/@nexart/agent-kit/python-bridge/
  ├── nexart_bridge.mjs              # Node-side dispatcher
  ├── nexart_bridge.py               # Python-side client
  └── PYTHON_BRIDGE_INSTRUCTIONS.md  # full setup reference`}
    />
    <p>
      Setup is three steps:
    </p>
    <ol>
      <li>
        Install the npm package in a directory accessible to your Python
        process: <code>npm install @nexart/agent-kit@&gt;=0.5.2</code>.
      </li>
      <li>
        Copy both <code>nexart_bridge.mjs</code> and{" "}
        <code>nexart_bridge.py</code> from{" "}
        <code>node_modules/@nexart/agent-kit/python-bridge/</code> into a{" "}
        <code>nexart_bridge/</code> folder inside your Python project.
      </li>
      <li>
        Import with{" "}
        <code>from nexart_bridge.nexart_bridge import ...</code>. Full
        instructions, including container deployment, are in{" "}
        <code>PYTHON_BRIDGE_INSTRUCTIONS.md</code>.
      </li>
    </ol>
    <p>
      Do not <code>pip install</code> anything. There is no PyPI package and
      none is planned.
    </p>

    <h2 id="verification-parity">Verification parity</h2>
    <p>
      Bundles produced through the bridge are byte-identical to bundles
      produced by the JavaScript SDK directly. The same{" "}
      <code>certificateHash</code> falls out of either path, and the same
      signatures verify. That means a Python-produced CER verifies cleanly
      with:
    </p>
    <ul>
      <li><code>verify.nexart.io/c/{`{certificateHash}`}</code></li>
      <li>The JavaScript SDK (<code>verifyAiCerBundleDetailed</code>)</li>
      <li>The <Link to="/docs/cli">NexArt CLI</Link></li>
      <li>The bridge's own <code>verify_cer</code></li>
    </ul>
    <p>
      All paths agree because all paths run the same canonical
      implementation underneath.
    </p>

    <h2 id="related">Related</h2>
    <ul>
      <li><Link to="/docs/concepts/cer">Certified Execution Records</Link></li>
      <li><Link to="/docs/verification">How Verification Works</Link></li>
      <li><Link to="/docs/certifying-llm-conversations">Certifying LLM Conversations</Link></li>
      <li><Link to="/docs/agent-kit">Agent Kit</Link></li>
      <li><Link to="/docs/agent-kit-instructions">Agent-Kit Instructions for AI Agents</Link></li>
    </ul>
  </>
);

export default PythonBridge;
