import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# CER (Certified Execution Record)
A CER is a tamper-proof record of an AI execution. It captures:
- Input hash (prompt/context)
- Output hash (model response)
- Model identifier
- Timestamp
- Cryptographic signature from attestation node

CERs are immutable. They prove WHAT ran, WHEN it ran, and that the record hasn't been altered.
Bundle shape: { cer_id, model, prompt_hash, output_hash, timestamp, node_signature, metadata }`;

const CER = () => (
  <>
    <PageHeader
      title="What is a CER?"
      summary="Certified Execution Records are the core unit of proof in NexArt."
      llmBlock={llmBlock}
    />
    <h2 id="overview">Overview</h2>
    <p>A <strong>Certified Execution Record (CER)</strong> is a tamper-proof, cryptographically signed record of an AI execution. Think of it as a notarized receipt for every AI operation your application performs.</p>
    <p>CERs don't store the actual prompts or outputs — they store <strong>hashes</strong>. This means you get proof of what happened without exposing sensitive data.</p>

    <h2 id="what-it-captures">What a CER Captures</h2>
    <ul>
      <li><strong>Input hash</strong> — SHA-256 hash of the prompt/context sent to the model</li>
      <li><strong>Output hash</strong> — SHA-256 hash of the model's response</li>
      <li><strong>Model identifier</strong> — Which model produced the output (e.g., <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">gpt-4</code>)</li>
      <li><strong>Timestamp</strong> — When the execution occurred</li>
      <li><strong>Node signature</strong> — Cryptographic signature from the attestation node</li>
    </ul>

    <h2 id="shape">CER Shape</h2>
    <CodeBlock
      code={`{
  "cer_id": "cer_8x7k2m4n9p",
  "version": "1.0",
  "model": "gpt-4",
  "prompt_hash": "sha256:a1b2c3d4e5f6...",
  "output_hash": "sha256:f6e5d4c3b2a1...",
  "timestamp": "2026-03-06T12:00:00.000Z",
  "node_id": "nexart-node-us-east-1",
  "node_signature": "0x3f2a8b1c...",
  "metadata": {
    "app_id": "my-app",
    "project_id": "proj_abc123"
  }
}`}
      title="CER Example"
    />

    <h2 id="immutability">Immutability</h2>
    <p>Once created, a CER cannot be modified. The hash chain ensures any tampering is detectable. This is what makes CERs useful for audits, compliance, and trust.</p>
  </>
);

export default CER;
