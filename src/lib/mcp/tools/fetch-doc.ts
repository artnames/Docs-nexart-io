import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const DOCS_HOST = "docs.nexart.io";

function normalizeUrl(input: string): string {
  if (input.startsWith("http://") || input.startsWith("https://")) return input;
  if (input.startsWith("/")) return `https://${DOCS_HOST}${input}`;
  return `https://${DOCS_HOST}/${input.replace(/^\/+/, "")}`;
}

function stripHtml(html: string): string {
  // Extract <main> or <body>
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const scope = mainMatch ? mainMatch[1] : html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  return scope
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|section|article)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export default defineTool({
  name: "fetch_doc",
  title: "Fetch NexArt Doc Page",
  description:
    "Fetch the readable text of a NexArt documentation page. Accepts a full https://docs.nexart.io/... URL or a path like /docs/verification.",
  inputSchema: {
    url: z.string().min(1).describe("Doc page URL or path, e.g. '/docs/verification'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ url }) => {
    const target = normalizeUrl(url);
    if (!/^https:\/\/(www\.)?docs\.nexart\.io\//.test(target)) {
      return {
        content: [{ type: "text", text: `Refusing to fetch non-docs URL: ${target}` }],
        isError: true,
      };
    }
    const res = await fetch(target, { headers: { Accept: "text/html" } });
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `Failed to fetch ${target}: ${res.status}` }],
        isError: true,
      };
    }
    const html = await res.text();
    const text = stripHtml(html);
    const trimmed = text.length > 20000 ? text.slice(0, 20000) + "\n\n… [truncated]" : text;
    return {
      content: [{ type: "text", text: `# ${target}\n\n${trimmed}` }],
      structuredContent: { url: target, length: text.length, text: trimmed },
    };
  },
});
