import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/gsap.js';

// Subtle staggered entrance for list rows / cards that carry [data-reveal].
export function useBatchReveal(scope, deps = []) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const items = gsap.utils.toArray('[data-reveal]');
      if (!items.length) return;
      gsap.set(items, { opacity: 0, y: 18 });
      ScrollTrigger.batch(items, {
        start: 'top 92%',
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: 'power2.out', overwrite: true }),
      });
    },
    { scope, dependencies: deps, revertOnUpdate: true }
  );
}
