import PageHeader from "@/components/docs/PageHeader";

const Apps = () => (
  <>
    <PageHeader
      title="Apps"
      summary="Register individual applications within a project."
    />
    <h2 id="overview">Overview</h2>
    <p>Apps represent individual applications or services within a project. Each app gets its own <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">app_id</code> that you include in attestation calls.</p>

    <h2 id="why">Why Use Apps?</h2>
    <ul>
      <li><strong>Filtering</strong> — View CERs for a specific app</li>
      <li><strong>Metrics</strong> — Track attestation volume per app</li>
      <li><strong>Access Control</strong> — Scope API keys to specific apps</li>
    </ul>

    <h2 id="create">Creating an App</h2>
    <ol>
      <li>Navigate to your project in the dashboard</li>
      <li>Go to the <strong>Apps</strong> tab</li>
      <li>Click <strong>Add App</strong></li>
      <li>Enter a name (e.g., "customer-chatbot")</li>
    </ol>
  </>
);

export default Apps;
