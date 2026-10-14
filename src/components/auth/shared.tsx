import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/i18n/I18nProvider';
import type { MessageKey } from '@/i18n/types';

/** Supabase auth errors as messages people can act on. */
export function authErrorKey(code: string | undefined, message: string): MessageKey {
  if (code === 'invalid_credentials' || /invalid login/i.test(message)) return 'pro.auth.errorInvalid';
  if (code === 'email_not_confirmed' || /not confirmed/i.test(message)) return 'pro.auth.errorNotConfirmed';
  if (code === 'user_already_exists' || /already registered/i.test(message)) return 'pro.auth.errorExists';
  if (/fetch/i.test(message)) return 'common.errorNetwork';
  return 'common.errorGeneric';
}

/** "By creating an account you accept the {terms} and the {privacy}" with both as links. */
export function TermsNotice() {
  const { t } = useI18n();
  // Split the sentence around its two placeholders so each becomes a link.
  const parts = t('pro.auth.termsNotice').split(/(\{terms\}|\{privacy\})/);
  return (
    <>
      {parts.map((part, i) =>
        part === '{terms}' ? (
          <Link key={i} to="/legal/terms" className="font-semibold text-ink underline underline-offset-2">
            {t('pro.auth.termsLink')}
          </Link>
        ) : part === '{privacy}' ? (
          <Link key={i} to="/legal/privacy" className="font-semibold text-ink underline underline-offset-2">
            {t('pro.auth.privacyLink')}
          </Link>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

type PasswordInputProps = React.ComponentPropsWithoutRef<typeof Input> & {
  visible: boolean;
  onToggle: () => void;
  labels: { show: string; hide: string };
};

// forwardRef: react-hook-form reads uncontrolled values through the ref.
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({ visible, onToggle, labels, ...props }, ref) => (
  <div className="relative">
    <Input ref={ref} type={visible ? 'text' : 'password'} className="pr-12" {...props} />
    <button
      type="button"
      onClick={onToggle}
      className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate1 hover:text-ink"
      aria-label={visible ? labels.hide : labels.show}
      aria-pressed={visible}
    >
      {visible ? <EyeOff className="h-[18px] w-[18px]" aria-hidden /> : <Eye className="h-[18px] w-[18px]" aria-hidden />}
    </button>
  </div>
));
PasswordInput.displayName = 'PasswordInput';
