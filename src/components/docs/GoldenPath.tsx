import { Link } from "react-router-dom";

const steps = [
  {
    n: 1,
    title: "Capture execution",
    what: "Record provider, model, prompt, input, parameters, and output. All six are required on CertifyDecisionParams.",
    why: "The certificateHash is computed from this data. Capture must happen before sealing.",
    fn: "@nexart/signals · createContext() (optional) → passed into certifyDecision(...)",
  },
  {
    n: 2,
    title: "Create CER",
    what: "Seal a CER bundle and compute certificateHash over the strict whitelist (JCS).",
    why: "The hash is the canonical identity of the record. It binds the bundle to its content.",
    fn: "certifyDecision(params) · or sealCer(snapshot) for the lower-level path",
  },
  {
    n: 3,
    title: "Certify via node",
    what: "Submit the bundle to the attestation node. Receive a signed receipt and verification envelope.",
    why: "The node provides an independent witness and a public verification surface.",
    fn: "certifyAndAttestDecision(params, options) · or attest(bundle, options) · POST /v1/cer/ai/certify",
  },
  {
    n: 4,
    title: "Verify independently",
    what: "Anyone can re-derive certificateHash, validate the receipt signature, and validate the envelope.",
    why: "Verification requires no trust in your infrastructure or the node beyond its published key.",
    fn: "verifyAiCerBundleDetailed(bundle) · or https://verify.nexart.io/c/{bundle.certificateHash}",
  },
];

const GoldenPath = () => (
  <div className="not-prose my-8 rounded-lg border border-primary/30 bg-primary/5 p-5">
    <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
      Quick Implementation Flow
    </div>
    <div className="text-sm text-muted-foreground mb-4">
      The four steps required to integrate NexArt correctly. Each step has a single responsibility.
    </div>
    <ol className="space-y-3">
      {steps.map((s) => (
        <li key={s.n} className="rounded-md border border-border bg-card p-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono text-primary">Step {s.n}</span>
            <span className="text-sm font-medium text-foreground">{s.title}</span>
          </div>
          <div className="mt-1.5 text-sm text-foreground/90">
            <span className="text-muted-foreground">What:</span> {s.what}
          </div>
          <div className="text-sm text-foreground/90">
            <span className="text-muted-foreground">Why:</span> {s.why}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">{s.fn}</div>
        </li>
      ))}
    </ol>
    <div className="mt-3 text-xs text-muted-foreground">
      Deeper reference:{" "}
      <Link to="/docs/verification" className="text-primary hover:underline">Verification</Link>{" "}
      ·{" "}
      <Link to="/docs/ai-cer-verification-layers" className="text-primary hover:underline">
        Verification Layers
      </Link>{" "}
      ·{" "}
      <Link to="/docs/concepts/hashes" className="text-primary hover:underline">Hashes</Link>
    </div>
  </div>
);

export default GoldenPath;
