import PageHeader from "@/components/docs/PageHeader";

const llmBlock = `# NexArt Projects
Projects are the primary organizational container in the NexArt dashboard.

## Structure
Project
└ Apps
   └ CER records

A CER belongs to a specific app within a project, or remains unassigned.
Projects are for organization, filtering, and configuration — they do not affect the cryptographic structure of CERs.

## Project settings
- Auto-stamp: controls whether CERs are automatically stamped during ingestion
- Retention policy: defines how long CER records are retained (30 days, 90 days, 1 year, forever)

## Why use projects
- Separate environments (production, staging, testing)
- Organize multiple applications
- Manage retention policies per project
- Filter CER records in the dashboard`;

const Projects = () => (
  <>
    <PageHeader
      title="Projects"
      summary="The primary organizational container in the NexArt dashboard."
      llmBlock={llmBlock}
    />

    <h2 id="overview">Overview</h2>
    <p>Projects are the primary organizational container in the NexArt dashboard. A project groups applications, Certified Execution Records (CERs), and project-level configuration together. Projects make it possible to organize attestations by product, service, or environment.</p>

    <h2 id="structure">Project Structure</h2>
    <p>The relationship between projects, apps, and CERs:</p>
    <ul>
      <li><strong>Project</strong>
        <ul>
          <li><strong>Apps</strong> — Applications registered under the project
            <ul>
              <li><strong>CER records</strong> — Attestation records associated with each app</li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
    <p>A CER may belong to a specific app within a project, or remain unassigned. Projects are used for organization, filtering, and configuration — they do not affect the cryptographic structure of CERs.</p>

    <h2 id="create">Creating a Project</h2>
    <ol>
      <li>Open the NexArt Dashboard</li>
      <li>Navigate to <strong>Projects</strong></li>
      <li>Click <strong>New Project</strong></li>
      <li>Enter a project name</li>
      <li>Save the project</li>
    </ol>
    <p>You can optionally add a description. Additional configuration settings can be adjusted after creation.</p>

    <h2 id="contains">What a Project Contains</h2>
    <ul>
      <li><strong>Apps</strong> — Applications registered under the project. Apps help organize attestations by service or product component.</li>
      <li><strong>CER Records</strong> — All attestation records associated with the project's apps appear in the project view.</li>
      <li><strong>Project Configuration</strong> — Settings that affect how CERs are handled in the dashboard and ingestion pipeline.</li>
    </ul>

    <h2 id="settings">Project Settings</h2>
    <h3>Auto-stamp</h3>
    <p>Controls whether CERs created within the project are automatically stamped during ingestion.</p>
    <ul>
      <li><strong>Enabled</strong> — CERs are automatically submitted for attestation</li>
      <li><strong>Disabled</strong> — Records are created but require manual stamping</li>
    </ul>
    <p>See <a href="/docs/dashboard/auto-stamp">Auto-stamp</a> for details.</p>

    <h3>Retention Policy</h3>
    <p>Defines how long CER records are retained in the NexArt system. This setting controls storage lifecycle but does not affect the cryptographic validity of CERs.</p>
    <p>See <a href="/docs/dashboard/retention">Retention Policy</a> for available options.</p>

    <h2 id="why">Why Use Projects</h2>
    <p>Projects help teams:</p>
    <ul>
      <li>Separate environments (production, staging, testing)</li>
      <li>Organize multiple applications under a shared context</li>
      <li>Manage retention policies per project</li>
      <li>Filter CER records easily in the dashboard</li>
    </ul>
  </>
);

export default Projects;
