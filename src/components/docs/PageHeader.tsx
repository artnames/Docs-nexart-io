import CopyForLLM from "./CopyForLLM";
import DocsMeta from "./DocsMeta";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface Props {
  title: string;
  summary: string;
  llmBlock?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const PageHeader = ({ title, summary, llmBlock, breadcrumbs }: Props) => {
  return (
    <div className="mb-8">
      <DocsMeta title={title} description={summary} breadcrumbs={breadcrumbs} />
      <h1>{title}</h1>
      <p className="text-base text-muted-foreground mt-1 mb-4">{summary}</p>
      {llmBlock && <CopyForLLM content={llmBlock} />}
    </div>
  );
};

export default PageHeader;
