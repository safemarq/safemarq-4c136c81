import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useFavorites } from '@/hooks/useFavorites';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

const HINT_KEY = 'safemarq-favorites-hint';

function hintSeen(): boolean {
  try {
    return localStorage.getItem(HINT_KEY) === '1';
  } catch {
    return true;
  }
}

function markHintSeen() {
  try {
    localStorage.setItem(HINT_KEY, '1');
  } catch {
    /* storage blocked */
  }
}

interface Props {
  garageId: string;
  garageName: string;
  /** icon: round 44 px button (rows). labeled: button with text (listing page). */
  variant?: 'icon' | 'labeled';
  onDark?: boolean;
  className?: string;
}

/**
 * The heart. Works without an account (kept on this device); the first time,
 * a note explains that an account keeps favourites on every device.
 */
export function FavoriteButton({ garageId, garageName, variant = 'icon', onDark = false, className }: Props) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { has, toggle, signedIn } = useFavorites();
  const [busy, setBusy] = useState(false);
  const [pulse, setPulse] = useState(0);
  const saved = has(garageId);

  const onClick = async (e: React.MouseEvent) => {
    // Rows are links: the heart must not open the listing.
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const result = await toggle(garageId);
      if (result === 'limit') {
        toast.error(t('favorites.limitLocal'));
        return;
      }
      if (result === 'added') {
        setPulse((n) => n + 1);
        if (!signedIn && !hintSeen()) {
          markHintSeen();
          toast(t('favorites.hintTitle'), {
            description: t('favorites.hintBody'),
            action: { label: t('favorites.hintAction'), onClick: () => navigate('/auth?retour=/favoris') },
            duration: 8000,
          });
        }
      }
    } catch {
      toast.error(t('common.errorGeneric'));
    } finally {
      setBusy(false);
    }
  };

  const label = saved ? t('favorites.remove', { name: garageName }) : t('favorites.add', { name: garageName });
  const icon = (
    <motion.span
      key={pulse}
      className="inline-flex"
      initial={false}
      animate={pulse && !reduce ? { scale: [1, 1.28, 1] } : undefined}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <Heart
        className={cn('h-5 w-5 transition-colors', saved ? 'fill-coral text-coral' : onDark ? 'text-chalk' : 'text-slate1')}
        strokeWidth={saved ? 2 : 1.8}
        aria-hidden
      />
    </motion.span>
  );

  if (variant === 'labeled') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={label}
        className={cn(
          'inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-4 text-[15px] font-semibold transition-colors',
          onDark ? 'border-chalk/35 text-chalk hover:bg-chalk/10' : 'border-ink/20 text-ink hover:border-ink/40',
          className,
        )}
      >
        {icon}
        <span aria-hidden>{saved ? t('favorites.saved') : t('favorites.save')}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors',
        onDark ? 'hover:bg-chalk/10' : 'hover:bg-paper-2',
        className,
      )}
    >
      {icon}
    </button>
  );
}
