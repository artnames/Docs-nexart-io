import { Outlet } from "react-router-dom";
import DocsSidebar from "./DocsSidebar";
import DocsHeader from "./DocsHeader";

const DocsLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <DocsHeader />
      <div className="flex">
        <DocsSidebar />
        <main className="flex-1 min-w-0 px-6 py-8 lg:px-12 lg:py-10">
          <div className="docs-prose max-w-[681px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocsLayout;
