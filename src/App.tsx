import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DocsLayout from "./components/docs/DocsLayout";
import GettingStarted from "./pages/docs/GettingStarted";
import ProtocolOverview from "./pages/docs/ProtocolOverview";
import CER from "./pages/docs/concepts/CER";
import SignedReceipts from "./pages/docs/concepts/SignedReceipts";
import HashTimestamping from "./pages/docs/concepts/HashTimestamping";
import VerificationReports from "./pages/docs/concepts/VerificationReports";
import SDK from "./pages/docs/SDK";
import AttestationNode from "./pages/docs/AttestationNode";
import Verification from "./pages/docs/Verification";
import Projects from "./pages/docs/dashboard/Projects";
import Apps from "./pages/docs/dashboard/Apps";
import AutoStamp from "./pages/docs/dashboard/AutoStamp";
import Retention from "./pages/docs/dashboard/Retention";
import AuditExports from "./pages/docs/dashboard/AuditExports";
import Examples from "./pages/docs/Examples";
import FAQ from "./pages/docs/FAQ";

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
            <Route path="concepts/cer" element={<CER />} />
            <Route path="concepts/signed-receipts" element={<SignedReceipts />} />
            <Route path="concepts/hash-timestamping" element={<HashTimestamping />} />
            <Route path="concepts/verification-reports" element={<VerificationReports />} />
            <Route path="sdk" element={<SDK />} />
            <Route path="attestation-node" element={<AttestationNode />} />
            <Route path="verification" element={<Verification />} />
            <Route path="dashboard/projects" element={<Projects />} />
            <Route path="dashboard/apps" element={<Apps />} />
            <Route path="dashboard/auto-stamp" element={<AutoStamp />} />
            <Route path="dashboard/retention" element={<Retention />} />
            <Route path="dashboard/audit-exports" element={<AuditExports />} />
            <Route path="examples" element={<Examples />} />
            <Route path="faq" element={<FAQ />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
