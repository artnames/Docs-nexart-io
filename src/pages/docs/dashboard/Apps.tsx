import PageHeader from "@/components/docs/PageHeader";

const llmBlock = `# NexArt Apps
Apps are child entities under projects, used for organizing and filtering CERs.

## Purpose
- Group CERs by application or service
- Filter records in the dashboard by app
- Provide organizational context in exports`;

const Apps = () => (
  <>
    <PageHeader
      title="Apps"
      summary="Organize CERs within a project by application or service."
      llmBlock={llmBlock}
    />
    <h2 id="overview">Overview</h2>
    <p>Apps are child entities under projects. They let you organize and filter CER records by the specific application or service that produced them.</p>

    <h2 id="why">Why Use Apps?</h2>
    <ul>
      <li><strong>Organization</strong> — Group CERs by application, service, or workflow</li>
      <li><strong>Filtering</strong> — View CERs for a specific app in the dashboard</li>
      <li><strong>Export context</strong> — App information is included in audit exports</li>
    </ul>

    <h2 id="create">Creating an App</h2>
    <ol>
      <li>Navigate to your project in the dashboard</li>
      <li>Go to the <strong>Apps</strong> tab</li>
      <li>Click <strong>Add App</strong></li>
      <li>Enter a name (e.g., "customer-chatbot", "doc-summarizer")</li>
    </ol>
  </>
);

export default Apps;
