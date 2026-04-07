import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# Project Bundles

A Project Bundle is a structured collection of CERs representing a multi-step workflow.

## What it contains
- steps[]: ordered array of CERs with parent references
- projectHash: SHA-256 derived from canonical bundle content
- metadata: project-level context (projectId, description, timestamps)
- optional node receipt at the project level

## projectHash
Derived from the canonical content of all steps. Any modification to any step produces a different projectHash.

## Relationship to CERs
Each step in a Project Bundle contains a full CER with its own certificateHash.
The Project Bundle adds structure (ordering, parent references, step graph) on top of individual CERs.

## Use cases
- Multi-step agent workflows
- Audit trails across sequential operations
- Chained AI executions with dependency tracking

## Verification
Project Bundles can be verified at verify.nexart.io/p/:projectHash or using verifyProjectBundle() / verifyProjectBundleAsync() from the SDK.
Verification checks each embedded CER and the overall project hash.`;

const ProjectBundles = () => (
  <>
    <PageHeader
      title="Project Bundles"
      summary="Structured collections of CERs for multi-step workflows."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>A <strong>Project Bundle</strong> is a structured collection of Certified Execution Records representing a multi-step workflow. Where a single CER proves one execution, a Project Bundle proves an entire sequence of executions and their relationships.</p>

    <h2 id="why">Why Project Bundles Exist</h2>
    <p>Single CERs work well for isolated executions. But many real-world systems involve multiple steps:</p>
    <ul>
      <li>An agent that reasons, calls tools, then summarizes</li>
      <li>A pipeline that transforms data across several stages</li>
      <li>A workflow where each step depends on a previous output</li>
    </ul>
    <p>Project Bundles give these multi-step processes a single verifiable artifact with one hash.</p>

    <h2 id="structure">What a Project Bundle Contains</h2>
    <ul>
      <li><strong>steps[]</strong>: an ordered array of CERs. Each step includes a full CER bundle with its own <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.</li>
      <li><strong>projectHash</strong>: a SHA-256 hash derived from the canonical content of the entire bundle. Any change to any step produces a different projectHash.</li>
      <li><strong>metadata</strong>: project-level context such as <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectId</code>, description, and timestamps.</li>
      <li><strong>parentRef</strong> (per step): optional reference to a preceding step, forming a step graph.</li>
    </ul>

    <h2 id="example">Example Structure</h2>
    <CodeBlock
      code={`{
  "bundleType": "cer.project.v1",
  "projectHash": "sha256:ab12cd34ef56...",
  "metadata": {
    "projectId": "proj_abc123",
    "description": "Contract review pipeline",
    "createdAt": "2026-04-01T10:00:00.000Z"
  },
  "steps": [
    {
      "stepIndex": 0,
      "cer": {
        "bundleType": "cer.ai.execution.v1",
        "certificateHash": "sha256:1111...",
        "snapshot": { "model": "gpt-4", "inputHash": "sha256:...", "outputHash": "sha256:..." }
      }
    },
    {
      "stepIndex": 1,
      "parentRef": "sha256:1111...",
      "cer": {
        "bundleType": "cer.ai.execution.v1",
        "certificateHash": "sha256:2222...",
        "snapshot": { "model": "gpt-4", "inputHash": "sha256:...", "outputHash": "sha256:..." }
      }
    }
  ]
}`}
      title="Project Bundle"
    />

    <h2 id="project-hash">projectHash</h2>
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code> is a SHA-256 hash derived from the canonical content of the Project Bundle. It covers all steps, their ordering, and their CER data. Modifying any step, reordering steps, or changing metadata produces a different hash.</p>
    <p>This is different from a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, which covers a single CER. See <Link to="/docs/concepts/hashes" className="text-primary hover:underline">Certificate Hash vs Project Hash</Link> for a comparison.</p>

    <h2 id="relationship-to-cers">Relationship to CERs</h2>
    <p>A Project Bundle does not replace CERs. Each step contains a full CER that remains independently verifiable. The Project Bundle adds:</p>
    <ul>
      <li>Step ordering and sequence</li>
      <li>Parent references between steps</li>
      <li>A single project-level hash covering the entire workflow</li>
      <li>Optional project-level node attestation</li>
    </ul>

    <h2 id="workflow-boundaries">Defining Workflow Boundaries</h2>
    <p>NexArt does not automatically detect workflows. The developer explicitly defines the start and end of a workflow and decides which steps are included.</p>
    <ul>
      <li>A workflow starts when you begin recording CERs.</li>
      <li>Each meaningful step must create its own CER.</li>
      <li>All CERs in the same workflow share a common <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">executionId</code>.</li>
      <li>The workflow ends when you collect those CERs and build a Project Bundle.</li>
    </ul>

    <h3>Example flow</h3>
    <CodeBlock
      code={`import { randomUUID } from "crypto";
import { certify, createProjectBundle } from "@nexart/ai-execution";

// 1. Generate a shared executionId
const executionId = randomUUID();

// 2. Step 1: create CER
const cer1 = await certify({ executionId, model: "gpt-4", input: "...", output: "..." });

// 3. Step 2: create CER
const cer2 = await certify({ executionId, model: "gpt-4", input: "...", output: "..." });

// 4. Step 3: create CER
const cer3 = await certify({ executionId, model: "gpt-4", input: "...", output: "..." });

// 5. Collect CERs and build Project Bundle
const bundle = await createProjectBundle({
  projectId: "proj_abc123",
  steps: [cer1, cer2, cer3],
});

// bundle.projectHash is the verifiable hash for the entire workflow`}
      title="Building a Project Bundle"
    />

    <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-4 my-4">
      <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">Important</p>
      <p className="text-sm text-muted-foreground">NexArt guarantees integrity of what is recorded. It does not guarantee that all steps were recorded. Completeness is controlled by the developer.</p>
    </div>

    <h3>Best practices</h3>
    <ul>
      <li>Always create a new <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">executionId</code> at workflow start.</li>
      <li>Record every external decision (LLM call, tool call, transformation).</li>
      <li>Keep step ordering explicit.</li>
      <li>Build the Project Bundle immediately after execution completes.</li>
    </ul>

    <h2 id="verification">Verification</h2>
    <p>Project Bundles can be verified in two ways:</p>
    <ul>
      <li>At <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer">verify.nexart.io</a> using the route <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/p/:projectHash</code></li>
      <li>Using the SDK: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyProjectBundle()</code> (Node) or <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyProjectBundleAsync()</code> (browser)</li>
    </ul>
    <p>Verification checks the projectHash, each embedded CER's certificateHash, and any node attestation present at the project level.</p>
    <p>See <Link to="/docs/verification" className="text-primary hover:underline">How Verification Works</Link> and <Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link> for details.</p>
  </>
);

export default ProjectBundles;
