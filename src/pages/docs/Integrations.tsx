import { Link } from "react-router-dom";
import PageHeader from "@/components/docs/PageHeader";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

const llmBlock = `# Integrations

NexArt integrates with several execution environments to generate Certified Execution Records.

Available integrations:
- Direct API (POST /v1/cer/ai/certify)
- CLI (nexart certify)
- n8n automation pipelines
- LangChain AI workflows`;

const integrations = [
  {
    title: "n8n",
    to: "/docs/integrations/n8n",
    desc: "Certify AI execution results inside n8n automation workflows.",
  },
  {
    title: "LangChain",
    to: "/docs/integrations/langchain",
    desc: "Generate CERs from LangChain AI workflows using the NexArt SDK.",
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
    bestFor: "Server-side certification",
    attestation: "Yes",
    user: "Backend developers",
  },
  {
    integration: "CLI",
    bestFor: "Local dev & offline verification",
    attestation: "Optional",
    user: "DevOps, CLI-first developers",
  },
  {
    integration: "n8n",
    bestFor: "Workflow automation",
    attestation: "Yes",
    user: "Automation engineers",
  },
  {
    integration: "LangChain",
    bestFor: "AI chains, agents, app logic",
    attestation: "Optional",
    user: "AI/ML engineers",
  },
];

const Integrations = () => (
  <>
    <PageHeader
      title="Integrations"
      summary="Connect NexArt to your execution environment."
      llmBlock={llmBlock}
    />

    <h2>Choose the Best Integration Path</h2>
    <ul>
      <li>Use the <strong>API</strong> if you want direct server-side certification</li>
      <li>Use the <strong>CLI</strong> if you want local development and offline verification</li>
      <li>Use <strong>n8n</strong> if you want workflow automation with minimal custom code</li>
      <li>Use <strong>LangChain</strong> if you are building AI chains, agents, or application logic in code</li>
    </ul>

    <div className="not-prose my-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Integration</TableHead>
            <TableHead>Best for</TableHead>
            <TableHead>Node attestation</TableHead>
            <TableHead>Typical user</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comparisonRows.map((row) => (
            <TableRow key={row.integration}>
              <TableCell className="font-medium">{row.integration}</TableCell>
              <TableCell>{row.bestFor}</TableCell>
              <TableCell>{row.attestation}</TableCell>
              <TableCell>{row.user}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <h2>Available Integrations</h2>
    <p>
      Developers can generate Certified Execution Records through direct API calls, CLI workflows,
      n8n automation pipelines, and LangChain AI workflows.
    </p>

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
  </>
);

export default Integrations;
