import PageHeader from "@/components/docs/PageHeader";

const llmBlock = `# Hash-Only Timestamping
NexArt never stores raw prompts or outputs. Only SHA-256 hashes are sent to the attestation node.
This means:
- Privacy: sensitive data never leaves your infrastructure
- Proof: the hash proves content existed at a specific time
- Efficiency: hashes are small, fast to transmit and store
The SDK hashes data client-side before transmission.`;

const HashTimestamping = () => (
  <>
    <PageHeader
      title="Hash-Only Timestamping"
      summary="How NexArt proves execution without storing your data."
      llmBlock={llmBlock}
    />
    <h2 id="how">How It Works</h2>
    <p>NexArt uses <strong>hash-only timestamping</strong>. Your prompts and outputs are hashed locally (SHA-256) before anything is sent to the attestation node. The raw data never leaves your infrastructure.</p>

    <h2 id="why">Why This Matters</h2>
    <ul>
      <li><strong>Privacy</strong> — Sensitive prompts, user data, and model outputs stay with you</li>
      <li><strong>Proof</strong> — The hash uniquely identifies the content. If someone changes even one character, the hash changes completely</li>
      <li><strong>Efficiency</strong> — Hashes are 64 characters. They're fast to transmit, store, and verify</li>
    </ul>

    <h2 id="verification">Verification Process</h2>
    <p>To verify, you re-hash the original content and compare it against the stored hash in the CER. If they match, the content is unchanged since attestation.</p>

    <h3>What You Can Prove</h3>
    <ul>
      <li>This specific input was used at this specific time</li>
      <li>This specific output was produced at this specific time</li>
      <li>Neither has been modified since attestation</li>
    </ul>
  </>
);

export default HashTimestamping;
