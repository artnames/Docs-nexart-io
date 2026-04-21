import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const llmBlock = `# Multi-step & Multi-agent Workflows

NexArt applies to any execution graph where one or more meaningful steps
should be independently verifiable.

## Core idea
- Each meaningful step (LLM call, tool call, agent handoff) MAY produce its
  own CER (cer.ai.execution.v1).
- Step CERs MAY be grouped into a Project Bundle (cer.project.bundle.v1).
- The Project Bundle MAY be registered on a node for public verification.

## When to use a Project Bundle
- Linear multi-step workflows (Step 1 -> Step 2 -> Step 3).
- Multi-agent handoffs (Agent A -> Agent B -> Agent C).
- Tool-using agents where each tool call should be auditable.
- Non-linear graphs (branching, parallel) where the final state should be
  attributable to a verifiable sequence of step CERs.

## When NOT to use a Project Bundle
- Single-execution flows. One CER is enough. See Path A.

## Identity
- Each step CER has its own certificateHash.
- The bundle has a projectHash that covers all step CERs.
- Public verification surfaces:
    /c/{certificateHash}   for any single step
    /p/{projectHash}       for the whole workflow`;

const MultiStepAndMultiAgentWorkflows = () => (
  <>
    <PageHeader
      title="Multi-step & Multi-agent Workflows"
      summary="How NexArt applies to workflows with more than one meaningful step. Each step can be its own CER. Steps can be grouped into a Project Bundle. Project Bundles can be registered for public verification."
      llmBlock={llmBlock}
    />

    <Alert className="mb-6">
      <Info className="h-4 w-4" />
      <AlertTitle>Single CER is still a first-class path</AlertTitle>
      <AlertDescription>
        If your execution is a single LLM call, a single tool call, or a single
        deterministic run, you do not need a Project Bundle. See{" "}
        <Link to="/docs/getting-started">Getting Started</Link> for Path A.
      </AlertDescription>
    </Alert>

    <h2>The mental model</h2>
    <ul>
      <li><strong>Step</strong> - one meaningful unit of execution (one LLM call, one tool call, one agent turn).</li>
      <li><strong>Step CER</strong> - a <code>cer.ai.execution.v1</code> record for that step.</li>
      <li><strong>Project Bundle</strong> - a <code>cer.project.bundle.v1</code> artifact grouping the step CERs of one workflow.</li>
      <li><strong>projectHash</strong> - canonical identity of the bundle.</li>
      <li><strong>Node registration</strong> - what makes the bundle publicly verifiable.</li>
    </ul>

    <h2>Linear multi-step example</h2>
    <p>
      Three agents collaborate. Each agent's output becomes a step CER. The
      three CERs are grouped into one Project Bundle and registered on the node.
    </p>
    <CodeBlock
      language="text"
      code={`Agent A ──▶ stepA CER  (certificateHash: sha256:aaa...)
Agent B ──▶ stepB CER  (certificateHash: sha256:bbb...)
Agent C ──▶ stepC CER  (certificateHash: sha256:ccc...)

           └─▶ Project Bundle  (projectHash: sha256:zzz...)
                          │
                          ▼
                 POST /v1/project-bundle/register
                          │
                          ▼
                 verify.nexart.io/p/{projectHash}`}
    />

    <CodeBlock language="typescript" code={`import {
  certifyDecision,
  createProjectBundle,
  verifyProjectBundle,
  registerProjectBundle,
} from "@nexart/ai-execution";

const stepA = await certifyDecision({ /* Agent A inputs */ });
const stepB = await certifyDecision({ /* Agent B inputs, sees Agent A output */ });
const stepC = await certifyDecision({ /* Agent C inputs, sees Agent B output */ });

const bundle = await createProjectBundle({
  projectId: "agent-trio-2026-04-21",
  steps: [stepA.cer, stepB.cer, stepC.cer],
});

const local = await verifyProjectBundle(bundle);
if (!local.ok) throw new Error("Bundle integrity failed");

const { projectHash } = await registerProjectBundle(bundle, {
  apiKey: process.env.NEXART_API_KEY!,
});

console.log(\`https://verify.nexart.io/p/\${projectHash}\`);`} />

    <h2>Tool-using agents</h2>
    <p>
      When an agent calls tools, each tool call MAY be a step CER. This gives
      auditors per-tool-call provenance without requiring you to certify the
      orchestration loop itself.
    </p>
    <ul>
      <li>Tool boundary in, tool boundary out: one step CER per call.</li>
      <li>Tool inputs and outputs are hashed into the step CER's <code>inputHash</code> and <code>outputHash</code>.</li>
      <li>The bundle records the order of calls; the projectHash binds the sequence.</li>
    </ul>

    <h2>Non-linear handoffs</h2>
    <p>
      Branching and parallel execution graphs are supported by the same model.
      Each branch's step CERs are included in the bundle. The projectHash binds
      the full set; the bundle's internal step ordering is canonical.
    </p>
    <ul>
      <li>Parallel branches: include each branch's step CERs in the bundle.</li>
      <li>Conditional branches: only the executed branch's step CERs need to be present.</li>
      <li>Retries: each retry MAY be its own step CER, preserving the audit trail.</li>
    </ul>

    <h2>Agent Kit</h2>
    <p>
      For linear workflows,{" "}
      <Link to="/docs/agent-kit"><code>@nexart/agent-kit</code></Link>{" "}
      wraps the per-step <code>certifyDecision</code> + <code>createProjectBundle</code>{" "}
      pattern behind <code>startWorkflow / step / finish</code>. It is the recommended
      entry point for linear pipelines. For non-linear graphs, use{" "}
      <code>@nexart/ai-execution</code> directly.
    </p>

    <h2>Common pitfalls</h2>
    <ul>
      <li>Treating one workflow as one CER. Use one CER <em>per step</em>, then group.</li>
      <li>Skipping registration. Local verification does not make the bundle publicly verifiable.</li>
      <li>Looking up steps by <code>executionId</code>. Always use <code>certificateHash</code>.</li>
    </ul>

    <h2>Related</h2>
    <ul>
      <li><Link to="/docs/concepts/project-bundles">Project Bundles concept</Link></li>
      <li><Link to="/docs/project-bundle-registration">Project Bundle Registration</Link></li>
      <li><Link to="/docs/end-to-end-verification">End-to-End Verification Flow</Link></li>
      <li><Link to="/docs/agent-kit">Agent Kit</Link></li>
    </ul>
  </>
);

export default MultiStepAndMultiAgentWorkflows;
