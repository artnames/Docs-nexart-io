import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# Confidential Execution Mode (SDK v1.1.0)
Confidential mode replaces sensitive CER fields (input, output) with
HMAC-SHA256 commitments. Plaintext stays client-side; the NexArt node
never receives raw input or output.

- Scheme: hmac-sha256-v1
- commitment = HMAC(salt, value)
- Salts (openings) are generated client-side and never sent to the node.
- Two verification modes:
  1. Authenticity (default) - confirms record integrity, no content disclosed.
  2. Equality (with openings) - proves a plaintext matches the commitment.
- Fail-closed: invalid scheme, missing salt, or unsupported field -> throw.
- Prompt remains plaintext in protocol 1.3.0.
- Node pipeline is unchanged; commitments are treated as standard snapshot data.

API: sealConfidential(), generateSalt() from @nexart/ai-execution.`;

const ConfidentialMode = () => (
  <>
    <PageHeader
      title="Confidential Execution Mode"
      summary="SDK v1.1.0. Replace sensitive CER fields with cryptographic commitments while keeping plaintext client-side."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>
      Confidential mode allows developers to:
    </p>
    <ul>
      <li>Replace sensitive fields (<code>input</code>, <code>output</code>) with cryptographic commitments.</li>
      <li>Keep plaintext data entirely client-side.</li>
      <li>Still produce a verifiable Certified Execution Record (CER).</li>
    </ul>
    <p className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
      The NexArt node never receives raw input or output in confidential mode.
    </p>

    <h2 id="what-changes">What Changes</h2>
    <p>The difference is local to the execution snapshot.</p>

    <CodeBlock
      title="Plain mode (snapshot excerpt)"
      language="json"
      code={`{
  "input":  "Should this refund be approved?",
  "output": "approve: policy_passed"
}`}
    />

    <CodeBlock
      title="Confidential mode (snapshot excerpt)"
      language="json"
      code={`{
  "input": {
    "_redacted": true,
    "scheme": "hmac-sha256-v1",
    "commitment": "sha256:b1c4...e9f2"
  },
  "output": {
    "_redacted": true,
    "scheme": "hmac-sha256-v1",
    "commitment": "sha256:7a02...41dc"
  }
}`}
    />

    <h2 id="commitment-model">Commitment Model</h2>
    <ul>
      <li><strong>Scheme:</strong> <code>hmac-sha256-v1</code></li>
      <li>Each committed field uses an independently generated salt (the <em>opening</em>).</li>
      <li><code>commitment = HMAC_SHA256(salt, value)</code></li>
    </ul>
    <p>Properties:</p>
    <ul>
      <li><strong>Not reversible.</strong> The commitment does not disclose the value.</li>
      <li><strong>Not guessable</strong> without the salt, even for low-entropy values.</li>
      <li><strong>Deterministic</strong> for the same <code>(value, salt)</code> pair.</li>
    </ul>

    <h2 id="openings">Openings</h2>
    <p>Openings are the per-field salts. They are:</p>
    <ul>
      <li>Generated client-side at sealing time.</li>
      <li>Never transmitted to the node.</li>
      <li>Required to later prove equality between a plaintext and a commitment.</li>
    </ul>
    <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
      If you lose the openings, you cannot prove the original content. The commitment alone is not sufficient.
    </p>

    <h2 id="verification-modes">Verification Modes</h2>
    <ol>
      <li>
        <strong>Authenticity verification (default).</strong> Confirms record integrity, signature,
        and envelope. Does not reveal or disclose committed content.
      </li>
      <li>
        <strong>Equality verification (with openings).</strong> Given a candidate plaintext and the
        corresponding opening, recomputes <code>HMAC(salt, value)</code> and checks it against the
        commitment. Proves that the supplied plaintext is the value originally committed.
      </li>
    </ol>

    <h2 id="fail-closed">Fail-Closed Behavior</h2>
    <ul>
      <li>Invalid scheme &rarr; throw.</li>
      <li>Missing salt for a committed field &rarr; throw.</li>
      <li>Attempt to commit unsupported fields &rarr; throw.</li>
      <li><code>prompt</code> remains plaintext in protocol <code>1.3.0</code> and MUST NOT be committed.</li>
    </ul>

    <h2 id="security-model">Security Model</h2>
    <p>Confidential mode guarantees:</p>
    <ul>
      <li>The node cannot read the committed sensitive fields.</li>
      <li>Third parties cannot reconstruct data from commitments alone.</li>
    </ul>
    <p>It does NOT guarantee:</p>
    <ul>
      <li>Confidentiality of non-committed fields (e.g. <code>prompt</code>, <code>provider</code>, <code>model</code>, <code>parameters</code>).</li>
      <li>Protection if openings are leaked. Anyone with the opening and the commitment can verify, and in low-entropy cases, brute-force the value.</li>
    </ul>

    <h2 id="implementation">Implementation (SDK)</h2>
    <CodeBlock
      title="Minimal usage"
      language="typescript"
      code={`import { sealConfidential, generateSalt } from "@nexart/ai-execution";

const inputSalt  = generateSalt();
const outputSalt = generateSalt();

const bundle = sealConfidential({
  provider:   "openai",
  model:      "gpt-4o-mini",
  prompt:     "Should this refund be approved?", // plaintext (not committed)
  parameters: { temperature: 0, maxTokens: 1024, topP: null, seed: null },
  input:      { value: { messages: [/* ... */] }, salt: inputSalt },
  output:     { value: { decision: "approve" },   salt: outputSalt },
});

// Persist (inputSalt, outputSalt) securely. They are the openings.`}
    />

    <h2 id="node-compatibility">Node Compatibility</h2>
    <ul>
      <li>No node changes are required.</li>
      <li>Commitments are treated as standard snapshot data by the node.</li>
      <li>Certification and verification pipelines remain unchanged.</li>
    </ul>

    <h2 id="best-practices">Best Practices</h2>
    <ul>
      <li>Only commit fields that are genuinely sensitive.</li>
      <li>Store openings in a secure secret store, scoped to the same retention boundary as the plaintext.</li>
      <li>Share openings only out-of-band, to parties that already have legitimate access to the plaintext.</li>
      <li>Never log openings. Never embed them in CERs, traces, or telemetry.</li>
    </ul>
  </>
);

export default ConfidentialMode;
