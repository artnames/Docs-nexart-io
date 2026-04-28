import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# AI Execution CER

An AI Execution CER (bundleType: cer.ai.execution.v1) is a tamper-evident record
of a single AI execution step. It is the smallest unit of proof in NexArt.

## What is included in certificateHash
certificateHash is SHA-256 over the canonical CER bundle. It covers:
- bundleType, version, createdAt
- snapshot.model
- snapshot.inputHash, snapshot.outputHash
- snapshot.metadata (when present)
- context.signals when included in the canonical bundle

Any change to any covered field produces a different certificateHash.

## What is NOT included
- Raw input or output text (only the SHA-256 hashes are stored)
- Optional context attached AFTER hashing (signals MAY be transported outside
  the hash scope; see Verification Semantics)
- Node attestation receipt (added under meta.attestation AFTER the hash is computed)
- Verification envelope (added under meta.verificationEnvelope when present)

## Determinism vs verifiability
- Determinism: given the same inputs, the canonical CER produces the same hash.
- Verifiability: anyone can recompute certificateHash from the bundle and
  validate the node receipt without trusting NexArt.
NexArt does NOT replay the model. It proves what was recorded, not the result quality.

## Identity
- certificateHash is the canonical identity of an AI Execution CER.
- executionId is a convenience identifier returned by the certify API; it is
  NOT a unique artifact identifier and MUST NOT be used as the primary key.
- Always look up artifacts by certificateHash: verify.nexart.io/c/{certificateHash}

## Minimal correct flow
import { certifyDecision } from "@nexart/ai-execution";
const cer = await certifyDecision({
  model, input, output, metadata
});
// cer.certificateHash is the canonical identifier`;

const AIExecution = () => (
  <>
    <DocsMeta
      title="AI Execution CER"
      description="Create Certified Execution Records for AI executions: model, inputHash, outputHash, metadata, and attested receipt."
    />
    <PageHeader
      title="AI Execution CER"
      summary="The smallest unit of proof in NexArt: a tamper-evident record of one AI execution step."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>
      An AI Execution CER is a single, tamper-evident record of one AI execution.
      Its bundle type is{" "}
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.ai.execution.v1</code>.
      It is the smallest unit of proof in the NexArt protocol. Multi-step workflows
      compose AI Execution CERs into a{" "}
      <Link to="/docs/concepts/project-bundles" className="text-primary hover:underline">Project Bundle</Link>.
    </p>

    <div className="not-prose my-6 rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-sm font-medium text-foreground mb-1">certificateHash is the canonical identity</div>
      <div className="text-sm text-muted-foreground">
        Always look up an AI Execution CER by{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">certificateHash</code>.{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">executionId</code> is
        a convenience identifier returned by the certify API. It is NOT a unique
        artifact identifier and MUST NOT be used as the primary key for storage,
        deduplication, or public verification URLs.
      </div>
    </div>

    <h2 id="what-it-proves">What an AI Execution CER Proves</h2>
    <ul>
      <li><strong>Integrity.</strong> The recorded execution metadata has not been modified since it was certified.</li>
      <li><strong>Witness (when attested).</strong> An independent attestation node observed the artifact at a specific point in time.</li>
    </ul>
    <p>
      It does <strong>not</strong> prove that the model output was correct, that the
      execution was reproducible by re-calling the model, or that all related steps
      were recorded. NexArt proves <em>what</em> was recorded, not the quality of the
      result. See the <Link to="/docs/trust-model" className="text-primary hover:underline">Trust Model</Link>.
    </p>

    <h2 id="hash-scope">What Is Included in certificateHash</h2>
    <p>
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is SHA-256
      over the canonical CER bundle. The following fields are covered:
    </p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">bundleType</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">version</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createdAt</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot.model</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot.inputHash</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot.outputHash</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">snapshot.metadata</code> (when present)</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">context.signals</code> when included in the canonical bundle (see below)</li>
    </ul>
    <p>Any change to any covered field produces a different <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.</p>

    <h2 id="hash-not-scope">What Is NOT Included in certificateHash</h2>
    <ul>
      <li><strong>Raw input and output.</strong> Only the SHA-256 hashes are stored. The original prompt and completion text are never written into the CER.</li>
      <li>
        <strong>Optional context attached after hashing.</strong>{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">context.signals</code> MAY be
        transported outside the hash scope when supplied as supplemental metadata
        rather than as part of the canonical bundle. In that case, signals do not
        invalidate core integrity if absent or modified.{" "}
        See <Link to="/docs/verification-semantics" className="text-primary hover:underline">Verification Semantics</Link>.
      </li>
      <li><strong>Node attestation.</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code> is added by the attestation node AFTER the hash is computed. The receipt itself binds the existing certificateHash; it does not change it.</li>
      <li><strong>Verification envelope.</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.verificationEnvelope</code> and its signature are added under <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta</code> and do not affect <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.</li>
    </ul>

    <h2 id="determinism-vs-verifiability">Determinism vs Verifiability</h2>
    <p>These two terms are often confused. They are not the same.</p>
    <ul>
      <li><strong>Determinism</strong> means: given the same canonical bundle bytes, the same <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is produced. This is a property of the hashing function and the canonical JSON serialization.</li>
      <li><strong>Verifiability</strong> means: anyone can recompute <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> from the bundle and validate the node receipt against the node's published key, without trusting NexArt. This is a property of the protocol.</li>
    </ul>
    <p>
      NexArt does <strong>not</strong> replay the model. The protocol proves the
      record's integrity and witness, not the model's behavior.
    </p>

    <h2 id="minimal-flow">Minimal Correct Flow</h2>
    <CodeBlock
      language="typescript"
      title="Create and certify a single AI Execution CER"
      code={`import { certifyDecision } from "@nexart/ai-execution";

const cer = await certifyDecision({
  model: "gpt-4o-mini",
  input: { messages: [{ role: "user", content: "Approve invoice #42?" }] },
  output: { decision: "approve", reason: "policy_passed" },
  metadata: { appId: "ap-bot", projectId: "proj_demo" },
});

// canonical identifier - use this for storage, dedup, and public URLs
const id = cer.certificateHash;

// public verification URL
const url = \`https://verify.nexart.io/c/\${encodeURIComponent(id)}\`;`}
    />

    <h2 id="required-vs-optional">Required vs Optional Fields</h2>
    <ul>
      <li><strong>Required:</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">model</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">input</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">output</code>. The SDK hashes <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">input</code> and <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">output</code> internally; only the hashes are stored.</li>
      <li><strong>Optional:</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">metadata</code> (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">appId</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectId</code>), <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signals</code> (see <Link to="/docs/concepts/context-signals" className="text-primary hover:underline">Context Signals</Link>).</li>
    </ul>
    <p className="text-sm text-muted-foreground">
      Avoid passing <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">undefined</code>{" "}
      values inside metadata or signals. Undefined values can break canonical JSON
      serialization on some runtimes. Either omit the key entirely or use{" "}
      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">null</code>.
    </p>

    <h2 id="next">Next</h2>
    <ul>
      <li><Link to="/docs/concepts/project-bundles" className="text-primary hover:underline">Project Bundles</Link>: group multiple CERs into one verifiable workflow.</li>
      <li><Link to="/docs/end-to-end-verification" className="text-primary hover:underline">End-to-End Verification</Link>: from execution to public verification.</li>
      <li><Link to="/docs/verification-semantics" className="text-primary hover:underline">Verification Semantics</Link>: reseal, signals scope, original vs public hash.</li>
      <li><Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link>: full SDK reference.</li>
    </ul>
  </>
);

export default AIExecution;
