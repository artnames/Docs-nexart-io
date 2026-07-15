// Single source of truth for version strings referenced in the docs.
// Mirrors docs/versions.json. Update both files together.
// Do NOT introduce version values that are not present in the shared manifest.

import manifest from "../../docs/versions.json";

export const VERSIONS = manifest as {
  sourceUrl: string;
  lastVerified: string;
  protocolVersions: string[];
  defaultProtocolVersion: string;
  canonicalizationProfiles: Record<string, string>;
  cerSchemaVersion: string;
  packages: Record<string, string>;
};

export const pkg = (name: keyof typeof manifest.packages) =>
  `${name}@${manifest.packages[name]}`;
