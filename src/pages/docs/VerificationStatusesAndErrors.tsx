import PageHeader from "@/components/docs/PageHeader";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const llmBlock = `# Verification Statuses & Errors

Builder-facing reference. Maps every verification outcome and node error to
its likely cause and the next action.

## Outcomes
- VERIFIED                : All applicable checks PASS. No supplemental notes.
- VERIFIED (supplemental) : Core integrity PASS. Supplemental context (e.g.
                            unbound signals) is present but not covered by the
                            certificateHash. NOT a failure.
- FAILED                  : One or more applicable checks FAIL. Artifact MUST NOT
                            be treated as verified.
- NOT_FOUND               : Artifact has not been registered on the node.

## Common error codes
- CONTEXT_NOT_PROTECTED       : Submitted context.signals are not covered by the
                                certificateHash. Treat as supplemental, not failure.
- CERTIFICATE_HASH_MISMATCH   : Recomputed certificateHash does not match the
                                value in the bundle. Usually non-canonical JSON.
- PERSISTENCE_FAILED          : Node accepted the request but could not write to
                                its proof tables. Retry; operations are idempotent.
- AUTH_INVALID                : Missing or rejected API key.
- LOCAL_OK_PUBLIC_NOT_FOUND   : Local SDK verification passes but verify.nexart.io
                                returns NOT_FOUND. The artifact was not registered
                                on the node. This is the single most common
                                "why doesn't it work in public" cause.

## Identity
- certificateHash is the canonical identity. Always look up by certificateHash.
- executionId is NOT a unique identifier and MUST NOT be used for verification.`;

const Row = ({
  status,
  meaning,
  cause,
  next,
}: {
  status: string;
  meaning: string;
  cause: string;
  next: string;
}) => (
  <tr>
    <td><code>{status}</code></td>
    <td>{meaning}</td>
    <td>{cause}</td>
    <td>{next}</td>
  </tr>
);

const VerificationStatusesAndErrors = () => (
  <>
    <PageHeader
      title="Verification Statuses & Errors"
      summary="What every verification result and node error actually means, what most likely caused it, and what to do next. Use this when your integration is not behaving the way you expected."
      llmBlock={llmBlock}
    />

    <Alert className="mb-6">
      <Info className="h-4 w-4" />
      <AlertTitle>Read this with Verification Semantics</AlertTitle>
      <AlertDescription>
        This page is the operational counterpart to{" "}
        <Link to="/docs/verification-semantics">Verification Semantics</Link>.
        Semantics defines what results mean. This page maps them to causes and
        fixes.
      </AlertDescription>
    </Alert>

    <h2>Verification outcomes</h2>
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Outcome</th>
            <th>Meaning</th>
            <th>Likely cause</th>
            <th>What to do</th>
          </tr>
        </thead>
        <tbody>
          <Row
            status="VERIFIED"
            meaning="All applicable checks passed. Artifact integrity is confirmed."
            cause="Normal success path."
            next="Treat the artifact as verified. No action."
          />
          <Row
            status="VERIFIED (supplemental)"
            meaning="Core integrity passed. Supplemental context (e.g. signals outside hash scope) is present."
            cause="context.signals were transported alongside the bundle but are not bound by the certificateHash."
            next="Safe to treat as verified. If you require signals to be hash-bound, re-issue with signals inside the canonical bundle."
          />
          <Row
            status="FAILED"
            meaning="One or more checks failed. Do NOT treat as verified."
            cause="Bundle was modified, signature is invalid, or recomputed hash does not match."
            next="Re-fetch the original artifact. If the failure persists, the artifact has been tampered with or was never valid."
          />
          <Row
            status="NOT_FOUND"
            meaning="No record of this certificateHash or projectHash on the node."
            cause="Artifact was never registered, or you are looking it up by the wrong identifier."
            next="Confirm you are using certificateHash (not executionId). For Project Bundles, register via /v1/project-bundle/register."
          />
        </tbody>
      </table>
    </div>

    <h2>Error codes</h2>
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Meaning</th>
            <th>Likely cause</th>
            <th>What to do</th>
          </tr>
        </thead>
        <tbody>
          <Row
            status="CONTEXT_NOT_PROTECTED"
            meaning="Context signals were submitted but are not covered by the certificateHash."
            cause="Signals were transported as supplemental metadata, outside the canonical bundle."
            next="Treat as supplemental. Not a failure of core integrity. See Context Signals."
          />
          <Row
            status="CERTIFICATE_HASH_MISMATCH"
            meaning="Recomputed certificateHash does not match the value in the bundle."
            cause="Non-canonical JSON: undefined values, key reordering, extra whitespace, or wrong serializer."
            next="Re-serialize using the SDK's canonical encoder. Do not hand-build bundle JSON."
          />
          <Row
            status="HASH_MISMATCH"
            meaning="Same as above but for projectHash on Project Bundle registration."
            cause="Steps were modified after the bundle was sealed, or non-canonical JSON."
            next="Rebuild the bundle from the original step CERs and re-register."
          />
          <Row
            status="PERSISTENCE_FAILED"
            meaning="Node accepted the request but could not persist it."
            cause="Transient backend issue."
            next="Retry with backoff. Registration is idempotent on projectHash / certificateHash."
          />
          <Row
            status="AUTH_INVALID"
            meaning="API key missing, malformed, or rejected."
            cause="Wrong key, wrong environment, or revoked key."
            next="Confirm NEXART_API_KEY is set and matches the App in the dashboard."
          />
          <Row
            status="LOCAL_OK_PUBLIC_NOT_FOUND"
            meaning="verifyCer / verifyProjectBundle passes locally but verify.nexart.io returns NOT_FOUND."
            cause="The artifact was never registered on the node."
            next="For single CER: call /api/stamp. For Project Bundle: call /v1/project-bundle/register."
          />
        </tbody>
      </table>
    </div>

    <h2>Decision shortcut</h2>
    <ul>
      <li>
        <strong>Local verify passes, public verify says NOT_FOUND:</strong> you
        skipped the registration step. See{" "}
        <Link to="/docs/project-bundle-registration">Project Bundle Registration</Link>.
      </li>
      <li>
        <strong>Recomputed hash differs from bundled hash:</strong> you are
        building JSON outside the SDK. Re-serialize with the canonical encoder.
      </li>
      <li>
        <strong>Result is VERIFIED (supplemental):</strong> this is success.
        Signals are recorded but not hash-bound. See{" "}
        <Link to="/docs/concepts/context-signals">Context Signals</Link>.
      </li>
      <li>
        <strong>Public hash differs from the hash you originally produced:</strong>{" "}
        you are looking at a redacted reseal. See{" "}
        <Link to="/docs/public-reseals-and-redacted-verification">
          Public Reseals & Redacted Verification
        </Link>
        .
      </li>
    </ul>

    <h2>Related</h2>
    <ul>
      <li><Link to="/docs/verification-semantics">Verification Semantics</Link></li>
      <li><Link to="/docs/end-to-end-verification">End-to-End Verification Flow</Link></li>
      <li><Link to="/docs/project-bundle-registration">Project Bundle Registration</Link></li>
      <li><Link to="/docs/public-reseals-and-redacted-verification">Public Reseals & Redacted Verification</Link></li>
    </ul>
  </>
);

export default VerificationStatusesAndErrors;
