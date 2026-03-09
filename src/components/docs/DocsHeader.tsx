import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import DocsSidebar from "./DocsSidebar";
import DocsSearch from "./DocsSearch";

const DocsHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex h-14 items-center px-4 lg:px-8">
          <button
            className="mr-3 lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="flex items-center gap-1.5 text-foreground">
            <span className="font-mono text-sm font-medium tracking-tight">nexart.io</span>
            <span className="text-muted-foreground text-sm font-normal ml-2">docs</span>
          </Link>
          <div className="ml-auto">
            <DocsSearch />
          </div>
        </div>
      </header>
      {mobileOpen && (
        <div className="fixed inset-0 top-14 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setMobileOpen(false)} />
          <div className="relative w-[280px] h-full bg-background border-r border-border overflow-y-auto">
            <DocsSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default DocsHeader;
