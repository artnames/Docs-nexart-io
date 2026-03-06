import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  code: string;
  language?: string;
  title?: string;
}

const CodeBlock = ({ code, language = "json", title }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden mb-6 bg-card">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground">
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
      {!title && (
        <div className="flex justify-end px-3 py-1.5 border-b border-border bg-muted/50">
          <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground">
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="font-mono text-foreground/90">{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
