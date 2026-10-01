import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap.js';
import { useRef } from 'react';

export const Loader = ({ label = 'Loading' }) => (
  <div className="loader" role="status" aria-label={label}>
    <span /> <span /> <span />
  </div>
);

export const Empty = ({ title, children, action }) => (
  <div className="empty">
    <h3>{title}</h3>
    {children && <p>{children}</p>}
    {action}
  </div>
);

export const ErrorBox = ({ error }) => (
  <div className="empty empty-error">
    <h3>Could not load this section</h3>
    <p>{error?.message || 'Please refresh and try again.'}</p>
  </div>
);

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | NSS KJCOEMR` : 'NSS KJCOEMR';
  }, [title]);
}

// Large page title; each line slides up from behind a mask on mount.
export function PageHead({ title, children, tone = 'light' }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.mask-in', { yPercent: 110, duration: 0.9, ease: 'power4.out', stagger: 0.08 });
      gsap.from('.page-head-sub', { opacity: 0, y: 12, duration: 0.7, delay: 0.35, ease: 'power2.out' });
    },
    { scope: ref }
  );
  return (
    <header ref={ref} className={`page-head ${tone}`}>
      <div className="container">
        <h1 className="mask">
          <span className="mask-in">{title}</span>
        </h1>
        {children && <div className="page-head-sub">{children}</div>}
      </div>
    </header>
  );
}

export const SectionTitle = ({ title, to, linkText }) => (
  <div className="section-title">
    <h2>{title}</h2>
    {to && (
      <Link to={to} className="text-link">
        {linkText}
      </Link>
    )}
  </div>
);

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={`drawer ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  );
}

export function Lightbox({ photos, index, onClose, onIndex }) {
  useEffect(() => {
    if (index === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % photos.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, photos, onClose, onIndex]);
  if (index === null || !photos[index]) return null;
  const p = photos[index];
  return (
    <div className="lightbox" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <button className="lb-btn lb-close" onClick={onClose} aria-label="Close">×</button>
      {photos.length > 1 && (
        <>
          <button className="lb-btn lb-prev" onClick={() => onIndex((index - 1 + photos.length) % photos.length)} aria-label="Previous photo">‹</button>
          <button className="lb-btn lb-next" onClick={() => onIndex((index + 1) % photos.length)} aria-label="Next photo">›</button>
        </>
      )}
      <figure>
        <img src={p.url} alt={p.caption || 'NSS photo'} />
        <figcaption>{p.caption} <span>{index + 1} of {photos.length}</span></figcaption>
      </figure>
    </div>
  );
}
