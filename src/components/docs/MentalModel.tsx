interface Props {
  /** Optional override; defaults to the canonical three lines. */
  lines?: string[];
}

const DEFAULT_LINES = [
  "Logs describe. CERs prove.",
  "Integrity ≠ Stamp ≠ Envelope.",
  "Verification does not require trust.",
];

const MentalModel = ({ lines = DEFAULT_LINES }: Props) => (
  <div className="not-prose my-6 rounded-lg border-l-2 border-primary bg-muted/30 px-4 py-3">
    <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
      Mental model
    </div>
    <ul className="text-sm text-foreground/90 space-y-1">
      {lines.map((l, i) => (
        <li key={i} className="font-medium">{l}</li>
      ))}
    </ul>
  </div>
);

export default MentalModel;
