const DocsFooter = () => {
  return (
    <footer className="border-t border-border mt-16 py-6 px-6 lg:px-12">
      <div className="max-w-[681px] flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} NexArt</span>
        <a href="https://nexart.io" className="hover:text-foreground transition-colors">nexart.io</a>
        <a href="https://nexart.io/protocol" className="hover:text-foreground transition-colors">Protocol</a>
        <a href="https://verify.nexart.io" className="hover:text-foreground transition-colors">Verification Portal</a>
        <a href="https://docs.nexart.io" className="hover:text-foreground transition-colors">Documentation</a>
        <a href="/llms.txt" className="hover:text-foreground transition-colors">llms.txt</a>
        <a href="/llms-full.txt" className="hover:text-foreground transition-colors">llms-full.txt</a>
      </div>
    </footer>
  );
};

export default DocsFooter;
