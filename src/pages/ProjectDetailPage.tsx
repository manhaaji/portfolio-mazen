import { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowLeft, ArrowUpRight, Play, Maximize2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { projects, projectCover, projectSrcSet, projectTexts, ratioOf, type Project } from '../data/projects';
import { Footer } from '../components/Footer';
import type { DeckItem } from '../components/DeckViewer';
import { VideoFrame } from '../components/VideoFrame';
const DeckViewer = lazy(() => import('../components/DeckViewer'));
import { RevealText, Reveal, Magnetic } from '../components/motion/Primitives';
import { Slate } from '../components/motion/EditSuite';
import { prefersReducedMotion } from '../lib/scroll';
import { splitTitle } from '../lib/title';
import { useDelayedPreview, PreviewRing } from '../components/DelayedPreview';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Lays the frames after the cover out by their real shape: wide frames take a
 * full row, upright/square frames pair up side by side (one alone is centred).
 */
function galleryRows(sizes: [number, number][], from: number, count: number) {
  const rows: number[][] = [];
  const upright = (i: number) => {
    const s = sizes[i];
    return !s || s[0] / s[1] < 1.2;
  };
  for (let i = from; i < count; i++) {
    if (upright(i) && i + 1 < count && upright(i + 1)) {
      rows.push([i, i + 1]);
      i++;
    } else rows.push([i]);
  }
  return rows;
}

function NeighbourLink({ project, label, align }: { project: Project; label: string; align: 'start' | 'end' }) {
  const { t } = useLanguage();
  return (
    <Link
      to={`/portfolio/${project.id}`}
      className={`group relative flex-1 min-h-[16rem] md:min-h-[22rem] overflow-hidden flex flex-col justify-end p-6 md:p-10 border-foreground/10 ${align === 'end' ? 'md:border-s text-end items-end' : ''}`}
      data-cursor="View"
    >
      <img
        src={projectCover(project)}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-0 scale-110 group-hover:opacity-100 group-hover:scale-100 transition-all duration-[1.1s] ease-[cubic-bezier(.16,1,.3,1)]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <span className="relative font-oswald text-[11px] tracking-[0.3em] uppercase text-gold mb-3">{label}</span>
      <span className="relative t-h2 text-foreground group-hover:text-white transition-colors duration-500 max-w-xl">
        {t(`portfolio.projects.${project.id}.title`)}
      </span>
      <span className="relative mt-4 text-xs muted-3 group-hover:text-white/60 transition-colors" dir="ltr">
        {project.id} · {t(`portfolio.filters.${project.category}.name`)}
      </span>
    </Link>
  );
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [deck, setDeck] = useState<number | null>(null);
  const closeDeck = useCallback(() => setDeck(null), []);
  const [storyOpen, setStoryOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  useEffect(() => setGalleryOpen(false), [projectId]);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroVideo = useRef<HTMLVideoElement>(null);
  const heroPreview = useDelayedPreview(heroVideo);
  const startHero = heroPreview.start;
  // The page's own video starts after a 2 s beat (with a loading ring), not on arrival.
  useEffect(() => {
    startHero();
  }, [projectId, startHero]);

  const index = projects.findIndex(p => p.id === projectId);
  const project = projects[index];
  const text = project ? projectTexts(language)[project.id] : undefined;

  const images = useMemo(
    () =>
      project
        ? project.oldGallery
          ? [project.oldImage!, ...project.oldGallery]
          : Array.from({ length: project.imagesCount }, (_, i) => `/assets/portfolio/${project.category}/${project.folderName}/${pad(i + 1)}.webp`)
        : [],
    [project],
  );

  const items: DeckItem[] = useMemo(() => {
    if (!project || !text) return [];
    const list: DeckItem[] = images.map((src, i) => ({ type: 'image', src, alt: `${text.title} — ${pad(i + 1)}` }));
    if (project.animationLink) list.unshift({ type: 'video', src: project.animationLink, alt: `${text.title} — motion` });
    return list;
  }, [project, text, images]);
  const videoOffset = project?.animationLink ? 1 : 0;

  // Title + meta per project for sharing and search.
  useEffect(() => {
    if (!text) return;
    const prev = document.title;
    document.title = `${text.title} | Mazen Khaled`;
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute('content');
    meta?.setAttribute('content', text.description);
    return () => {
      document.title = prev;
      if (prevDesc) meta?.setAttribute('content', prevDesc);
    };
  }, [text]);

  // Hero media scales down into place as the page scrolls.
  useEffect(() => {
    if (!heroRef.current || prefersReducedMotion()) return;
    const tw = gsap.fromTo(
      heroRef.current,
      { scale: 0.86, borderRadius: '2rem' },
      { scale: 1, borderRadius: '0rem', ease: 'none', scrollTrigger: { trigger: heroRef.current, start: 'top 90%', end: 'top 15%', scrub: true } },
    );
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, [projectId]);

  if (!project || !text) return <Navigate to="/portfolio" replace />;

  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const paragraphs = (text.details || text.description).split(/\n\s*\n/).filter(Boolean);
  const [lead, ...rest] = paragraphs;
  const storyLong = (text.details || '').length > 380 || rest.length > 0;
  const readMin = Math.max(1, Math.round((text.details || text.description).split(/\s+/).length / 200));

  const meta = [
    { k: 'V1', label: isAr ? 'العميل' : 'Client', value: text.client || '—' },
    { k: 'V2', label: isAr ? 'القسم' : 'Discipline', value: t(`portfolio.filters.${project.category}.name`) },
    { k: 'A1', label: isAr ? 'التاريخ' : 'Date', value: text.date || '—' },
    {
      k: 'A2',
      label: isAr ? 'المحتوى' : 'Deliverables',
      value: `${project.imagesCount} ${isAr ? 'صورة' : project.imagesCount === 1 ? 'frame' : 'frames'}${project.animationLink ? (isAr ? ' + فيديو' : ' + motion') : ''}`,
    },
  ];

  return (
    <main className="min-h-screen">
      {/* ---------- Intro ---------- */}
      <section className="relative pt-32 md:pt-40 pb-14 md:pb-20 overflow-hidden">
        <div className="ambient w-[40rem] h-[40rem] -top-60 end-0 opacity-60" />
        <div className="wrap relative">
          <div className="flex items-center justify-between gap-4 mb-10">
            <Magnetic strength={0.25}>
              <Link to="/portfolio" className="group inline-flex items-center gap-3 text-sm text-foreground/70 hover:text-gold transition-colors">
                <span className="w-10 h-10 rounded-full border border-foreground/15 grid place-items-center group-hover:border-gold group-hover:bg-gold group-hover:text-black transition-all duration-500">
                  <ArrowLeft size={16} className="rtl:rotate-180 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="u-link">{isAr ? 'كل الأعمال' : 'All work'}</span>
              </Link>
            </Magnetic>
            <span className="font-oswald text-[11px] tracking-[0.3em] muted-3" dir="ltr">
              {pad(index + 1)} / {pad(projects.length)}
            </span>
          </div>

          <Slate sc={`02.${pad(index + 1)}`} title={project.id} meta={t(`portfolio.filters.${project.category}.name`)} />

          {/* Title: project name in display caps, the kind of work as a serif line under it */}
          <h1 className="mb-8 md:mb-12 max-w-4xl">
            <span
              className="block font-oswald font-semibold uppercase text-foreground leading-[0.95] tracking-[-0.015em] rtl:font-alexandria rtl:normal-case rtl:leading-tight rtl:font-extrabold"
              style={{ fontSize: isAr ? 'clamp(2rem, 5.2vw, 3.8rem)' : 'clamp(2.3rem, 5.6vw, 4.6rem)' }}
            >
              <RevealText text={splitTitle(text.title)[0]} stagger={0.05} start="top 95%" />
            </span>
            {splitTitle(text.title)[1] && (
              <Reveal delay={0.25}>
                <span className="block t-serif text-gold mt-3 leading-snug" style={{ fontSize: 'clamp(1.2rem, 2.4vw, 2rem)' }}>
                  {splitTitle(text.title)[1]}
                </span>
              </Reveal>
            )}
          </h1>

          <div className="grid lg:grid-cols-12 gap-10 items-end">
            <Reveal className="lg:col-span-5" delay={0.2}>
              <p className="relative ps-5 text-[15px] sm:text-base leading-[1.85] text-foreground/70 max-w-xl before:absolute before:start-0 before:top-1 before:bottom-1 before:w-[2px] before:rounded before:bg-gradient-to-b before:from-gold before:to-gold/0">
                {text.description}
              </p>
            </Reveal>
            {/* Timeline-style metadata tracks */}
            <Reveal className="lg:col-span-7" delay={0.3}>
              <dl className="grid grid-cols-2 md:grid-cols-4 border-t border-foreground/10">
                {meta.map((m, i) => (
                  <div key={m.k} className={`py-5 pe-4 ${i > 0 ? 'md:border-s md:ps-5' : ''} ${i % 2 ? 'border-s ps-4 md:ps-5' : ''} ${i > 1 ? 'border-t md:border-t-0' : ''} border-foreground/10`}>
                    <dt className="flex items-center gap-2 font-oswald text-[10px] tracking-[0.25em] uppercase muted-3 mb-2">
                      <span className="text-gold">{m.k}</span> {m.label}
                    </dt>
                    <dd className="text-sm text-foreground leading-snug">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Hero media ---------- */}
      {project.animationLink && (project.videoKind === 'reel' || project.videoKind === 'film') ? (
        <section className="wrap max-w-[1280px]">
          {project.videoKind === 'reel' ? (
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5 md:order-2">
                <VideoFrame src={project.animationLink} poster={projectCover(project)} kind="reel" title={text.title} isAr={isAr} />
              </div>
              <button type="button" onClick={() => setDeck(videoOffset)} data-cursor="View" className="md:col-span-7 pro-frame group text-start">
                <div className="pro-frame-bar" dir="ltr">
                  <span className="flex gap-1.5"><i /><i /><i /></span>
                  <span className="truncate">{project.id} — COVER</span>
                  <span className="opacity-50">{project.imagesCount} FR</span>
                </div>
                <div className="pro-frame-media relative bg-card overflow-hidden" style={{ aspectRatio: ratioOf(project) }}>
                  <img src={projectCover(project)} srcSet={projectSrcSet(project, 0)} sizes="(min-width: 768px) 60vw, 100vw" alt={text.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                </div>
              </button>
            </div>
          ) : (
            <VideoFrame src={project.animationLink} poster={projectCover(project)} kind="film" title={`${project.id} — ${text.title}`} isAr={isAr} />
          )}
        </section>
      ) : (
      <section className="wrap max-w-[1280px]">
        <div
          ref={heroRef}
          className="pro-frame origin-top will-change-transform mx-auto"
          // An upright cover stays whole on screen instead of running past the fold.
          style={{ width: `min(100%, calc(80svh * ${(project.sizes[0]?.[0] || 16) / (project.sizes[0]?.[1] || 9)}))` }}
        >
          <div className="pro-frame-bar" dir="ltr">
            <span className="flex gap-1.5"><i /><i /><i /></span>
            <span className="truncate">{project.id} — {text.title}</span>
            {project.animationLink ? <span className="pro-rec">● REC</span> : <span className="opacity-50">{project.imagesCount} FR</span>}
          </div>
          <button
            type="button"
            onClick={() => setDeck(0)}
            className="pro-frame-media group block w-full relative bg-card overflow-hidden"
            style={{ aspectRatio: ratioOf(project) }}
            data-cursor={project.animationLink ? 'Play' : 'View'}
            aria-label={isAr ? 'افتح العرض' : 'Open viewer'}
          >
            <img src={projectCover(project)} srcSet={projectSrcSet(project, 0)} sizes="(min-width: 1280px) 1280px, 100vw" alt={text.title} className="absolute inset-0 w-full h-full object-cover" />
            {project.animationLink && (
              <>
                <video
                  ref={heroVideo}
                  src={project.animationLink}
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className={`absolute inset-0 w-full h-full object-contain bg-black transition-opacity duration-1000 ${heroPreview.state === 'playing' ? 'opacity-100' : 'opacity-0'}`}
                />
                <PreviewRing state={heroPreview.state} label={isAr ? 'تحميل' : 'Loading'} />
              </>
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <span className="absolute bottom-5 start-5 md:bottom-8 md:start-8 flex items-center gap-3 text-white text-sm">
              <span className="w-12 h-12 rounded-full bg-gold text-black grid place-items-center group-hover:scale-110 transition-transform duration-500">
                {project.animationLink ? <Play size={16} className="fill-current ms-0.5" /> : <Maximize2 size={16} />}
              </span>
              {project.animationLink ? (isAr ? 'شغّل بالصوت' : 'Play with sound') : isAr ? 'عرض كامل' : 'View full screen'}
            </span>
          </button>
        </div>
      </section>
      )}

      {/* ---------- Extra videos (added in Mazen Studio) ---------- */}
      {project.videos && project.videos.length > 0 && (
        <section className="section pb-0">
          <div className="wrap max-w-[1280px]">
            <p className="eyebrow mb-6">{isAr ? 'فيديوهات المشروع' : 'Project films'}</p>
            <div className="grid gap-8 md:grid-cols-2 items-start">
              {project.videos.map((v, i) => (
                <div key={v.src + i} className={v.kind === 'film' ? 'md:col-span-2' : ''}>
                  <VideoFrame src={v.src} poster={v.poster} kind={v.kind} title={`${project.id} — ${pad(i + 1)}`} isAr={isAr} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Story: a framed brief, readable length, expandable ---------- */}
      <section className="section">
        <div className="wrap max-w-[1180px] grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <aside className="lg:col-span-4 lg:sticky lg:top-32 space-y-8">
            <div>
              <p className="eyebrow mb-3">{isAr ? 'الخدمات' : 'Services'}</p>
              <ul className="flex flex-wrap gap-2">
                {(text.services || []).map(s => (
                  <li key={s} className="text-xs px-3 py-1.5 rounded-full border border-foreground/12 muted-2">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            {text.liveUrl && (
              <Magnetic>
                <a href={text.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
                  <span className="btn-icon">
                    <ArrowUpRight size={14} className="rtl:-scale-x-100" />
                  </span>
                  {t('portfolio.projectDetails.viewLive')}
                </a>
              </Magnetic>
            )}
          </aside>

          <Reveal className="lg:col-span-8">
            <article className="g-border relative rounded-2xl bg-card/60 backdrop-blur-sm p-6 sm:p-8 md:p-10 overflow-hidden">
              <span className="absolute -top-16 -end-16 w-48 h-48 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
              <header className="flex items-center justify-between gap-4 mb-6 pb-5 border-b border-foreground/10">
                <span className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full grid place-items-center bg-gold/15 text-gold font-serif text-xl leading-none">&ldquo;</span>
                  <span className="eyebrow">{isAr ? 'قصة المشروع' : 'The Story'}</span>
                </span>
                <span className="font-oswald text-[10px] tracking-[0.25em] muted-3 uppercase" dir="ltr">
                  {readMin} min read
                </span>
              </header>
              <div
                className={`relative overflow-hidden transition-[max-height] duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${storyOpen || !storyLong ? 'max-h-[3000px]' : 'max-h-[15rem] sm:max-h-[13rem]'}`}
              >
                <p className="text-[17px] sm:text-lg leading-[1.9] text-foreground/90 font-medium mb-5">{lead}</p>
                {rest.map((para, i) => (
                  <p key={i} className="text-[15px] sm:text-base leading-[1.95] muted-2 mb-5">
                    {para}
                  </p>
                ))}
                {!storyOpen && storyLong && (
                  <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgb(var(--card-rgb))] to-transparent pointer-events-none" />
                )}
              </div>
              {storyLong && (
                <button
                  onClick={() => setStoryOpen(o => !o)}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-gold hover:gap-3 transition-all"
                  aria-expanded={storyOpen}
                >
                  {storyOpen ? (isAr ? 'اقفل' : 'Show less') : isAr ? 'اقرأ القصة كاملة' : 'Read the full story'}
                  <ArrowUpRight size={14} className={`transition-transform duration-500 ${storyOpen ? '-rotate-45' : 'rotate-[135deg]'}`} />
                </button>
              )}
            </article>
          </Reveal>
        </div>
      </section>

      {/* ---------- Gallery: every frame after the cover at its own shape ---------- */}
      {images.length > 1 && !project.oldGallery && (
        <section id="gallery" className="pb-24 md:pb-32 scroll-mt-28">
          <div className="wrap max-w-[1180px]">
            <div className="flex items-end justify-between gap-6 mb-8 md:mb-12 border-b border-foreground/10 pb-5">
              <h2 className="t-h2 text-foreground">{t('portfolio.projectDetails.projectGallery')}</h2>
              <span className="font-oswald text-[11px] tracking-[0.3em] muted-3" dir="ltr">
                {pad(images.length - 1)} FRAMES
              </span>
            </div>

            {!galleryOpen ? (
              <Reveal>
                <button
                  type="button"
                  onClick={() => setGalleryOpen(true)}
                  className="group relative w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-card/40 ring-1 ring-foreground/10 hover:ring-gold/50 transition-all duration-500"
                  data-cursor="Open"
                  aria-expanded={false}
                >
                  <span className="absolute inset-0 flex items-center justify-center">
                    {images.slice(1, 6).map((src, k, arr) => {
                      const off = k - (arr.length - 1) / 2;
                      return (
                        <img
                          key={src}
                          src={src.replace(/\/(\d\d)\.webp$/, '/thumbs/$1.webp')}
                          alt=""
                          loading="lazy"
                          className="peek-card absolute h-[72%] w-auto rounded-md shadow-xl opacity-50 group-hover:opacity-90"
                          style={{ ['--off' as string]: off, zIndex: 10 - Math.round(Math.abs(off)) }}
                        />
                      );
                    })}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                  <span className="relative z-20 h-full flex flex-col items-center justify-end pb-5 gap-1.5">
                    <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-black text-sm font-semibold shadow-lg group-hover:scale-105 transition-transform duration-500">
                      {isAr ? `عرض كل الصور (${images.length - 1})` : `View all frames (${images.length - 1})`}
                      <ArrowUpRight size={15} className="rotate-90 rtl:-scale-x-100" />
                    </span>
                  </span>
                </button>
              </Reveal>
            ) : (
            <div className="flex flex-col gap-4 md:gap-6">
              {galleryRows(project.sizes, 1, images.length).map((row, ri) => (
                <div key={row[0]} className={`grid gap-4 md:gap-6 ${row.length === 2 ? 'sm:grid-cols-2' : ''}`}>
                  {row.map(i => {
                    const [w, h] = project.sizes[i] || [4, 5];
                    const lone = row.length === 1 && w / h < 1.2;
                    return (
                      <Reveal key={i} y={40} delay={Math.min(ri, 3) * 0.08}>
                        <button
                          type="button"
                          onClick={() => setDeck(i + videoOffset)}
                          className="group relative block w-full mx-auto overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10 hover:ring-gold/50 transition-[box-shadow] duration-500"
                          // A lone upright frame stays fully on screen.
                          style={{ aspectRatio: `${w} / ${h}`, maxWidth: lone ? `min(100%, calc(85svh * ${(w / h).toFixed(3)}))` : undefined }}
                          data-cursor="View"
                          aria-label={`${text.title} — ${pad(i + 1)}`}
                        >
                          <img
                            src={images[i]}
                            srcSet={projectSrcSet(project, i)}
                            sizes={row.length === 2 ? '(min-width: 640px) 590px, 100vw' : '(min-width: 1180px) 1180px, 100vw'}
                            alt={`${text.title} — ${pad(i + 1)}`}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.015]"
                          />
                          <span className="absolute top-3 start-3 font-oswald text-[10px] tracking-[0.25em] text-white/85 bg-black/45 backdrop-blur px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity" dir="ltr">
                            {pad(i + 1)}
                          </span>
                        </button>
                      </Reveal>
                    );
                  })}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setGalleryOpen(false);
                  document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="mx-auto mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-foreground/15 text-sm muted-2 hover:text-gold hover:border-gold/60 transition-colors"
              >
                {isAr ? 'اقفل الصور' : 'Collapse frames'}
                <ArrowUpRight size={14} className="-rotate-45 rtl:rotate-[-135deg]" />
              </button>
            </div>
            )}
          </div>
        </section>
      )}

      {/* ---------- Prev / Next ---------- */}
      {projects.length > 1 && (
        <section className="border-t border-foreground/10">
          <div className="flex flex-col md:flex-row">
            {prev.id !== next.id && <NeighbourLink project={prev} label={isAr ? 'المشروع السابق' : 'Previous scene'} align="start" />}
            <NeighbourLink project={next} label={isAr ? 'المشروع التالي' : 'Next scene'} align="end" />
          </div>
        </section>
      )}

      <Footer />
      {deck !== null && (
        <Suspense fallback={null}>
          <DeckViewer items={items} start={deck} title={text.title} rtl={isAr} onClose={closeDeck} />
        </Suspense>
      )}
    </main>
  );
}
