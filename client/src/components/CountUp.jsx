import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap.js';

export default function CountUp({ to = 0, suffix = '' }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        el.textContent = `${to}${suffix}`;
        return;
      }
      const o = { v: 0 };
      gsap.to(o, {
        v: to,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => (el.textContent = `${Math.round(o.v).toLocaleString('en-IN')}${suffix}`),
      });
    },
    { dependencies: [to] }
  );
  return <span ref={ref}>0{suffix}</span>;
}
