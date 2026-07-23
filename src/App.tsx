import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieBanner from "@/components/CookieBanner";
import Index from "./pages/Index.tsx";
import GarageDetail from "./pages/GarageDetail.tsx";
import Auth from "./pages/Auth.tsx";
import Favorites from "./pages/Favorites.tsx";
import Profile from "./pages/Profile.tsx";
import Vehicles from "./pages/Vehicles.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ClaimGarage from "./pages/ClaimGarage.tsx";
import Pro from "./pages/Pro.tsx";
import Pricing from "./pages/Pricing.tsx";
import BillingSuccess from "./pages/BillingSuccess.tsx";
import BillingCancel from "./pages/BillingCancel.tsx";
import About from "./pages/About.tsx";
import Terms from "./pages/legal/Terms.tsx";
import Privacy from "./pages/legal/Privacy.tsx";
import CookiesPage from "./pages/legal/Cookies.tsx";
import Mentions from "./pages/legal/Mentions.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";
import TradeCity from "./pages/TradeCity.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/pro" element={<Pro />} />
                  <Route path="/pro/claim" element={<ClaimGarage />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/billing/success" element={<BillingSuccess />} />
                  <Route path="/billing/cancel" element={<BillingCancel />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/garage/:id" element={<GarageDetail />} />
                  <Route path="/legal/terms" element={<Terms />} />
                  <Route path="/legal/privacy" element={<Privacy />} />
                  <Route path="/legal/cookies" element={<CookiesPage />} />
                  <Route path="/legal/mentions" element={<Mentions />} />
                  <Route path="/admin" element={<Admin />} />
                  {/* Ranking page: /:trade/:city — validated inside the component */}
                  <Route path="/:trade/:city" element={<TradeCity />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <CookieBanner />
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
