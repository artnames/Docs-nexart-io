import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import SignedReceipts from "./pages/docs/concepts/SignedReceipts";
import HashTimestamping from "./pages/docs/concepts/HashTimestamping";
import VerificationReports from "./pages/docs/concepts/VerificationReports";
import SDK from "./pages/docs/SDK";
import NexArtCLI from "./pages/docs/NexArtCLI";
import CodeModeSDK from "./pages/docs/CodeModeSDK";
import UIRendererSDK from "./pages/docs/UIRendererSDK";
import AttestationNode from "./pages/docs/AttestationNode";
import Verification from "./pages/docs/Verification";
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
import AICERVerificationLayers from "./pages/docs/AICERVerificationLayers";
import AICERPackageFormat from "./pages/docs/AICERPackageFormat";

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
            <Route path="getting-started" element={<GettingStarted />} />
            <Route path="quickstart" element={<Quickstart />} />
            <Route path="cer-protocol" element={<CERProtocol />} />
            <Route path="cer-record-management" element={<CERRecordManagement />} />
            <Route path="protocol-overview" element={<ProtocolOverview />} />
            <Route path="concepts/cer" element={<CER />} />
            <Route path="concepts/signed-receipts" element={<SignedReceipts />} />
            <Route path="concepts/hash-timestamping" element={<HashTimestamping />} />
            <Route path="concepts/verification-reports" element={<VerificationReports />} />
            <Route path="concepts/context-signals" element={<ContextSignals />} />
            <Route path="sdk" element={<SDK />} />
            <Route path="cli" element={<NexArtCLI />} />
            <Route path="codemode-sdk" element={<CodeModeSDK />} />
            <Route path="ui-renderer-sdk" element={<UIRendererSDK />} />
            <Route path="attestation-node" element={<AttestationNode />} />
            <Route path="verification" element={<Verification />} />
            <Route path="ai-cer-verification-layers" element={<AICERVerificationLayers />} />
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
            <Route path="faq" element={<FAQ />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
