import { defineMcp } from "@lovable.dev/mcp-js";
import listDocs from "./tools/list-docs";
import searchDocs from "./tools/search-docs";
import fetchDoc from "./tools/fetch-doc";

export default defineMcp({
  name: "nexart-docs-mcp",
  title: "NexArt Docs",
  version: "0.1.0",
  instructions:
    "Tools for exploring the NexArt documentation at docs.nexart.io. Use `search_docs` to find pages by keyword, `list_docs` to browse by section, and `fetch_doc` to read the full text of a specific page.",
  tools: [listDocs, searchDocs, fetchDoc],
});
