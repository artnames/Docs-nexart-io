// Single source of truth for version strings referenced in the docs.
// Mirrors docs/versions.json (docs-local, manually synchronized manifest).
// Update BOTH files together and record the authoritative source in versions.json.
// Do NOT introduce version values that are not present in the shared manifest.

import manifest from "../../docs/versions.json";

type Entry<T> = { value: T; source: string; verifiedAt: string; sync: string };

type Manifest = {
  manifestKind: string;
  isDynamicallyImported: boolean;
  syncInstructions: string;
  lastReviewed: string;
  protocol: {
    supportedProtocolVersions: Entry<string[]>;
    defaultProtocolVersion: Entry<string>;
  };
  canonicalizationProfiles: Record<string, Entry<string>>;
  cerSchemaVersion: Entry<string>;
  bundleTypeIdentifier: Entry<string>;
  deployedNodeVersion: Entry<string | null>;
  deployedVerifierVersion: Entry<string | null>;
  packages: Record<string, Entry<string>>;
};

const m = manifest as unknown as Manifest;

// Compatibility surface preserved from the previous flat manifest so existing
// call sites do not need to change.
export const VERSIONS = {
  lastVerified: m.lastReviewed,
  protocolVersions: m.protocol.supportedProtocolVersions.value,
  defaultProtocolVersion: m.protocol.defaultProtocolVersion.value,
  canonicalizationProfiles: Object.fromEntries(
    Object.entries(m.canonicalizationProfiles).map(([k, v]) => [k, v.value])
  ) as Record<string, string>,
  cerSchemaVersion: m.cerSchemaVersion.value,
  bundleTypeIdentifier: m.bundleTypeIdentifier.value,
  packages: Object.fromEntries(
    Object.entries(m.packages).map(([k, v]) => [k, v.value])
  ) as Record<string, string>,
};

export const VERSIONS_MANIFEST = m;

export const pkg = (name: string) => {
  const entry = m.packages[name];
  if (!entry) throw new Error(`Unknown package: ${name}`);
  return `${name}@${entry.value}`;
};
