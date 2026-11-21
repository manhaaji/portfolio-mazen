import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { projects, projectCover, projectSrcSet, projectTexts, type Project } from '../data/projects';
import { Magnetic } from '../components/motion/Primitives';
import { useDelayedPreview, useInViewPreview, PreviewRing } from '../components/DelayedPreview';
import { prefersReducedMotion } from '../lib/scroll';
import { splitTitle } from '../lib/title';

gsap.registerPlugin(ScrollTrigger);

const HOME_LIMIT = 6;
const pad = (n: number) => String(n).padStart(2, '0');

/** One project on the reel: a big frame with the title laid across it. */
function ReelPanel({ project, index, total }: { project: Project; index: number; total: number }) {
  const { t, language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const preview = useDelayedPreview(videoRef);
  useInViewPreview(mediaRef, preview, !!project.animationLink);
  const title = t(`portfolio.projects.${project.id}.title`);
  const services = projectTexts(language)[project.id]?.services || [];
  const [cw, ch] = project.sizes[0] || [16, 9];
  const r = cw / ch;

  return (
    <Link
      to={`/portfolio/${project.id}`}
      className="reel-panel group relative shrink-0 block snap-center"
      // The frame keeps the cover's own shape; it is as wide as the screen allows without getting taller than ~half of it.
      style={{ width: `min(86vw, 760px, calc(46svh * ${r}))` }}
      data-cursor={project.animationLink ? 'Play' : 'View'}
      onPointerEnter={() => project.animationLink && preview.start()}
      onPointerLeave={preview.stop}
    >
      <div className="flex items-baseline justify-between gap-4 mb-4 font-oswald text-[11px] tracking-[0.3em] uppercase">
        <span className="text-gold" dir="ltr">
          {pad(index + 1)} / {pad(total)}
        </span>
        <span className="muted-3">{t(`portfolio.filters.${project.category}.name`)}</span>
      </div>
      <div className="pro-frame">
        <div className="pro-frame-bar" dir="ltr">
          <span className="flex gap-1.5"><i /><i /><i /></span>
          <span className="truncate">{project.id} · {project.animationLink ? 'MOTION + STILLS' : 'STILLS'}</span>
          {project.animationLink ? <span className="pro-rec">● REC</span> : <span className="opacity-50">{project.imagesCount} FR</span>}
        </div>
        <div ref={mediaRef} className="pro-frame-media relative overflow-hidden bg-card" style={{ aspectRatio: `${cw} / ${ch}` }}>
          <img
            src={projectCover(project)}
            srcSet={projectSrcSet(project, 0)}
            sizes="(min-width: 768px) 760px, 86vw"
            alt={title}
            loading="lazy"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover transition-[filter,transform] duration-700 group-hover:brightness-110 group-hover:scale-[1.02]"
          />
          {project.animationLink && (
            <video
              ref={videoRef}
              src={project.animationLink}
              muted
              loop
              playsInline
              preload="none"
              className={`absolute inset-0 w-full h-full object-contain bg-black transition-opacity duration-700 ${preview.state === 'playing' ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
          <PreviewRing state={preview.state} label={language === 'ar' ? 'معاينة' : 'Preview'} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8 flex items-end justify-between gap-6">
            <h3 className="text-white max-w-[24ch]">
              <span className="block font-oswald font-semibold uppercase leading-[0.95] text-[clamp(1.35rem,3vw,2.9rem)] tracking-[-0.01em] rtl:font-alexandria rtl:normal-case rtl:leading-tight rtl:text-[clamp(1.2rem,2.4vw,2.3rem)]">
                {splitTitle(title)[0]}
              </span>
              {splitTitle(title)[1] && <span className="block t-serif text-[#D4AF37] text-[clamp(0.95rem,1.5vw,1.35rem)] mt-1.5 leading-snug">{splitTitle(title)[1]}</span>}
            </h3>
            <span className="shrink-0 w-14 h-14 rounded-full bg-gold text-black grid place-items-center scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500">
              {project.animationLink ? <Play size={18} className="fill-current ms-0.5" /> : <ArrowUpRight size={20} className="rtl:-scale-x-100" />}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-5 grid sm:grid-cols-[1fr_auto] gap-4 items-start">
        <p className="muted-2 text-sm leading-relaxed max-w-xl line-clamp-2">{t(`portfolio.projects.${project.id}.description`)}</p>
        <ul className="flex flex-wrap gap-1.5 sm:justify-end">
          {services.slice(0, 3).map(s => (
            <li key={s} className="text-[11px] px-2.5 py-1 rounded-full border border-foreground/12 muted-2 whitespace-nowrap">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}

/**
 * Selected work as a reel: on desktop the section pins and the projects run
 * past horizontally (leaning with scroll speed); on touch screens it stacks.
 */
export function Portfolio() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const list = projects.slice(0, HOME_LIMIT);
  const [staticReel] = useState(() => prefersReducedMotion());

  // Phones/tablets: the reel is a native side-swipe strip; its progress line follows the swipe.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (progress.current && max > 0) progress.current.style.transform = `scaleX(${Math.abs(el.scrollLeft) / max})`;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!section.current || !track.current || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    // Scroll-driven pinned reel only where there is a mouse and room for it.
    mm.add('(min-width: 768px) and (hover: hover)', () => {
      const el = track.current!;
      const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);
      const dir = isAr ? 1 : -1;
      const skewTo = gsap.quickTo(el, 'skewX', { duration: 0.6, ease: 'power3' });
      const tween = gsap.to(el, {
        x: () => dir * distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: self => {
            skewTo(gsap.utils.clamp(-6, 6, (self.getVelocity() / -400) * -dir));
            if (progress.current) progress.current.style.transform = `scaleX(${self.progress})`;
          },
          onLeave: () => skewTo(0),
          onLeaveBack: () => skewTo(0),
        },
      });
      return () => tween.scrollTrigger?.kill();
    });
    return () => mm.revert();
  }, [isAr]);

  return (
    <section id="portfolio" ref={section} className={`relative overflow-hidden bg-background ${staticReel ? 'reel-static' : ''}`}>
      <div className="py-20 md:py-0 md:h-[100svh] flex flex-col justify-center">
        <div
          ref={track}
          className="reel-track flex flex-row items-center gap-5 md:gap-[5vw] px-[clamp(1.1rem,4vw,3.5rem)] md:pe-[12vw]"
        >
          {/* Intro card */}
          <div className="shrink-0 w-[78vw] sm:w-[52vw] lg:w-[30vw] max-w-xl snap-start">
            <p className="font-oswald text-[11px] tracking-[0.3em] uppercase text-gold mb-6">SC.02 — {isAr ? 'أعمال مختارة' : 'Selected Work'}</p>
            <h2 className="t-h1 text-foreground mb-6" style={{ fontSize: 'clamp(2.4rem, 4.4vw, 4.6rem)' }}>
              {isAr ? <>أعمال <span className="t-serif text-gold">مختارة</span></> : <>Selected <span className="t-serif text-gold">work</span></>}
              <sup className="font-oswald text-gold text-[0.28em] align-top ms-3">({pad(projects.length)})</sup>
            </h2>
            <p className="muted-2 leading-relaxed mb-8">{t('portfolio.subtitle')}</p>
            <p className="reel-hint-scroll items-center gap-3 text-xs muted-3 tracking-[0.2em] uppercase">
              <span className="w-10 h-px bg-gold" /> {isAr ? 'كمّل سكرول — الشريط بيتحرك' : 'Keep scrolling — the reel runs'}
            </p>
            <p className="reel-hint-swipe items-center gap-3 text-xs text-gold tracking-[0.2em] uppercase">
              <span className="swipe-hint inline-block">{isAr ? '←' : '→'}</span> {isAr ? 'اسحب للشمال عشان تشوف الشغل' : 'Swipe to see the work'}
            </p>
          </div>

          {list.map((p, i) => (
            <ReelPanel key={p.id} project={p} index={i} total={list.length} />
          ))}

          {/* Outro card */}
          <div className="shrink-0 w-[70vw] sm:w-[44vw] lg:w-[28vw] flex flex-col items-start gap-6 snap-center">
            <p className="t-h2 text-foreground max-w-xs">{isAr ? 'شغل أكتر في الهوية والموشن والفيديو.' : 'More work in branding, motion and film.'}</p>
            <Magnetic>
              <Link to="/portfolio" className="btn btn-gold">
                <span className="btn-icon">
                  <ArrowUpRight size={14} className="rtl:-scale-x-100" />
                </span>
                {t('portfolio.viewAll')}
              </Link>
            </Magnetic>
          </div>
        </div>

        {/* Reel progress */}
        <div className="flex mt-8 md:mt-0 md:absolute md:bottom-8 inset-x-0 justify-center pointer-events-none">
          <span className="relative w-48 h-px bg-foreground/15 overflow-hidden">
            <span ref={progress} className="absolute inset-0 bg-gold origin-left rtl:origin-right" style={{ transform: 'scaleX(0)' }} />
          </span>
        </div>
      </div>
    </section>
  );
}
