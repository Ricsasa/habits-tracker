'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '@/lib/i18n/useLanguage';

gsap.registerPlugin(useGSAP);

/**
 * Loading state as a self-drawing highlighter stroke.
 *
 * The system's signature interaction is an accent flooding a padding box, so
 * waiting is that same stroke sweeping in and back out under the label. It
 * reads as the app marking its place rather than as a spinner, and it inherits
 * the route accent for free through `--header-accent`.
 */
export default function LoadingIndicator() {
  const { t } = useLanguage();
  const container = useRef<HTMLParagraphElement>(null);
  const stroke = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: no-preference)', () => {
        const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.15 });

        timeline
          .fromTo(
            stroke.current,
            { scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 0.55, ease: 'power2.inOut' }
          )
          .to(stroke.current, {
            scaleX: 0,
            transformOrigin: 'right center',
            duration: 0.55,
            ease: 'power2.inOut',
            delay: 0.15,
          });

        return () => timeline.kill();
      });

      // Reduced motion keeps the mark, drops the movement.
      media.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(stroke.current, { scaleX: 1, opacity: 0.5 });
      });

      return () => media.revert();
    },
    { scope: container }
  );

  return (
    <p
      ref={container}
      role="status"
      aria-live="polite"
      className="relative inline-block px-2 py-0.5 text-sm uppercase tracking-[0.05em] text-content-secondary dark:text-content-secondary-dark"
    >
      <span
        ref={stroke}
        aria-hidden="true"
        className="absolute inset-0 -z-10 scale-x-0 bg-accent"
      />
      {t('common.loading')}
    </p>
  );
}
