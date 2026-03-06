import PageHeader from "@/components/docs/PageHeader";

const FAQ = () => (
  <>
    <PageHeader
      title="FAQ"
      summary="Frequently asked questions about NexArt."
    />

    <h2 id="what-is-nexart">What is NexArt?</h2>
    <p>NexArt is an AI execution attestation platform. It creates tamper-proof records of AI operations so you can prove what your AI did, when it did it, and that the record hasn't been modified.</p>

    <h2 id="store-data">Does NexArt store my prompts or outputs?</h2>
    <p>No. NexArt uses hash-only timestamping. Only SHA-256 hashes of your data are sent to the attestation node. Your raw prompts and outputs never leave your infrastructure.</p>

    <h2 id="models">Which AI models are supported?</h2>
    <p>NexArt is model-agnostic. It works with any AI model — OpenAI, Anthropic, Mistral, open-source models, or your own fine-tuned models. You specify the model identifier in the attestation call.</p>

    <h2 id="latency">How much latency does attestation add?</h2>
    <p>Attestation is asynchronous by default and adds near-zero latency to your AI calls. The SDK submits the hash bundle in the background. If you need synchronous confirmation, expect 50-100ms additional latency.</p>

    <h2 id="pricing">How is NexArt priced?</h2>
    <p>NexArt uses usage-based pricing. You pay per attestation. See the <a href="https://nexart.io/pricing" target="_blank" rel="noopener noreferrer">pricing page</a> for current rates. There's a free tier for development and testing.</p>

    <h2 id="compliance">Is NexArt suitable for compliance?</h2>
    <p>Yes. NexArt is designed for audit and compliance use cases. Verification reports can be exported as PDF or JSON. Retention policies support regulatory requirements up to indefinite storage.</p>

    <h2 id="self-hosted">Can I self-host NexArt?</h2>
    <p>Self-hosted attestation nodes are on the roadmap. Currently, NexArt operates managed nodes in multiple regions (US, EU, APAC).</p>

    <h2 id="sdk-languages">Which languages does the SDK support?</h2>
    <p>The primary SDK is for JavaScript/TypeScript (Node.js). Python and Go SDKs are planned. You can also use the REST API directly from any language.</p>
  </>
);

export default FAQ;
