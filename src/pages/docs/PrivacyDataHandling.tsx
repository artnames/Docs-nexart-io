import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# Privacy & Data Handling
NexArt is execution integrity infrastructure. It stores cryptographic execution records (CERs), not raw AI prompts or outputs.

## What NexArt stores
- certificateHash (SHA-256)
- execution identifier
- input and output hashes (not payloads)
- protocol and runtime metadata
- node attestation data (signature, node identity)
- timestamps

## What NexArt does NOT store
- raw prompts or inputs
- raw outputs or completions
- user-identifiable content (unless submitted by the integrating application)

## Public verification
- verify.nexart.io shows redacted, public-safe records
- sensitive execution payloads are not included
- visible fields: certificateHash, executionId, protocol version, node attestation, runtime hash, app-provided metadata

## Integrator responsibility
Applications integrating NexArt control what data is submitted.
Developers should avoid including personal identifiers in executionId, metadata, projectId, or appId.
Use internal identifiers (e.g. tx_8347293) instead of personal identifiers (e.g. john-smith-payment).

## NexArt's role
NexArt generates CERs, cryptographically binds execution metadata, provides node attestations, and enables independent verification.
It does not process or store underlying user data unless explicitly included by the integrating application.

## Operational logs
NexArt may retain limited operational logs (request metadata) for reliability and security.
Logs do not include raw execution payloads and are retained for a limited period.`;

const PrivacyDataHandling = () => (
  <>
    <PageHeader
      title="Privacy & Data Handling"
      summary="How NexArt handles execution data, what gets stored, and who is responsible for personal data."
      llmBlock={llmBlock}
    />

    <h2 id="execution-data">Execution Data & Privacy</h2>
    <p>
      NexArt is execution integrity infrastructure. It stores cryptographic execution records, not raw application data.
    </p>
    <p>A Certified Execution Record (CER) typically contains:</p>
    <ul>
      <li><strong>Certificate hash</strong> — a SHA-256 hash that uniquely identifies the record</li>
      <li><strong>Execution identifier</strong> — a reference ID for the execution</li>
      <li><strong>Input and output hashes</strong> — SHA-256 hashes of the execution inputs and outputs, not the underlying payloads</li>
      <li><strong>Protocol and runtime metadata</strong> — model, version, and configuration data</li>
      <li><strong>Node attestation data</strong> — the Ed25519 signature, node identity, and attestor key ID</li>
      <li><strong>Timestamps</strong> — when the record was created and attested</li>
    </ul>
    <p>
      Hashes are used to bind execution results to a certification record without storing the underlying data. This means NexArt can verify that an execution happened and was not tampered with, without needing access to what was actually said or generated.
    </p>

    <h2 id="what-nexart-does-not-store">What NexArt Does NOT Store</h2>
    <ul>
      <li>Raw prompts or user inputs</li>
      <li>Raw outputs or completions</li>
      <li>User-identifiable content, unless explicitly submitted by the integrating application</li>
    </ul>

    <h2 id="public-verification">Public Verification Records</h2>
    <p>
      The public verifier at{" "}
      <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a>{" "}
      displays redacted, public-safe representations of records. Sensitive execution payloads are not included.
    </p>
    <p>Fields visible in a public verification record:</p>
    <ul>
      <li>Certificate hash</li>
      <li>Execution ID</li>
      <li>Protocol version</li>
      <li>Node attestation (signature, node identity)</li>
      <li>Runtime hash</li>
      <li>Metadata fields provided by the integrating application</li>
    </ul>
    <p>
      The verifier exposes only the information required to independently confirm that a record is intact and properly signed. It does not reveal what was executed.
    </p>

    <h2 id="integrator-responsibility">Responsibility of Integrating Applications</h2>
    <p>
      Applications integrating NexArt are responsible for the data they submit to the certification API. NexArt does not inspect or filter the contents of metadata fields.
    </p>
    <p>Developers should avoid including personal identifiers in fields such as:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">executionId</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">metadata</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectId</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">appId</code></li>
    </ul>
    <p>Use internal identifiers instead of personal identifiers:</p>
    <CodeBlock
      code={`// Preferred
executionId: "tx_8347293"

// Avoid
executionId: "john-smith-payment"`}
      title="Identifier examples"
    />

    <h2 id="nexart-role">NexArt's Role</h2>
    <p>NexArt operates as an execution integrity infrastructure provider. Its role is limited to:</p>
    <ul>
      <li>Generating Certified Execution Records</li>
      <li>Cryptographically binding execution metadata to a certificate hash</li>
      <li>Providing node attestations via Ed25519 signatures</li>
      <li>Enabling independent verification of records</li>
    </ul>
    <p>
      NexArt does not process or store the underlying user data that produced an execution, unless that data is explicitly included by the integrating application in the certification request.
    </p>

    <h2 id="operational-logs">Operational Logs</h2>
    <p>
      NexArt may retain limited operational logs for service reliability and security monitoring. These logs may include request metadata such as timestamps, request paths, and status codes. Logs are retained for a limited period and do not include raw execution payloads.
    </p>
  </>
);

export default PrivacyDataHandling;
