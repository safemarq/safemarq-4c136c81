import { lazy, Suspense, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nProvider } from '@/i18n/I18nProvider';
import type { Locale } from '@/i18n/config';
import ErrorBoundary from '@/components/ErrorBoundary';
import CookieBanner from '@/components/CookieBanner';
import { FavoritesSync } from '@/hooks/useFavorites';
import Index from './pages/Index.tsx';

// Every route except the landing page is its own chunk: phones download only
// what the visited page needs.
const GarageDetail = lazy(() => import('./pages/GarageDetail.tsx'));
const Auth = lazy(() => import('./pages/Auth.tsx'));
const Favorites = lazy(() => import('./pages/Favorites.tsx'));
const Profile = lazy(() => import('./pages/Profile.tsx'));
const Vehicles = lazy(() => import('./pages/Vehicles.tsx'));
const Pro = lazy(() => import('./pages/Pro.tsx'));
const ProAuth = lazy(() => import('./pages/pro/ProAuth.tsx'));
const ProResetPassword = lazy(() => import('./pages/pro/ProResetPassword.tsx'));
const ProOnboarding = lazy(() => import('./pages/pro/ProOnboarding.tsx'));
const ProDashboard = lazy(() => import('./pages/pro/ProDashboard.tsx'));
const Pricing = lazy(() => import('./pages/Pricing.tsx'));
const BillingSuccess = lazy(() => import('./pages/BillingSuccess.tsx'));
const BillingCancel = lazy(() => import('./pages/BillingCancel.tsx'));
const About = lazy(() => import('./pages/About.tsx'));
const Terms = lazy(() => import('./pages/legal/Terms.tsx'));
const Privacy = lazy(() => import('./pages/legal/Privacy.tsx'));
const CookiesPage = lazy(() => import('./pages/legal/Cookies.tsx'));
const Mentions = lazy(() => import('./pages/legal/Mentions.tsx'));
const Admin = lazy(() => import('./pages/Admin.tsx'));
const NotFound = lazy(() => import('./pages/NotFound.tsx'));
const Ranking = lazy(() => import('./pages/Ranking.tsx'));
const Search = lazy(() => import('./pages/Search.tsx'));
const Makes = lazy(() => import('./pages/Makes.tsx'));
const MakePage = lazy(() => import('./pages/MakePage.tsx'));
const Equipment = lazy(() => import('./pages/Equipment.tsx'));
const ToolBrandPage = lazy(() => import('./pages/ToolBrandPage.tsx'));
const Blog = lazy(() => import('./pages/Blog.tsx'));
const BlogPost = lazy(() => import('./pages/BlogPost.tsx'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

/** New page → top of page; link with #hash → that section. */
function ScrollManager() {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, search, hash]);
  return null;
}

const PageFallback = () => <div className="min-h-[100dvh] bg-background" aria-busy="true" />;

const App = ({ initialLocale }: { initialLocale: Locale }) => (
  // Visitors who ask their system for less motion get none of the framer-motion animations.
  <MotionConfig reducedMotion="user">
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <I18nProvider initialLocale={initialLocale}>
          <ThemeProvider>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollManager />
                  <FavoritesSync />
                  <ErrorBoundary>
                    <Suspense fallback={<PageFallback />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/nouveau-mot-de-passe" element={<ProResetPassword variant="consumer" />} />
                        <Route path="/favoris" element={<Favorites />} />
                        <Route path="/favorites" element={<Navigate to="/favoris" replace />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/vehicles" element={<Vehicles />} />

                        {/* Pro area: one entry point for garages and dealers */}
                        <Route path="/pro" element={<Pro />} />
                        <Route path="/pro/connexion" element={<ProAuth />} />
                        <Route path="/pro/nouveau-mot-de-passe" element={<ProResetPassword />} />
                        <Route path="/pro/inscription" element={<ProOnboarding />} />
                        <Route path="/pro/dashboard" element={<ProDashboard />} />
                        <Route path="/pro/claim" element={<Navigate to="/pro/inscription" replace />} />
                        <Route path="/dashboard" element={<Navigate to="/pro/dashboard" replace />} />

                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/billing/success" element={<BillingSuccess />} />
                        <Route path="/billing/cancel" element={<BillingCancel />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/recherche" element={<Search />} />
                        <Route path="/marques" element={<Makes />} />
                        <Route path="/marques/:make" element={<MakePage />} />
                        <Route path="/marques/:make/:city" element={<MakePage />} />
                        <Route path="/outillage" element={<Equipment />} />
                        <Route path="/outillage/:brand" element={<ToolBrandPage />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                        <Route path="/garage/:id" element={<GarageDetail />} />
                        <Route path="/legal/terms" element={<Terms />} />
                        <Route path="/legal/privacy" element={<Privacy />} />
                        <Route path="/legal/cookies" element={<CookiesPage />} />
                        <Route path="/legal/mentions" element={<Mentions />} />
                        <Route path="/admin" element={<Admin />} />
                        {/* Rankings: /:trade/:city (cars), /:vehicle/:city, /:vehicle/:trade/:city — see lib/links.ts */}
                        <Route path="/:a/:b" element={<Ranking />} />
                        <Route path="/:a/:b/:c" element={<Ranking />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                    <CookieBanner />
                  </ErrorBoundary>
                </BrowserRouter>
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </MotionConfig>
);

export default App;
