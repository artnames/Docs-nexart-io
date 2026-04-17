import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchEntry {
  title: string;
  path: string;
  keywords: string;
  section?: string;
}

const searchIndex: SearchEntry[] = [
  { title: "What is NexArt", path: "/docs/what-is-nexart", section: "Getting Started", keywords: "what is nexart introduction overview platform protocol cryptographic verification execution integrity" },
  { title: "Getting Started", path: "/docs/getting-started", section: "Getting Started", keywords: "getting started introduction overview install SDK CER certified execution record verify" },
  { title: "Quickstart", path: "/docs/quickstart", section: "Getting Started", keywords: "quickstart create verify first CER certificate hash API curl POST certify audit export evidence" },
  { title: "CER Anatomy", path: "/docs/concepts/cer", section: "Core Concepts", keywords: "CER anatomy structure bundle schema type namespace version metadata certificate hash execution" },
  { title: "Project Bundles", path: "/docs/concepts/project-bundles", section: "Core Concepts", keywords: "project bundles grouping CER projectHash multi-execution aggregate" },
  { title: "Certificate Hash vs Project Hash", path: "/docs/concepts/hashes", section: "Core Concepts", keywords: "certificate hash project hash comparison SHA-256 identifier difference" },
  { title: "Signed Receipts", path: "/docs/concepts/signed-receipts", section: "Core Concepts", keywords: "signed receipts attestation node signature Ed25519 receipt kid timestamp" },
  { title: "Hash-Only Timestamping", path: "/docs/concepts/hash-timestamping", section: "Core Concepts", keywords: "hash timestamping SHA-256 certificate hash privacy data handling zero knowledge" },
  { title: "Context Signals", path: "/docs/concepts/context-signals", section: "Core Concepts", keywords: "context signals metadata immutable certificateHash provenance evidence" },
  { title: "Verification Reports", path: "/docs/concepts/verification-reports", section: "Core Concepts", keywords: "verification reports bundle integrity node signature receipt consistency PASS FAIL SKIPPED VERIFIED FAILED" },
  { title: "Integrations", path: "/docs/integrations", section: "Integrations", keywords: "integrations overview API CLI n8n LangChain" },
  { title: "n8n Integration", path: "/docs/integrations/n8n", section: "Integrations", keywords: "n8n integration automation workflow community node certify verify" },
  { title: "LangChain Integration", path: "/docs/integrations/langchain", section: "Integrations", keywords: "langchain integration AI agent moderation pipeline workflow approval SDK certify verify CER" },
  { title: "CER Protocol", path: "/docs/cer-protocol", section: "Protocol", keywords: "CER protocol specification canonical hash computation verification semantics schema versioning AIEF conformance" },
  { title: "CER Record Management", path: "/docs/cer-record-management", section: "Protocol", keywords: "CER record management lifecycle active archived hidden deleted revoke export hide audit retention policy retention classes legal hold expiry governance operational sensitive actions governance controls trust posture evidence auditability guarantees immutability independent verification historical verifiability protocol stability scope of evidence roles permissions viewer operator auditor administrator permission matrix access control RBAC policy control layer visibility policies export policies action policies audit policies sensitive action policies policy scope policy categories policy expressions" },
  { title: "CER Audit Workflows", path: "/docs/cer-audit-workflows", section: "Protocol", keywords: "audit workflows evidence pack export manifest verification snapshot node metadata offline verification review compliance evidence packaging" },
  { title: "Protocol Overview", path: "/docs/protocol-overview", section: "Protocol", keywords: "protocol overview architecture flow execution attestation verification trust" },
  { title: "Trust Model", path: "/docs/trust-model", section: "Protocol", keywords: "trust model node attestation independent verification transparency public key" },
  { title: "Verification", path: "/docs/verification", section: "Protocol", keywords: "verification verify bundle integrity node signature receipt consistency VERIFIED FAILED NOT_FOUND PASS FAIL SKIPPED" },
  { title: "Attestation Node", path: "/docs/attestation-node", section: "Protocol", keywords: "attestation node nexart node signing Ed25519 receipt endpoint" },
  { title: "Integration Surfaces", path: "/docs/integration-surfaces", section: "Protocol", keywords: "integration surfaces API SDK CLI dashboard webhook" },
  { title: "AI Execution SDK", path: "/docs/sdk", section: "Developer Tools", keywords: "SDK ai-execution npm package certify verify typescript javascript API client" },
  { title: "NexArt CLI", path: "/docs/cli", section: "Developer Tools", keywords: "CLI command line nexart ai create certify verify json output terminal" },
  { title: "CodeMode SDK", path: "/docs/codemode-sdk", section: "Developer Tools", keywords: "codemode SDK render deterministic code execution" },
  { title: "UI Renderer SDK", path: "/docs/ui-renderer-sdk", section: "Developer Tools", keywords: "UI renderer SDK component display CER verification" },
  { title: "Projects", path: "/docs/dashboard/projects", section: "Dashboard", keywords: "dashboard projects manage create settings" },
  { title: "Apps", path: "/docs/dashboard/apps", section: "Dashboard", keywords: "dashboard apps API keys credentials" },
  { title: "Auto-stamp", path: "/docs/dashboard/auto-stamp", section: "Dashboard", keywords: "auto-stamp automatic attestation stamping" },
  { title: "Retention Policy", path: "/docs/dashboard/retention", section: "Dashboard", keywords: "retention policy data storage expiration" },
  { title: "Audit Exports", path: "/docs/dashboard/audit-exports", section: "Dashboard", keywords: "audit exports download evidence package zip" },
  { title: "Privacy & Data Handling", path: "/docs/privacy", section: "Reference", keywords: "privacy data handling hash-only zero knowledge GDPR" },
  { title: "Examples", path: "/docs/examples", section: "Reference", keywords: "examples use cases AI decision automation compliance audit" },
  { title: "FAQ", path: "/docs/faq", section: "Reference", keywords: "FAQ questions answers common" },
];

const DocsSearch = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (path: string) => {
      setOpen(false);
      navigate(path);
    },
    [navigate]
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 border border-border rounded-md hover:bg-muted hover:text-foreground transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search docs…</span>
        <span className="sm:hidden">Search…</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border rounded">
          ⌘K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search documentation…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Array.from(new Set(searchIndex.map((e) => e.section))).map(
            (section) => (
              <CommandGroup key={section} heading={section}>
                {searchIndex
                  .filter((e) => e.section === section)
                  .map((entry) => (
                    <CommandItem
                      key={entry.path}
                      value={`${entry.title} ${entry.keywords}`}
                      onSelect={() => handleSelect(entry.path)}
                    >
                      {entry.title}
                    </CommandItem>
                  ))}
              </CommandGroup>
            )
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default DocsSearch;
