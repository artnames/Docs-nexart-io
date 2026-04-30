const items = [
  {
    bad: 'Setting version: "1.0" on the bundle',
    good: 'Use version: "0.1" (matches cer.ai.execution.v1).',
    why: "An incorrect version changes the canonical projection and breaks certificateHash recomputation.",
  },
  {
    bad: "Hashing the full bundle (including meta.attestation, signature, receipt)",
    good:
      "Hash only the strict whitelist: bundleType, version, createdAt, snapshot, context, contextSummary (JCS).",
    why: "meta and attestation are added after sealing. Hashing them produces a different, non-verifiable hash.",
  },
  {
    bad: "Trying to verify the Verification Envelope from a publicly redacted record",
    good:
      "Layer 3 envelope verification requires the full attestation projection. Redacted public payloads support Layer 1 and Layer 2 only.",
    why: "Envelope signature covers a 5-field projection that may be removed by redaction.",
  },
  {
    bad: "Mutating the bundle after certification (re-ordering keys, adding fields, normalizing dates)",
    good: "Treat the certified bundle as immutable. Persist it byte-for-byte.",
    why: "Any mutation invalidates certificateHash and the receipt. The node enforces EXECUTION_MUTATION_DETECTED (409) on resubmit.",
  },
  {
    bad: "Looking up records by executionId",
    good: "Always look up by certificateHash. executionId is not a unique artifact identity.",
    why: "Two attempts of the same execution can share an executionId but produce different certificateHashes.",
  },
];

const CommonMistakes = () => (
  <div className="not-prose my-8 rounded-lg border border-destructive/30 bg-destructive/5 p-5">
    <div className="text-xs font-semibold uppercase tracking-wide text-destructive mb-1">
      Common Mistakes
    </div>
    <div className="text-sm text-muted-foreground mb-4">
      Verified failure patterns observed in real integrations. Avoid these to prevent verification errors.
    </div>
    <ul className="space-y-3">
      {items.map((m, i) => (
        <li key={i} className="rounded-md border border-border bg-card p-3">
          <div className="text-sm">
            <span className="text-destructive font-medium">Wrong:</span>{" "}
            <span className="text-foreground/90">{m.bad}</span>
          </div>
          <div className="text-sm mt-1">
            <span className="text-primary font-medium">Right:</span>{" "}
            <span className="text-foreground/90">{m.good}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Why: {m.why}</div>
        </li>
      ))}
    </ul>
  </div>
);

export default CommonMistakes;
