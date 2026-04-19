import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const llmBlock = `# End-to-End Verification Flow

NexArt verification has THREE distinct levels. Builders MUST understand all three.

## Level 1 - Local SDK Verification (integrity only)
- verifyCer(bundle), verifyProjectBundle(bundle), verifyCerAsync, verifyProjectBundleAsync
- Proves the artifact has not been modified
- Does NOT make the artifact publicly verifiable
- Does NOT prove the artifact was witnessed by an attestation node

## Level 2 - Node Certification / Registration (trust anchor)
- POST /api/stamp                     -> attest a single CER
- POST /v1/project-bundle/register    -> register a Project Bundle
- The node returns a signed receipt and writes the artifact to its proof tables
- This is what makes the artifact PUBLICLY verifiable

## Level 3 - Public Verification (independent witness)
- https://verify.nexart.io/c/{certificateHash}   (single CER)
- https://verify.nexart.io/p/{projectHash}       (Project Bundle)
- Requires a node-registered artifact. Local-only artifacts will NOT resolve.

## Required pipeline
Execute -> certifyDecision -> (optional /api/stamp) -> createProjectBundle
       -> verifyProjectBundle (local) -> /v1/project-bundle/register (REQUIRED for public verify)
       -> verify.nexart.io/p/{projectHash}

## Critical rule
A bundle that verifies locally but is not registered on the node is NOT publicly
verifiable and will NOT resolve on verify.nexart.io. Local verification proves
integrity. Node registration anchors trust. They are not interchangeable.

## Project Bundle registration endpoint
POST https://node.nexart.io/v1/project-bundle/register
Authorization: Bearer <NEXART_API_KEY>
Content-Type: application/json
Body: full cer.project.bundle.v1 JSON returned by createProjectBundle()

## Builder Checklist (before claiming "it works")
- [ ] CER verifies locally
- [ ] Project Bundle verifies locally
- [ ] Bundle registered on node (success response)
- [ ] verify.nexart.io/p/{projectHash} resolves`;

const EndToEndVerification = () => (
  <>
    <PageHeader
      title="From Execution to Public Verification"
      summary="The complete end-to-end flow. Local verification proves integrity. Node registration anchors trust. Public verification is an independent witness. They are not interchangeable."
      llmBlock={llmBlock}
    />

    <Alert className="mb-6 border-destructive/40">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>A bundle that verifies locally is not publicly verifiable</AlertTitle>
      <AlertDescription>
        A Project Bundle that passes <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">verifyProjectBundle()</code> locally
        but has NOT been registered on the attestation node will NOT resolve on
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono ml-1">verify.nexart.io/p/&#123;projectHash&#125;</code>.
        Registration is a separate, REQUIRED step.
      </AlertDescription>
    </Alert>

    <h2 id="lifecycle">The Full Lifecycle</h2>
    <p>
      Every verifiable execution moves through the same seven stages. Skipping any
      stage between local verification and public verification breaks the trust chain.
    </p>

    <CodeBlock
      title="Lifecycle"
      language="text"
      code={`1. Execute AI step                     (your application)
2. Create CER                          certifyDecision(...)
3. (Optional) Attest CER on node       POST /api/stamp
4. Build Project Bundle                createProjectBundle({ steps: [...] })
5. Verify locally                      verifyProjectBundle(bundle)
6. Register bundle on node  REQUIRED   POST /v1/project-bundle/register
7. Public verification                 verify.nexart.io/p/{projectHash}`}
    />

    <CodeBlock
      title="Trust chain"
      language="text"
      code={`Execution -> CER -> Bundle -> Local Verify -> Node Register -> Public Verify
                                  (integrity)   (trust anchor)   (independent witness)`}
    />

    <h2 id="three-levels">Three Levels of Verification</h2>
    <p>
      NexArt provides three distinct verification levels. They answer different
      questions and are NOT interchangeable.
    </p>

    <h3 id="level-1">Level 1 - Local SDK Verification (integrity)</h3>
    <p>Proves the artifact has not been modified since it was produced.</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyCer(bundle)</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyProjectBundle(bundle)</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyCerAsync</code> / <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyProjectBundleAsync</code> (browser)</li>
    </ul>
    <p>
      <strong>What it proves:</strong> Bundle integrity. The recomputed
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code> /
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code> matches the bundle.
    </p>
    <p>
      <strong>What it does NOT prove:</strong> That any third party has witnessed
      the artifact. Local-only artifacts cannot be looked up on
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">verify.nexart.io</code>.
    </p>

    <h3 id="level-2">Level 2 - Node Certification / Registration (trust anchor)</h3>
    <p>Submits the artifact to the attestation node, which signs a receipt and writes the artifact to its proof tables.</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /api/stamp</code> — attest a single CER</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /v1/project-bundle/register</code> — register a Project Bundle</li>
    </ul>
    <p>
      <strong>What it produces:</strong> An Ed25519-signed receipt anchored to the
      node's public key, plus a durable proof record on the node. This is what
      anchors trust.
    </p>

    <h3 id="level-3">Level 3 - Public Verification (independent witness)</h3>
    <p>Anyone can verify a node-registered artifact without your API key.</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">https://verify.nexart.io/c/&#123;certificateHash&#125;</code> — single CER</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">https://verify.nexart.io/p/&#123;projectHash&#125;</code> — Project Bundle</li>
    </ul>
    <p>
      <strong>Requires:</strong> A node-registered artifact. If the artifact was
      only verified locally, the public verifier returns
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">NOT_FOUND</code>.
    </p>

    <h2 id="bundle-registration">Project Bundle Registration (REQUIRED for public verify)</h2>
    <p>
      This is the step most often missed. Local verification is not a substitute
      for registration.
    </p>

    <CodeBlock
      title="Endpoint"
      language="http"
      code={`POST https://node.nexart.io/v1/project-bundle/register
Authorization: Bearer <NEXART_API_KEY>
Content-Type: application/json

<full cer.project.bundle.v1 JSON returned by createProjectBundle()>`}
    />

    <h3 id="response">Response</h3>
    <p>A successful response includes:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestationId</code> — node-assigned identifier for the registered bundle</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verificationEnvelope</code> — canonical envelope covering the project-level receipt</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signature</code> — Ed25519 signature over the envelope by the node's signing key</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">metadata</code> — node identity, key id, timestamp, protocol version</li>
    </ul>

    <h3 id="success-definition">Success Definition</h3>
    <p>Registration is successful ONLY when ALL of the following are true:</p>
    <ol>
      <li>The node returns a 2xx response with the fields above.</li>
      <li>The bundle is written to the node's proof tables.</li>
      <li>
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">https://verify.nexart.io/p/&#123;projectHash&#125;</code> resolves
        and returns <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">VERIFIED</code>.
      </li>
    </ol>
    <p>
      A 200 response alone is not sufficient evidence of success. Always confirm
      against the public verifier.
    </p>

    <h2 id="minimal-flow">Minimal Correct Flow</h2>
    <CodeBlock
      title="End-to-end (Node / TypeScript)"
      language="typescript"
      code={`import {
  certifyDecision,
  createProjectBundle,
  verifyProjectBundle,
} from "@nexart/ai-execution";

// 1. Generate CERs for each step
const cer1 = await certifyDecision({ /* step 1 */ });
const cer2 = await certifyDecision({ /* step 2 */ });
const cer3 = await certifyDecision({ /* step 3 */ });

// 2. Build the Project Bundle
const bundle = createProjectBundle({
  projectTitle: "Contract review pipeline",
  steps: [cer1, cer2, cer3],
});

// 3. Local integrity check (does NOT make it publicly verifiable)
const local = verifyProjectBundle(bundle);
if (local.status !== "VERIFIED") {
  throw new Error("Local verification failed");
}

// 4. REQUIRED: register the bundle on the attestation node.
// Without this step, the bundle will NOT resolve on verify.nexart.io.
const res = await fetch("https://node.nexart.io/v1/project-bundle/register", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.NEXART_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(bundle),
});

if (!res.ok) {
  throw new Error(\`Bundle registration failed: \${res.status}\`);
}

const { attestationId } = await res.json();
const projectHash = bundle.integrity.projectHash;

// 5. Public verification URL (share this, not the bundle JSON)
console.log(\`https://verify.nexart.io/p/\${encodeURIComponent(projectHash)}\`);`}
    />

    <h2 id="failures">Common Failure Cases</h2>

    <h3 id="fail-not-registered">Bundle verifies locally but not on verify.nexart.io</h3>
    <p>
      <strong>Cause:</strong> The bundle was never registered on the node.
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">verifyProjectBundle()</code>
      only checks integrity locally; it does not contact the node.
    </p>
    <p>
      <strong>Fix:</strong> Call <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">POST /v1/project-bundle/register</code> with
      the full bundle JSON and a valid API key.
    </p>

    <h3 id="fail-200-not-found">Node returns 200 but bundle not found later</h3>
    <p>Possible causes:</p>
    <ul>
      <li>Wrong endpoint (e.g. calling <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/api/stamp</code> with a project bundle instead of <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/v1/project-bundle/register</code>).</li>
      <li>Wrong payload shape (sending a single CER instead of the full <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">cer.project.bundle.v1</code> object).</li>
      <li>Wrong environment (staging API key against production node, or vice versa).</li>
      <li>Missing or malformed <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">Authorization</code> header.</li>
      <li>Bundle was written to a non-persistent code path (e.g. a dry-run flag, a test mode, or a proxy that swallows the body).</li>
    </ul>
    <p>
      <strong>Fix:</strong> Confirm the response includes
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">attestationId</code> and
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">signature</code>, then resolve
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono ml-1">verify.nexart.io/p/&#123;projectHash&#125;</code> as the
      authoritative success signal.
    </p>

    <h3 id="fail-partial">"Partially Verified" confusion</h3>
    <p>
      The verifier reports per-pillar results (Bundle Integrity, Node Signature,
      Receipt Consistency, Verification Envelope). A partial result usually
      means one of:
    </p>
    <ul>
      <li>The bundle has no node attestation, so node-dependent checks return <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">SKIPPED</code>.</li>
      <li>Context fields outside the certificateHash scope have been edited; they do not break integrity but are not covered by the hash.</li>
      <li>Different verifier versions evaluate the same artifact at different protocol versions; minor versions are forward-compatible, breaking changes require a new namespace.</li>
    </ul>
    <p>
      See <Link to="/docs/concepts/verification-reports" className="text-primary hover:underline">Verification Reports</Link> for
      the full per-pillar semantics.
    </p>

    <h2 id="checklist">Builder Checklist</h2>
    <p>Before claiming an integration "works", confirm every item:</p>
    <ul className="list-none pl-0 space-y-2">
      <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" /><span>CER verifies locally with <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyCer()</code>.</span></li>
      <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" /><span>Project Bundle verifies locally with <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyProjectBundle()</code>.</span></li>
      <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" /><span>Bundle registered on the node — response includes <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">attestationId</code> and <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">signature</code>.</span></li>
      <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" /><span>Bundle appears in node proof tables (lookup by <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code> succeeds).</span></li>
      <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-1 text-primary shrink-0" /><span><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verify.nexart.io/p/&#123;projectHash&#125;</code> resolves and returns <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">VERIFIED</code>.</span></li>
    </ul>

    <h2 id="trust-model">Trust Model in One Sentence</h2>
    <p>
      <strong>SDK proves integrity. Node anchors trust. Verifier provides an
      independent check.</strong> See <Link to="/docs/trust-model" className="text-primary hover:underline">Trust Model</Link> for the
      full breakdown of who signs what and why each role is necessary.
    </p>
  </>
);

export default EndToEndVerification;
