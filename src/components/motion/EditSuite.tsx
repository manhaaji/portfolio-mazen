import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { prefersReducedMotion } from '../../lib/scroll';

gsap.registerPlugin(ScrollTrigger);

/**
 * The site's signature: an edit-suite HUD. A timecode runs with the scroll
 * position (as if scrubbing a timeline), next to the current "scene" name.
 */
const FPS = 25;
const SCENES: Record<string, { en: string; ar: string; sc: string }> = {
  hero: { en: 'Opening', ar: 'الافتتاح', sc: '00' },
  about: { en: 'About', ar: 'عني', sc: '01' },
  portfolio: { en: 'Selected Work', ar: 'الأعمال', sc: '02' },
  services: { en: 'Services', ar: 'الخدمات', sc: '03' },
  contact: { en: 'Contact', ar: 'تواصل', sc: '04' },
};

export function TimecodeHUD() {
  const tc = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [scene, setScene] = useState('hero');
  const { language } = useLanguage();
  const { pathname } = useLocation();

  useEffect(() => {
    // ~2 min of "footage" mapped onto the full page.
    const total = 2 * 60 * FPS;
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: self => {
        const f = Math.round(self.progress * total);
        const s = Math.floor(f / FPS);
        const pad = (n: number) => String(n).padStart(2, '0');
        if (tc.current) tc.current.textContent = `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(f % FPS)}`;
        if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
      },
    });
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setScene(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    const timer = setTimeout(() => Object.keys(SCENES).forEach(id => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }), 600);
    return () => {
      st.kill();
      io.disconnect();
      clearTimeout(timer);
    };
  }, [pathname]);

  if (pathname !== '/') return null;
  const onHero = scene === 'hero';
  const s = SCENES[scene] || SCENES.hero;
  return (
    <div className={`fixed bottom-5 start-5 z-40 hidden md:flex items-center gap-3 px-3.5 py-2 rounded-full bg-[#0b0b0b]/90 border border-white/10 text-[11px] font-oswald tracking-[0.18em] text-foreground/70 pointer-events-none transition-all duration-700 ${onHero ? 'opacity-0 translate-y-4' : 'opacity-100'}`} dir="ltr" aria-hidden>
      <span className="flex items-center gap-1.5 text-red-500">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> REC
      </span>
      <span className="w-px h-3 bg-foreground/20" />
      <span ref={tc} className="tabular-nums text-foreground">00:00:00:00</span>
      <span className="relative w-16 h-[2px] bg-foreground/15 overflow-hidden rounded">
        <span ref={bar} className="absolute inset-0 bg-gold origin-left" style={{ transform: 'scaleX(0)' }} />
      </span>
      <span className="text-gold">SC.{s.sc}</span>
      <span className="uppercase">{language === 'ar' ? s.ar : s.en}</span>
    </div>
  );
}

/** Viewfinder crop marks around a piece of media. */
export function Frame({ children, className = '', label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div className={`frame relative ${className}`}>
      <span className="fm fm-tl" aria-hidden />
      <span className="fm fm-tr" aria-hidden />
      <span className="fm fm-bl" aria-hidden />
      <span className="fm fm-br" aria-hidden />
      {label && (
        <span className="absolute -top-6 start-0 font-oswald text-[10px] tracking-[0.3em] text-foreground/45 uppercase" dir="ltr">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

/** "SC.02 — Selected Work" scene slate used as each section's opener. */
export function Slate({ sc, title, meta }: { sc: string; title: string; meta?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true } });
    tl.from(ref.current.querySelector('.slate-line'), { scaleX: 0, duration: 1.4, ease: 'expo.inOut' })
      .from(ref.current.querySelectorAll('.slate-item'), { yPercent: 120, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 0.3);
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);
  return (
    <div ref={ref} className="relative mb-12 md:mb-20">
      <div className="flex items-end justify-between gap-6 pb-4 font-oswald text-[11px] tracking-[0.3em] uppercase">
        <span className="overflow-hidden flex gap-4">
          <span className="slate-item inline-block text-gold">SC.{sc}</span>
          <span className="slate-item inline-block text-foreground/80">{title}</span>
        </span>
        {meta && (
          <span className="overflow-hidden hidden sm:block">
            <span className="slate-item inline-block text-foreground/40" dir="ltr">{meta}</span>
          </span>
        )}
      </div>
      <div className="slate-line h-px bg-foreground/15 origin-left rtl:origin-right" />
    </div>
  );
}
