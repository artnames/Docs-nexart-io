/**
 * SealedVsCertified
 *
 * Canonical reference block: distinguishes a locally sealed CER from a
 * node-certified CER. Server-rendered. Used on CLI and Verification pages.
 *
 * Definitions are normative:
 *   Sealed    = integrity only (Layer 1 PASS, Layers 2 & 3 SKIPPED)
 *   Certified = integrity + node attestation + envelope (Layers 1, 2, 3 PASS)
 */
const SealedVsCertified = () => (
  <section
    aria-labelledby="sealed-vs-certified-heading"
    className="not-prose my-6 rounded-lg border border-border bg-muted/20 p-5"
  >
    <h3
      id="sealed-vs-certified-heading"
      className="text-xs font-semibold uppercase tracking-wide text-primary mb-3"
    >
      Sealed vs Certified
    </h3>

    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-2 font-medium border-b border-border">Property</th>
            <th className="text-left px-4 py-2 font-medium border-b border-border">Sealed (local)</th>
            <th className="text-left px-4 py-2 font-medium border-b border-border">Certified (node)</th>
          </tr>
        </thead>
        <tbody className="font-mono text-xs">
          <tr>
            <td className="px-4 py-2 border-b border-border font-sans">Origin</td>
            <td className="px-4 py-2 border-b border-border">SDK / CLI, fully offline</td>
            <td className="px-4 py-2 border-b border-border">Attestation node (POST /v1/cer/ai/certify)</td>
          </tr>
          <tr>
            <td className="px-4 py-2 border-b border-border font-sans">API key required</td>
            <td className="px-4 py-2 border-b border-border">no</td>
            <td className="px-4 py-2 border-b border-border">yes (NEXART_API_KEY)</td>
          </tr>
          <tr>
            <td className="px-4 py-2 border-b border-border font-sans">certificateHash</td>
            <td className="px-4 py-2 border-b border-border">present</td>
            <td className="px-4 py-2 border-b border-border">present (identical input → identical hash)</td>
          </tr>
          <tr>
            <td className="px-4 py-2 border-b border-border font-sans">meta.attestation (receipt)</td>
            <td className="px-4 py-2 border-b border-border">absent</td>
            <td className="px-4 py-2 border-b border-border">present, Ed25519-signed</td>
          </tr>
          <tr>
            <td className="px-4 py-2 border-b border-border font-sans">meta.verificationEnvelope</td>
            <td className="px-4 py-2 border-b border-border">absent</td>
            <td className="px-4 py-2 border-b border-border">present (v0.16.1)</td>
          </tr>
          <tr>
            <td className="px-4 py-2 border-b border-border font-sans">Layer 1 — Integrity</td>
            <td className="px-4 py-2 border-b border-border">PASS</td>
            <td className="px-4 py-2 border-b border-border">PASS</td>
          </tr>
          <tr>
            <td className="px-4 py-2 border-b border-border font-sans">Layer 2 — Receipt</td>
            <td className="px-4 py-2 border-b border-border">SKIPPED</td>
            <td className="px-4 py-2 border-b border-border">PASS</td>
          </tr>
          <tr>
            <td className="px-4 py-2 border-b border-border font-sans">Layer 3 — Envelope</td>
            <td className="px-4 py-2 border-b border-border">SKIPPED</td>
            <td className="px-4 py-2 border-b border-border">PASS</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-sans">Third-party verifiable</td>
            <td className="px-4 py-2">integrity only</td>
            <td className="px-4 py-2">yes (attested)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p className="text-xs text-muted-foreground mt-3">
      <strong>SKIPPED is not a failure.</strong> A sealed bundle is a valid CER; it simply has not
      been attested by a node. Certification adds Layers 2 and 3 without changing the
      <code className="bg-muted px-1 py-0.5 rounded font-mono ml-1">certificateHash</code>.
    </p>
  </section>
);

export default SealedVsCertified;
