import { Link } from "react-router-dom";
import PageHeader from "@/components/docs/PageHeader";
import DocsMeta from "@/components/docs/DocsMeta";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

const llmBlock = `# Integrations

NexArt integrates with several execution environments. Both single-CER and Project Bundle workflows are supported.

Available integrations:
- Direct API (POST /v1/cer/ai/certify) - single CER
- CLI (nexart certify, nexart project-bundle) - single CER and Project Bundle
- n8n - single CER per workflow step or per workflow outcome
- LangChain - single CER per chain/tool, or Project Bundle for multi-step
- @nexart/agent-kit - convenience layer for both wrapped tool CERs and linear workflow Project Bundles

For Project Bundle workflows, the bundle must be registered on the node for public verification.`;

const integrations = [
  {
    title: "n8n",
    to: "/docs/integrations/n8n",
    desc: "Certify AI execution results inside n8n automation workflows.",
  },
  {
    title: "LangChain",
    to: "/docs/integrations/langchain",
    desc: "Generate CERs from LangChain chains, tools, and agent workflows.",
  },
  {
    title: "Agent Kit",
    to: "/docs/agent-kit",
    desc: "Wrap tools as CERs, or build linear workflows that emit Project Bundles.",
  },
  {
    title: "Direct API",
    to: "/docs/sdk",
    desc: "Call POST /v1/cer/ai/certify directly from any environment.",
  },
  {
    title: "CLI",
    to: "/docs/cli",
    desc: "Create and verify CERs from the command line.",
  },
];

const comparisonRows = [
  {
    integration: "API",
    bestFor: "Server-side single-CER certification",
    bundles: "Single CER",
    user: "Backend developers",
  },
  {
    integration: "CLI",
    bestFor: "Local dev, CI, offline verification",
    bundles: "Single CER",
    user: "DevOps, CLI-first developers",
  },
  {
    integration: "n8n",
    bestFor: "Workflow automation",
    bundles: "Single CER per step",
    user: "Automation engineers",
  },
  {
    integration: "LangChain",
    bestFor: "AI chains, tools, agents",
    bundles: "Single CER or Project Bundle",
    user: "AI/ML engineers",
  },
  {
    integration: "Agent Kit",
    bestFor: "Agent tools and linear workflows",
    bundles: "Single CER or Project Bundle",
    user: "Agent builders",
  },
];

const Integrations = () => (
  <>
    <DocsMeta
      title="Integrations"
      description="Connect NexArt to your stack: n8n workflows, LangChain agents, custom Node services, and CLI pipelines."
    />
    <PageHeader
      title="Integrations"
      summary="Connect NexArt to your execution environment. Single-CER and Project Bundle paths are both supported."
      llmBlock={llmBlock}
    />

    <h2>Two Integration Models</h2>
    <ul>
      <li><strong>Single CER</strong>: certify one execution at a time. Works with every integration below. The most common starting point.</li>
      <li><strong>Project Bundle</strong>: group multiple step CERs into one verifiable unit for multi-step or multi-agent workflows. Best paired with <Link to="/docs/agent-kit" className="text-primary hover:underline">Agent Kit</Link> or the SDK <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">createProjectBundle</code> helper.</li>
    </ul>
    <p>Project Bundles are not required. Single-CER integrations are first-class.</p>

    <h2>Choose the Best Integration Path</h2>
    <ul>
      <li>Use the <strong>API</strong> for direct server-side certification of one execution at a time</li>
      <li>Use the <strong>CLI</strong> for local development, CI pipelines, and offline verification</li>
      <li>Use <strong>n8n</strong> for workflow automation with minimal custom code</li>
      <li>Use <strong>LangChain</strong> when building AI chains, tools, or agents in code</li>
      <li>Use <strong>Agent Kit</strong> to wrap tools as CERs or to assemble linear workflows into Project Bundles</li>
    </ul>

    <div className="not-prose my-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Integration</TableHead>
            <TableHead>Best for</TableHead>
            <TableHead>Bundle support</TableHead>
            <TableHead>Typical user</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comparisonRows.map((row) => (
            <TableRow key={row.integration}>
              <TableCell className="font-medium">{row.integration}</TableCell>
              <TableCell>{row.bestFor}</TableCell>
              <TableCell>{row.bundles}</TableCell>
              <TableCell>{row.user}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <h2>Available Integrations</h2>

    <div className="not-prose my-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {integrations.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="block rounded-lg border border-border bg-card p-4 hover:border-primary/40 hover:bg-accent/30 transition-colors no-underline"
        >
          <div className="font-medium text-foreground text-sm">{item.title}</div>
          <div className="text-muted-foreground text-xs mt-1">{item.desc}</div>
        </Link>
      ))}
    </div>

    <div className="not-prose my-6 rounded-lg border border-border bg-muted/30 p-4">
      <div className="text-sm font-medium text-foreground mb-1">Public verification</div>
      <div className="text-sm text-muted-foreground">
        Single CERs verify publicly once attested by the node. Project Bundles verify publicly only after they are <strong>registered</strong> on the node. See{" "}
        <Link to="/docs/end-to-end-verification" className="text-primary hover:underline">End-to-End Verification</Link>.
      </div>
    </div>
  </>
);

export default Integrations;
