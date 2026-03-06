import PageHeader from "@/components/docs/PageHeader";

const llmBlock = `# UI Renderer SDK

The UI Renderer SDK produces deterministic user interface outputs that can be tied to verifiable execution records.

## Purpose
- Render UI components in a controlled, deterministic environment
- Link rendered artifacts to Certified Execution Records (CERs)

## Inputs
- Component structure
- Data
- Parameters
- Seed

## Output Artifacts
- HTML snapshots
- Rendered images
- Structured artifacts

## Verification
Because rendering is deterministic, a verifier can re-render the same component and confirm the output hash matches.`;

const UIRendererSDK = () => (
  <>
    <PageHeader
      title="UI Renderer SDK"
      summary="Deterministic UI rendering for verifiable interface artifacts."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>The UI Renderer SDK is used to produce deterministic user interface outputs.</p>
    <p>It allows UI components to render in a controlled environment so the resulting artifact can be reproduced and verified.</p>
    <p>This is useful for:</p>
    <ul>
      <li>AI-generated interfaces</li>
      <li>Automated report generation</li>
      <li>Visual artifacts produced by agents</li>
    </ul>

    <h2 id="deterministic-rendering">Deterministic Rendering</h2>
    <p>The renderer ensures that identical inputs produce identical UI output. Inputs may include:</p>
    <ul>
      <li>Component structure</li>
      <li>Data</li>
      <li>Parameters</li>
      <li>Seed</li>
    </ul>

    <h2 id="output-artifacts">Output Artifacts</h2>
    <p>Outputs can include:</p>
    <ul>
      <li>HTML snapshots</li>
      <li>Rendered images</li>
      <li>Structured artifacts</li>
    </ul>
    <p>These outputs can be linked to Certified Execution Records for attestation and verification.</p>

    <h2 id="verification">Verification</h2>
    <p>Because rendering is deterministic, a verifier can re-render the same component and confirm the output hash matches. This enables independent verification of UI artifacts without trusting the original rendering system.</p>
  </>
);

export default UIRendererSDK;
