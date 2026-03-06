import PageHeader from "@/components/docs/PageHeader";

const Retention = () => (
  <>
    <PageHeader
      title="Retention Policy"
      summary="Control how long CERs and receipts are stored."
    />
    <h2 id="overview">Overview</h2>
    <p>Retention policies define how long NexArt stores your attestation records. This helps you balance compliance requirements with storage costs.</p>

    <h2 id="options">Available Policies</h2>
    <ul>
      <li><strong>30 days</strong> — For development and testing</li>
      <li><strong>1 year</strong> — Standard retention</li>
      <li><strong>7 years</strong> — For regulated industries</li>
      <li><strong>Indefinite</strong> — Records are never automatically deleted</li>
    </ul>

    <h2 id="set">Setting a Policy</h2>
    <p>Go to Dashboard → Project Settings → Retention. Select your policy. It applies to all new CERs in that project. Existing CERs keep their original retention.</p>

    <h2 id="export">Before Expiry</h2>
    <p>NexArt sends a notification 30 days before records expire. You can export records before deletion using <a href="/docs/dashboard/audit-exports">Audit Exports</a>.</p>
  </>
);

export default Retention;
