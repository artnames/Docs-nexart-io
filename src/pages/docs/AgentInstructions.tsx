import { Link } from "react-router-dom";
import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Agent-Kit: Implementation Instructions for AI Agents

> You are an AI coding agent. Follow these steps exactly. At the end the user's project will be installing @nexart/agent-kit, certifying at least one AI decision into a tamper-evident CER (Certified Execution Record) bundle, and verifying that bundle. Do not skip verification. Do not invent APIs not listed here.

## 0. Goal
Add NexArt certification to the user's Node.js / TypeScript project so that every AI decision produces a verifiable, tamper-evident bundle (a CerAiExecutionBundle).

Success criteria (all must be true at the end):
1. @nexart/agent-kit@^0.5.2 and @nexart/ai-execution@^0.22.0 are installed.
2. At least one call site produces a CER bundle via certifyDecision, wrapTool, or startWorkflow.
3. A verification call (verifyAiCerBundleDetailed or verifyProjectBundle) returns status: 'VERIFIED' / ok: true.
4. You ran the project once and observed the verification pass.

## 1. Prerequisites
- Node >= 18.0.0
- ESM only: package.json MUST have "type": "module". Fallback: dynamic await import() from CJS. Never require() (throws ERR_REQUIRE_ESM).
- TypeScript: "module": "NodeNext", "moduleResolution": "NodeNext".

## 2. Install
npm install @nexart/agent-kit @nexart/ai-execution

## 3. Pick one pattern
- A. certifyDecision: one-off decision (default if vague)
- B. wrapTool: function certified on every call
- C. startWorkflow: multi-step pipeline, single auditable Project Bundle

## 4. Pattern A: certifyDecision
import { certifyDecision, verifyAiCerBundleDetailed } from '@nexart/agent-kit';
const { bundle } = await certifyDecision({ decision, output, provider, model });
const r = verifyAiCerBundleDetailed(bundle);
if (r.status !== 'VERIFIED') throw new Error(r.reasonCodes.join(', '));

## 5. Pattern B: wrapTool
import { wrapTool, verifyAiCerBundleDetailed } from '@nexart/agent-kit';
const tool = wrapTool({ name, provider, run });  // SINGLE options object, not positional
const { result, bundle, certificateHash } = await tool(args);
verify bundle before trusting it.

## 6. Pattern C: startWorkflow
import { startWorkflow } from '@nexart/agent-kit';
import { verifyProjectBundle } from '@nexart/ai-execution';
const wf = startWorkflow({ projectTitle, projectGoal, enableSignals: true });
await wf.step('name', async () => { ... });   // await every step
const { projectBundle, projectHash } = wf.finish();
const v = verifyProjectBundle(projectBundle);

Workflow rules (DO NOT VIOLATE):
- All step() before first finish(). step() after finish() throws.
- finish() is deterministic and cached. Pass options on first call only.
- projectBundle is deeply frozen. Do not mutate.

## 7. (Optional) Register with node
await wf.finishAndRegister({ register: { nodeUrl, apiKey } });
Skip entirely if no node. Local verification is sufficient.

## 8. Run and confirm
Observe Status: VERIFIED (A, B) or Project hash: sha256:... (C). Anything else: fix using table 9.

## 9. Troubleshooting
- ERR_REQUIRE_ESM: add "type": "module" or use dynamic import.
- Cannot find module: reinstall both packages.
- TS Cannot find type declarations: set "moduleResolution": "NodeNext".
- BUNDLE_TAMPERED / HASH_MISMATCH: do not mutate bundle between create and verify.
- step() called after finish(): move all step() before finish().
- step() resolved after finish(): await every step() before finish().
- TypeError Cannot assign to read only property: treat bundle as immutable.
- ProjectBundleRegistrationError: check err.statusCode, err.details, API key, node URL.

## 10. Public API surface (only symbols you should use)
@nexart/agent-kit: certifyDecision, wrapTool, startWorkflow, createProjectSession, exportProjectBundle, importProjectBundle, verifyAiCerBundleDetailed, verifyProjectBundleDetailed, ReasonCode, getContextInfo, computeContextHash, summarizeContext, buildContextInfo, ProjectBundleRegistrationError, AGENT_KIT_VERSION.
@nexart/ai-execution: verifyProjectBundle.

Anything else: you are inventing API. Stop.

## 11. Final checklist
- Both packages in dependencies
- One file imports from @nexart/agent-kit
- That file calls certifyDecision OR wrapTool OR startWorkflow
- That file calls a verification function
- You ran it and saw VERIFIED (A/B) or no errors (C)
- You did not mutate any returned bundle

Report success with the bundle hash observed.

Full reference: https://docs.nexart.io/agent-kit-instructions.md`;

const AgentInstructions = () => (
  <>
    <PageHeader
      title="Agent-Kit Setup Instructions for AI Coding Agents"
      summary="A prescriptive runbook written for AI coding agents. Paste it into your AI assistant (Cursor, Claude Code, Lovable, Windsurf, Cline) and it will install @nexart/agent-kit, certify at least one AI decision, and verify the resulting bundle."
      llmBlock={llmBlock}
    />

    <div className="not-prose my-6 rounded-lg border border-primary/30 bg-primary/5 p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">How to use this page</div>
      <p className="text-sm text-muted-foreground mb-2">
        This page is unusual: it is written in the second person, addressed to an AI coding agent, not to you. AI assistants like Cursor, Claude Code, Lovable, Windsurf, and Cline can install and wire up <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">@nexart/agent-kit</code> correctly on the first try if given a single, prescriptive, constraint-aware runbook. This is that runbook.
      </p>
      <p className="text-sm text-muted-foreground mb-1">You have three ways to use it:</p>
      <ol className="text-sm text-muted-foreground list-decimal ml-5 space-y-1">
        <li>Click the <strong>Copy for LLM</strong> button above and paste it into your assistant as the first message of an integration task.</li>
        <li>Point your assistant at the raw markdown: <em>"Follow the instructions at <a href="https://docs.nexart.io/agent-kit-instructions.md" className="text-primary hover:underline">https://docs.nexart.io/agent-kit-instructions.md</a>."</em></li>
        <li>Read it yourself as the canonical setup reference.</li>
      </ol>
    </div>

    <h2 id="goal">0. Goal</h2>
    <p>
      Add NexArt certification to the user's Node.js / TypeScript project so that every AI decision produces a verifiable, tamper-evident bundle (a <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">CerAiExecutionBundle</code>). A "decision" is any output you would otherwise just log or return: an LLM completion, a tool call result, a routing choice, a generated artifact, etc.
    </p>
    <p>Success criteria (all must be true at the end):</p>
    <ol>
      <li><code>@nexart/agent-kit@^0.5.2</code> and <code>@nexart/ai-execution@^0.22.0</code> are installed.</li>
      <li>At least one call site produces a CER bundle via <code>certifyDecision</code>, <code>wrapTool</code>, or <code>startWorkflow</code>.</li>
      <li>A verification call returns <code>status: 'VERIFIED'</code> / <code>ok: true</code>.</li>
      <li>You ran the project once and observed the verification pass.</li>
    </ol>

    <h2 id="prerequisites">1. Prerequisites</h2>
    <CodeBlock language="bash" code={`node --version   # must be >= 18.0.0
cat package.json | grep '"type"'   # should be "module"`} />
    <ul>
      <li><strong>Node 18+ is required.</strong> If older, tell the user and stop.</li>
      <li><strong>The package is ESM-only.</strong> <code>package.json</code> MUST have <code>"type": "module"</code>. Fallback: dynamic <code>await import('@nexart/agent-kit')</code> from a CJS file. Do NOT attempt <code>require('@nexart/agent-kit')</code>, which throws <code>ERR_REQUIRE_ESM</code>.</li>
      <li><strong>TypeScript</strong> recommended. Set <code>"module": "NodeNext"</code> and <code>"moduleResolution": "NodeNext"</code>.</li>
    </ul>

    <h2 id="install">2. Install</h2>
    <CodeBlock language="bash" code="npm install @nexart/agent-kit @nexart/ai-execution" />
    <p>
      <code>@nexart/ai-execution</code> is a peer-style dep that <code>@nexart/agent-kit</code> re-exports verification helpers from. Install both.
    </p>

    <h2 id="pick-pattern">3. Pick the right pattern</h2>
    <p>Pick <strong>one</strong>. If the user is vague, default to <strong>Pattern A</strong>.</p>
    <div className="not-prose my-4 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2 font-medium">Pattern</th>
            <th className="text-left p-2 font-medium">Use when</th>
            <th className="text-left p-2 font-medium">What you get</th>
          </tr>
        </thead>
        <tbody className="text-muted-foreground">
          <tr className="border-b border-border/50">
            <td className="p-2 align-top"><strong className="text-foreground">A. <code>certifyDecision</code></strong></td>
            <td className="p-2 align-top">One-off decision, single LLM call, single tool result</td>
            <td className="p-2 align-top">One <code>CerAiExecutionBundle</code></td>
          </tr>
          <tr className="border-b border-border/50">
            <td className="p-2 align-top"><strong className="text-foreground">B. <code>wrapTool</code></strong></td>
            <td className="p-2 align-top">A tool/function runs many times and every call should be certified</td>
            <td className="p-2 align-top">A wrapped function: each invocation produces a bundle</td>
          </tr>
          <tr>
            <td className="p-2 align-top"><strong className="text-foreground">C. <code>startWorkflow</code></strong></td>
            <td className="p-2 align-top">Multi-step pipeline where the whole run is one auditable artifact</td>
            <td className="p-2 align-top">One <code>ProjectBundle</code> with one CER per step</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>Do not implement all three "to be safe". Ship the smallest correct change.</p>

    <h2 id="pattern-a">4. Pattern A: <code>certifyDecision</code> (default)</h2>
    <CodeBlock
      language="typescript"
      title="certify-example.ts"
      code={`import { certifyDecision, verifyAiCerBundleDetailed } from '@nexart/agent-kit';

const { bundle } = await certifyDecision({
  decision: 'Recommend product X to user 123',
  output:   'product_x',
  provider: 'openai',
  model:    'gpt-4o',
});

const result = verifyAiCerBundleDetailed(bundle);
if (result.status !== 'VERIFIED') {
  throw new Error(\`CER verification failed: \${result.reasonCodes.join(', ')}\`);
}

console.log('Certified:', bundle.certificateHash);
console.log('Status:   ', result.status);`}
    />
    <p>
      Run it: <code>node certify-example.js</code> (or <code>npx tsx certify-example.ts</code>). Expected output: <code>Status: VERIFIED</code>. If you do not see <code>VERIFIED</code>, stop and report the actual <code>reasonCodes</code>.
    </p>

    <h2 id="pattern-b">5. Pattern B: <code>wrapTool</code></h2>
    <p>
      <code>wrapTool</code> takes a SINGLE options object (<code>{`{ name, run, provider?, source?, tags?, ... }`}</code>), not positional arguments. The wrapped function returns <code>{`{ result, bundle, certificateHash }`}</code>.
    </p>
    <CodeBlock
      language="typescript"
      title="wrapTool"
      code={`import { wrapTool, verifyAiCerBundleDetailed } from '@nexart/agent-kit';

const lookupPrice = wrapTool({
  name:     'lookup-price',
  provider: 'agent-kit',
  run: async (args: { sku: string }) => {
    return { sku: args.sku, priceUsd: 19.99 };
  },
});

const { result, bundle, certificateHash } = await lookupPrice({ sku: 'SKU-42' });

const v = verifyAiCerBundleDetailed(bundle);
if (v.status !== 'VERIFIED') throw new Error(v.reasonCodes.join(', '));

console.log('Tool returned:', result);
console.log('Bundle hash: ', certificateHash);`}
    />

    <h2 id="pattern-c">6. Pattern C: <code>startWorkflow</code> (multi-step project bundle)</h2>
    <CodeBlock
      language="typescript"
      title="startWorkflow"
      code={`import { startWorkflow } from '@nexart/agent-kit';
import { verifyProjectBundle } from '@nexart/ai-execution';

const wf = startWorkflow({
  projectTitle: 'Daily report generation',
  projectGoal:  'Produce signed daily summary',
  // Recommended in v0.5.0+. Chains every step's CER to the previous one:
  enableSignals: true,
});

await wf.step('fetch-data',  async () => await fetchTodaysRows());
await wf.step('summarize',   async () => await callLlmSummary());
await wf.step('write-report', async () => await writeReportFile());

const { projectBundle, projectHash } = wf.finish();

const v = verifyProjectBundle(projectBundle);
if (!v.ok) throw new Error(\`Project bundle invalid: \${v.errors.join(', ')}\`);

console.log('Project hash:', projectHash);
console.log('Steps:       ', projectBundle.totalSteps);`}
    />

    <h3>Workflow rules (DO NOT VIOLATE)</h3>
    <ul>
      <li><strong>Add all <code>step()</code> calls before the first <code>finish()</code>.</strong> Calling <code>step()</code> after <code>finish()</code> throws. The workflow is sealed.</li>
      <li><strong><code>finish()</code> is deterministic and cached.</strong> Calling it twice returns the same bundle reference and the same <code>projectHash</code>. Options on the second call are silently ignored. Pass any options on the FIRST call.</li>
      <li><strong>The returned <code>projectBundle</code> is deeply frozen.</strong> Do not attempt to mutate it, which throws <code>TypeError</code>. Build new objects if you need a modified copy.</li>
    </ul>

    <h2 id="register">7. (Optional) Register with a NexArt node</h2>
    <p>If the user has a NexArt node URL and API key, replace <code>wf.finish()</code> with:</p>
    <CodeBlock
      language="typescript"
      title="finishAndRegister"
      code={`const { projectBundle, projectHash, registration } = await wf.finishAndRegister({
  register: {
    nodeUrl: process.env.NEXART_NODE_URL!,
    apiKey:  process.env.NEXART_API_KEY!,
  },
});

console.log('Registered:', registration.registrationId);`}
    />
    <p>If the user does not have a node, skip this step entirely. Local verification is sufficient for most use cases.</p>

    <h2 id="run">8. Run it and confirm</h2>
    <CodeBlock language="bash" code={`node <your-file>.js          # or: npx tsx <your-file>.ts`} />
    <p>You must observe one of:</p>
    <ul>
      <li><code>Status: VERIFIED</code> (Patterns A, B), or</li>
      <li><code>Project hash: sha256:...</code> with no thrown error (Pattern C).</li>
    </ul>
    <p>If anything else happens, do not declare success. Fix it using the troubleshooting table below.</p>

    <h2 id="troubleshooting">9. Troubleshooting</h2>
    <div className="not-prose my-4 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2 font-medium">Symptom</th>
            <th className="text-left p-2 font-medium">Cause</th>
            <th className="text-left p-2 font-medium">Fix</th>
          </tr>
        </thead>
        <tbody className="text-muted-foreground">
          {[
            ["ERR_REQUIRE_ESM", "Project is CommonJS", `Add "type": "module" to package.json OR use await import() from CJS`],
            ["Cannot find module '@nexart/agent-kit'", "Not installed", "Re-run npm install @nexart/agent-kit @nexart/ai-execution"],
            ["TS: Cannot find type declarations", "Wrong moduleResolution", `Set "moduleResolution": "NodeNext" in tsconfig.json`],
            ["BUNDLE_TAMPERED or HASH_MISMATCH", "Bundle was mutated after creation", "Do not modify bundle between create and verify"],
            ["step() called after finish() — workflow is sealed", "Called wf.step(...) after wf.finish()", "Move all step() before finish()"],
            ["step() resolved after finish() — workflow was sealed mid-step", "An async step() was pending when finish() ran", "await every step() before finish()"],
            ["TypeError: Cannot assign to read only property", "Tried to mutate the deep-frozen bundle", "Treat the bundle as immutable; build a new object"],
            ["ProjectBundleRegistrationError", "Node rejected the bundle", "Check err.statusCode, err.details; usually wrong API key or node URL"],
          ].map(([sym, cause, fix], i) => (
            <tr key={i} className="border-b border-border/50 last:border-0">
              <td className="p-2 align-top"><code className="text-xs">{sym}</code></td>
              <td className="p-2 align-top">{cause}</td>
              <td className="p-2 align-top">{fix}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h2 id="api-surface">10. Public API surface</h2>
    <p>The only symbols you should use:</p>
    <CodeBlock
      language="typescript"
      code={`import {
  // Core certification
  certifyDecision,
  wrapTool,
  startWorkflow,

  // Project bundle helpers
  createProjectSession,
  exportProjectBundle,
  importProjectBundle,

  // Verification (re-exported from @nexart/ai-execution)
  verifyAiCerBundleDetailed,
  verifyProjectBundleDetailed,
  ReasonCode,

  // Context helpers
  getContextInfo,
  computeContextHash,
  summarizeContext,
  buildContextInfo,

  // Errors
  ProjectBundleRegistrationError,

  // Version constant
  AGENT_KIT_VERSION,
} from '@nexart/agent-kit';

import { verifyProjectBundle } from '@nexart/ai-execution';`}
    />
    <p>If you reach for any symbol not in this list, you are inventing API. Stop and re-read this document.</p>

    <h2 id="checklist">11. Final checklist before declaring done</h2>
    <ul>
      <li>Both packages appear in <code>package.json</code> <code>dependencies</code></li>
      <li>One file imports from <code>@nexart/agent-kit</code></li>
      <li>That file calls one of: <code>certifyDecision</code>, <code>wrapTool</code>, <code>startWorkflow</code></li>
      <li>The same file calls a verification function on the produced bundle</li>
      <li>You ran the file once and saw <code>VERIFIED</code> (A/B) or no errors (C)</li>
      <li>You did not modify any returned <code>bundle</code> or <code>projectBundle</code></li>
    </ul>
    <p>When all six boxes are checked, report success to the user with the bundle hash you observed.</p>
    <p className="text-sm text-muted-foreground">
      If you got stuck on a step not covered by the troubleshooting table, the canonical reference is the <Link to="/docs/agent-kit" className="text-primary hover:underline">Agent Kit</Link> page.
    </p>

    <h2 id="related">Related</h2>
    <ul>
      <li><Link to="/docs/agent-kit" className="text-primary hover:underline">Agent Kit</Link>: full API reference</li>
      <li><Link to="/docs/quickstart" className="text-primary hover:underline">Quickstart</Link>: 5-minute human walkthrough</li>
      <li><Link to="/docs/verification" className="text-primary hover:underline">Verification</Link>: how CER verification works</li>
      <li><Link to="/docs/concepts/project-bundles" className="text-primary hover:underline">Project Bundles</Link>: multi-step workflow concept</li>
    </ul>
  </>
);

export default AgentInstructions;
