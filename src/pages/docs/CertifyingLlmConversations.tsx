import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const llmBlock = `# Certifying LLM Conversations

A developer guide for integrating NexArt into a conversational AI application
so every turn and every full conversation produces a cryptographically
verifiable execution record.

## Two layers
1. Per-message CER: one Certified Execution Record per LLM turn.
2. Per-conversation Project Bundle: groups turn CERs and is registered for
   public verification.

## What this proves
- The exact prompt, model parameters, and response existed at a given time.
- The conversation has not been modified since sealing.
- The NexArt attestation node witnessed and signed the record.

## What this does NOT prove
- That the model's answer is correct, safe, or non-hallucinated.
- That the user's identity is verified (unless your app attaches identity
  signals to the executionContext).
- Anything about content redacted AFTER sealing - redaction invalidates the
  certificateHash.

## Endpoints
- POST /api/attest                     -> attest a single turn CER
- POST /v1/project-bundle/register     -> register the full conversation bundle

## SDK
@nexart/ai-execution >= 0.14.0 (verified against 0.16.1).`;

const CertifyingLlmConversations = () => (
  <>
    <PageHeader
      title="Certifying LLM Conversations"
      summary="End-to-end pattern for producing per-message and per-conversation Certified Execution Records inside your own conversational AI application."
      llmBlock={llmBlock}
    />

    <p>
      This guide shows how to integrate NexArt into a conversational AI
      application so that every user turn produces a Certified Execution Record
      (CER), and the full conversation is sealed into a Project Bundle that any
      third party can verify. It assumes you already have a working LLM loop and
      are familiar with the{" "}
      <Link to="/docs/ai-execution">AI Execution CER</Link> concept.
    </p>
    <p>
      The pattern below is stable across minor SDK updates of{" "}
      <code>@nexart/ai-execution</code>. Examples are written against{" "}
      <code>{`>=`} 0.14.0</code> and verified against the current{" "}
      <code>0.16.1</code> release.
    </p>

    <h2 id="toc">On this page</h2>
    <ol>
      <li><a href="#two-layers">Why two layers: per-message and per-conversation</a></li>
      <li><a href="#scope">What certification proves and what it doesn't</a></li>
      <li><a href="#per-turn">Certifying a single turn</a></li>
      <li><a href="#sealing">Sealing the conversation</a></li>
      <li><a href="#verification">After-the-fact verification</a></li>
      <li><a href="#redaction">Redaction before sealing</a></li>
    </ol>

    <h2 id="two-layers">Why two layers: per-message and per-conversation</h2>
    <p>
      A conversation is not a single execution. It is a sequence of executions,
      each of which is independently meaningful and independently auditable.
      NexArt mirrors that structure with two layers of certification:
    </p>
    <ul>
      <li>
        <strong>Per-message CER.</strong> One Certified Execution Record per LLM
        turn. Each turn's prompt, model parameters, and response are hashed and
        signed in isolation. A turn CER is verifiable on its own, even if the
        rest of the conversation is unavailable.
      </li>
      <li>
        <strong>Per-conversation Project Bundle.</strong> When the conversation
        ends (or reaches a natural checkpoint), the turn CERs are grouped into a
        Project Bundle. The bundle commits to the ordered set of turns under a
        single <code>projectHash</code>, and registering it produces a publicly
        verifiable artifact at <code>verify.nexart.io/p/{`{projectHash}`}</code>.
      </li>
    </ul>
    <p>
      Both layers are required for end-to-end certification. A turn CER without
      a bundle cannot prove the conversation it belonged to. A bundle without
      registered turn CERs cannot prove the content of any individual turn.
    </p>

    <h2 id="scope">What certification proves and what it doesn't</h2>
    <p>
      NexArt provides cryptographic proof of execution integrity. It does not
      validate semantic correctness. Be explicit with stakeholders about what a
      green verification result actually means.
    </p>
    <div className="grid gap-4 md:grid-cols-2 my-4">
      <div className="rounded-md border border-border p-4">
        <p className="font-medium mb-2">What this proves</p>
        <ul className="m-0">
          <li>The exact prompt, model identity, parameters, and response existed at the recorded time.</li>
          <li>Nothing in the certified payload has been modified since sealing.</li>
          <li>The NexArt attestation node witnessed and signed the record.</li>
          <li>The ordered sequence of turns in the conversation is fixed.</li>
        </ul>
      </div>
      <div className="rounded-md border border-border p-4">
        <p className="font-medium mb-2">What this does NOT prove</p>
        <ul className="m-0">
          <li>That the model's response is correct, safe, or non-hallucinated.</li>
          <li>That the end user's identity is verified (unless you attach identity signals).</li>
          <li>That any field redacted after sealing is recoverable.</li>
          <li>That the model used was the "best" or "right" model for the task.</li>
        </ul>
      </div>
    </div>

    <h2 id="per-turn">Certifying a single turn</h2>
    <p>
      Wrap each LLM call so that the prompt, the model parameters, and the
      response are committed to a CER. Then post the CER to the attestation
      node, which returns a signed receipt.
    </p>
    <CodeBlock language="typescript" code={`import { certifyDecision } from "@nexart/ai-execution";

async function certifyTurn(args: {
  conversationId: string;
  turnIndex: number;
  userMessage: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  assistantResponse: string;
}) {
  const { cer } = await certifyDecision({
    executionId: \`\${args.conversationId}:turn-\${args.turnIndex}\`,
    input: {
      systemPrompt: args.systemPrompt,
      userMessage: args.userMessage,
    },
    output: {
      assistantResponse: args.assistantResponse,
    },
    model: {
      id: args.model,
      parameters: { temperature: args.temperature },
    },
    executionContext: {
      conversationId: args.conversationId,
      turnIndex: args.turnIndex,
    },
  });

  // Attest the single turn on the node.
  const res = await fetch("https://node.nexart.io/api/attest", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${process.env.NEXART_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cer),
  });

  if (!res.ok) {
    throw new Error(\`Attestation failed: \${res.status}\`);
  }

  const { receipt } = await res.json();
  return { cer, receipt };
}`} />
    <p>
      Persist <code>cer</code> alongside the turn in your application database.
      You will need every turn CER when you seal the conversation in the next
      step.
    </p>

    <h2 id="sealing">Sealing the conversation</h2>
    <p>
      When the conversation ends, group the ordered turn CERs into a Project
      Bundle and register it. The bundle commits to the ordering of turns
      under a single <code>projectHash</code>.
    </p>
    <CodeBlock language="typescript" code={`import {
  createProjectBundle,
  verifyProjectBundle,
  registerProjectBundle,
} from "@nexart/ai-execution";

async function sealConversation(conversationId: string, turnCers: unknown[]) {
  // 1. Group turns. Order matters - stepIndex implies turn order.
  const bundle = await createProjectBundle({
    projectId: conversationId,
    steps: turnCers.map((cer, stepIndex) => ({
      cer,
      stepIndex,
    })),
  });

  // 2. Verify integrity locally before sending anything to the node.
  const local = await verifyProjectBundle(bundle);
  if (!local.ok) {
    throw new Error("Bundle failed local verification - do not register");
  }

  // 3. Register on the node. REQUIRED for public verification.
  const reg = await registerProjectBundle(bundle, {
    apiKey: process.env.NEXART_API_KEY!,
  });

  return {
    projectHash: reg.projectHash,
    publicUrl: \`https://verify.nexart.io/p/\${reg.projectHash}\`,
  };
}`} />
    <p>
      This example treats the conversation as linear: turn N follows turn
      N-1. Branching conversations and multi-agent handoffs use additional
      step-graph fields; see{" "}
      <Link to="/docs/multi-step-and-multi-agent-workflows">
        Multi-step and Multi-agent Workflows
      </Link>{" "}
      for that pattern.
    </p>

    <h2 id="verification">After-the-fact verification</h2>
    <p>
      Once a conversation is sealed and registered, anyone with the{" "}
      <code>projectHash</code> can verify it independently of your
      application, your SDK, and your code. There are three layers and they
      are not interchangeable.
    </p>
    <ol>
      <li>
        <strong>Local integrity.</strong> <code>verifyProjectBundle(bundle)</code>{" "}
        recomputes hashes against the bundle's own contents. Useful inside your
        application before registration or when reprocessing exports.
      </li>
      <li>
        <strong>Per-turn public verification.</strong>{" "}
        <code>verify.nexart.io/c/{`{certificateHash}`}</code> resolves any
        individual turn CER that was attested via <code>/api/attest</code>.
      </li>
      <li>
        <strong>Per-conversation public verification.</strong>{" "}
        <code>verify.nexart.io/p/{`{projectHash}`}</code> resolves the registered
        bundle, validates each step CER, and confirms ordering. This is the
        artifact you give to auditors.
      </li>
    </ol>
    <p>
      See{" "}
      <Link to="/docs/verification-statuses-and-errors">
        Verification Statuses and Errors
      </Link>{" "}
      for the full catalogue of response shapes and what they mean.
    </p>

    <h2 id="redaction">Redaction before sealing</h2>
    <p>
      Some conversations contain content that should not be exposed to a public
      verifier: personally identifying information, customer secrets, internal
      system prompts. NexArt supports redaction, but only at well-defined
      points in the lifecycle.
    </p>

    <Alert className="my-4 border-destructive/40">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Important: redaction happens before sealing, not after</AlertTitle>
      <AlertDescription>
        Once <code>certifyDecision</code> returns, the bundle's{" "}
        <code>certificateHash</code> is fixed. Any subsequent edit to the CER
        payload, including removal of sensitive fields, changes the recomputed
        hash, and the registered bundle will no longer match. If you need a
        public-safe representation of an already-sealed CER, use{" "}
        <Link to="/docs/public-reseals-and-redacted-verification">
          redacted reseal
        </Link>{" "}
        on the node side; do not modify the original bundle client-side.
      </AlertDescription>
    </Alert>

    <p>The supported pattern is:</p>
    <ol>
      <li>Apply redaction to the prompt and response BEFORE calling <code>certifyDecision</code>.</li>
      <li>Let the SDK compute the <code>certificateHash</code> over the redacted payload.</li>
      <li>Attest the redacted CER on the node.</li>
      <li>Seal and register the bundle.</li>
    </ol>
    <p>
      If you must retain the unredacted content internally for your own
      operational use, store it separately from the certified payload and never
      mix the two streams. The CER is the source of truth for what was
      witnessed; your internal store is not certified.
    </p>

    <div className="not-prose my-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <p className="text-sm text-muted-foreground m-0">
        <strong className="text-foreground">Working with Python?</strong> See the{" "}
        <Link to="/docs/python-bridge" className="text-primary hover:underline">Python Bridge</Link>{" "}
        page for using NexArt from Python via the canonical JS SDK.
      </p>
    </div>

    <h2 id="related">Related</h2>
    <ul>
      <li><Link to="/docs/ai-execution">AI Execution CER</Link></li>
      <li><Link to="/docs/end-to-end-verification">End-to-End Verification Flow</Link></li>
      <li><Link to="/docs/project-bundle-registration">Project Bundle Registration</Link></li>
      <li><Link to="/docs/multi-step-and-multi-agent-workflows">Multi-step and Multi-agent Workflows</Link></li>
      <li><Link to="/docs/public-reseals-and-redacted-verification">Public Reseals and Redacted Verification</Link></li>
      <li><Link to="/docs/verification-statuses-and-errors">Verification Statuses and Errors</Link></li>
    </ul>
  </>
);

export default CertifyingLlmConversations;
