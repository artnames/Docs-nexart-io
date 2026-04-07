import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface NavItem {
  title: string;
  path?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { title: "Getting Started", path: "/docs/getting-started" },
  { title: "Quickstart", path: "/docs/quickstart" },
  {
    title: "Core Concepts",
    children: [
      { title: "Certified Execution Records", path: "/docs/concepts/cer" },
      { title: "Project Bundles", path: "/docs/concepts/project-bundles" },
      { title: "Certificate Hash vs Project Hash", path: "/docs/concepts/hashes" },
      { title: "Signed Receipts", path: "/docs/concepts/signed-receipts" },
      { title: "Hash-Only Timestamping", path: "/docs/concepts/hash-timestamping" },
      { title: "Context Signals", path: "/docs/concepts/context-signals" },
      { title: "Verification Reports", path: "/docs/concepts/verification-reports" },
    ],
  },
  {
    title: "Verification",
    children: [
      { title: "How Verification Works", path: "/docs/verification" },
      { title: "verify.nexart.io", path: "/docs/verify-nexart" },
    ],
  },
  {
    title: "SDK",
    children: [
      { title: "AI Execution SDK", path: "/docs/sdk" },
      { title: "Browser Verification", path: "/docs/browser-verification" },
      { title: "CodeMode SDK", path: "/docs/codemode-sdk" },
      { title: "UI Renderer SDK", path: "/docs/ui-renderer-sdk" },
      { title: "Agent Kit", path: "/docs/agent-kit" },
      { title: "NexArt CLI", path: "/docs/cli" },
    ],
  },
  {
    title: "Node & Attestation",
    children: [
      { title: "Attestation Node", path: "/docs/attestation-node" },
      { title: "Trust Model", path: "/docs/trust-model" },
    ],
  },
  {
    title: "Protocol",
    children: [
      { title: "CER Protocol", path: "/docs/cer-protocol" },
      { title: "CER Record Management", path: "/docs/cer-record-management" },
      { title: "CER Audit Workflows", path: "/docs/cer-audit-workflows" },
      { title: "Protocol Overview", path: "/docs/protocol-overview" },
      { title: "AI CER Verification Layers", path: "/docs/ai-cer-verification-layers" },
      { title: "AI CER Package Format", path: "/docs/ai-cer-package-format" },
      { title: "Integration Surfaces", path: "/docs/integration-surfaces" },
    ],
  },
  {
    title: "Integrations",
    children: [
      { title: "Overview", path: "/docs/integrations" },
      { title: "n8n", path: "/docs/integrations/n8n" },
      { title: "LangChain", path: "/docs/integrations/langchain" },
    ],
  },
  {
    title: "Dashboard",
    children: [
      { title: "Projects", path: "/docs/dashboard/projects" },
      { title: "Apps", path: "/docs/dashboard/apps" },
      { title: "Auto-stamp", path: "/docs/dashboard/auto-stamp" },
      { title: "Retention Policy", path: "/docs/dashboard/retention" },
      { title: "Audit Exports", path: "/docs/dashboard/audit-exports" },
    ],
  },
  { title: "Guides", path: "/docs/guides" },
  { title: "Examples", path: "/docs/examples" },
  { title: "Privacy & Data Handling", path: "/docs/privacy" },
  { title: "FAQ", path: "/docs/faq" },
];

interface Props {
  onNavigate?: () => void;
}

const DocsSidebar = ({ onNavigate }: Props) => {
  return (
    <nav className="hidden lg:block w-[260px] shrink-0 border-r border-border sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 px-4"
      style={onNavigate ? { display: 'block', position: 'static', width: '100%', height: 'auto' } : {}}
    >
      <ul className="space-y-1">
        {navigation.map((item) => (
          <SidebarItem key={item.title} item={item} onNavigate={onNavigate} />
        ))}
      </ul>
    </nav>
  );
};

const SidebarItem = ({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) => {
  const [open, setOpen] = useState(true);

  if (item.children) {
    return (
      <li>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full px-3 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground rounded-md"
        >
          {item.title}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? '' : '-rotate-90'}`} />
        </button>
        {open && (
          <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-border pl-3">
            {item.children.map((child) => (
              <SidebarItem key={child.title} item={child} onNavigate={onNavigate} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={item.path!}
        onClick={onNavigate}
        className={({ isActive }) =>
          `block px-3 py-1.5 text-sm rounded-md transition-colors ${
            isActive
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`
        }
      >
        {item.title}
      </NavLink>
    </li>
  );
};

export default DocsSidebar;
