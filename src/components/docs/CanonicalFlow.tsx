/**
 * CanonicalFlow
 *
 * Single source of truth for the NexArt integration mental model.
 * Rendered identically across all key documentation pages so that
 * developers, AI agents, and crawlers extract a consistent pattern.
 *
 * Do NOT alter the canonical content. Page-specific context is passed
 * via the `context` prop and rendered as a single short line ABOVE
 * the snippet. The snippet body itself is invariant.
 */

interface CanonicalFlowProps {
  /** One short contextual line specific to the host page. */
  context: string;
}

export function CanonicalFlow({ context }: CanonicalFlowProps) {
  return (
    <section
      aria-labelledby="canonical-flow-heading"
      data-llm-block="nexart-canonical-flow"
      className="my-8 rounded-lg border border-border bg-muted/30 p-6"
    >
      <p className="mb-4 text-sm italic text-muted-foreground">{context}</p>

      <h2
        id="canonical-flow-heading"
        className="mb-4 font-serif text-xl font-semibold text-foreground"
      >
        NexArt Integration (Canonical Flow)
      </h2>

      <div className="space-y-4 text-sm leading-relaxed text-foreground">
        <div>
          <p className="mb-2 font-semibold">Flow:</p>
          <ol className="ml-5 list-decimal space-y-1 text-muted-foreground">
            <li>Capture execution input</li>
            <li>Seal locally (offline)</li>
            <li>Verify locally</li>
            <li>(Optional) Certify via node</li>
            <li>Verify again</li>
          </ol>
        </div>

        <div>
          <p className="mb-2 font-semibold">Verification outcomes:</p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>
              <strong className="text-foreground">Sealed</strong> &rarr; Integrity: PASS, Receipt: SKIPPED, Envelope: SKIPPED
            </li>
            <li>
              <strong className="text-foreground">Certified</strong> &rarr; Integrity: PASS, Receipt: PASS, Envelope: PASS
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-2 font-semibold">Rules:</p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>Sealing does NOT require a node</li>
            <li>Certification is OPTIONAL</li>
            <li>Verification does NOT require trust</li>
            <li>SKIPPED is expected for local artifacts and is NOT a failure</li>
          </ul>
        </div>

        <div>
          <p className="mb-2 font-semibold">Do NOT:</p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>call the node before sealing</li>
            <li>recompute hashes manually</li>
            <li>modify bundles after sealing</li>
            <li>treat SKIPPED as failure</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default CanonicalFlow;
