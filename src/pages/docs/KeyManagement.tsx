import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Node Key Management and Rotation

Each NexArt attestation node signs CER receipts using Ed25519 keys.
The node exposes public keys at GET /.well-known/nexart-node.json.

## Key model
- One active key used for signing new CERs.
- Multiple deprecated keys retained for verifying old CERs.
- Each key has a unique kid (key identifier).

## Well-known endpoint response
{
  "nodeId": "nexart-node-primary",
  "activeKid": "k1",
  "keys": [
    { "kid": "k1", "algorithm": "Ed25519", "publicKey": "...", "status": "active" },
    { "kid": "k0", "algorithm": "Ed25519", "publicKey": "...", "status": "deprecated" }
  ]
}

## Verification guarantees
- Old CERs remain verifiable after key rotation.
- Verification accepts all known keys.
- certificateHash is NOT affected by key rotation.
- Only signatures depend on keys.

The NexArt Node acts as the independent trust authority. Verification does not rely on trusting platform storage or databases. It is performed using the signed receipt and the node's published public keys.

## Key rotation procedure
1. Generate a new Ed25519 key pair.
2. Set the new private key as NODE_ATTESTATION_PRIVATE_KEY.
3. Move the previous key to NODE_ATTESTATION_DEPRECATED_KEYS.
Only the PUBLIC KEY is required for deprecated keys. Deprecated private keys must NOT be retained.

Deprecated keys are used for verification only. They do not require private key material. Retaining private keys beyond their active use increases security risk and is not permitted.
4. Deploy the node.
5. Verify new CERs are signed with the new key.
6. Verify old CERs still verify.
7. Monitor system behavior.
8. Optionally remove deprecated keys after a safe period.

## When to rotate
- Suspected compromise.
- Periodic rotation (recommended but optional).
- During security upgrades.

Deprecated public keys should be retained for at least the duration of the CER retention policy. Removing a key too early may prevent verification of historical records.

## Security considerations
- Private keys must never be exposed.
- Keys are stored in Railway environment variables.
- Access to Railway must be restricted (2FA, limited access).
- Rotation must be controlled and documented.

## Backward compatibility
- Rotation does NOT break existing CER verification.
- Multi-key support ensures continuity.
- Verification remains deterministic.`;

const KeyManagement = () => (
  <>
    <DocsMeta
      title="Key Management and Rotation (NexArt Node)"
      description="How NexArt Node manages Ed25519 signing keys, rotates them safely, and maintains backward-compatible verification."
    />
    <PageHeader
      title="Key Management and Rotation (NexArt Node)"
      summary="How NexArt Node manages Ed25519 signing keys, rotates them safely, and maintains backward-compatible verification."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>Each NexArt attestation node signs Certified Execution Records (CERs) using Ed25519 keys. The signature is embedded in the attestation receipt, which becomes part of the CER bundle.</p>
    <p>The signing key is what makes a node receipt trustable. It binds the node identity to the record at a specific point in time. Without it, receipts cannot be independently verified.</p>
    <p>Key management matters because:</p>
    <ul>
      <li>It defines whether receipts can be verified later.</li>
      <li>It determines if old CERs survive a security incident.</li>
      <li>It is a target for audit and compliance review.</li>
    </ul>

    <h2 id="key-model">Key Model</h2>
    <p>The node maintains a key ring with two categories of keys:</p>
    <ul>
      <li><strong>Active key.</strong> The single key currently used to sign new CER receipts. Identified by <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">activeKid</code>.</li>
      <li><strong>Deprecated keys.</strong> Previously active keys kept for verification only. They are not used for new signatures.</li>
    </ul>
    <p>Every key has a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> (key identifier). The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> is included in every signed receipt so verifiers know which public key to use.</p>
    <p>The node publishes its public keys at:</p>
    <p><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">GET /.well-known/nexart-node.json</code></p>

    <CodeBlock
      code={`{
  "nodeId": "nexart-node-primary",
  "activeKid": "k1",
  "keys": [
    {
      "kid": "k1",
      "algorithm": "Ed25519",
      "publicKey": "MCowBQYDK2VwAyEA...",
      "status": "active"
    },
    {
      "kid": "k0",
      "algorithm": "Ed25519",
      "publicKey": "MCowBQYDK2VwAyEA...",
      "status": "deprecated"
    }
  ]
}`}
      language="json"
      title="Example well-known response"
    />

    <p><strong>Field definitions:</strong></p>
    <ul>
      <li><strong>nodeId</strong> — unique identifier for the attestation node.</li>
      <li><strong>activeKid</strong> — the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> of the key currently used for signing.</li>
      <li><strong>keys[]</strong> — array of all known keys. Each entry contains:
        <ul className="mt-1">
          <li><strong>kid</strong> — key identifier. Must be unique within the node.</li>
          <li><strong>algorithm</strong> — signing algorithm. Always Ed25519.</li>
          <li><strong>publicKey</strong> — the public key material in base64.</li>
          <li><strong>status</strong> — active or deprecated.</li>
        </ul>
      </li>
    </ul>

    <h2 id="verification-guarantees">Verification Guarantees</h2>
    <p>The key system is designed so that rotation never breaks verification:</p>
    <ul>
      <li>Old CERs remain verifiable after key rotation. Deprecated keys are retained until explicitly removed.</li>
      <li>Verification accepts all known keys. The verifier matches the receipt <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> against the published key set.</li>
      <li>Certificate hashes are NOT affected by key rotation. The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> is computed from the CER bundle content, not the signature.</li>
      <li>Only signatures depend on keys. If a key is lost, previously signed receipts may become unverifiable. This is why deprecated keys are retained.</li>
    </ul>
    <p>The NexArt Node acts as the independent trust authority. Verification does not rely on trusting platform storage or databases. It is performed using the signed receipt and the node's published public keys.</p>

    <h2 id="key-rotation-process">Key Rotation Process</h2>
    <p>Follow this procedure exactly. Do not skip steps.</p>
    <ol>
      <li>
        <strong>Generate a new Ed25519 key pair.</strong>
        <p className="text-muted-foreground mt-1">Use a cryptographically secure source. The private key will be used for signing; the public key will be published.</p>
      </li>
      <li>
        <strong>Set the new key as <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NODE_ATTESTATION_PRIVATE_KEY</code>.</strong>
        <p className="text-muted-foreground mt-1">This becomes the active signing key. The node will use it for all new receipts.</p>
      </li>
      <li>
        <strong>Move the previous key to <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">NODE_ATTESTATION_DEPRECATED_KEYS</code>.</strong>
        <p className="text-muted-foreground mt-1">Only the PUBLIC KEY is required for deprecated keys. Deprecated private keys must NOT be retained.</p>
        <p className="text-muted-foreground mt-1">Deprecated keys are used for verification only. They do not require private key material. Retaining private keys beyond their active use increases security risk and is not permitted.</p>
      </li>
      <li>
        <strong>Deploy the node.</strong>
        <p className="text-muted-foreground mt-1">On startup, the node loads the active key and all deprecated keys. It publishes the public material at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/.well-known/nexart-node.json</code>.</p>
      </li>
      <li>
        <strong>Verify new CERs are signed with the new key.</strong>
        <p className="text-muted-foreground mt-1">Create a test CER and inspect the receipt. Confirm the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> matches the new <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">activeKid</code>.</p>
      </li>
      <li>
        <strong>Verify old CERs still verify.</strong>
        <p className="text-muted-foreground mt-1">Pick a CER signed before rotation and run it through the verifier. The receipt <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">kid</code> should match a deprecated key in the well-known document.</p>
      </li>
      <li>
        <strong>Monitor system behavior.</strong>
        <p className="text-muted-foreground mt-1">Watch for verification failures, key mismatch errors, or well-known endpoint latency.</p>
      </li>
      <li>
        <strong>Optionally remove deprecated keys after a safe period.</strong>
        <p className="text-muted-foreground mt-1">There is no fixed retention period. Remove a deprecated key only when you are confident no valid receipts depend on it. In practice, this means waiting until all CERs signed with that key have exceeded your retention policy.</p>
      </li>
    </ol>

    <h2 id="when-to-rotate">When to Rotate Keys</h2>
    <p>Rotate keys in the following situations:</p>
    <ul>
      <li><strong>Suspected compromise.</strong> If a private key may have been exposed, rotate immediately. Treat this as an incident.</li>
      <li><strong>Periodic rotation.</strong> Recommended but optional. A reasonable interval is 12 months. More frequent rotation adds operational burden without proportional security benefit if the key is well-protected.</li>
      <li><strong>Security upgrades.</strong> If the host infrastructure changes (new platform, new secret store, new access controls), rotation reduces blast radius from any misconfiguration.</li>
    </ul>
    <p>Deprecated public keys should be retained for at least the duration of the CER retention policy. Removing a key too early may prevent verification of historical records.</p>

    <h2 id="security-considerations">Security Considerations</h2>
    <ul>
      <li><strong>Private keys must never be exposed.</strong> They are loaded from environment variables at runtime. They must not appear in logs, source control, or chat messages.</li>
      <li><strong>Keys are stored in Railway environment variables.</strong> Railway is the current host. Access to the Railway project must be restricted to authorized operators only.</li>
      <li><strong>Enforce two-factor authentication.</strong> Every account with Railway access must have 2FA enabled.</li>
      <li><strong>Limit access.</strong> Only operators who need to rotate keys should have project access. Review access quarterly.</li>
      <li><strong>Rotation must be controlled.</strong> Key rotation is not automated. It is performed by an operator following the procedure above. Document each rotation with date, reason, and operator identity.</li>
    </ul>

    <h2 id="backward-compatibility">Backward Compatibility</h2>
    <p>Key rotation is designed to be non-breaking:</p>
    <ul>
      <li>Rotation does NOT break existing CER verification. Deprecated keys are kept in the well-known document.</li>
      <li>Multi-key support ensures continuity. Verifiers check all published keys, not just the active one.</li>
      <li>Verification remains deterministic. A CER verifies the same way today as it did the day it was signed, provided the key is still published.</li>
    </ul>
    <p className="text-sm text-muted-foreground border-l-2 border-border pl-3 mt-3">
      <strong>Note:</strong> If a deprecated key is removed before all dependent CERs have expired, those CERs will fail signature verification. The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> will still prove integrity, but the attestation witness will be unverifiable. Plan key removal against your retention policy.
    </p>
  </>
);

export default KeyManagement;
