# NexArt Agent-Kit: Implementation Instructions for AI Agents

> **You are an AI coding agent.** Follow these steps exactly. At the end the user's project will be installing `@nexart/agent-kit`, certifying at least one AI decision into a tamper-evident CER (Certified Execution Record) bundle, and verifying that bundle. Do not skip verification. Do not invent APIs not listed here.

---

## 0. Goal

Add NexArt certification to the user's Node.js / TypeScript project so that every AI decision produces a verifiable, tamper-evident bundle (a `CerAiExecutionBundle`). A "decision" is any output you would otherwise just log or return: an LLM completion, a tool call result, a routing choice, a generated artifact, etc.

Success criteria (all must be true at the end):

1. `@nexart/agent-kit@^0.5.2` and `@nexart/ai-execution@^0.22.0` are installed.
2. At least one call site in the user's code produces a CER bundle via `certifyDecision`, `wrapTool`, or `startWorkflow`.
3. A verification call (`verifyAiCerBundleDetailed` or `verifyProjectBundle`) runs against the produced bundle and returns `status: 'VERIFIED'` / `ok: true`.
4. You ran the project once and observed the verification pass.

---

## 1. Prerequisites (verify before doing anything else)

Run these checks. If any fails, fix it before continuing.

```bash
node --version   # must be >= 18.0.0
cat package.json | grep '"type"'   # should be "module", see step 2 if missing
```

- **Node 18+ is required.** If older, tell the user and stop.
- **The package is ESM-only.** The user's `package.json` MUST have `"type": "module"`. If it does not, you have two choices:
  - (Preferred) Add `"type": "module"` to `package.json` and convert the relevant file(s) to ESM (`import` syntax, `.js` extensions in relative imports).
  - (Fallback) Use dynamic `await import('@nexart/agent-kit')` from a CJS file. Do NOT attempt `require('@nexart/agent-kit')`, which throws `ERR_REQUIRE_ESM`.
- **TypeScript is recommended but optional.** If TS is present, ensure `"module": "NodeNext"` (or `"ESNext"`) and `"moduleResolution": "NodeNext"` in `tsconfig.json`. The package ships its own `.d.ts` files.

---

## 2. Install

```bash
npm install @nexart/agent-kit @nexart/ai-execution
```

`@nexart/ai-execution` is a peer-style dep that `@nexart/agent-kit` re-exports verification helpers from. Install both. Do NOT pin to anything older than what is listed above.

---

## 3. Pick the right pattern

Read the user's stated need and pick **one** of the three patterns below. If the user is vague, default to **Pattern A**.

| Pattern | Use when | What you get |
|---|---|---|
| **A. `certifyDecision`** | One-off decision, single LLM call, single tool result | One `CerAiExecutionBundle` |
| **B. `wrapTool`** | The user has a tool/function that runs many times and every call should be certified | A wrapped function: each invocation produces a bundle |
| **C. `startWorkflow`** | Multi-step pipeline (e.g. fetch then analyze then decide then write) where the whole run should be a single auditable artifact | One `ProjectBundle` containing one CER per step, deterministically hashed |

Pick one and implement it. Do not implement all three "to be safe", ship the smallest correct change.

---

## 4. Pattern A: `certifyDecision` (minimal, default)

Create or modify a file (e.g. `certify-example.ts` or wherever the user's decision is made):

```ts
import { certifyDecision, verifyAiCerBundleDetailed } from '@nexart/agent-kit';

// Replace these four values with the user's actual decision context.
const { bundle } = await certifyDecision({
  decision: 'Recommend product X to user 123',  // human-readable label
  output:   'product_x',                         // what the AI produced (string)
  provider: 'openai',                            // 'openai' | 'anthropic' | 'agent-kit' | etc.
  model:    'gpt-4o',                            // free-form model identifier string
});

// MANDATORY: verify before trusting the bundle.
const result = verifyAiCerBundleDetailed(bundle);
if (result.status !== 'VERIFIED') {
  throw new Error(`CER verification failed: ${result.reasonCodes.join(', ')}`);
}

console.log('Certified:', bundle.certificateHash);
console.log('Status:   ', result.status);
```

Run it: `node certify-example.js` (or `npx tsx certify-example.ts`). Expected output: `Status: VERIFIED`. **If you do not see `VERIFIED`, stop and report the actual `reasonCodes`.**

---

## 5. Pattern B: `wrapTool`

Use this if the user has a function that should be certified on every call.

`wrapTool` takes a SINGLE options object (`{ name, run, provider?, source?, tags?, ... }`), not positional arguments. The wrapped function takes whatever arguments `run` declares and returns `{ result, bundle, certificateHash }`.

```ts
import { wrapTool, verifyAiCerBundleDetailed } from '@nexart/agent-kit';

const lookupPrice = wrapTool({
  name:     'lookup-price',                // also used as the model identifier in the CER
  provider: 'agent-kit',                   // optional; defaults to 'tool'
  run: async (args: { sku: string }) => {
    // Whatever the tool actually does:
    return { sku: args.sku, priceUsd: 19.99 };
  },
});

const { result, bundle, certificateHash } = await lookupPrice({ sku: 'SKU-42' });

const v = verifyAiCerBundleDetailed(bundle);
if (v.status !== 'VERIFIED') throw new Error(v.reasonCodes.join(', '));

console.log('Tool returned:', result);
console.log('Bundle hash: ', certificateHash);
```

The tool's return value is preserved on `result`. The CER is on `bundle`. Always verify.

---

## 6. Pattern C: `startWorkflow` (multi-step project bundle)

Use this when the whole pipeline is the auditable unit.

```ts
import { startWorkflow } from '@nexart/agent-kit';
import { verifyProjectBundle } from '@nexart/ai-execution';

const wf = startWorkflow({
  projectTitle: 'Daily report generation',
  projectGoal:  'Produce signed daily summary',
  // Optional but recommended in v0.5.0. Chains every step's CER to the previous one:
  enableSignals: true,
});

await wf.step('fetch-data',  async () => await fetchTodaysRows());
await wf.step('summarize',   async () => await callLlmSummary());
await wf.step('write-report', async () => await writeReportFile());

const { projectBundle, projectHash } = wf.finish();

const v = verifyProjectBundle(projectBundle);
if (!v.ok) throw new Error(`Project bundle invalid: ${v.errors.join(', ')}`);

console.log('Project hash:', projectHash);
console.log('Steps:       ', projectBundle.totalSteps);
```

### Workflow rules (DO NOT VIOLATE)

- **Add all `step()` calls before the first `finish()`.** Calling `step()` after `finish()` throws. The workflow is sealed.
- **`finish()` is deterministic and cached.** Calling it twice returns the same bundle reference and the same `projectHash`. Options passed on the second call are silently ignored. Pass any options on the FIRST call.
- **The returned `projectBundle` is deeply frozen.** Do not attempt to mutate it, which throws `TypeError`. Build new objects if you need a modified copy.

---

## 7. (Optional) Register the bundle with a NexArt node

If the user has a NexArt node URL and an API key, replace `wf.finish()` with:

```ts
const { projectBundle, projectHash, registration } = await wf.finishAndRegister({
  register: {
    nodeUrl: process.env.NEXART_NODE_ENDPOINT!,
    apiKey:  process.env.NEXART_API_KEY!,
  },
});

console.log('Registered:', registration.registrationId);
```

If the user does not have a node, **skip this step entirely**. Local verification (steps 4-6) is sufficient for most use cases.

---

## 8. Run it and confirm

```bash
node <your-file>.js          # or: npx tsx <your-file>.ts
```

You must observe one of:
- `Status: VERIFIED` (Patterns A, B), or
- `Project hash: sha256:...` with no thrown error (Pattern C).

If anything else happens, do not declare success. Fix it using the troubleshooting table below.

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ERR_REQUIRE_ESM` | Project is CommonJS | Add `"type": "module"` to `package.json` OR use `await import('@nexart/agent-kit')` from CJS |
| `Cannot find module '@nexart/agent-kit'` | Not installed | Re-run `npm install @nexart/agent-kit @nexart/ai-execution` |
| TS error: `Cannot find module '@nexart/agent-kit' or its corresponding type declarations` | Wrong `moduleResolution` | Set `"moduleResolution": "NodeNext"` in `tsconfig.json` |
| `CER verification failed` with reason `BUNDLE_TAMPERED` or `HASH_MISMATCH` | Bundle was mutated after creation | Do not modify `bundle` between `certifyDecision()` and `verifyAiCerBundleDetailed()` |
| `step() called after finish() — workflow is sealed` | You called `wf.step(...)` after `wf.finish()` | Move all `step()` calls before `finish()` |
| `step() resolved after finish() — workflow was sealed mid-step` | An async `step()` was still pending when `finish()` ran | `await` every `step()` before calling `finish()` |
| `TypeError: Cannot assign to read only property` on `projectBundle.*` | You tried to mutate the deep-frozen cached bundle | Treat the bundle as immutable; build a new object instead |
| `ProjectBundleRegistrationError` from `finishAndRegister` | Node rejected the bundle | Check `err.statusCode` and `err.details`; usually wrong API key or node URL |

---

## 10. Public API surface (the only symbols you should use)

```ts
import {
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

import { verifyProjectBundle } from '@nexart/ai-execution';
```

If you reach for any symbol not in this list, you are inventing API. Stop and re-read this document.

---

## 11. Final checklist before declaring done

- [ ] `@nexart/agent-kit` and `@nexart/ai-execution` appear in `package.json` `dependencies`
- [ ] One file in the user's project imports from `@nexart/agent-kit`
- [ ] That file calls one of: `certifyDecision`, `wrapTool`, or `startWorkflow`
- [ ] The same file calls a verification function on the produced bundle
- [ ] You ran the file once and saw `VERIFIED` (Patterns A/B) or no errors (Pattern C)
- [ ] You did not modify any returned `bundle` or `projectBundle` object

When all six boxes are checked, report success to the user with the bundle hash you observed.

If you got stuck on a step not covered by the troubleshooting table, the canonical reference is https://docs.nexart.io/docs/agent-kit.
