import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";
import TechnicalTruth from "@/components/docs/TechnicalTruth";
import SealedVsCertified from "@/components/docs/SealedVsCertified";
import CanonicalFlow from "@/components/docs/CanonicalFlow";
import { Link } from "react-router-dom";

const llmBlock = `# NexArt CLI

Package: @nexart/cli@0.17.0

The NexArt CLI is a thin command-line surface over the AI Execution SDK
(@nexart/ai-execution@0.23.0). It contains zero CER cryptographic logic.
All hashing, canonicalization (protocol-bound: nexart-v1 for 1.2.0, jcs-v1 / RFC 8785 for 1.3.0),
and verification is delegated to the SDK.

## Canonical workflow
1. Create execution input (JSON file matching CreateSnapshotParams).
2. Seal locally          -> nexart ai seal     (offline, no API key)
3. Verify locally        -> nexart ai verify   (integrity PASS, receipt/envelope SKIPPED)
4. Optional: certify     -> nexart ai certify  (node attestation, requires NEXART_API_KEY)
5. Verify again          -> nexart ai verify   (integrity PASS, receipt PASS, envelope PASS)

## Terminology
- Sealed   = integrity only. Local artifact. No node attestation. Layer 1 PASS, Layers 2 and 3 SKIPPED.
- Certified = integrity + node attestation + verification envelope. Layers 1, 2, 3 all PASS.
SKIPPED is not a failure. It means the layer is not applicable to the bundle.

## Commands
- nexart ai seal <input.json> [--out cer.json] [--protocol-version 1.2.0|1.3.0]
    Fully offline. Delegates to SDK createSnapshot() + sealCer().
    Output: cer.ai.execution.v1 bundle, version "0.1", with certificateHash.
    --protocol-version overrides the producer default for this invocation.
    Default: 1.2.0 (nexart-v1). Opt into 1.3.0 (jcs-v1 / RFC 8785) only when
    a standards-based canonicalization is required.
    Produces NO attestation, NO receipt, NO verification envelope.

- nexart ai certify <input.json> [--out cer.json] [--protocol-version 1.2.0|1.3.0]
    Calls POST /v1/cer/ai/certify on the attestation node.
    Requires NEXART_API_KEY and NEXART_NODE_URL.
    Output: certified CER bundle with meta.attestation and meta.verificationEnvelope.

- nexart ai verify <bundle-or-package.json>
    Pure delegation to verifyAiCerBundleDetailed(). The CLI performs no
    hash recomputation, no canonicalization, no signature checks. The CLI
    is an input router and an output formatter. Verifiers select the
    canonicalization profile from the bundle's protocolVersion; the
    --protocol-version flag is producer-only and has no effect here.

## Bundle versions
- Bundle version: "0.1"
- Protocol version (default): 1.2.0 (nexart-v1)
- Protocol version (opt-in):  1.3.0 (jcs-v1 / RFC 8785)
- CLI version: 0.11.0
- SDK version: 0.22.0

## Verification result for a SEALED bundle
{
  "status": "VERIFIED",
  "integrity": "PASS",
  "receipt":   "SKIPPED",
  "envelope":  "SKIPPED"
}

## Verification result for a CERTIFIED bundle
{
  "status": "VERIFIED",
  "integrity": "PASS",
  "receipt":   "PASS",
  "envelope":  "PASS"
}`;

const NexArtCLI = () => (
  <>
    <DocsMeta
      title="NexArt CLI"
      description="NexArt CLI v0.8.1: seal CERs locally, certify via the node, and verify bundles. A thin delegation layer over @nexart/ai-execution."
    />
    <PageHeader
      title="NexArt CLI"
      summary="Command-line surface over the AI Execution SDK. Seal locally, certify optionally, verify anywhere."
      llmBlock={llmBlock}
    />
    <CanonicalFlow context="CLI commands map directly to this flow." />

    <TechnicalTruth />

    <h2>Best For</h2>
    <ul>
      <li>Local development and testing</li>
      <li>Offline sealing of CER bundles (no network, no API key)</li>
      <li>Offline verification of CER bundles and CER packages</li>
      <li>CI pipelines and automation scripts</li>
    </ul>

    <h2>Architecture: CLI is a delegation layer</h2>
    <p>
      As of <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/cli@0.16.1</code>, the CLI
      contains <strong>zero CER cryptographic logic</strong>. Every operation is delegated to{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ai-execution@0.23.0</code>:
    </p>
    <ul>
      <li>
        <strong>SDK owns:</strong> snapshot creation, protocol-bound canonicalization (nexart-v1 / jcs-v1), hashing,
        sealing, verification logic.
      </li>
      <li>
        <strong>CLI owns:</strong> command surface, file I/O, argument parsing, output formatting.
      </li>
      <li>
        <strong>Node owns:</strong> attestation, Ed25519 receipt signing, verification envelope signature.
      </li>
    </ul>
    <p className="text-sm text-muted-foreground">
      The CLI does not recompute hashes, does not canonicalize JSON, and does not validate signatures. It routes input
      to the SDK and prints what the SDK returns.
    </p>

    <h2>Canonical workflow</h2>
    <p>The recommended order for any new integration:</p>
    <CodeBlock
      language="bash"
      title="seal -> verify -> (optional) certify -> verify"
      code={`# 1. Seal locally (offline, no API key)
npx @nexart/cli@0.17.0 ai seal execution.json --out cer.json

# 2. Verify the sealed bundle
npx @nexart/cli@0.17.0 ai verify cer.json
# integrity: PASS, receipt: SKIPPED, envelope: SKIPPED

# 3. (Optional) Certify via the attestation node
export NEXART_NODE_URL="https://node.nexart.io"
export NEXART_API_KEY="<your-api-key>"
npx @nexart/cli@0.17.0 ai certify execution.json --out cer.certified.json

# 4. Verify again (now attested)
npx @nexart/cli@0.17.0 ai verify cer.certified.json
# integrity: PASS, receipt: PASS, envelope: PASS`}
    />

    <SealedVsCertified />

    <h2>Installation</h2>
    <CodeBlock code={`npx @nexart/cli@0.17.0 --help`} title="Install / Help" />

    <h2>Environment Variables</h2>
    <ul>
      <li>
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NEXART_API_KEY</code>: required for{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ai certify</code>. Not required for{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ai seal</code> or{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ai verify</code>.
      </li>
      <li>
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NEXART_NODE_URL</code>: attestation node URL.
        Required for <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">ai certify</code>.
      </li>
      <li>
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NEXART_RENDERER_ENDPOINT</code>: URL of the
        canonical renderer service (for deterministic rendering workflows).
      </li>
    </ul>

    <h2 id="seal">nexart ai seal (v0.8.1+)</h2>
    <p>
      Seal an execution into a CER bundle <strong>fully offline</strong>. No node call, no API key, no network access.
      Delegates to the SDK functions{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createSnapshot()</code> and{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">sealCer()</code>.
    </p>

    <h3>Input contract</h3>
    <p>
      The input file MUST be a JSON object matching{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">CreateSnapshotParams</code> exactly, as defined
      by <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ai-execution@0.23.0</code>:
    </p>
    <CodeBlock
      language="json"
      title="execution.json (CreateSnapshotParams)"
      code={`{
  "executionId": "demo-001",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "input": {
    "messages": [
      { "role": "user", "content": "Should this report be approved?" }
    ]
  },
  "output": {
    "decision": "approve",
    "reason": "policy_passed"
  }
}`}
    />

    <h3>Command</h3>
    <CodeBlock code={`npx @nexart/cli@0.17.0 ai seal execution.json --out cer.json`} title="Seal a CER" />

    <h3>Output</h3>
    <p>The command writes a CER bundle with:</p>
    <ul>
      <li>
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType: "cer.ai.execution.v1"</code>
      </li>
      <li>
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">version: "0.1"</code>
      </li>
      <li>
        computed <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> (SHA-256 over
        JCS-canonicalized whitelist projection)
      </li>
      <li>
        <strong>no</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code>
      </li>
      <li>
        <strong>no</strong> receipt
      </li>
      <li>
        <strong>no</strong> verification envelope
      </li>
    </ul>

    <h3>Verification result for a sealed bundle</h3>
    <CodeBlock
      language="json"
      title="ai verify (sealed bundle)"
      code={`{
  "status": "VERIFIED",
  "integrity": "PASS",
  "receipt":   "SKIPPED",
  "envelope":  "SKIPPED",
  "cli": {
    "inputType": "bundle",
    "cliVersion": "0.8.1"
  }
}`}
    />
    <p className="text-sm text-muted-foreground">
      <strong>SKIPPED is not a failure.</strong> It means the layer does not apply to a sealed (non-attested) bundle.
      The bundle is a fully valid CER; it has just not been certified by a node.
    </p>

    <h2 id="certify">nexart ai certify</h2>
    <p>
      Send an execution to the NexArt attestation node for certification. The node returns a signed Ed25519 receipt and
      a verification envelope. Requires{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NEXART_API_KEY</code> and{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NEXART_NODE_URL</code>.
    </p>
    <CodeBlock code={`npx @nexart/cli@0.17.0 ai certify execution.json --out cer.certified.json`} title="Certify" />
    <CodeBlock
      code={`CER certified
certificateHash: sha256:...
verificationUrl: https://verify.nexart.io/c/sha256:...`}
      title="Certify Result"
    />
    <p className="text-sm text-muted-foreground">
      The certified bundle has identical{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">certificateHash</code> to a sealed bundle created
      from the same input. Certification adds{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">meta.attestation</code> and{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">meta.verificationEnvelope</code> without
      modifying any hashed field.
    </p>

    <h2 id="verify">nexart ai verify</h2>
    <p>
      As of v0.8.1, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">nexart ai verify</code> is a{" "}
      <strong>pure delegation</strong> to{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyAiCerBundleDetailed()</code> in{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ai-execution@0.23.0</code>. The CLI:
    </p>
    <ul>
      <li>
        does <strong>not</strong> recompute the{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">certificateHash</code>
      </li>
      <li>
        does <strong>not</strong> canonicalize JSON
      </li>
      <li>
        does <strong>not</strong> validate signatures
      </li>
      <li>only routes the input file to the SDK and formats the SDK's result</li>
    </ul>
    <p>
      The command accepts both raw CER bundles and{" "}
      <Link to="/docs/ai-cer-package-format" className="text-primary hover:underline">
        CER packages
      </Link>
      .
    </p>

    <h3>Verify a sealed (local) CER bundle</h3>
    <CodeBlock code={`npx @nexart/cli@0.11.0 ai verify cer.json`} title="Verify Sealed Bundle" />
    <CodeBlock
      language="json"
      title="Sealed bundle result"
      code={`{
  "status": "VERIFIED",
  "integrity": "PASS",
  "receipt":   "SKIPPED",
  "envelope":  "SKIPPED",
  "cli": {
    "inputType": "bundle",
    "cliVersion": "0.8.1"
  }
}`}
    />

    <h3>Verify a certified CER bundle</h3>
    <CodeBlock code={`npx @nexart/cli@0.11.0 ai verify cer.certified.json`} title="Verify Certified Bundle" />
    <CodeBlock
      language="json"
      title="Certified bundle result"
      code={`{
  "status": "VERIFIED",
  "integrity": "PASS",
  "receipt":   "PASS",
  "envelope":  "PASS",
  "cli": {
    "inputType": "bundle",
    "cliVersion": "0.8.1"
  }
}`}
    />

    <h3>Verify a CER package</h3>
    <p>
      When the input is a CER package, the CLI extracts and verifies the inner CER bundle through the SDK. Package-level
      trust layers (e.g. verification envelope at the package wrapper) are not fully verified by this command.
    </p>
    <CodeBlock code={`npx @nexart/cli@0.11.0 ai verify package.json`} title="Verify CER Package" />
    <CodeBlock
      language="json"
      title="Package result"
      code={`{
  "status": "VERIFIED",
  "integrity": "PASS",
  "receipt":   "PASS",
  "envelope":  "PASS",
  "cli": {
    "inputType": "package",
    "verifiedInnerCer": true,
    "packageTrustLayersVerified": false,
    "cliVersion": "0.8.1"
  }
}`}
    />
    <p className="text-sm text-muted-foreground">
      <strong>Output schema:</strong> top-level fields (
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">status</code>,{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">integrity</code>,{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">receipt</code>,{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">envelope</code>) come directly from the SDK.{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">cli.*</code> fields are additive CLI metadata and
      do not participate in verification semantics.
    </p>

    <h2>Use in Automation or CI</h2>
    <CodeBlock
      language="bash"
      title="CI Example"
      code={`# Seal locally during build (offline, no secrets)
npx @nexart/cli@0.11.0 ai seal execution.json --out cer.json
npx @nexart/cli@0.11.0 ai verify cer.json

# Certify on release (requires API key)
npx @nexart/cli@0.11.0 ai certify execution.json --out cer.certified.json
npx @nexart/cli@0.11.0 ai verify cer.certified.json`}
    />

    <h2>Context Signals</h2>
    <p>Attach structured metadata to a CER using a signals file. Signals are included in the certificateHash.</p>
    <CodeBlock
      code={`npx @nexart/cli@0.11.0 ai seal    execution.json --signals-file signals.json
npx @nexart/cli@0.11.0 ai certify execution.json --signals-file signals.json`}
      title="With Signals"
    />
    <p>
      See{" "}
      <Link to="/docs/concepts/context-signals" className="text-primary hover:underline">
        Context Signals
      </Link>{" "}
      for the full specification.
    </p>

    <h2>Deterministic Rendering</h2>
    <p>The CLI also supports deterministic rendering workflows for canvas-based executions:</p>
    <CodeBlock
      code={`npx @nexart/cli@0.11.0 run ./examples/sketch.js \\
  --seed 12345 \\
  --vars "50,50,50,0,0,0,0,0,0,0" \\
  --include-code \\
  --out out.png`}
      title="Run a Render"
    />
    <CodeBlock code={`npx @nexart/cli@0.11.0 verify out.snapshot.json`} title="Verify a Snapshot" />

    <h2>Versions</h2>
    <ul>
      <li>
        CLI: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/cli@0.11.0</code>
      </li>
      <li>
        SDK: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">@nexart/ai-execution@0.23.0</code>
      </li>
      <li>
        Bundle version: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">"0.1"</code>
      </li>
      <li>
        Protocol version (default): <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">1.2.0</code> (
        <code>nexart-v1</code>)
      </li>
      <li>
        Protocol version (opt-in): <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">1.3.0</code> (
        <code>jcs-v1</code>, RFC 8785) via{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">--protocol-version 1.3.0</code>
      </li>
    </ul>

    <h2>Next Steps</h2>
    <ul>
      <li>
        <Link to="/docs/quickstart" className="text-primary hover:underline">
          Quickstart
        </Link>
        : seal then verify in three steps
      </li>
      <li>
        <Link to="/docs/architecture" className="text-primary hover:underline">
          Architecture
        </Link>
        : SDK / CLI / Node ownership boundaries
      </li>
      <li>
        <Link to="/docs/verification" className="text-primary hover:underline">
          Verification
        </Link>
        : layer-by-layer semantics
      </li>
      <li>
        <Link to="/docs/sdk" className="text-primary hover:underline">
          AI Execution SDK
        </Link>
        : programmatic seal and certify
      </li>
      <li>
        <Link to="/docs/integrations/langchain" className="text-primary hover:underline">
          LangChain
        </Link>{" "}
        /{" "}
        <Link to="/docs/integrations/n8n" className="text-primary hover:underline">
          n8n
        </Link>
        : framework integrations
      </li>
    </ul>
  </>
);

export default NexArtCLI;
