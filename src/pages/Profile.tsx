import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, BadgeCheck, Heart, MessageSquare, User, LogOut, Car, BarChart3, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useGarageOwnership } from '@/hooks/useDashboard';
import { useGarages } from '@/hooks/useGarages';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import FavoriteButton from '@/components/FavoriteButton';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile = () => {
  const { user, signOut, loading } = useAuth();
  const { data: favoriteIds = [], isLoading: loadingFavs } = useFavorites();
  const { data: garages = [], isLoading: loadingGarages } = useGarages();
  const { data: ownerships = [] } = useGarageOwnership();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: myReviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['my-reviews', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const favoriteGarages = garages.filter(g => favoriteIds.includes(g.id));
  const isLoading = loadingFavs || loadingGarages || loadingReviews;
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Utilisateur';

  // Map garage ids to names for reviews
  const garageMap = new Map(garages.map(g => [g.id, g]));

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </header>

      <main className="pt-14 pb-24 md:pb-12 max-w-4xl mx-auto px-4">
        {/* Profile header */}
        <motion.div
          className="py-6 flex items-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{displayName}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {myReviews.length} avis
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {favoriteIds.length} favoris
            </span>
            </div>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Link to="/vehicles">
              <Button variant="outline" size="sm" className="text-xs"><Car className="w-3.5 h-3.5 mr-1" /> Mes véhicules</Button>
            </Link>
            {ownerships.length > 0 ? (
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="text-xs"><BarChart3 className="w-3.5 h-3.5 mr-1" /> Dashboard Pro</Button>
              </Link>
            ) : (
              <Link to="/pro/connexion">
                <Button variant="outline" size="sm" className="text-xs"><Briefcase className="w-3.5 h-3.5 mr-1" /> Espace Pro</Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="reviews" className="text-xs">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Mes avis ({myReviews.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs">
              <Heart className="w-3.5 h-3.5 mr-1.5" />
              Favoris ({favoriteIds.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
              </div>
            ) : myReviews.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Vous n'avez pas encore publié d'avis</p>
                <Link to="/">
                  <Button variant="outline" size="sm">Découvrir des garages</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myReviews.map((review, index) => {
                  const garage = garageMap.get(review.garage_id);
                  return (
                    <motion.div
                      key={review.id}
                      className="surface-card p-4 space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between">
                        {garage ? (
                          <Link to={`/garage/${garage.slug}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                            {garage.name}
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-foreground">Garage</span>
                        )}
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-foreground/70 leading-relaxed">{review.text}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: fr })}
                        </span>
                        <span>{review.helpful_count} personne(s) ont trouvé cet avis utile</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="mt-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
              </div>
            ) : favoriteGarages.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Heart className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Aucun favori pour le moment</p>
                <Link to="/">
                  <Button variant="outline" size="sm">Découvrir des garages</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {favoriteGarages.map((garage, index) => (
                  <motion.div
                    key={garage.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link to={`/garage/${garage.slug}`} className="block">
                      <div className="surface-card p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors">
                        <div className="w-14 h-14 rounded-xl bg-secondary overflow-hidden shrink-0">
                          {garage.images[0] && (
                            <img src={garage.images[0]} alt={garage.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold text-foreground truncate">{garage.name}</h3>
                            {garage.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{garage.specialty} · {garage.address}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-foreground">{garage.rating}</span>
                            <span className="text-[10px] text-muted-foreground">({garage.reviews} avis)</span>
                          </div>
                        </div>
                        <FavoriteButton garageId={garage.id} />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
