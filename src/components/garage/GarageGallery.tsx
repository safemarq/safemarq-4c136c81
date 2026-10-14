import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

interface GarageGalleryProps {
  images: string[];
  name: string;
}

/** Listing photos; arrows and dots only when there is more than one. */
const GarageGallery = ({ images, name }: GarageGalleryProps) => {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const many = images.length > 1;

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper-2 md:aspect-[21/9]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={current}
          src={images[current]}
          alt={t('garage.photoAlt', { name, n: current + 1 })}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>

      {many && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label={t('common.previous')}
            className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-card/85 text-ink shadow-sm backdrop-blur hover:bg-card"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={t('common.next')}
            className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-card/85 text-ink shadow-sm backdrop-blur hover:bg-card"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={t('garage.photoAlt', { name, n: i + 1 })}
                aria-current={i === current}
                className={cn('h-2 rounded-full transition-all', i === current ? 'w-5 bg-chalk' : 'w-2 bg-chalk/50')}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GarageGallery;
