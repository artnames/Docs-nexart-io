import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const DOCS_BASE = "https://docs.nexart.io";

export default defineTool({
  name: "search_docs",
  title: "Search NexArt Docs",
  description:
    "Keyword search across NexArt documentation page titles and URLs (docs.nexart.io). Returns the best matching pages. Use fetch_doc to read a specific page.",
  inputSchema: {
    query: z.string().min(1).describe("Keywords to search for, e.g. 'certificate hash verification'."),
    limit: z.number().int().min(1).max(25).default(10).describe("Maximum number of results."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, limit }) => {
    const res = await fetch(`${DOCS_BASE}/llms.txt`);
    if (!res.ok) throw new Error(`Failed to load docs index: ${res.status}`);
    const text = await res.text();
    const entries: { title: string; url: string; section: string; snippet: string }[] = [];
    let section = "General";
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("## ")) {
        section = line.slice(3).trim();
        continue;
      }
      const m = line.match(/^-\s+\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)(.*)$/);
      if (m) {
        // include following indented lines as snippet
        const snippetLines: string[] = [m[3].trim()];
        for (let j = i + 1; j < lines.length && (lines[j].startsWith("  ") || lines[j].trim() === ""); j++) {
          snippetLines.push(lines[j].trim());
        }
        entries.push({
          title: m[1],
          url: m[2],
          section,
          snippet: snippetLines.join(" ").trim(),
        });
      }
    }

    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = entries
      .map((e) => {
        const hay = `${e.title} ${e.url} ${e.section} ${e.snippet}`.toLowerCase();
        let score = 0;
        for (const t of terms) {
          if (e.title.toLowerCase().includes(t)) score += 5;
          if (hay.includes(t)) score += 1;
        }
        return { ...e, score };
      })
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score: _s, ...rest }) => rest);

    return {
      content: [
        {
          type: "text",
          text: scored.length
            ? JSON.stringify(scored, null, 2)
            : `No results for "${query}".`,
        },
      ],
      structuredContent: { count: scored.length, results: scored },
    };
  },
});
