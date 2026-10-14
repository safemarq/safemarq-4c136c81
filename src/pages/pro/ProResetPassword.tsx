import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Seo from '@/components/Seo';
import { ProShell } from '@/components/pro/ProShell';
import SiteHeader from '@/components/site/SiteHeader';
import { Field } from '@/components/pro/Field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';
import { passwordSchema } from '@/lib/pro/validation';

const schema = z.object({ password: passwordSchema });

/** Reset form, shared by pros (/pro/nouveau-mot-de-passe) and drivers (/nouveau-mot-de-passe). */
export default function ProResetPassword({ variant = 'pro' }: { variant?: 'pro' | 'consumer' }) {
  const signInPath = variant === 'pro' ? '/pro/connexion' : '/auth';
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, loading, updatePassword } = useAuth();
  const [failed, setFailed] = useState(false);
  // The recovery session is exchanged from the URL just after mount; give it a moment.
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setWaited(true), 1500);
    return () => window.clearTimeout(id);
  }, []);

  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { password: '' } });

  const onSubmit = form.handleSubmit(async ({ password }) => {
    const { error } = await updatePassword(password);
    if (error) return setFailed(true);
    toast.success(t('pro.reset.done'));
    navigate(signInPath, { replace: true });
  });

  const linkInvalid = failed || (!loading && waited && !user);

  const Wrapper = variant === 'pro' ? NarrowProShell : ConsumerShell;
  return (
    <Wrapper>
      <Seo title={t('pro.reset.metaTitle')} noindex />
      <div className="mx-auto max-w-md py-10 md:py-16">
        <h1 className="text-[30px] leading-tight text-strong">{t('pro.reset.title')}</h1>
        {linkInvalid ? (
          <div className="mt-6 space-y-4">
            <p role="alert" className="text-[15px] text-slate1">{t('pro.reset.invalidLink')}</p>
            <Link to={signInPath} className="btn-ghost-navy">{t('pro.reset.backToSignIn')}</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
            <Field label={t('pro.reset.newPassword')} hint={t('pro.auth.passwordHint')} error={form.formState.errors.password?.message}>
              <Input type="password" autoComplete="new-password" {...form.register('password')} />
            </Field>
            <button type="submit" className="btn-amber w-full" disabled={form.formState.isSubmitting || !user}>
              {form.formState.isSubmitting ? t('pro.auth.submitting') : t('pro.reset.submit')}
            </button>
          </form>
        )}
      </div>
    </Wrapper>
  );
}

const NarrowProShell = ({ children }: { children: React.ReactNode }) => <ProShell width="narrow">{children}</ProShell>;

function ConsumerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-paper text-ink">
      <SiteHeader />
      <main id="contenu" className="mx-auto max-w-3xl px-4 sm:px-6">
        {children}
      </main>
    </div>
  );
}
