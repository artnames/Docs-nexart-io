import { Link } from "react-router-dom";
import PageHeader from "@/components/docs/PageHeader";

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

const Integrations = () => (
  <>
    <PageHeader
      title="Integrations"
      summary="Connect NexArt to your execution environment."
      llmBlock={llmBlock}
    />

    <p>
      NexArt can integrate with several execution environments. Developers can generate Certified
      Execution Records through direct API calls, CLI workflows, n8n automation pipelines, and
      LangChain AI workflows.
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
