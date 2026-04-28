import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";

const llmBlock = `# Project Bundles

A Project Bundle is a structured collection of CERs representing a multi-step workflow.
bundleType: cer.project.bundle.v1

## What it contains
- stepRegistry: ordered step metadata (stepId, sequence, stepLabel, certificateHash)
- embeddedBundles: the CERs themselves, keyed by stepId
- integrity.projectHash: hash derived from canonical JSON content (sha256-canonical-json)
- project-level metadata: projectBundleId, projectTitle, timestamps, optional goal/summary/tags
- optional project-level node receipt

## projectHash
Derived from the canonical JSON content of the entire Project Bundle using sha256-canonical-json. Any modification to any embedded CER, step metadata, or ordering produces a different projectHash.

## Relationship to CERs
Each entry in embeddedBundles contains a full CER with its own certificateHash.
The Project Bundle adds structure (stepRegistry, ordering, relationships) on top of individual CERs.

## Verification
Project Bundles can be verified at verify.nexart.io/p/:projectHash or using verifyProjectBundle() / verifyProjectBundleAsync() from the SDK.
Verification checks each embedded CER and the overall project hash.`;

const ProjectBundles = () => (
  <>
    <DocsMeta
      title="Project Bundles"
      description="Group related CERs under a single projectHash for multi-step verification. Optional and never required for single-CER use cases."
    />
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
      <li><strong>stepRegistry</strong>: ordered step metadata. Each entry contains a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">stepId</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">sequence</code> number, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">stepLabel</code>, and the step's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.</li>
      <li><strong>embeddedBundles</strong>: the actual CERs, keyed by <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">stepId</code>. Each embedded bundle is a full CER with its own <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>.</li>
      <li><strong>integrity</strong>: contains the <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code> and the algorithm used (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">sha256-canonical-json</code>). Any change to any embedded CER, step metadata, or ordering produces a different <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code>.</li>
      <li><strong>Project-level metadata</strong>: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectBundleId</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectTitle</code>, timestamps (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">startedAt</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">completedAt</code>), and optional fields like <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectGoal</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectSummary</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">appName</code>, and <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">tags</code>.</li>
    </ul>

    <h2 id="example">Canonical Structure</h2>
    <p className="text-sm text-muted-foreground mb-3">This is the real stored shape of a Project Bundle artifact.</p>
    <CodeBlock
      code={`{
  "bundleType": "cer.project.bundle.v1",
  "projectBundleId": "pb_a1b2c3d4",
  "projectTitle": "Contract review pipeline",
  "protocolVersion": "1.2.0",
  "version": "0.1",
  "startedAt": "2026-04-01T10:00:00.000Z",
  "completedAt": "2026-04-01T10:02:30.000Z",
  "totalSteps": 2,
  "stepRegistry": [
    {
      "stepId": "step_1",
      "sequence": 0,
      "stepLabel": "Extract clauses",
      "certificateHash": "sha256:1111..."
    },
    {
      "stepId": "step_2",
      "sequence": 1,
      "stepLabel": "Summarize risks",
      "certificateHash": "sha256:2222..."
    }
  ],
  "embeddedBundles": {
    "step_1": {
      "bundleType": "cer.ai.execution.v1",
      "certificateHash": "sha256:1111...",
      "snapshot": { "model": "gpt-4", "inputHash": "sha256:...", "outputHash": "sha256:..." }
    },
    "step_2": {
      "bundleType": "cer.ai.execution.v1",
      "certificateHash": "sha256:2222...",
      "snapshot": { "model": "gpt-4", "inputHash": "sha256:...", "outputHash": "sha256:..." }
    }
  },
  "integrity": {
    "algorithm": "sha256-canonical-json",
    "projectHash": "sha256:ab12cd34ef56..."
  }
}`}
      title="Project Bundle (cer.project.bundle.v1)"
    />

    <h2 id="project-hash">projectHash</h2>
    <p>The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code> is computed using <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">sha256-canonical-json</code> over the canonical content of the Project Bundle. It covers all embedded CERs, the step registry, ordering, and project metadata. Modifying any embedded CER, reordering steps, or changing metadata produces a different hash.</p>
    <p>This is different from a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>, which covers a single CER. See <Link to="/docs/concepts/hashes" className="text-primary hover:underline">Certificate Hash vs Project Hash</Link> for a detailed comparison.</p>

    <h2 id="relationship-to-cers">Relationship to CERs</h2>
    <p>A Project Bundle does not replace CERs. Each entry in <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">embeddedBundles</code> contains a full CER that remains independently verifiable by its <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code>. The Project Bundle adds:</p>
    <ul>
      <li>Step ordering and sequence via <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">stepRegistry</code></li>
      <li>Step identity and labeling (<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">stepId</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">stepLabel</code>)</li>
      <li>A single project-level hash covering the entire workflow</li>
      <li>Optional project-level node receipt</li>
    </ul>

    <h2 id="workflow-boundaries">Defining Workflow Boundaries</h2>
    <p>NexArt does not automatically detect workflows. The developer explicitly defines the start and end of a workflow and decides which steps are included.</p>
    <ul>
      <li>A workflow starts when you begin recording CERs for a given process.</li>
      <li>Each meaningful step must create its own CER.</li>
      <li>The developer keeps the workflow context consistent and then collects the relevant CERs into a Project Bundle.</li>
      <li>The workflow ends when you build the Project Bundle from those CERs.</li>
    </ul>
    <p className="text-muted-foreground mt-2">Developers often track a shared workflow or conversation identifier in their own system to group related steps. This is a developer-side concern, not a Project Bundle protocol requirement.</p>

    <h3>Conceptual builder example</h3>
    <p className="text-sm text-muted-foreground mb-3">This is a simplified conceptual example showing the general flow. Refer to the <Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link> docs for the exact current helper signatures.</p>
    <CodeBlock
      code={`import { certify, createProjectBundle } from "@nexart/ai-execution";

// Step 1: create CER
const cer1 = await certify({
  model: "gpt-4",
  input: "Extract key clauses from the contract.",
  output: "Clause 1: ..., Clause 2: ..."
});

// Step 2: create CER
const cer2 = await certify({
  model: "gpt-4",
  input: "Summarize risks from: Clause 1: ..., Clause 2: ...",
  output: "Risk summary: ..."
});

// Build Project Bundle from collected CERs
// Step metadata (stepId, sequence, stepLabel) is included when building
const projectBundle = await createProjectBundle({
  projectTitle: "Contract review pipeline",
  steps: [
    { stepId: "step_1", stepLabel: "Extract clauses", cer: cer1 },
    { stepId: "step_2", stepLabel: "Summarize risks", cer: cer2 }
  ]
});

// projectBundle.integrity.projectHash is the verifiable hash`}
      title="Conceptual builder example"
    />

    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 my-4">
      <p className="text-sm font-medium text-destructive mb-1">Important</p>
      <p className="text-sm text-muted-foreground">NexArt guarantees integrity of what is recorded. It does not guarantee that all steps were recorded. Completeness is controlled by the developer.</p>
    </div>

    <h3>Best practices</h3>
    <ul>
      <li>Record every meaningful step (LLM call, tool call, transformation).</li>
      <li>Keep step ordering explicit using <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">sequence</code> values.</li>
      <li>Keep workflow context consistent across steps in your application.</li>
      <li>Build the Project Bundle immediately after execution completes.</li>
      <li>Register it on the node if you want public lookup by <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code>.</li>
    </ul>

    <h2 id="agent-kit">Using agent-kit (recommended)</h2>
    <p>For linear workflows, <Link to="/docs/agent-kit" className="text-primary hover:underline">@nexart/agent-kit</Link> removes manual step tracking. Instead of creating CERs individually and assembling them, you use the workflow helpers:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">startWorkflow()</code> begins a new workflow and generates a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">workflowId</code></li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">step()</code> creates a CER per step. Each step gets its own <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">executionId</code>. The <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">workflowId</code> links them together.</li>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">finish()</code> builds the Project Bundle synchronously</li>
    </ul>
    <p className="text-sm text-muted-foreground mt-2"><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">step()</code> records the step name as input and the function return value as output. Implicit closure state is NOT recorded.</p>

    <CodeBlock
      code={`import { startWorkflow } from "@nexart/agent-kit";

const workflow = startWorkflow({ projectTitle: "Contract review" });

const clauses = await workflow.step("Extract clauses", async () => {
  return await llm.call("Extract key clauses...");
});

const risks = await workflow.step("Summarize risks", async () => {
  return await llm.call("Summarize risks from: " + clauses);
});

const bundle = workflow.finish();
// bundle.integrity.projectHash is the verifiable hash`}
      title="Workflow with agent-kit (v0.3.0)"
    />

    <div className="rounded-md border border-border bg-muted/30 p-4 my-4">
      <p className="text-sm font-medium text-foreground mb-1">Limitation</p>
      <p className="text-sm text-muted-foreground">agent-kit v0.3.0 is designed for linear workflows. For complex DAGs or non-linear execution graphs, use the lower-level SDK helpers (<code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">certify</code> + <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">createProjectBundle</code>).</p>
    </div>

    <h2 id="verification">Verification</h2>
    <p>Project Bundles can be verified in two ways:</p>
    <ul>
      <li>On <a href="https://verify.nexart.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">verify.nexart.io</a> via <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">/p/:projectHash</code>. The site fetches the Project Bundle from the node-backed trust surface and runs verification independently in the browser.</li>
      <li>With the SDK: <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyProjectBundle()</code> for Node/server environments, or <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">verifyProjectBundleAsync()</code> for browser-safe verification.</li>
    </ul>
    <p>Verification checks:</p>
    <ul>
      <li><code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">projectHash</code> integrity</li>
      <li>Each embedded CER's <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">certificateHash</code></li>
      <li>Optional node receipt at the project level</li>
    </ul>
    <p className="text-muted-foreground mt-2">The node is not required for verification. It provides discovery and independent attestation. Integrity is proven by the hashes alone.</p>
    <p>See <Link to="/docs/verification" className="text-primary hover:underline">How Verification Works</Link> and <Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link> for details.</p>
  </>
);

export default ProjectBundles;
