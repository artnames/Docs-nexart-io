import PageHeader from "@/components/docs/PageHeader";

const llmBlock = `# NexArt Projects
Projects are the top-level organizational unit in the NexArt dashboard.

## What projects contain
- Apps (child entities for grouping CERs)
- CER records
- Project-level settings: auto-stamp toggle, retention policy

## Current settings
- Auto-stamp: enable/disable at project level
- Retention policy: 30 days, 90 days, 1 year, or forever`;

const Projects = () => (
  <>
    <PageHeader
      title="Projects"
      summary="The top-level organizational unit for attestations."
      llmBlock={llmBlock}
    />
    <h2 id="overview">Overview</h2>
    <p>Projects are the top-level organizational unit in the NexArt dashboard. Each project groups related apps, CER records, and settings together.</p>

    <h2 id="create">Creating a Project</h2>
    <ol>
      <li>Go to the Dashboard → Projects</li>
      <li>Click <strong>New Project</strong></li>
      <li>Enter a name and optional description</li>
    </ol>

    <h2 id="contains">What a Project Contains</h2>
    <ul>
      <li><strong>Apps</strong> — Child entities used to organize and filter CERs within the project</li>
      <li><strong>CER records</strong> — All attestation records associated with the project's apps</li>
    </ul>

    <h2 id="settings">Project Settings</h2>
    <ul>
      <li><strong>Auto-stamp</strong> — Enable or disable automatic stamping during CER ingestion. See <a href="/docs/dashboard/auto-stamp">Auto-stamp</a>.</li>
      <li><strong>Retention policy</strong> — Configure how long records are retained. See <a href="/docs/dashboard/retention">Retention Policy</a>.</li>
    </ul>
  </>
);

export default Projects;
