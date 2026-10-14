import { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, LayoutDashboard, FileCheck, MessageSquare, Building2, Users, Bell, BadgeCheck, Newspaper } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin, useAdminStats } from '@/hooks/useAdmin';
import AdminStats from '@/components/admin/AdminStats';
import AdminClaims from '@/components/admin/AdminClaims';
import AdminReviews from '@/components/admin/AdminReviews';
import AdminGarages from '@/components/admin/AdminGarages';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminPros from '@/components/admin/AdminPros';
import AdminBlog from '@/components/admin/AdminBlog';
import { useAdminPendingProCount } from '@/hooks/useAdminPros';
import { toast } from 'sonner';

const Admin = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: stats } = useAdminStats();
  const { data: pendingPros = 0 } = useAdminPendingProCount();

  useEffect(() => {
    if (!loading && !checkingAdmin && isAdmin === false) {
      toast.error('Accès refusé');
    }
  }, [loading, checkingAdmin, isAdmin]);

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (isAdmin === false) return <Navigate to="/" replace />;

  const pendingClaims = stats?.pendingClaims ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-500" />
            </div>
            <h1 className="text-sm font-bold text-foreground">Espace Admin</h1>
            <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
              Accès restreint
            </span>
          </div>
          {pendingClaims > 0 && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full font-semibold">
              <Bell className="w-3.5 h-3.5" />
              {pendingClaims} revendication{pendingClaims > 1 ? 's' : ''} en attente
            </div>
          )}
        </div>
      </header>

      <main className="pt-14 pb-12 max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 space-y-6"
        >
          {/* KPIs */}
          <AdminStats />

          {/* Tabs */}
          <Tabs defaultValue={pendingPros > 0 ? 'pros' : pendingClaims > 0 ? 'claims' : 'overview'}>
            <TabsList className="w-full grid grid-cols-7 h-auto">
              <TabsTrigger value="pros" className="text-xs py-2 flex gap-1.5 items-center relative">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Comptes pro</span>
                {pendingPros > 0 && (
                  <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-amber text-amber-d rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingPros > 9 ? '9+' : pendingPros}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="overview" className="text-xs py-2 flex gap-1.5 items-center">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vue d'ensemble</span>
              </TabsTrigger>
              <TabsTrigger value="claims" className="text-xs py-2 flex gap-1.5 items-center relative">
                <FileCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Revendications</span>
                {pendingClaims > 0 && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingClaims > 9 ? '9+' : pendingClaims}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs py-2 flex gap-1.5 items-center">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Avis</span>
              </TabsTrigger>
              <TabsTrigger value="garages" className="text-xs py-2 flex gap-1.5 items-center">
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Garages</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs py-2 flex gap-1.5 items-center">
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Utilisateurs</span>
              </TabsTrigger>
              <TabsTrigger value="blog" className="text-xs py-2 flex gap-1.5 items-center">
                <Newspaper className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Blog</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="surface-card p-5 text-center space-y-2">
                <Shield className="w-10 h-10 mx-auto text-primary/40" />
                <p className="text-sm font-semibold text-foreground">Bienvenue dans l'espace admin</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Utilisez les onglets ci-dessus pour gérer les revendications, modérer les avis,
                  administrer les garages et gérer les utilisateurs.
                </p>
                {pendingClaims > 0 && (
                  <p className="text-xs font-semibold text-orange-500">
                    ⚠ {pendingClaims} revendication{pendingClaims > 1 ? 's' : ''} en attente de traitement
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pros" className="mt-4">
              <AdminPros />
            </TabsContent>

            <TabsContent value="claims" className="mt-4">
              <AdminClaims />
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <AdminReviews />
            </TabsContent>

            <TabsContent value="garages" className="mt-4">
              <AdminGarages />
            </TabsContent>

            <TabsContent value="users" className="mt-4">
              <AdminUsers />
            </TabsContent>

            <TabsContent value="blog" className="mt-4">
              <AdminBlog />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
