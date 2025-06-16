
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import PeoplePage from "./components/PeoplePage";
import PersonDetailsPage from "./components/PersonDetailsPage";
import TeamsPage from "./components/TeamsPage";
import LicensesPage from "./components/LicensesPage";
import AssetsPage from "./components/AssetsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="person/:id" element={<PersonDetailsPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="licenses" element={<LicensesPage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="documents" element={<div className="p-8 text-center text-gray-500">Página de Documentos em desenvolvimento</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
