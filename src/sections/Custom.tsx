import { lazy, Suspense, useState } from 'react';
import { ArrowUpRight, Maximize2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Slate } from '../components/motion/EditSuite';
import { Reveal, Magnetic } from '../components/motion/Primitives';
import { VideoFrame } from '../components/VideoFrame';
import type { DeckItem } from '../components/DeckViewer';
import { pick, type CustomSection } from '../data/content';

const DeckViewer = lazy(() => import('../components/DeckViewer'));

/** Sections the owner adds from Mazen Studio: gallery, video, text, call-to-action. */
export function CustomSectionView({ section, index }: { section: CustomSection; index: number }) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const title = pick(section.title, language);
  const subtitle = pick(section.subtitle, language);
  const body = pick(section.body, language);
  const label = pick(section.label, language) || title;
  const sc = String(index).padStart(2, '0');

  const head = (
    <>
      {label && <Slate sc={sc} title={label} />}
      {title && (
        <Reveal>
          <h2 className="font-oswald font-semibold uppercase text-foreground leading-[0.95] tracking-[-0.015em] rtl:font-alexandria rtl:normal-case rtl:font-extrabold max-w-4xl" style={{ fontSize: 'clamp(2rem, 5vw, 4.2rem)' }}>
            {title}
          </h2>
        </Reveal>
      )}
      {subtitle && (
        <Reveal delay={0.1}>
          <p className="t-serif text-gold mt-3 text-xl sm:text-2xl">{subtitle}</p>
        </Reveal>
      )}
      {body && section.type !== 'text' && (
        <Reveal delay={0.15}>
          <p className="muted-2 mt-6 max-w-2xl leading-[1.85] text-[15px] sm:text-base whitespace-pre-line">{body}</p>
        </Reveal>
      )}
    </>
  );

  return (
    <section id={section.id} className="section overflow-hidden">
      <div className="wrap relative max-w-[1240px]">
        {section.type === 'gallery' && <Gallery section={section} head={head} isAr={isAr} title={title} />}
        {section.type === 'video' && (
          <div className={section.video?.kind === 'reel' ? 'grid lg:grid-cols-12 gap-10 lg:gap-16 items-center' : ''}>
            <div className={section.video?.kind === 'reel' ? 'lg:col-span-6' : 'mb-10'}>{head}</div>
            {section.video?.src && (
              <Reveal className={section.video.kind === 'reel' ? 'lg:col-span-6' : ''}>
                <VideoFrame src={section.video.src} poster={section.video.poster} kind={section.video.kind} title={title} isAr={isAr} />
              </Reveal>
            )}
          </div>
        )}
        {section.type === 'text' && (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">{head}</div>
            {body && (
              <Reveal className="lg:col-span-7" delay={0.1}>
                <p className="text-[1.15rem] sm:text-[1.35rem] leading-[1.7] text-foreground/85 whitespace-pre-line">{body}</p>
              </Reveal>
            )}
          </div>
        )}
        {section.type === 'cta' && (
          <div className="g-border rounded-[2rem] p-8 sm:p-14 text-center flex flex-col items-center">
            {title && <h2 className="font-oswald font-semibold uppercase text-foreground rtl:font-alexandria rtl:normal-case" style={{ fontSize: 'clamp(1.8rem, 4.4vw, 3.6rem)' }}>{title}</h2>}
            {subtitle && <p className="t-serif text-gold mt-2 text-xl">{subtitle}</p>}
            {body && <p className="muted-2 mt-5 max-w-xl leading-relaxed whitespace-pre-line">{body}</p>}
            {section.button?.url && (
              <Magnetic className="mt-8">
                <a href={section.button.url} target={section.button.url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="btn btn-gold">
                  {pick(section.button.label, language) || (isAr ? 'تواصل معايا' : "Let's talk")}
                  <ArrowUpRight size={16} className="rtl:-scale-x-100" />
                </a>
              </Magnetic>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Gallery({ section, head, isAr, title }: { section: CustomSection; head: React.ReactNode; isAr: boolean; title: string }) {
  const [deck, setDeck] = useState<number | null>(null);
  const images = section.images || [];
  const items: DeckItem[] = images.map((im, i) => ({ type: 'image', src: im.src, alt: `${title} — ${i + 1}` }));
  const layout = section.layout || 'masonry';

  return (
    <>
      <div className="mb-10">{head}</div>
      {layout === 'strip' ? (
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 [scrollbar-width:thin]">
          {images.map((im, i) => (
            <button key={im.src + i} type="button" onClick={() => setDeck(i)} data-cursor="View" className="snap-start shrink-0 w-[72vw] sm:w-[40vw] lg:w-[30vw] rounded-2xl overflow-hidden border border-foreground/10 bg-card group">
              <img src={im.thumb || im.src} alt="" loading="lazy" width={im.w} height={im.h} className="w-full h-auto group-hover:scale-[1.03] transition-transform duration-700" />
            </button>
          ))}
        </div>
      ) : (
        <div className={layout === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4' : 'columns-2 lg:columns-3 gap-3 sm:gap-4 [&>*]:mb-3 sm:[&>*]:mb-4'}>
          {images.map((im, i) => (
            <Reveal key={im.src + i} delay={(i % 3) * 0.05}>
              <button type="button" onClick={() => setDeck(i)} data-cursor="View" className={`relative block w-full rounded-2xl overflow-hidden border border-foreground/10 bg-card group break-inside-avoid ${layout === 'grid' ? 'aspect-square' : ''}`}>
                <img src={im.thumb || im.src} alt="" loading="lazy" width={im.w} height={im.h} className={`w-full ${layout === 'grid' ? 'h-full object-cover' : 'h-auto'} group-hover:scale-[1.03] transition-transform duration-700`} />
                <span className="absolute top-3 end-3 w-9 h-9 rounded-full bg-black/50 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={14} />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      )}
      {deck !== null && (
        <Suspense fallback={null}>
          <DeckViewer items={items} start={deck} title={title} rtl={isAr} onClose={() => setDeck(null)} />
        </Suspense>
      )}
    </>
  );
}
