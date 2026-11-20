import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, ArrowUpRight, MoveHorizontal } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';
import { VideoModal } from '../components/VideoModal';
import { LightTable } from '../components/LightTable';
import { useLanguage } from '../contexts/LanguageContext';
import { Magnetic } from '../components/motion/Primitives';
import { onAppReady, prefersReducedMotion, scrollToId } from '../lib/scroll';
import { SOCIAL, SITE } from '../data/site';

gsap.registerPlugin(ScrollTrigger);

const socials = [
  { href: SOCIAL.instagram, icon: FaInstagram, label: 'Instagram' },
  { href: SOCIAL.facebook, icon: FaFacebookF, label: 'Facebook' },
  { href: SOCIAL.telegram, icon: FaTelegramPlane, label: 'Telegram' },
  { href: SOCIAL.whatsapp, icon: FaWhatsapp, label: 'WhatsApp' },
].filter(s => s.href);

function useCairoClock() {
  const fmt = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Cairo' });
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/**
 * Opening scene: the light table of real frames fills the screen; the name
 * sits on top in difference-blend so it inverts over whatever passes beneath.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [dragged, setDragged] = useState(false);
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const time = useCairoClock();

  const role = t('hero.roles').split(/\s*[·|،,]\s*/).filter(Boolean);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap.set('.hero-char', { yPercent: 110 });
      gsap.set('.hero-fade', { autoAlpha: 0, y: 20 });
      const off = onAppReady(() => {
        const d = reduced ? 0.01 : 1;
        gsap.timeline({ defaults: { ease: 'expo.out' } })
          .to('.hero-char', { yPercent: 0, duration: 0.95 * d, stagger: 0.03 }, 0.15)
          .to('.hero-fade', { autoAlpha: 1, y: 0, duration: 0.6 * d, stagger: 0.05 }, 0.45);
      });
      if (!reduced) {
        // Leaving the table: the name spreads apart and the board recedes.
        const st = { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: true };
        gsap.to('.hero-name-a', { xPercent: -14, ease: 'none', scrollTrigger: st });
        gsap.to('.hero-name-b', { xPercent: 14, ease: 'none', scrollTrigger: { ...st } });
        gsap.to('.hero-board', { scale: 0.9, opacity: 0.25, ease: 'none', scrollTrigger: { ...st } });
      }
      return off;
    }, sectionRef);
    return () => ctx.revert();
  }, [language]);

  const name = (word: string) =>
    [...word].map((c, i) => (
      <span key={i} className="hero-char inline-block will-change-transform">
        {c}
      </span>
    ));

  return (
    <section id="hero" ref={sectionRef} className="relative h-[100svh] min-h-[560px] overflow-hidden bg-background">
      <div className="hero-board absolute inset-0 origin-center">
        <LightTable onHoverTitle={setHovered} onFirstDrag={() => setDragged(true)} />
      </div>
      <div className="lt-vignette absolute inset-0 pointer-events-none" />

      {/* Name */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none" dir="ltr">
        <h1 className="sr-only">Mazen Khaled — {role.join(', ')}</h1>
        {/* Lockup: condensed caps + serif italic — the site's signature pairing */}
        <div className="text-foreground text-center leading-[0.82] [text-shadow:0_8px_60px_rgb(var(--background-rgb)/.9)]" aria-hidden>
          <div className="hero-name-a overflow-hidden font-oswald font-semibold uppercase tracking-[-0.03em]" style={{ fontSize: 'clamp(4rem, 13vw, 13rem)' }}>
            {name('Mazen')}
          </div>
          <div className="hero-name-b overflow-hidden t-serif text-gold -mt-[0.06em] pb-[0.08em]" style={{ fontSize: 'clamp(3.6rem, 11.5vw, 11.5rem)' }}>
            {name('Khaled')}
          </div>
        </div>
        <div className="hero-fade mt-6 flex flex-col items-center gap-3 px-6 text-center" dir={isAr ? 'rtl' : 'ltr'}>
          <p className="text-foreground text-base sm:text-xl max-w-xl leading-snug font-medium [text-shadow:0_4px_30px_rgb(var(--background-rgb))]">
            {t('hero.valueLine')}
          </p>
          <p className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[10px] sm:text-[11px] tracking-[0.32em] uppercase font-oswald text-foreground/60">
            {role.map((r, i) => (
              <span key={r} className="flex items-center gap-3">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-gold" />}
                {r}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* Hovered frame caption */}
      <div className="absolute top-24 sm:top-28 inset-x-0 flex justify-center pointer-events-none px-4">
        <span
          className={`px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border border-foreground/10 text-xs text-foreground transition-all duration-500 ${hovered || !dragged ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
        >
          {hovered ? (
            <>
              <span className="font-oswald text-gold me-2" dir="ltr">{hovered}</span>
              {t(`portfolio.projects.${hovered}.title`)}
            </>
          ) : (
            <span className="flex items-center gap-2">
              <MoveHorizontal size={14} className="text-gold animate-pulse" />
              {t('hero.dragHint')}
            </span>
          )}
        </span>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 inset-x-0 z-10 wrap pb-5 sm:pb-7 pointer-events-none">
        <div className="hero-fade grid grid-cols-2 lg:grid-cols-3 items-end gap-4">
          <div className="hidden lg:flex flex-col gap-2 text-[11px] tracking-[0.2em] uppercase text-foreground/60">
            <span className="flex items-center gap-2" dir="ltr">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400" />
              {SITE.location} — {time}
            </span>
          </div>
          <div className="col-span-2 lg:col-span-1 flex flex-wrap justify-center gap-3 pointer-events-auto">
            <Magnetic>
              <button onClick={() => setIsVideoModalOpen(true)} data-cursor="Play" className="btn btn-gold">
                <span className="btn-icon">
                  <Play size={12} className="fill-current ms-0.5" />
                </span>
                {t('hero.viewShowreel')}
              </button>
            </Magnetic>
            <Magnetic>
              <button onClick={() => scrollToId('portfolio')} className="btn btn-line bg-background/40">
                {t('hero.exploreWork')}
                <ArrowUpRight size={16} className="rtl:-scale-x-100" />
              </button>
            </Magnetic>
          </div>
          <div className="hidden lg:flex justify-end gap-2 pointer-events-auto">
            {socials.map(({ href, icon: Icon, label }) => (
              <Magnetic key={label} strength={0.5}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 flex items-center justify-center border border-foreground/15 rounded-full text-foreground/70 bg-background/40 backdrop-blur-sm hover:border-gold hover:text-black hover:bg-gold transition-all duration-300"
                >
                  <Icon size={13} />
                </a>
              </Magnetic>
            ))}
          </div>
        </div>
      </div>

      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} videoUrl={SITE.showreel} title={t('hero.viewShowreel')} />
    </section>
  );
}
