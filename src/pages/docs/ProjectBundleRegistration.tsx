import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

// Retained for LLM/SEO discoverability. Not rendered in UI.
const llmBlock = `# Project Bundle Registration

Registration turns a locally verified bundle into a publicly verifiable artifact.

## Three distinct verification layers
1. Local SDK verification - proves bundle integrity on the caller's machine.
2. Node registration       - persists the bundle and returns a signed receipt.
3. Public verification     - independent witness via verify.nexart.io/p/{projectHash}.

Local verification and public verification are NOT interchangeable.
A bundle that verifies locally but is not registered on the node will NOT
resolve on verify.nexart.io.

## When to use registration
Use when:
- multiple steps or agents need workflow-level public verification
- an external auditor must resolve the bundle without your SDK
- a node-signed receipt is required as a trust anchor

Do not use when:
- the flow is a single execution (use Path A and /api/stamp)
- the audit trail is internal-only and never resolved publicly

## Endpoint
POST https://node.nexart.io/v1/project-bundle/register
Authorization: Bearer <NEXART_API_KEY>
Content-Type: application/json
Body: full cer.project.bundle.v1 JSON returned by createProjectBundle()

## Successful response (shape)
{
  "ok": true,
  "projectHash": "sha256:...",
  "registeredAt": "2026-04-21T12:00:00Z",
  "receipt": { "kid": "...", "sig": "...", "alg": "Ed25519" }
}

## After registration
- The bundle is reachable at https://verify.nexart.io/p/{projectHash}
- Individual step CERs remain reachable at /c/{certificateHash}
- Re-registering the same projectHash is idempotent (duplicate prevention).`;

void llmBlock;

const ProjectBundleRegistration = () => (
  <>
    <DocsMeta
      title="Project Bundle Registration"
      description="Group multiple CERs into a Project Bundle and register it via projectHash for unified public verification."
    />
    <PageHeader
      title="Project Bundle Registration"
      summary="Registration turns a locally verified bundle into a publicly verifiable artifact on verify.nexart.io."
    />

    <Alert className="mb-6 border-destructive/40">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Local verification is not public verification</AlertTitle>
      <AlertDescription>
        A Project Bundle that passes <code>verifyProjectBundle()</code> locally is
        not publicly verifiable until it is registered on the node. It will NOT
        resolve on verify.nexart.io.
      </AlertDescription>
    </Alert>

    <h2>When to use registration</h2>
    <div className="grid gap-4 md:grid-cols-2 my-4">
      <div className="rounded-md border border-border p-4">
        <p className="font-medium mb-2">Use when</p>
        <ul className="m-0">
          <li>Multiple steps or agents</li>
          <li>Workflow-level public verification</li>
          <li>External auditor must resolve without your SDK</li>
          <li>Node-signed receipt required as trust anchor</li>
        </ul>
      </div>
      <div className="rounded-md border border-border p-4">
        <p className="font-medium mb-2">Skip when</p>
        <ul className="m-0">
          <li>Single execution (use Path A + <code>/api/stamp</code>)</li>
          <li>Independent decisions, not a workflow</li>
          <li>Internal-only audit trail, never resolved publicly</li>
        </ul>
      </div>
    </div>

    <h2>The three verification layers</h2>
    <p>
      These are distinct and not interchangeable. A bundle can pass one and still
      need the next.
    </p>
    <ol>
      <li>
        <strong>Local SDK verification.</strong>{" "}
        <code>verifyProjectBundle(bundle)</code> recomputes hashes and checks
        step integrity against the bundle's own contents. It proves the artifact
        has not been modified since it was produced.
      </li>
      <li>
        <strong>Node registration.</strong>{" "}
        <code>POST /v1/project-bundle/register</code> persists the bundle in the
        node's proof tables and returns a signed receipt. This is the trust
        anchor for any third party.
      </li>
      <li>
        <strong>Public verification.</strong>{" "}
        <code>verify.nexart.io/p/{`{projectHash}`}</code> resolves the registered
        bundle and re-runs verification against the node's stored copy. Anyone
        with the projectHash can verify, without your code or your SDK.
      </li>
    </ol>

    <h2>Minimal end-to-end flow</h2>
    <CodeBlock language="typescript" code={`import {
  certifyDecision,
  createProjectBundle,
  verifyProjectBundle,
  registerProjectBundle,
} from "@nexart/ai-execution";

// 1. Produce step CERs (each step is its own verifiable record).
const stepA = await certifyDecision({ /* step A inputs */ });
const stepB = await certifyDecision({ /* step B inputs */ });

// 2. Group steps into a Project Bundle (computes projectHash).
const bundle = await createProjectBundle({
  projectId: "workflow-123",
  steps: [stepA.cer, stepB.cer],
});

// 3. Local verification - integrity only.
const local = await verifyProjectBundle(bundle);
if (!local.ok) throw new Error("Bundle is not internally consistent");

// 4. Register on the node - REQUIRED for public verification.
const reg = await registerProjectBundle(bundle, {
  apiKey: process.env.NEXART_API_KEY!,
});

console.log("Public URL:", \`https://verify.nexart.io/p/\${reg.projectHash}\`);`} />

    <h2>Successful registration response</h2>
    <CodeBlock language="json" code={`{
  "ok": true,
  "projectHash": "sha256:7d4a...e91",
  "registeredAt": "2026-04-21T12:00:00Z",
  "receipt": {
    "alg": "Ed25519",
    "kid": "node-key-2026-01",
    "sig": "base64..."
  }
}`} />

    <h2>What the registration helper does</h2>
    <ul>
      <li>POSTs the canonical bundle JSON to <code>/v1/project-bundle/register</code>.</li>
      <li>Authenticates with your <code>NEXART_API_KEY</code>.</li>
      <li>Receives a node-signed receipt over the bundle's <code>projectHash</code>.</li>
      <li>Is idempotent: re-registering the same bundle returns the existing record.</li>
    </ul>

    <h2>Failure modes</h2>
    <p>
      For a complete catalogue of node responses and what to do about them, see{" "}
      <Link to="/docs/verification-statuses-and-errors">
        Verification Statuses & Errors
      </Link>
      . The most common ones at registration time:
    </p>
    <ul>
      <li>
        <code>HASH_MISMATCH</code> - the recomputed projectHash does not match
        the value in the submitted bundle. Usually caused by non-canonical JSON
        (extra whitespace, undefined values, key reordering).
      </li>
      <li>
        <code>PERSISTENCE_FAILED</code> - node accepted the request but could
        not write to its proof tables. Retry with backoff; the operation is
        idempotent on <code>projectHash</code>.
      </li>
      <li>
        <code>AUTH_INVALID</code> - missing or rejected API key.
      </li>
    </ul>

    <Alert className="mb-6">
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>Builder checklist before claiming "it works"</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1">
          <li>Each step CER verifies locally</li>
          <li>Project Bundle verifies locally</li>
          <li>Bundle registered on the node (success response received)</li>
          <li><code>verify.nexart.io/p/{`{projectHash}`}</code> resolves</li>
        </ul>
      </AlertDescription>
    </Alert>

    <h2>Related</h2>
    <ul>
      <li><Link to="/docs/end-to-end-verification">End-to-End Verification Flow</Link></li>
      <li><Link to="/docs/concepts/project-bundles">Project Bundles concept</Link></li>
      <li><Link to="/docs/verification-statuses-and-errors">Verification Statuses & Errors</Link></li>
      <li><Link to="/docs/multi-step-and-multi-agent-workflows">Multi-step & Multi-agent Workflows</Link></li>
    </ul>
  </>
);

export default ProjectBundleRegistration;
