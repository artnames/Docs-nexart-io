import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# Builder Guides
Quick-start guides for common NexArt tasks.

## Verify a CER
import { verifyCer } from "@nexart/ai-execution";
const result = verifyCer(bundle);

## Verify a Project Bundle
import { verifyProjectBundle } from "@nexart/ai-execution";
const result = verifyProjectBundle(projectBundle);

## Browser-safe verification
import { verifyCerAsync } from "@nexart/ai-execution";
const result = await verifyCerAsync(bundle);

## Register a Project Bundle
POST /v1/project-bundle/register with the Project Bundle JSON.`;

const Guides = () => (
  <>
    <PageHeader
      title="Builder Guides"
      summary="Quick-start paths for common NexArt tasks."
      llmBlock={llmBlock}
    />

    <h2 id="verify-cer">Verify a CER</h2>
    <CodeBlock
      language="typescript"
      title="Node / server"
      code={`import { verifyCer } from "@nexart/ai-execution";

const result = verifyCer(cerBundle);

if (result.status === "VERIFIED") {
  // CER is intact
}

// Or verify by certificateHash at:
// https://verify.nexart.io/c/sha256%3A...`}
    />

    <h2 id="verify-project-bundle">Verify a Project Bundle</h2>
    <CodeBlock
      language="typescript"
      title="Node / server"
      code={`import { verifyProjectBundle } from "@nexart/ai-execution";

const result = verifyProjectBundle(projectBundle);

// result.status: "VERIFIED" | "FAILED"
// result.steps: per-step verification results

// Or verify at:
// https://verify.nexart.io/p/sha256%3A...`}
    />

    <h2 id="browser-verification">Use Browser-Safe Verification</h2>
    <CodeBlock
      language="typescript"
      title="Browser / Edge"
      code={`import { verifyCerAsync } from "@nexart/ai-execution";

const result = await verifyCerAsync(cerBundle);

// Same result shape as verifyCer()
// Uses Web Crypto API, no Node.js dependencies`}
    />
    <p className="text-sm text-muted-foreground">
      See <Link to="/docs/browser-verification" className="text-primary hover:underline">Browser Verification</Link> for a full example with Project Bundles.
    </p>

    <h2 id="register-project-bundle">Register a Project Bundle with the Node</h2>
    <CodeBlock
      title="Register a Project Bundle"
      code={`POST /v1/project-bundle/register
Authorization: Bearer NEXART_API_KEY
Content-Type: application/json

{
  "bundleType": "cer.project.v1",
  "metadata": {
    "projectId": "proj_abc123",
    "description": "Contract review pipeline"
  },
  "steps": [
    { "stepIndex": 0, "cer": { ... } },
    { "stepIndex": 1, "parentRef": "sha256:...", "cer": { ... } }
  ]
}`}
    />
    <p>The node computes the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code>, signs a project-level receipt, and returns a verification URL at <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/p/:projectHash</code>.</p>
  </>
);

export default Guides;
