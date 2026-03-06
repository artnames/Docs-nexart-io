import PageHeader from "@/components/docs/PageHeader";

const Projects = () => (
  <>
    <PageHeader
      title="Projects"
      summary="Organize your attestations into logical groups."
    />
    <h2 id="overview">Overview</h2>
    <p>Projects are the top-level organizational unit in the NexArt dashboard. Each project groups related apps, CERs, and settings together.</p>

    <h2 id="create">Creating a Project</h2>
    <ol>
      <li>Go to the Dashboard → Projects</li>
      <li>Click <strong>New Project</strong></li>
      <li>Enter a name and optional description</li>
      <li>Your project gets a unique <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">project_id</code></li>
    </ol>

    <h2 id="settings">Project Settings</h2>
    <ul>
      <li><strong>API Keys</strong> — Generate and manage keys per project</li>
      <li><strong>Team Members</strong> — Invite collaborators with role-based access</li>
      <li><strong>Retention</strong> — Set how long CERs are stored</li>
      <li><strong>Webhooks</strong> — Get notified on attestation events</li>
    </ul>
  </>
);

export default Projects;
