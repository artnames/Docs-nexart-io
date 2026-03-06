import PageHeader from "@/components/docs/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

const llmBlock = `# NexArt Integration Examples

## Basic attestation (Node.js)
import { NexArt, hashContent } from "@nexart/sdk";
const nexart = new NexArt({ apiKey: process.env.NEXART_API_KEY });

const prompt = "Summarize this document";
const output = await callOpenAI(prompt);

const receipt = await nexart.attest({
  model: "gpt-4",
  prompt_hash: hashContent(prompt),
  output_hash: hashContent(output),
  metadata: { app_id: "doc-summarizer" }
});

## Verify
const check = await nexart.verify(receipt.receipt_id);
// check.valid === true`;

const Examples = () => (
  <>
    <PageHeader
      title="Examples"
      summary="Practical integration examples for common use cases."
      llmBlock={llmBlock}
    />

    <h2 id="basic">Basic Attestation</h2>
    <p>The simplest integration: attest a single AI call.</p>
    <CodeBlock
      code={`import { NexArt, hashContent } from "@nexart/sdk";

const nexart = new NexArt({ apiKey: process.env.NEXART_API_KEY });

async function summarize(document: string) {
  const prompt = \`Summarize: \${document}\`;
  const output = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
  });

  const response = output.choices[0].message.content;

  // Attest the execution
  const receipt = await nexart.attest({
    model: "gpt-4",
    prompt_hash: hashContent(prompt),
    output_hash: hashContent(response),
    metadata: { app_id: "doc-summarizer" }
  });

  return { summary: response, receipt_id: receipt.receipt_id };
}`}
      title="basic-attest.ts"
    />

    <h2 id="batch">Batch Attestation</h2>
    <p>Attest multiple executions efficiently.</p>
    <CodeBlock
      code={`const results = await Promise.all(
  executions.map(exec =>
    nexart.attest({
      model: exec.model,
      prompt_hash: hashContent(exec.prompt),
      output_hash: hashContent(exec.output),
      metadata: { batch_id: "batch_001" }
    })
  )
);

console.log(\`Attested \${results.length} executions\`);`}
      title="batch-attest.ts"
    />

    <h2 id="webhook">Webhook Integration</h2>
    <p>Receive notifications when attestations are confirmed.</p>
    <CodeBlock
      code={`// Express webhook handler
app.post("/webhook/nexart", (req, res) => {
  const event = req.body;

  if (event.type === "attestation.confirmed") {
    console.log("CER confirmed:", event.cer_id);
    console.log("Receipt:", event.receipt_id);
    // Store receipt reference in your database
  }

  res.status(200).send("ok");
});`}
      title="webhook.ts"
    />

    <h2 id="verify-example">Verification Page</h2>
    <p>Build a verification page where users can check a receipt.</p>
    <CodeBlock
      code={`// React component
function VerifyPage() {
  const [receiptId, setReceiptId] = useState("");
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    const res = await fetch(
      \`/api/v1/verify/\${receiptId}\`
    );
    setResult(await res.json());
  };

  return (
    <div>
      <input
        value={receiptId}
        onChange={e => setReceiptId(e.target.value)}
        placeholder="Enter receipt ID"
      />
      <button onClick={handleVerify}>Verify</button>
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}`}
      title="VerifyPage.tsx"
    />
  </>
);

export default Examples;
