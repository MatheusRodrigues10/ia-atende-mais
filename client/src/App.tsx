import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginAdmin from "./pages/LoginAdmin";
import LoginUsuario from "./pages/LoginUsuario";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import PainelAdmin from "./pages/PainelAdmin";
import PainelUsuario from "./pages/PainelUsuario";
import RegisterUsuario from "./pages/RegisterUsuario";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginUsuario />} />
          <Route path="/register" element={<RegisterUsuario />} />
          <Route path="/login-admin" element={<LoginAdmin />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/painel-usuario" element={<PainelUsuario />} />
          <Route path="/painel-admin" element={<PainelAdmin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
