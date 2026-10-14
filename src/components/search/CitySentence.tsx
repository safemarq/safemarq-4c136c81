import { useCallback, useRef, useState } from 'react';
import { CityChooser } from '@/components/search/FilterBar';
import { PickerShell } from '@/components/search/Pickers';
import { SlotButton, Swap } from '@/components/search/SlotButton';
import { useLocateCity } from '@/hooks/useLocateCity';
import { useI18n } from '@/i18n/I18nProvider';
import { cityName, rememberCity, type City } from '@/lib/cities';
import { cn } from '@/lib/utils';

interface Props {
  /** Fixed start of the sentence: "Un garage BMW à". */
  start: string;
  /** Start when no town is known yet: "Un garage BMW" (followed by "près de chez moi"). */
  startNoCity: string;
  city: City | null;
  /** Called with the town once chosen and confirmed (button, or pick after pressing it). */
  onGo: (city: City) => void;
  /** Called on every pick, before confirming (lets the page preview the town). */
  onPick?: (city: City) => void;
  cta: string;
  /** Pick = go: no button (the page updates in place). */
  instant?: boolean;
  className?: string;
}

/**
 * "Un garage BMW à [Namur]": the town is the one changeable word, underlined
 * in amber like the home page sentence, and opens the town picker.
 */
export function CitySentence({ start, startNoCity, city: initial, onGo, onPick, cta, instant = false, className }: Props) {
  const { t, locale } = useI18n();
  const [city, setCity] = useState<City | null>(initial);
  const [open, setOpen] = useState(false);
  // Pressed without a town: the pick that follows goes straight on.
  const goOnPick = useRef(false);

  const pick = useCallback(
    (c: City) => {
      setCity(c);
      setOpen(false);
      rememberCity(c);
      onPick?.(c);
      if (instant || goOnPick.current) {
        goOnPick.current = false;
        onGo(c);
      }
    },
    [instant, onGo, onPick],
  );
  const { locate, locating, error } = useLocateCity(pick);

  const submit = () => {
    if (city) return onGo(city);
    goOnPick.current = true;
    setOpen(true);
  };

  const cityText = city ? cityName(city, locale) : t('home.sentence.nearMe');

  return (
    <div role="search" aria-label={start} className={cn('flex flex-col gap-6 md:flex-row md:flex-wrap md:items-end md:gap-x-8', className)}>
      <div className="font-display text-[32px] font-semibold leading-[1.08] text-chalk sm:text-[40px] md:text-[48px]">
        <span className="text-chalk/60">{city ? start : startNoCity} </span>
        <PickerShell
          title={t('searchPage.whereTitle')}
          open={open}
          onOpenChange={(o) => {
            if (!o) goOnPick.current = false;
            setOpen(o);
          }}
          width="w-[24rem] p-4"
          trigger={
            <SlotButton label={`${t('search.cityLabel')} : ${cityText}`} drawn order={0} onClick={() => setOpen(true)}>
              <Swap text={cityText} />
            </SlotButton>
          }
        >
          <CityChooser autoFocus onCity={pick} onLocate={locate} locating={locating} error={error && t(error)} />
        </PickerShell>
      </div>
      {!instant && (
        <button type="button" onClick={submit} className="btn-amber min-h-[52px] self-stretch px-7 text-[16px] md:mb-1 md:self-auto">
          {cta}
        </button>
      )}
    </div>
  );
}
