import { useEffect, useRef, type ReactNode, type ElementType, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../../lib/scroll';

gsap.registerPlugin(ScrollTrigger);

/**
 * Masked word-by-word reveal on scroll. Splits by words only, so Arabic
 * letters keep their joined shapes.
 */
export function RevealText({
  text,
  as: Tag = 'span',
  className = '',
  delay = 0,
  stagger = 0.06,
  start = 'top 85%',
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const words = ref.current.querySelectorAll('.rw-inner');
    const tween = gsap.fromTo(
      words,
      { yPercent: 110, rotate: 4 },
      {
        yPercent: 0,
        rotate: 0,
        duration: 0.75,
        ease: 'expo.out',
        stagger: stagger * 0.7,
        delay,
        scrollTrigger: { trigger: ref.current, start, once: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [text, delay, stagger, start]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="rw" aria-hidden>
          <span className="rw-inner">{w}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Fade/slide children in when they enter the viewport. */
export function Reveal({
  children,
  className = '',
  y = 40,
  delay = 0,
  style,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const tween = gsap.fromTo(
      ref.current,
      { y: Math.min(y, 24), opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [y, delay]);
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/** Element drifts toward the pointer while hovered (buttons, icons). */
export function Magnetic({ children, strength = 0.35, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength]);
  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}

/** Infinite marquee whose speed and lean react to scroll velocity. */
export function Marquee({ items, reverse = false, className = '' }: { items: string[]; reverse?: boolean; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    const dir = reverse ? 1 : -1;
    let x = 0;
    let boost = 0;
    const half = () => el.scrollWidth / 2;
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        boost = Math.min(Math.abs(self.getVelocity()) / 300, 12);
      },
    });
    const skewTo = gsap.quickTo(el, 'skewX', { duration: 0.5, ease: 'power3' });
    const tick = () => {
      x += dir * (0.6 + boost);
      boost *= 0.92;
      const w = half();
      if (w > 0) {
        if (x <= -w) x += w;
        if (x >= 0) x -= w;
      }
      gsap.set(el, { x });
      skewTo(-dir * boost * 0.8);
    };
    if (reverse) x = -half();
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, [reverse, items]);

  const row = items.map((it, i) => (
    <span key={i} className="marquee-item">
      {it}
      <span className="marquee-star" aria-hidden>✦</span>
    </span>
  ));
  return (
    <div className={`marquee ${className}`} dir="ltr">
      <div ref={track} className="marquee-track">
        {row}
        {row}
      </div>
    </div>
  );
}

/** Thin progress bar showing how far down the page the visitor is. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => gsap.set(bar.current, { scaleX: self.progress }),
    });
    return () => st.kill();
  }, []);
  return <div ref={bar} className="scroll-progress" aria-hidden />;
}
