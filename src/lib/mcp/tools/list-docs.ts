import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const DOCS_BASE = "https://docs.nexart.io";

async function fetchIndex(): Promise<{ title: string; url: string; section: string }[]> {
  const res = await fetch(`${DOCS_BASE}/llms.txt`);
  if (!res.ok) throw new Error(`Failed to load docs index: ${res.status}`);
  const text = await res.text();
  const entries: { title: string; url: string; section: string }[] = [];
  let section = "General";
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith("## ")) {
      section = line.slice(3).trim();
      continue;
    }
    const m = line.match(/^-\s+\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
    if (m) entries.push({ title: m[1], url: m[2], section });
  }
  return entries;
}

export default defineTool({
  name: "list_docs",
  title: "List NexArt Docs",
  description:
    "List all pages of the NexArt documentation (docs.nexart.io) grouped by section. Use this to discover what topics exist before fetching a specific page.",
  inputSchema: {
    section: z
      .string()
      .optional()
      .describe("Optional case-insensitive section filter, e.g. 'Verification', 'Integrations'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ section }) => {
    const entries = await fetchIndex();
    const filtered = section
      ? entries.filter((e) => e.section.toLowerCase().includes(section.toLowerCase()))
      : entries;
    const bySection: Record<string, { title: string; url: string }[]> = {};
    for (const e of filtered) {
      (bySection[e.section] ||= []).push({ title: e.title, url: e.url });
    }
    return {
      content: [{ type: "text", text: JSON.stringify(bySection, null, 2) }],
      structuredContent: { count: filtered.length, sections: bySection },
    };
  },
});
