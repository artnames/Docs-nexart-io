import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DocsLayout from "./components/docs/DocsLayout";
import GettingStarted from "./pages/docs/GettingStarted";
import Quickstart from "./pages/docs/Quickstart";
import Integrations from "./pages/docs/Integrations";
import ProtocolOverview from "./pages/docs/ProtocolOverview";
import CERProtocol from "./pages/docs/CERProtocol";
import CERRecordManagement from "./pages/docs/CERRecordManagement";
import CER from "./pages/docs/concepts/CER";
import ProjectBundles from "./pages/docs/concepts/ProjectBundles";
import Hashes from "./pages/docs/concepts/Hashes";
import SignedReceipts from "./pages/docs/concepts/SignedReceipts";
import HashTimestamping from "./pages/docs/concepts/HashTimestamping";
import VerificationReports from "./pages/docs/concepts/VerificationReports";
import SDK from "./pages/docs/SDK";
import NexArtCLI from "./pages/docs/NexArtCLI";
import CodeModeSDK from "./pages/docs/CodeModeSDK";
import UIRendererSDK from "./pages/docs/UIRendererSDK";
import AttestationNode from "./pages/docs/AttestationNode";
import Verification from "./pages/docs/Verification";
import VerifyNexart from "./pages/docs/VerifyNexart";
import BrowserVerification from "./pages/docs/BrowserVerification";
import TrustModel from "./pages/docs/TrustModel";
import Projects from "./pages/docs/dashboard/Projects";
import Apps from "./pages/docs/dashboard/Apps";
import AutoStamp from "./pages/docs/dashboard/AutoStamp";
import Retention from "./pages/docs/dashboard/Retention";
import AuditExports from "./pages/docs/dashboard/AuditExports";
import Examples from "./pages/docs/Examples";
import FAQ from "./pages/docs/FAQ";
import N8n from "./pages/docs/integrations/N8n";
import LangChain from "./pages/docs/integrations/LangChain";
import IntegrationSurfaces from "./pages/docs/IntegrationSurfaces";
import PrivacyDataHandling from "./pages/docs/PrivacyDataHandling";
import CERAuditWorkflows from "./pages/docs/CERAuditWorkflows";
import ContextSignals from "./pages/docs/concepts/ContextSignals";
import ExecutionContext from "./pages/docs/concepts/ExecutionContext";
import AICERVerificationLayers from "./pages/docs/AICERVerificationLayers";
import AICERPackageFormat from "./pages/docs/AICERPackageFormat";
import AgentKit from "./pages/docs/AgentKit";
import Guides from "./pages/docs/Guides";
import WhatIsNexArt from "./pages/docs/WhatIsNexArt";
import EndToEndVerification from "./pages/docs/EndToEndVerification";
import AIExecution from "./pages/docs/AIExecution";
import VerificationSemantics from "./pages/docs/VerificationSemantics";
import ProjectBundleRegistration from "./pages/docs/ProjectBundleRegistration";
import VerificationStatusesAndErrors from "./pages/docs/VerificationStatusesAndErrors";
import MultiStepAndMultiAgentWorkflows from "./pages/docs/MultiStepAndMultiAgentWorkflows";
import PublicResealsAndRedactedVerification from "./pages/docs/PublicResealsAndRedactedVerification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/docs" element={<DocsLayout />}>
            <Route index element={<Navigate to="/docs/getting-started" replace />} />
            <Route path="what-is-nexart" element={<WhatIsNexArt />} />
            <Route path="getting-started" element={<GettingStarted />} />
            <Route path="quickstart" element={<Quickstart />} />
            <Route path="cer-protocol" element={<CERProtocol />} />
            <Route path="cer-record-management" element={<CERRecordManagement />} />
            <Route path="protocol-overview" element={<ProtocolOverview />} />
            <Route path="concepts/cer" element={<CER />} />
            <Route path="concepts/project-bundles" element={<ProjectBundles />} />
            <Route path="concepts/hashes" element={<Hashes />} />
            <Route path="concepts/signed-receipts" element={<SignedReceipts />} />
            <Route path="concepts/hash-timestamping" element={<HashTimestamping />} />
            <Route path="concepts/verification-reports" element={<VerificationReports />} />
            <Route path="concepts/context-signals" element={<ContextSignals />} />
            <Route path="concepts/execution-context" element={<ExecutionContext />} />
            <Route path="sdk" element={<SDK />} />
            <Route path="cli" element={<NexArtCLI />} />
            <Route path="codemode-sdk" element={<CodeModeSDK />} />
            <Route path="ui-renderer-sdk" element={<UIRendererSDK />} />
            <Route path="attestation-node" element={<AttestationNode />} />
            <Route path="end-to-end-verification" element={<EndToEndVerification />} />
            <Route path="ai-execution" element={<AIExecution />} />
            <Route path="verification-semantics" element={<VerificationSemantics />} />
            <Route path="project-bundle-registration" element={<ProjectBundleRegistration />} />
            <Route path="verification-statuses-and-errors" element={<VerificationStatusesAndErrors />} />
            <Route path="multi-step-and-multi-agent-workflows" element={<MultiStepAndMultiAgentWorkflows />} />
            <Route path="public-reseals-and-redacted-verification" element={<PublicResealsAndRedactedVerification />} />
            <Route path="verification" element={<Verification />} />
            <Route path="verify-nexart" element={<VerifyNexart />} />
            <Route path="browser-verification" element={<BrowserVerification />} />
            <Route path="ai-cer-verification-layers" element={<AICERVerificationLayers />} />
            <Route path="ai-cer-package-format" element={<AICERPackageFormat />} />
            <Route path="trust-model" element={<TrustModel />} />
            <Route path="integration-surfaces" element={<IntegrationSurfaces />} />
            <Route path="cer-audit-workflows" element={<CERAuditWorkflows />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="dashboard/projects" element={<Projects />} />
            <Route path="dashboard/apps" element={<Apps />} />
            <Route path="dashboard/auto-stamp" element={<AutoStamp />} />
            <Route path="dashboard/retention" element={<Retention />} />
            <Route path="dashboard/audit-exports" element={<AuditExports />} />
            <Route path="privacy" element={<PrivacyDataHandling />} />
            <Route path="examples" element={<Examples />} />
            <Route path="integrations/n8n" element={<N8n />} />
            <Route path="integrations/langchain" element={<LangChain />} />
            <Route path="agent-kit" element={<AgentKit />} />
            <Route path="guides" element={<Guides />} />
            <Route path="faq" element={<FAQ />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
