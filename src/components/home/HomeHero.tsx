import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CityChooser } from '@/components/search/FilterBar';
import { PickerShell, VehicleList } from '@/components/search/Pickers';
import { SlotButton, Swap } from '@/components/search/SlotButton';
import { TradeList } from '@/components/search/TradeList';
import { EASE } from '@/components/safemarq/motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeLabelKey, vehicleKey } from '@/i18n/keys';
import type { MessageKey } from '@/i18n/types';
import { cityName, lastCity, loadPlaces, rememberCity, type City } from '@/lib/cities';
import { rankingPath } from '@/lib/links';
import { PHOTOS, photoSrcSet, photoUrl } from '@/lib/photos';
import { DEFAULT_VEHICLE, isVehicle, offers, type TradeSlug, type VehicleSlug } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';

type Slot = 'trade' | 'vehicle' | 'city';

/** On the first visit the first word flicks through a few trades before it settles. */
const ROLL: TradeSlug[] = ['carrosserie', 'pneus', 'freinage', 'climatisation', 'controle-technique', 'pare-brise', 'entretien'];
const ROLL_START = 300;
const ROLL_STEPS = [100, 110, 125, 150, 185, 240]; // ms between words: a counter slowing down
const ROLL_SETTLE = 260; // last word in place before the underlines draw
const ROLL_MAX_CHARS = 14; // long names would not fit one line on a phone
const ROLLED_KEY = 'safemarq-hero-rolled';

// React 18 does not know the camelCase prop yet; pass the HTML attribute as is.
const HIGH_PRIORITY = { fetchpriority: 'high' } as Record<string, string>;

function shouldRoll(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return sessionStorage.getItem(ROLLED_KEY) !== '1';
  } catch {
    return false;
  }
}

/**
 * The search as a sentence: "[Un garage] pour [ma voiture] à [Namur]".
 * Each underlined part opens its picker; nothing else sits on the photo.
 */
export function HomeHero() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [params] = useSearchParams();

  // Links like /?vehicule=moto&metier=hivernage#recherche preset the sentence.
  const paramVehicle = params.get('vehicule');
  const presetVehicle: VehicleSlug | null = isVehicle(paramVehicle) ? paramVehicle : null;
  const paramTrade = params.get('metier');
  const presetTrade = paramTrade && offers(presetVehicle ?? DEFAULT_VEHICLE, paramTrade) ? paramTrade : null;

  const [vehicle, setVehicle] = useState<VehicleSlug>(presetVehicle ?? DEFAULT_VEHICLE);
  const [trade, setTrade] = useState<TradeSlug | null>(presetTrade);
  const [city, setCity] = useState<City | null>(() => lastCity());
  const [open, setOpen] = useState<Slot | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<MessageKey | null>(null);
  // Set when "See the ranking" is pressed without a town: picking one then goes straight on.
  const goOnPick = useRef(false);

  // Intro: the first word rolls, then the three underlines draw in.
  const [intro] = useState(() => !presetTrade && !presetVehicle && shouldRoll());
  const [rollWord, setRollWord] = useState<string | null>(null);
  const [landed, setLanded] = useState(!intro);
  const timers = useRef<number[]>([]);

  const stopRoll = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setRollWord(null);
    setLanded(true);
  }, []);

  useEffect(() => {
    if (!intro) return;
    const words = ROLL.map((s) => t(tradeLabelKey(s, DEFAULT_VEHICLE)))
      .filter((w) => w.length <= ROLL_MAX_CHARS)
      .slice(0, ROLL_STEPS.length);
    let at = ROLL_START;
    words.forEach((w, i) => {
      timers.current.push(window.setTimeout(() => setRollWord(w), at));
      at += ROLL_STEPS[i];
    });
    timers.current.push(window.setTimeout(() => setRollWord(null), at));
    timers.current.push(window.setTimeout(stopRoll, at + ROLL_SETTLE));
    try {
      sessionStorage.setItem(ROLLED_KEY, '1');
    } catch {
      /* private mode: the intro may play again, that is all */
    }
    return () => timers.current.forEach(window.clearTimeout);
    // Plays once, in the language of the first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intro]);

  useEffect(() => {
    if (presetVehicle) setVehicle(presetVehicle);
    if (presetTrade) setTrade(presetTrade);
    // Arriving from a trade link without a known town: ask for it straight away.
    if ((presetTrade || presetVehicle) && !lastCity()) {
      goOnPick.current = true;
      setOpen('city');
    }
  }, [presetVehicle, presetTrade]);

  const go = (target: City) => {
    rememberCity(target);
    navigate(rankingPath({ vehicle, trade, city: target.slug }));
  };

  const pickCity = (c: City) => {
    setCity(c);
    setOpen(null);
    setLocateError(null);
    if (goOnPick.current) {
      goOnPick.current = false;
      go(c);
    }
  };

  const submit = () => {
    if (city) return go(city);
    goOnPick.current = true;
    setOpen('city');
  };

  const locate = () => {
    if (!('geolocation' in navigator)) return setLocateError('search.locateFailed');
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          pickCity((await loadPlaces()).nearest(pos.coords.latitude, pos.coords.longitude));
        } catch {
          setLocateError('common.errorNetwork');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setLocateError(err.code === err.PERMISSION_DENIED ? 'search.locateDenied' : 'search.locateFailed');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60_000 },
    );
  };

  const changeVehicle = (next: VehicleSlug) => {
    setVehicle(next);
    // Keep the trade when the new vehicle has it (servicing, tyres…), else "any".
    setTrade((current) => (current && offers(next, current) ? current : null));
    setOpen(null);
  };

  const onOpenChange = (slot: Slot) => (o: boolean) => {
    if (o && slot === 'trade') stopRoll();
    if (!o && slot === 'city') goOnPick.current = false;
    setOpen(o ? slot : null);
  };

  const tradeText = trade ? t(tradeLabelKey(trade, vehicle)) : t(vehicleKey(vehicle, 'someone'));
  const vehicleText = t(vehicleKey(vehicle, 'mine'));
  const cityText = city ? cityName(city, locale) : t('home.sentence.nearMe');
  const photo = PHOTOS.hero;

  // Entrance, first visit only: lines rise in turn while the first word rolls.
  const rise = (i: number) =>
    intro
      ? { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.08 + i * 0.08, ease: EASE } }
      : { initial: false as const };

  return (
    <section id="recherche" className="relative isolate overflow-hidden bg-navy-900 text-chalk">
      <HeroPhoto
        alt={t('home.photoAlt.hero')}
        animate={intro}
        mobile={photoSrcSet(photo, [390, 780, 1170], 3 / 4)}
        desktop={[800, 1200, 1600, 2000].map((w) => `${photoUrl(photo, w)} ${w}w`).join(', ')}
        src={photoUrl(photo, 1600)}
        position={`${photo.fx * 100}% ${photo.fy * 100}%`}
      />
      {/* Phones: the photo fills the top and fades into navy under the sentence.
          Wider: navy on the left for the words, the photo bleeding in from the right. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,hsl(var(--navy-900)/0.75)_0%,hsl(var(--navy-900)/0)_18%,hsl(var(--navy-900)/0)_32%,hsl(var(--navy-900)/0.92)_54%,hsl(var(--navy-900))_62%)] md:hidden"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,hsl(var(--navy-900))_0%,hsl(var(--navy-900))_33%,hsl(var(--navy-900)/0.72)_45%,hsl(var(--navy-900)/0.12)_66%,hsl(var(--navy-900)/0)_82%),linear-gradient(0deg,hsl(var(--navy-900)/0.85)_0%,hsl(var(--navy-900)/0)_36%),linear-gradient(180deg,hsl(var(--navy-900)/0.65)_0%,hsl(var(--navy-900)/0)_22%)] md:block"
      />

      <div className="container-editorial flex min-h-[100svh] flex-col justify-end pb-9 pt-28 md:min-h-[min(92svh,880px)] md:pb-20 md:pt-36">
        <div role="search" aria-label={t('home.sentence.label')}>
          {/* max-w in em: long trade names wrap before they reach the photo's subject. */}
          <div className="max-w-[9.2em] font-display text-[44px] font-semibold leading-[1.04] tracking-[-0.012em] text-chalk sm:text-[56px] md:text-[64px] lg:text-[80px] xl:text-[92px]">
            <motion.span className="block" {...rise(0)}>
              <PickerShell
                title={t('search.chooseTrade')}
                open={open === 'trade'}
                onOpenChange={onOpenChange('trade')}
                wide
                trigger={
                  <SlotButton label={`${t('search.tradeLabel')} : ${tradeText}`} drawn={landed} order={0} onClick={() => onOpenChange('trade')(true)}>
                    <Swap text={rollWord ?? tradeText} nowrap={rollWord !== null} />
                  </SlotButton>
                }
              >
                <TradeList
                  vehicle={vehicle}
                  selected={trade}
                  allOption
                  columns={isMobile ? 1 : 3}
                  onSelect={(slug) => {
                    setTrade(slug);
                    setOpen(null);
                  }}
                />
              </PickerShell>
            </motion.span>
            <motion.span className="block" {...rise(1)}>
              <span className="font-medium text-chalk/60">{t('home.sentence.for')} </span>
              <PickerShell
                title={t('search.chooseVehicle')}
                open={open === 'vehicle'}
                onOpenChange={onOpenChange('vehicle')}
                trigger={
                  <SlotButton label={`${t('search.vehicleLabel')} : ${vehicleText}`} drawn={landed} order={1} onClick={() => onOpenChange('vehicle')(true)}>
                    <Swap text={vehicleText} />
                  </SlotButton>
                }
              >
                <VehicleList value={vehicle} onPick={changeVehicle} />
              </PickerShell>
            </motion.span>
            <motion.span className="block" {...rise(2)}>
              {city && <span className="font-medium text-chalk/60">{t('home.sentence.in')} </span>}
              <PickerShell
                title={t('searchPage.whereTitle')}
                open={open === 'city'}
                onOpenChange={onOpenChange('city')}
                width="w-[24rem] p-4"
                trigger={
                  <SlotButton label={`${t('search.cityLabel')} : ${cityText}`} drawn={landed} order={2} onClick={() => onOpenChange('city')(true)}>
                    <Swap text={cityText} />
                  </SlotButton>
                }
              >
                <CityChooser autoFocus onCity={pickCity} onLocate={locate} locating={locating} error={locateError && t(locateError)} />
              </PickerShell>
            </motion.span>
          </div>
        </div>

        <motion.div className="mt-8 flex flex-col gap-5 md:mt-11 md:flex-row md:items-center md:gap-9" {...rise(3)}>
          <button type="button" onClick={submit} className="btn-amber min-h-[56px] self-stretch px-8 text-[17px] md:self-auto">
            {t('home.sentence.cta')}
          </button>
          <h1 className="max-w-[23rem] font-sans text-[15px] font-normal leading-snug text-chalk/75 [text-wrap:pretty] md:text-base">
            {t('home.heroLead')}
          </h1>
        </motion.div>
      </div>
    </section>
  );
}

function HeroPhoto({ alt, animate, mobile, desktop, src, position }: { alt: string; animate: boolean; mobile: string; desktop: string; src: string; position: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(!animate);
  useEffect(() => {
    if (ref.current?.complete) setReady(true);
  }, []);
  return (
    <div className="absolute inset-x-0 top-0 -z-20 h-[62%] md:inset-y-0 md:left-auto md:h-full md:w-[68%]">
      <picture>
        <source media="(max-width: 767px)" srcSet={mobile} sizes="100vw" />
        <motion.img
          ref={ref}
          src={src}
          srcSet={desktop}
          sizes="68vw"
          alt={alt}
          decoding="async"
          {...HIGH_PRIORITY}
          onLoad={() => setReady(true)}
          // The photo settles as it appears: a slight zoom out, once.
          initial={animate ? { opacity: 0, scale: 1.06 } : false}
          animate={ready ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 1.6, ease: EASE }}
          className="h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
      </picture>
    </div>
  );
}
