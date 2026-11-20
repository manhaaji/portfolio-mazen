import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../../lib/scroll';

gsap.registerPlugin(ScrollTrigger);

/** "01 — About" section index with a line that draws in. */
export function SectionLabel({ num, children, className = '' }: { num: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true } });
    tl.from(ref.current.querySelector('.bar'), { scaleX: 0, duration: 1, ease: 'expo.out' })
      .from(ref.current.querySelectorAll('.num, .eyebrow'), { opacity: 0, y: 10, duration: 0.7, stagger: 0.08 }, 0.15);
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);
  return (
    <div ref={ref} className={`sec-label ${className}`}>
      <span className="num">{num}</span>
      <span className="bar" />
      <span className="eyebrow">{children}</span>
    </div>
  );
}

/** Image / video that wipes in with clip-path and settles from a slight zoom. */
export function ClipMedia({
  children,
  className = '',
  from = 'bottom',
  parallax = 0,
}: {
  children: ReactNode;
  className?: string;
  from?: 'bottom' | 'left' | 'right' | 'center';
  parallax?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const media = el.querySelectorAll('img, video');
    if (prefersReducedMotion()) {
      el.style.clipPath = 'none';
      gsap.set(media, { scale: 1 });
      return;
    }
    const start = {
      bottom: 'inset(100% 0% 0% 0%)',
      left: 'inset(0% 100% 0% 0%)',
      right: 'inset(0% 0% 0% 100%)',
      center: 'inset(50% 50% 50% 50%)',
    }[from];
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    tl.fromTo(el, { clipPath: start }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'expo.inOut' })
      .fromTo(media, { scale: 1.18 }, { scale: 1, duration: 1.2, ease: 'expo.out' }, 0.1);
    let st: ScrollTrigger | undefined;
    if (parallax) {
      st = ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: s => gsap.set(media, { yPercent: (s.progress - 0.5) * parallax }),
      });
    }
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      st?.kill();
    };
  }, [from, parallax]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`} style={{ clipPath: 'inset(100% 0% 0% 0%)' }}>
      {children}
    </div>
  );
}

/** Number that counts up once when it scrolls into view. */
export function Counter({ value, suffix = '', className = '' }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(prefersReducedMotion() ? value : 0);
  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const obj = { v: 0 };
    const tw = gsap.to(obj, {
      v: value,
      duration: 1.6,
      ease: 'expo.out',
      onUpdate: () => setShown(Math.round(obj.v)),
      scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
    });
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, [value]);
  return (
    <span ref={ref} className={className}>
      {shown.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}

/**
 * Paragraph whose words light up one by one as the reader scrolls through it.
 * Words wrapped in *asterisks* light up in gold.
 */
export function ScrollHighlight({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(/\s+/);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = [...el.querySelectorAll<HTMLSpanElement>('.hl-word')];
    if (prefersReducedMotion()) {
      spans.forEach(s => s.classList.add('on'));
      return;
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      end: 'bottom 45%',
      scrub: true,
      onUpdate: self => {
        const n = Math.round(self.progress * spans.length);
        spans.forEach((s, i) => s.classList.toggle('on', i < n));
      },
    });
    return () => st.kill();
  }, [text]);
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => {
        const gold = /^\*.*\*[.,،]?$/.test(w);
        return (
          <span key={i} className={`hl-word ${gold ? 'gold t-serif' : ''}`}>
            {gold ? w.replace(/\*/g, '') : w}{' '}
          </span>
        );
      })}
    </p>
  );
}
