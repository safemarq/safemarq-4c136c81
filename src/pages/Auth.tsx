import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { Field } from '@/components/pro/Field';
import { GoogleIcon } from '@/components/pro/GoogleIcon';
import { PasswordInput, TermsNotice, authErrorKey } from '@/components/auth/shared';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';
import { safeReturn } from '@/lib/returnPath';
import type { MessageKey } from '@/i18n/types';
import { emailSchema, passwordSchema } from '@/lib/pro/validation';
import { cn } from '@/lib/utils';

type Mode = 'signin' | 'signup';

const signInSchema = z.object({ email: emailSchema, password: z.string().min(1, { message: 'validation.required' }) });
const signUpSchema = z.object({ email: emailSchema, password: passwordSchema });
type Values = z.infer<typeof signUpSchema>;

/** /auth: sign in or create a free account (favourites everywhere, quotes followed). */
export default function Auth() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const back = safeReturn(params.get('retour'));
  const { user, loading, recovering, signIn, signUp, signInWithGoogle, requestPasswordReset, resendConfirmation } = useAuth();

  const [mode, setMode] = useState<Mode>(params.get('mode') === 'inscription' ? 'signup' : 'signin');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<MessageKey | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  const modeRef = useRef<Mode>(mode);
  modeRef.current = mode;
  const form = useForm<Values>({
    resolver: (values, ctx, options) => zodResolver(modeRef.current === 'signin' ? signInSchema : signUpSchema)(values, ctx, options),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  // Signed in (password, Google return, confirmation link): back where they came from.
  useEffect(() => {
    if (!loading && user && !recovering) navigate(back, { replace: true });
  }, [loading, user, recovering, navigate, back]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setFormError(null);
    form.clearErrors();
  };

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    setFormError(null);
    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setFormError(authErrorKey(error.code, error.message));
      return;
    }
    const res = await signUp(email, password, undefined, back);
    if (res.error) return setFormError(authErrorKey(res.error.code, res.error.message));
    if (res.alreadyExists) {
      switchMode('signin');
      return setFormError('pro.auth.errorExists');
    }
    if (res.needsConfirmation) setSentTo(email);
  });

  const onGoogle = async () => {
    setGoogleBusy(true);
    const { error } = await signInWithGoogle(back);
    if (error) {
      setGoogleBusy(false);
      setFormError('pro.auth.errorGoogle');
    }
  };

  const onForgot = async () => {
    const parsed = emailSchema.safeParse(form.getValues('email'));
    if (!parsed.success) {
      form.setFocus('email');
      return setFormError('pro.auth.resetPrompt');
    }
    await requestPasswordReset(parsed.data, '/nouveau-mot-de-passe');
    // Same message whether or not the account exists (no account enumeration).
    toast.success(t('pro.auth.resetSent', { email: parsed.data }));
  };

  const { errors, isSubmitting } = form.formState;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo title={t('auth.metaTitle')} description={t('auth.metaDescription')} noindex />
      <SiteHeader />
      <main id="contenu" className="container-editorial">
        <div className="grid gap-10 py-10 md:py-16 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-16">
          <section aria-labelledby="auth-title" className="min-w-0">
            {sentTo ? (
              <div className="rounded-2xl border border-line bg-card p-6 md:p-8">
                <MailCheck className="h-8 w-8 text-teal" aria-hidden />
                <h1 id="auth-title" className="mt-4 text-[30px] font-semibold leading-tight text-strong">
                  {t('pro.auth.checkInboxTitle')}
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed text-slate1">{t('auth.checkInboxBody', { email: sentTo })}</p>
                <button
                  type="button"
                  className="mt-6 text-[15px] font-semibold text-strong underline underline-offset-4"
                  onClick={async () => {
                    await resendConfirmation(sentTo, back);
                    toast.success(t('pro.auth.checkInboxResent'));
                  }}
                >
                  {t('pro.auth.checkInboxResend')}
                </button>
              </div>
            ) : (
              <>
                <h1 id="auth-title" className="text-[36px] font-semibold leading-[1.04] text-strong md:text-[48px]">
                  {t('auth.title')}
                </h1>
                <p className="mt-3 max-w-md text-base leading-relaxed text-slate1">{t('auth.subtitle')}</p>

                <div role="tablist" aria-label={t('auth.title')} className="mt-7 grid grid-cols-2 gap-1 rounded-xl bg-paper-2 p-1">
                  {(['signin', 'signup'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => switchMode(m)}
                      className={cn('min-h-[44px] rounded-lg text-[15px] font-semibold transition-colors', mode === m ? 'seg-active' : 'text-slate1 hover:text-ink')}
                    >
                      {m === 'signin' ? t('pro.auth.tabSignIn') : t('pro.auth.tabSignUp')}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onGoogle}
                  disabled={googleBusy}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-ink/20 bg-card text-[15px] font-semibold text-ink transition-colors hover:border-ink/40 disabled:opacity-60"
                >
                  <GoogleIcon className="h-5 w-5" />
                  {t('pro.auth.google')}
                </button>

                <div className="my-6 flex items-center gap-3 text-sm text-slate1" aria-hidden>
                  <span className="h-px flex-1 bg-line" />
                  {t('pro.auth.or')}
                  <span className="h-px flex-1 bg-line" />
                </div>

                <form onSubmit={onSubmit} noValidate className="space-y-5">
                  <Field label={t('pro.auth.email')} error={errors.email?.message}>
                    <Input type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} {...form.register('email')} />
                  </Field>
                  <Field label={t('pro.auth.password')} hint={mode === 'signup' ? t('pro.auth.passwordHint') : undefined} error={errors.password?.message}>
                    <PasswordInput
                      visible={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                      labels={{ show: t('pro.auth.showPassword'), hide: t('pro.auth.hidePassword') }}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      {...form.register('password')}
                    />
                  </Field>

                  {mode === 'signin' && (
                    <div className="-mt-2 text-right">
                      <button type="button" onClick={onForgot} className="py-1 text-sm font-semibold text-slate1 underline-offset-4 hover:text-strong hover:underline">
                        {t('pro.auth.forgot')}
                      </button>
                    </div>
                  )}

                  {formError && (
                    <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm font-medium text-destructive">
                      {t(formError)}
                    </p>
                  )}

                  <button type="submit" className="btn-amber w-full" disabled={isSubmitting}>
                    {isSubmitting ? t('pro.auth.submitting') : mode === 'signin' ? t('pro.auth.submitSignIn') : t('auth.submitSignUp')}
                  </button>

                  {mode === 'signup' && (
                    <p className="text-[13px] leading-relaxed text-slate1">
                      <TermsNotice />
                    </p>
                  )}
                </form>

                <p className="mt-8 border-t border-line pt-6 text-[15px] text-slate1">
                  {t('auth.proPrompt')}{' '}
                  <Link to="/pro/connexion" className="font-semibold text-strong underline-offset-4 hover:underline">
                    {t('auth.proLink')}
                  </Link>
                </p>
              </>
            )}
          </section>

          <Benefits />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Benefits() {
  const { t } = useI18n();
  const items = [
    { title: t('auth.benefit1Title'), body: t('auth.benefit1Body') },
    { title: t('auth.benefit2Title'), body: t('auth.benefit2Body') },
    { title: t('auth.benefit3Title'), body: t('auth.benefit3Body') },
  ];
  return (
    <aside className="relative self-start overflow-hidden rounded-2xl bg-navy-900 p-6 text-chalk md:p-10 lg:mt-2">
      <span aria-hidden className="absolute bottom-0 right-0 h-5 w-5 bg-amber" />
      <h2 className="font-display text-2xl font-semibold leading-tight text-chalk md:text-[28px]">{t('auth.benefitsTitle')}</h2>
      <ul className="mt-7 space-y-6">
        {items.map((b) => (
          <li key={b.title} className="border-t border-chalk/15 pt-5">
            <h3 className="font-sans text-base font-semibold text-chalk">{b.title}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-chalk/70">{b.body}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
