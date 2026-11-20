import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../../lib/scroll';

const LABELS: Record<string, { en: string; ar: string; icon: string }> = {
  View: { en: 'View', ar: 'شوف', icon: '↗' },
  Open: { en: 'Open', ar: 'افتح', icon: '↗' },
  Play: { en: 'Play', ar: 'تشغيل', icon: '▶' },
  Drag: { en: 'Drag', ar: 'اسحب', icon: '⇆' },
};

/**
 * A crafted pointer: an arrow with a gold edge that sits exactly on the real
 * mouse (no lag, so it never feels slippery), a soft halo that blooms over
 * interactive things, and a contextual pill (View / Play / Drag …).
 * Desktop mice only; touch devices keep their native behaviour.
 */
export function CustomCursor() {
  const arrow = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [enabled] = useState(() => window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion());

  useEffect(() => {
    if (!enabled || !arrow.current || !halo.current || !pill.current) return;
    document.documentElement.classList.add('has-custom-cursor');
    const ax = gsap.quickSetter(arrow.current, 'x', 'px');
    const ay = gsap.quickSetter(arrow.current, 'y', 'px');
    const hx = gsap.quickTo(halo.current, 'x', { duration: 0.18, ease: 'power3' });
    const hy = gsap.quickTo(halo.current, 'y', { duration: 0.18, ease: 'power3' });
    const px = gsap.quickTo(pill.current, 'x', { duration: 0.25, ease: 'power3' });
    const py = gsap.quickTo(pill.current, 'y', { duration: 0.25, ease: 'power3' });

    const move = (e: PointerEvent) => {
      ax(e.clientX);
      ay(e.clientY);
      hx(e.clientX);
      hy(e.clientY);
      px(e.clientX + 22);
      py(e.clientY + 18);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const tagged = t.closest<HTMLElement>('[data-cursor]')?.dataset.cursor || '';
      const interactive = !!t.closest('a, button, [role="button"], input, textarea, select, label');
      setLabel(tagged);
      gsap.to(halo.current, { scale: tagged ? 1.5 : interactive ? 1 : 0, opacity: tagged || interactive ? 1 : 0, duration: 0.3, ease: 'power3.out' });
      gsap.to(arrow.current, { scale: interactive ? 0.9 : 1, duration: 0.2 });
    };
    const down = () => gsap.to(arrow.current, { scale: 0.8, duration: 0.12 });
    const up = () => gsap.to(arrow.current, { scale: 1, duration: 0.2 });
    const hide = () => gsap.to([arrow.current, halo.current, pill.current], { autoAlpha: 0, duration: 0.15 });
    const show = () => gsap.to([arrow.current], { autoAlpha: 1, duration: 0.15 });

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.documentElement.addEventListener('pointerleave', hide);
    document.documentElement.addEventListener('pointerenter', show);
    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.removeEventListener('pointerleave', hide);
      document.documentElement.removeEventListener('pointerenter', show);
    };
  }, [enabled]);

  useEffect(() => {
    if (!pill.current) return;
    gsap.to(pill.current, { autoAlpha: label ? 1 : 0, scale: label ? 1 : 0.8, duration: 0.25, ease: 'power3.out' });
  }, [label]);

  if (!enabled) return null;
  const isAr = document.documentElement.lang === 'ar';
  const info = LABELS[label];
  return (
    <>
      <div ref={halo} className="mc-halo" aria-hidden />
      <div ref={arrow} className="mc-arrow" aria-hidden>
        <svg width="26" height="26" viewBox="0 0 26 26">
          <defs>
            <linearGradient id="mc-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F4D03F" />
              <stop offset=".55" stopColor="#D4AF37" />
              <stop offset="1" stopColor="#B8941F" />
            </linearGradient>
          </defs>
          <path d="M3 2.5 L21.5 11.2 L13.4 13.4 L10.8 21.6 Z" fill="#0b0b0b" stroke="url(#mc-g)" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M6.2 6 L16.8 11 L12.2 12.2 L10.6 17.2 Z" fill="url(#mc-g)" opacity=".9" />
        </svg>
      </div>
      <div ref={pill} className="mc-pill" aria-hidden>
        {info && (
          <>
            <span className="mc-pill-icon">{info.icon}</span>
            {isAr ? info.ar : info.en}
          </>
        )}
      </div>
    </>
  );
}
