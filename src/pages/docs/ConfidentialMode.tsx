import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# Confidential Execution (Protocol 1.3.1)
Protocol 1.3.1 introduces commitment-based confidentiality, replacing the
hash-bound omission model used in 1.2.0.

Model:
- The client transmits raw prompt, input, output, and parameters to the
  attestation node over TLS during certification.
- The node converts input and output into commitment envelopes using
  HMAC-SHA256 (sealConfidential) with deterministically derived per-field
  salts. Raw input and output are processed transiently on the node for
  the sole purpose of sealing.
- Raw input and output are transmitted over TLS and processed transiently.
  They are excluded from the certified snapshot and from proof_json, and
  the documented confidential flow is designed not to persist them.
- The certified CER contains only commitments and hashes.
- Verification operates on commitments, not plaintext.

This flow does NOT claim that raw input/output never leaves the customer
environment; it MUST cross TLS to the node. The operational guarantee is
scoped: the certification flow is designed to exclude raw values from the
snapshot, from proof_json, and from intentional persistence.

Envelope shape:
{ "_redacted": true, "scheme": "hmac-sha256-v1", "commitment": "sha256:..." }

Compatibility:
- 1.2.0 (nexart-v1, default) - hash-bound omission, legacy.
- 1.3.0 (jcs-v1)             - RFC 8785 canonicalization, plaintext snapshot.
- 1.3.1 (jcs-v1)             - RFC 8785 + node-side commitment envelopes for
                                input and output. prompt and parameters remain
                                plaintext in the snapshot.

The client MUST NOT pre-hash or pre-redact input/output for 1.3.1. Sealing is
performed exclusively by the node.`;

const ConfidentialMode = () => (
  <>
    <PageHeader
      title="Confidential Execution (Protocol 1.3.1)"
      summary="Node-side commitment envelopes for input and output. Raw plaintext is transmitted over TLS and processed transiently; it is excluded from the certified snapshot and from proof_json, and the documented flow is designed not to persist it."
      llmBlock={llmBlock}
    />

    <h2 id="summary">Summary</h2>
    <p className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
      Protocol 1.3.1 introduces commitment-based confidentiality, replacing the
      hash-bound omission model used in 1.2.0.
    </p>

    <h2 id="overview">Overview</h2>
    <p>
      In protocol <code>1.3.1</code> the client transmits raw execution data to
      the attestation node <strong>over TLS</strong> during certification. The
      node processes it transiently to convert the sensitive fields into{" "}
      <strong>commitment envelopes</strong> before building the CER.
    </p>
    <ul>
      <li>Raw <code>input</code> and <code>output</code> are transmitted to the node over TLS during certification.</li>
      <li>The node seals them into commitment envelopes using <code>sealConfidential</code> (HMAC-SHA256).</li>
      <li>Per-field salts are derived deterministically inside the node and are not exposed.</li>
      <li>On the node, raw <code>input</code> and <code>output</code> are:
        <ul>
          <li>processed transiently for the sole purpose of sealing,</li>
          <li>excluded from the certified snapshot,</li>
          <li>excluded from <code>proof_json</code>,</li>
          <li>not intentionally persisted by the certification flow.</li>
        </ul>
      </li>
      <li>The resulting CER contains only commitments and hashes.</li>
      <li>Verification operates on commitments, not plaintext.</li>
    </ul>
    <p className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
      Scope of the guarantee. Raw <code>input</code>/<code>output</code> MUST cross TLS to the node in order to be
      sealed, so this flow does <strong>not</strong> claim they never leave the customer environment. The documented
      guarantee is scoped to the certification path: raw values are excluded from the certified snapshot and from{" "}
      <code>proof_json</code>, and the flow is designed not to persist them. A blanket claim of absence from all
      logs, traces, crash reports, caches, and backups is not asserted here.
    </p>

    <h2 id="envelope">Commitment Envelope</h2>
    <p>Each committed field is replaced in the snapshot by an envelope:</p>
    <CodeBlock
      title="Commitment envelope"
      language="json"
      code={`{
  "_redacted": true,
  "scheme": "hmac-sha256-v1",
  "commitment": "sha256:<hex>"
}`}
    />
    <ul>
      <li><strong>Scheme:</strong> <code>hmac-sha256-v1</code>.</li>
      <li><strong>Computation:</strong> <code>commitment = HMAC_SHA256(salt, value)</code>.</li>
      <li><strong>Properties:</strong> not reversible, not guessable without the salt, deterministic for a given <code>(salt, value)</code> pair.</li>
    </ul>

    <h2 id="certification-flow">Certification Flow (1.3.1)</h2>
    <p>For <code>protocolVersion: "1.3.1"</code>:</p>
    <p><strong>Client sends:</strong></p>
    <ul>
      <li><code>prompt</code></li>
      <li><code>input</code> (raw)</li>
      <li><code>output</code> (raw)</li>
      <li><code>parameters</code> (full object)</li>
    </ul>
    <p><strong>Node:</strong></p>
    <ul>
      <li>seals <code>input</code> and <code>output</code> into commitment envelopes,</li>
      <li>derives deterministic per-field salts internally,</li>
      <li>builds the CER snapshot with the envelopes in place of plaintext,</li>
      <li>computes <code>certificateHash</code>, signs the receipt, and returns the attested bundle.</li>
    </ul>
    <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
      The client MUST NOT pre-hash or pre-redact <code>input</code>/<code>output</code> for 1.3.1.
      Sealing is performed exclusively by the node. The hash-bound omission pattern from 1.2.0
      is no longer the confidentiality model.
    </p>

    <h2 id="request-example">Request Example</h2>
    <CodeBlock
      title="POST /v1/cer/ai/certify - protocolVersion 1.3.1"
      language="json"
      code={`{
  "executionId": "exec_123",
  "provider": "openai",
  "model": "gpt-4o",
  "prompt": "You are a financial analyst.",
  "input": "Summarize the risks.",
  "output": "Revenue decline...",
  "parameters": {
    "temperature": 0,
    "maxTokens": 1024,
    "topP": 1,
    "seed": null
  },
  "protocolVersion": "1.3.1",
  "appId": "example-app"
}`}
    />

    <h2 id="resulting-snapshot">Resulting Snapshot (excerpt)</h2>
    <CodeBlock
      title="Certified CER snapshot - input/output replaced by commitments"
      language="json"
      code={`{
  "prompt": "You are a financial analyst.",
  "parameters": { "temperature": 0, "maxTokens": 1024, "topP": 1, "seed": null },
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

    <h2 id="verification">Verification</h2>
    <ul>
      <li>
        <strong>Authenticity (default).</strong> Confirms bundle integrity,
        receipt signature, and envelope. No plaintext is required and none is
        disclosed.
      </li>
      <li>
        <strong>Equality (optional).</strong> A party that independently holds
        the original plaintext can recompute the commitment and compare it to
        the value in the snapshot. The node does not perform this check and does
        not retain the data required to perform it.
      </li>
    </ul>

    <h2 id="protocol-matrix">Protocol Version Matrix</h2>
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 border-b border-border">protocolVersion</th>
            <th className="text-left px-4 py-3 border-b border-border">Canonicalization</th>
            <th className="text-left px-4 py-3 border-b border-border">Confidentiality model</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="px-4 py-3 font-mono text-xs">1.2.0</td>
            <td className="px-4 py-3">nexart-v1 (default)</td>
            <td className="px-4 py-3">Hash-bound omission (legacy).</td>
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-3 font-mono text-xs">1.3.0</td>
            <td className="px-4 py-3">jcs-v1 (RFC 8785) - transitional</td>
            <td className="px-4 py-3">Plaintext snapshot. No node-side sealing.</td>
          </tr>
          <tr>
            <td className="px-4 py-3 font-mono text-xs">1.3.1</td>
            <td className="px-4 py-3">jcs-v1 (RFC 8785)</td>
            <td className="px-4 py-3">Node-side commitment envelopes for <code>input</code> and <code>output</code>.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 id="security-model">Security Model</h2>
    <p>Confidential mode guarantees:</p>
    <ul>
      <li>The certified record and <code>proof_json</code> contain only commitments for <code>input</code> and <code>output</code>.</li>
      <li>The certification flow is designed not to persist raw <code>input</code>/<code>output</code>.</li>
      <li>Third parties cannot reconstruct plaintext from commitments alone.</li>
    </ul>
    <p>It does NOT guarantee:</p>
    <ul>
      <li>Confidentiality of non-committed fields. <code>prompt</code> and <code>parameters</code> remain plaintext in the snapshot.</li>
      <li>Protection against parties who already hold the plaintext. Equality verification is by design available to them.</li>
      <li>Transport confidentiality beyond TLS to the node.</li>
    </ul>

    <h2 id="best-practices">Best Practices</h2>
    <ul>
      <li>Only place genuinely sensitive content in <code>input</code>/<code>output</code>.</li>
      <li>Avoid embedding secrets in <code>prompt</code> or <code>parameters</code>; they are not committed.</li>
      <li>If your audit workflow requires equality verification, retain the original plaintext in your own system of record. The node does not.</li>
      <li>Do not log raw <code>input</code>/<code>output</code> alongside the resulting <code>certificateHash</code> unless your retention policy permits it.</li>
    </ul>
  </>
);

export default ConfidentialMode;
