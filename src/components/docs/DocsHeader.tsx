import { Link } from "react-router-dom";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import DocsSidebar from "./DocsSidebar";

const DocsHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center px-4 lg:px-8">
          <button
            className="mr-3 lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>NexArt</span>
            <span className="text-muted-foreground font-normal text-sm ml-1">docs</span>
          </Link>
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
