import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Verification
Verification confirms three things about a CER:
1. The bundle has not been modified
2. The receipt was signed by a valid attestation node
3. The receipt references the correct certificateHash

## How to verify
Three ways to verify a record:
1. By executionId — https://verify.nexart.io/e/exec_abc123
2. By certificateHash — https://verify.nexart.io/c/sha256%3A7f83...
3. By uploading a CER bundle — drag and drop or paste the JSON bundle at verify.nexart.io

## Public verifier
verify.nexart.io is the public verification portal.
The verifier uses a redacted/public-safe representation. Raw inputs/outputs are not exposed.

## Checks
1. Bundle Integrity — recompute certificateHash from bundle contents, confirm it matches
2. Node Signature — validate Ed25519 signature using key from node.nexart.io/.well-known/nexart-node.json (matched by kid)
3. Receipt Consistency — receipt (at meta.attestation.receipt) references same certificateHash as bundle

## What is publicly visible
- certificateHash, timestamp, node identity, verification status
- Input/output content is hashed (SHA-256), not stored or displayed
- Metadata fields may be included or redacted based on export settings

## Outcomes
VERIFIED — all checks pass, valid signed receipt
PARTIAL — some checks pass, no full attestation (hash-only timestamps, redacted exports)
INVALID — one or more checks fail (modified record, bad signature)
UNAVAILABLE — missing data, unsupported format, unknown node

## Independent verification
Verification can be performed without NexArt API access using the CER bundle (including meta.attestation) and the node's published public keys.`;

const Verification = () => (
  <>
    <PageHeader
      title="Verification"
      summary="How to verify any NexArt record, with or without API access."
      llmBlock={llmBlock}
    />

    <h2 id="overview">What Verification Proves</h2>
    <p>Verification answers three questions about a Certified Execution Record:</p>
    <ol>
      <li>Has the CER bundle been modified since it was created?</li>
      <li>Was the receipt signed by a valid NexArt attestation node?</li>
      <li>Does the receipt reference the correct <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>?</li>
    </ol>
    <p>If all three checks pass, the record is intact and its attestation is trustworthy.</p>

    <h2 id="how-to-verify">How to Verify a Record</h2>
    <p>There are three ways to verify a CER through the public verifier at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>:</p>

    <h3 id="by-execution-id">1. By Execution ID</h3>
    <p>If you have the execution ID returned by the certification API, open the verification URL directly:</p>
    <CodeBlock
      code={`https://verify.nexart.io/e/exec_abc123`}
      title="Verify by Execution ID"
    />

    <h3 id="by-certificate-hash">2. By Certificate Hash</h3>
    <p>If you have the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, use the hash-based URL. The colon in the hash must be URL-encoded:</p>
    <CodeBlock
      code={`https://verify.nexart.io/c/sha256%3A7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`}
      title="Verify by Certificate Hash"
    />

    <h3 id="by-bundle-upload">3. By Uploading a CER Bundle</h3>
    <p>You can also verify a record by uploading or pasting the full CER JSON bundle at <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>. The verifier will recompute the hash and check the signature locally.</p>
    <p>This is useful when you have the CER file but not the execution ID or verification URL.</p>

    <h2 id="public-vs-private">What Is Publicly Visible?</h2>
    <p>The public verifier uses a <strong>redacted, public-safe representation</strong> of the record:</p>
    <ul>
      <li>Verification status, certificateHash, timestamp, and node identity are visible.</li>
      <li>Raw input and output content is <strong>never exposed</strong>. The record contains SHA-256 hashes of these fields, not the original text.</li>
      <li>Metadata fields (like appId) may be included or redacted depending on the record's export settings.</li>
    </ul>
    <p>Anyone can verify that a record is intact and properly signed without seeing the private data that produced it.</p>

    <h2 id="what-gets-stored">What Gets Stored for Public Verification?</h2>
    <p>When a record is certified:</p>
    <ul>
      <li>The attestation node returns a <strong>signed receipt</strong> containing the certificateHash, timestamp, node identity, and Ed25519 signature. This is stored at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code> in the CER bundle.</li>
      <li>A <strong>redacted, public-safe version</strong> of the record is persisted for verification.</li>
      <li>Input and output content is hashed (SHA-256). The hashes appear in the record, but the original content is not stored by the node or verifier.</li>
      <li>You control which metadata fields are included when you create the record.</li>
    </ul>

    <h2 id="checks">Verification Checks</h2>
    <ol>
      <li><strong>Bundle Integrity.</strong> Recompute the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> from the bundle contents. If the hash differs, the bundle has been modified.</li>
      <li><strong>Node Signature.</strong> Validate the Ed25519 signature using the public key published at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code>, matched by the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> in the receipt.</li>
      <li><strong>Receipt Consistency.</strong> Confirm the receipt at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.receipt</code> references the same <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> as the bundle and that the node identity matches.</li>
    </ol>

    <h2 id="outcomes">Verification Outcomes</h2>
    <CodeBlock
      code={`VERIFIED      All checks pass. The CER has a valid signed receipt.

PARTIAL       Some checks pass, but the record lacks full attestation.
              Common for hash-only timestamps or redacted exports.

INVALID       One or more checks fail. The record may have been
              modified or the signature does not match.

UNAVAILABLE   Verification cannot be completed. Missing data,
              unsupported format, or unknown node identity.`}
      title="Verification Outcomes"
    />

    <h2 id="by-bundle-type">Expected Outcomes by Bundle Type</h2>
    <ul>
      <li><strong>cer.ai.execution.v1</strong> (with attestation) — all checks should pass → <strong>VERIFIED</strong></li>
      <li><strong>signed-redacted-reseal</strong> — some snapshot fields removed → <strong>VERIFIED</strong> or <strong>PARTIAL</strong></li>
      <li><strong>hash-only-timestamp</strong> — only certificateHash is attested → <strong>PARTIAL</strong></li>
      <li><strong>legacy</strong> — older format, limited coverage → <strong>PARTIAL</strong> or <strong>UNAVAILABLE</strong></li>
    </ul>

    <h2 id="independent">Independent Verification (No API Required)</h2>
    <p>You can verify a CER without calling any NexArt API. All you need is the CER bundle (including <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation</code>) and access to the node's published keys:</p>
    <ol>
      <li>Recompute the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> from the CER bundle (SHA-256)</li>
      <li>Compare it with the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> in <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">meta.attestation.receipt</code></li>
      <li>Fetch the node's public key from <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">node.nexart.io/.well-known/nexart-node.json</code></li>
      <li>Find the key matching the receipt's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code></li>
      <li>Verify the Ed25519 signature over the receipt payload</li>
    </ol>
    <p>If all steps pass, you can trust the attestation independently of NexArt infrastructure. No account, API key, or network call to NexArt is required beyond fetching the node's public key.</p>
  </>
);

export default Verification;
