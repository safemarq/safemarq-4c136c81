import type { Variants, Transition } from 'framer-motion';

export const EASE = [0.16, 1, 0.3, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.1, staggerChildren: 0.08 } },
};

export const heroStagger: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.05, staggerChildren: 0.12 } },
};

export const cardHover: Transition = { type: 'spring', stiffness: 300, damping: 24 };

export const inViewProps = {
  initial: 'hidden' as const,
  whileInView: 'show' as const,
  viewport: { once: true, margin: '-80px' },
};
