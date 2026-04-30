const modes = [
  {
    layer: "Layer 1 — Integrity",
    failure: "certificateHash mismatch",
    meaning: "The bundle was modified after sealing, or the wrong projection was hashed.",
    action:
      "Re-derive certificateHash with sealCer(...) over the strict whitelist. If it still differs, the stored bundle is no longer authentic.",
  },
  {
    layer: "Layer 2 — Signed Receipt",
    failure: "Receipt signature invalid",
    meaning:
      "The receipt was not produced by the published node key, or the receipt payload was modified.",
    action:
      "Refetch the node key set from /.well-known/nexart-node.json. If signature still fails, the receipt is not trustworthy.",
  },
  {
    layer: "Layer 3 — Verification Envelope",
    failure: "Envelope signature invalid or projection mismatch",
    meaning:
      "The envelope payload (5-field attestation projection) does not match what was signed, or the kid is wrong.",
    action:
      "Confirm the bundle includes meta.verificationEnvelope and meta.verificationEnvelopeSignature. Public/redacted payloads cannot satisfy Layer 3.",
  },
  {
    layer: "Node",
    failure: "EXECUTION_MUTATION_DETECTED (409)",
    meaning:
      "An execution_id already maps to a different certificateHash. The node rejects mutation by design.",
    action:
      "Do not re-submit modified bundles under the same execution_id. Create a new execution.",
  },
];

const FailureModes = () => (
  <div className="not-prose my-8 rounded-lg border border-border bg-card p-5">
    <div className="text-xs font-semibold uppercase tracking-wide text-foreground mb-1">
      What happens if verification fails
    </div>
    <div className="text-sm text-muted-foreground mb-4">
      Each verification layer fails for a different, specific reason. Isolating the failed layer
      tells you exactly what went wrong.
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-md">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="px-3 py-2 border-b border-border">Layer</th>
            <th className="px-3 py-2 border-b border-border">Failure</th>
            <th className="px-3 py-2 border-b border-border">Meaning</th>
            <th className="px-3 py-2 border-b border-border">Action</th>
          </tr>
        </thead>
        <tbody>
          {modes.map((m, i) => (
            <tr key={i} className="align-top">
              <td className="px-3 py-2 border-b border-border font-medium">{m.layer}</td>
              <td className="px-3 py-2 border-b border-border font-mono text-xs">{m.failure}</td>
              <td className="px-3 py-2 border-b border-border text-foreground/90">{m.meaning}</td>
              <td className="px-3 py-2 border-b border-border text-foreground/90">{m.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default FailureModes;
