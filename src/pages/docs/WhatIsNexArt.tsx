import PageHeader from "@/components/docs/PageHeader";
import { Link } from "react-router-dom";

const WhatIsNexArt = () => {
  return (
    <div className="space-y-10">
      <PageHeader
        title="What is NexArt"
        summary="NexArt turns AI and code executions into cryptographically verifiable evidence."
        breadcrumbs={[{ name: "Docs", path: "/docs" }, { name: "What is NexArt", path: "/docs/what-is-nexart" }]}
      />

      <section>
        <h2>The problem</h2>
        <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
          <li>Logs describe what happened but do not prove it.</li>
          <li>Logs can be altered, incomplete, or reconstructed after the fact.</li>
          <li>Audits rely on trusting systems, not verifying them.</li>
          <li>There is no standard way to prove that an AI or code execution produced a specific output from a specific input.</li>
        </ul>
      </section>

      <section>
        <h2>What NexArt does</h2>
        <p className="text-muted-foreground">
          Every execution becomes a <Link to="/docs/concepts/cer" className="text-primary hover:underline">Certified Execution Record (CER)</Link>. CERs capture:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
          <li>Inputs</li>
          <li>Outputs</li>
          <li>Parameters</li>
          <li>Context (signals)</li>
          <li>Metadata</li>
        </ul>
        <p className="text-muted-foreground mt-3">
          The record is hashed (SHA-256) to produce a <code>certificateHash</code>. Any change to the record breaks the hash.
        </p>
        <p className="text-muted-foreground mt-2">
          Single executions are identified by a <code>certificateHash</code>. Multi-step workflows are identified by a <code>projectHash</code>.
        </p>
        <p className="font-semibold mt-4">Logs describe events. CERs prove execution integrity.</p>
      </section>

      <section>
        <h2>Core components</h2>
        <div className="space-y-4">
          <div>
            <h3>SDK</h3>
            <p className="text-muted-foreground">Creates CERs and verifies them locally. See <Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link>.</p>
          </div>
          <div>
            <h3>CER (Certified Execution Record)</h3>
            <p className="text-muted-foreground">The atomic unit of proof. One execution, one sealed record. See <Link to="/docs/concepts/cer" className="text-primary hover:underline">CERs</Link>.</p>
          </div>
          <div>
            <h3>Project Bundles</h3>
            <p className="text-muted-foreground">Group multi-step workflows into a single verifiable structure with a <code>projectHash</code>. See <Link to="/docs/concepts/project-bundles" className="text-primary hover:underline">Project Bundles</Link>.</p>
          </div>
          <div>
            <h3>Node</h3>
            <p className="text-muted-foreground">Independent witness and public trust surface. Provides attestation and lookup. Verification always happens independently. No trust in NexArt is required to verify a record. See <Link to="/docs/attestation-node" className="text-primary hover:underline">Attestation Node</Link>.</p>
          </div>
          <div>
            <h3>verify.nexart.io</h3>
            <p className="text-muted-foreground">Public verification interface. Runs verification locally in the browser. See <Link to="/docs/verify-nexart" className="text-primary hover:underline">verify.nexart.io</Link>.</p>
          </div>
        </div>
      </section>

      <section>
        <h2>How it works</h2>
        <ol className="list-decimal pl-6 space-y-1.5 text-muted-foreground">
          <li><strong>Execute</strong>: AI or code runs via SDK</li>
          <li><strong>Record</strong>: CER is created</li>
          <li><strong>Seal</strong>: <code>certificateHash</code> is computed</li>
          <li><strong>Attest</strong> (optional): node issues attestation</li>
          <li><strong>Bundle</strong> (optional): Project Bundle created, <code>projectHash</code> derived</li>
          <li><strong>Verify</strong>: using SDK or <Link to="/docs/verify-nexart" className="text-primary hover:underline">verify.nexart.io</Link></li>
        </ol>
      </section>

      <section>
        <h2>What you can prove</h2>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>What ran</li>
          <li>With what inputs</li>
          <li>What it produced</li>
          <li>In what sequence (for workflows)</li>
          <li>That it has not been altered</li>
        </ul>
      </section>

      <section>
        <h2>Where NexArt fits</h2>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>AI agents</li>
          <li>Multi-step workflows</li>
          <li>Compliance and audit trails</li>
          <li>Decision traceability</li>
          <li>Evidence-backed automation</li>
        </ul>
      </section>

      <section>
        <h2>What NexArt is NOT</h2>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Not observability</li>
          <li>Not logging</li>
          <li>Not model evaluation</li>
          <li>Not correctness validation</li>
        </ul>
        <p className="font-semibold mt-4">NexArt does not tell you if something is correct. It proves what happened.</p>
      </section>

      <section>
        <h2>What NexArt guarantees</h2>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Integrity of what was recorded (tamper-evidence via hashing)</li>
          <li>Independent verification without trusting NexArt infrastructure</li>
          <li>Attestation as an optional layer (node receipt, not required for integrity)</li>
        </ul>
        <p className="text-muted-foreground mt-2">NexArt does NOT guarantee completeness. Recording every step is the developer's responsibility.</p>
      </section>

      <section>
        <h2>Next steps</h2>
        <ul className="space-y-2">
          <li><Link to="/docs/concepts/cer" className="text-primary hover:underline">Certified Execution Records</Link></li>
          <li><Link to="/docs/concepts/project-bundles" className="text-primary hover:underline">Project Bundles</Link></li>
          <li><Link to="/docs/verification" className="text-primary hover:underline">Verification</Link></li>
          <li><Link to="/docs/sdk" className="text-primary hover:underline">AI Execution SDK</Link></li>
          <li><Link to="/docs/agent-kit" className="text-primary hover:underline">Agent Kit</Link></li>
        </ul>
      </section>
    </div>
  );
};

export default WhatIsNexArt;
