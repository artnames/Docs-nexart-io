import CopyForLLM from "./CopyForLLM";

interface Props {
  title: string;
  summary: string;
  llmBlock?: string;
}

const PageHeader = ({ title, summary, llmBlock }: Props) => {
  return (
    <div className="mb-8">
      <h1>{title}</h1>
      <p className="text-base text-muted-foreground mt-1 mb-4">{summary}</p>
      {llmBlock && <CopyForLLM content={llmBlock} />}
    </div>
  );
};

export default PageHeader;
