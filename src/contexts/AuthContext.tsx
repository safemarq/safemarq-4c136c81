import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';

type Result = { error: AuthError | null };
type SignUpResult = Result & {
  /** Supabase hides existing accounts behind a fake success: no identity is returned. */
  alreadyExists: boolean;
  /** Email confirmation is on: no session until the link is clicked. */
  needsConfirmation: boolean;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** True while the user arrived from a password-reset email. */
  recovering: boolean;
  signUp: (email: string, password: string, displayName?: string, redirectPath?: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<Result>;
  signInWithGoogle: (redirectPath: string) => Promise<{ error: Error | null }>;
  resendConfirmation: (email: string, redirectPath: string) => Promise<Result>;
  requestPasswordReset: (email: string, redirectPath: string) => Promise<Result>;
  updatePassword: (password: string) => Promise<Result>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const absolute = (path: string) => `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    // Subscribe first so no event between getSession() and subscription is lost.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (event === 'USER_UPDATED' || event === 'SIGNED_OUT') setRecovering(false);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      recovering,
      signUp: async (email, password, displayName, redirectPath = '/') => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: displayName ? { display_name: displayName } : undefined, emailRedirectTo: absolute(redirectPath) },
        });
        return {
          error,
          alreadyExists: !error && !!data.user && (data.user.identities?.length ?? 0) === 0,
          needsConfirmation: !error && !data.session,
        };
      },
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
      },
      signInWithGoogle: async (redirectPath) => {
        // Google credentials are managed by Lovable Cloud: its broker runs the OAuth
        // round trip, then hands the session back to Supabase (or redirects the page).
        const result = await lovable.auth.signInWithOAuth('google', {
          redirect_uri: absolute(redirectPath),
          extraParams: { prompt: 'select_account' },
        });
        return { error: result.error ?? null };
      },
      resendConfirmation: async (email, redirectPath) => {
        const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: absolute(redirectPath) } });
        return { error };
      },
      requestPasswordReset: async (email, redirectPath) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: absolute(redirectPath) });
        return { error };
      },
      updatePassword: async (password) => {
        const { error } = await supabase.auth.updateUser({ password });
        return { error };
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading, recovering],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
