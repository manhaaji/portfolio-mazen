import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { EffectCoverflow, Keyboard, A11y, Navigation, Zoom } from 'swiper/modules';
import { ArrowLeft, ArrowRight, MoveHorizontal } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/zoom';
import { getLenis } from '../lib/scroll';

export interface DeckItem {
  type: 'image' | 'video';
  src: string;
  alt: string;
}

/**
 * Full-screen viewer for a project's frames (Swiper, MIT).
 * Desktop: 3D coverflow you drag or arrow through. Phones: edge-to-edge frames
 * that slide like a photo app (pinch or double-tap to zoom). "Back" returns to the page.
 */
export default function DeckViewer({
  items,
  start,
  title,
  rtl,
  onClose,
}: {
  items: DeckItem[];
  start: number;
  title: string;
  rtl: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(start);
  const swiperRef = useRef<SwiperType | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [mobile] = useState(() => window.innerWidth < 768);
  const pad = (n: number) => String(n).padStart(2, '0');

  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    stripRef.current?.querySelector<HTMLElement>(`[data-i="${index}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    // Only the visible slide's video plays.
    document.querySelectorAll<HTMLVideoElement>('.deck video').forEach((v, i) => (i === index ? v.play().catch(() => {}) : v.pause()));
  }, [index]);

  const current = items[index];

  return createPortal(
    <div className="deck fixed inset-0 z-[9000] flex flex-col text-[#f4f1ea] animate-[deckIn_.6s_cubic-bezier(.16,1,.3,1)]" role="dialog" aria-modal="true" aria-label={title} dir={rtl ? 'rtl' : 'ltr'}>
      {/* Backdrop: the current frame, blurred into ambience */}
      <div className="absolute inset-0 bg-[#060606]" />
      {!mobile && current?.type === 'image' && (
        <img key={current.src} src={current.src.replace(/\/(\d\d)\.webp$/, '/thumbs/$1.webp')} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 blur-3xl scale-110" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
      {/* Phones: a thin progress line under the top bar */}
      {mobile && (
        <span className="absolute top-0 inset-x-0 h-[2px] bg-white/10 z-20">
          <span className="block h-full bg-[#D4AF37] transition-[width] duration-300 ease-out" style={{ width: `${((index + 1) / items.length) * 100}%` }} />
        </span>
      )}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between gap-4 px-4 md:px-8 pt-4 md:pt-6">
        <button
          onClick={onClose}
          className="group inline-flex items-center gap-3 h-11 ps-1.5 pe-5 rounded-full bg-white/10 hover:bg-[#D4AF37] hover:text-black border border-white/15 backdrop-blur-md transition-all duration-500"
        >
          <span className="w-8 h-8 rounded-full bg-[#D4AF37] text-black grid place-items-center group-hover:bg-black group-hover:text-[#D4AF37] transition-colors">
            <ArrowLeft size={15} className="rtl:rotate-180 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform" />
          </span>
          <span className="text-sm font-medium">{rtl ? 'رجوع للمشروع' : 'Back to project'}</span>
        </button>
        <div className="text-end min-w-0">
          <p className="font-oswald text-[11px] tracking-[0.3em] text-white/50 truncate max-w-[45vw]" dir="ltr">
            <span className="text-[#D4AF37]">{pad(index + 1)}</span> / {pad(items.length)}
          </p>
          <p className="hidden md:block text-xs text-white/40 truncate max-w-[40vw]">{title}</p>
        </div>
      </div>

      {/* Deck */}
      <div className={`relative z-10 flex-1 min-h-0 flex ${mobile ? 'items-stretch py-3' : 'items-center'}`}>
        {mobile ? (
          <Swiper
            key="phone"
            modules={[Keyboard, A11y, Zoom]}
            slidesPerView={1}
            spaceBetween={14}
            initialSlide={start}
            zoom={{ maxRatio: 3, toggle: true }}
            dir={rtl ? 'rtl' : 'ltr'}
            speed={420}
            resistanceRatio={0.55}
            threshold={6}
            longSwipesRatio={0.22}
            onSwiper={s => (swiperRef.current = s)}
            onSlideChange={s => setIndex(s.activeIndex)}
            className="w-full h-full"
          >
            {items.map((it, i) => (
              <SwiperSlide key={i} className="!h-full">
                {({ isActive }) =>
                  it.type === 'video' ? (
                    <div className="w-full h-full grid place-items-center px-2">
                      <video src={it.src} muted loop playsInline controls={isActive} className="max-h-full max-w-full object-contain rounded-md" />
                    </div>
                  ) : (
                    <div className="swiper-zoom-container">
                      <img
                        src={it.src}
                        alt={it.alt}
                        draggable={false}
                        className="max-h-full max-w-full object-contain select-none"
                        loading={Math.abs(i - start) < 2 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    </div>
                  )
                }
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <Swiper
            key="flow"
            modules={[EffectCoverflow, Keyboard, A11y, Navigation]}
            effect="coverflow"
            grabCursor
            centeredSlides
            slidesPerView="auto"
            initialSlide={start}
            keyboard={{ enabled: true }}
            dir={rtl ? 'rtl' : 'ltr'}
            coverflowEffect={{ rotate: 0, stretch: -40, depth: 220, modifier: 1, scale: 0.86, slideShadows: false }}
            speed={650}
            onSwiper={s => (swiperRef.current = s)}
            onSlideChange={s => setIndex(s.activeIndex)}
            className="w-full"
          >
            {items.map((it, i) => (
              <SwiperSlide key={i} className="!w-[min(62vw,980px)]">
                {({ isActive }) => (
                  <div
                    className={`relative mx-auto overflow-hidden rounded-xl bg-[#111] ring-1 transition-[filter,box-shadow] duration-700 ${
                      isActive ? 'ring-[#D4AF37]/60 shadow-[0_40px_120px_-30px_rgba(212,175,55,.45)]' : 'ring-white/10 brightness-[.35]'
                    }`}
                  >
                    <div className="h-[68vh] grid place-items-center">
                      {it.type === 'video' ? (
                        <video src={it.src} muted loop playsInline controls={isActive} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <img src={it.src} alt={it.alt} draggable={false} className="max-h-full max-w-full object-contain select-none" loading={Math.abs(i - start) < 3 ? 'eager' : 'lazy'} />
                      )}
                    </div>
                    <span className="absolute top-3 start-3 font-oswald text-[10px] tracking-[0.25em] text-white/85 bg-black/50 backdrop-blur px-2 py-1" dir="ltr">
                      {it.type === 'video' ? 'MOTION' : `FRAME ${pad(i + 1)}`}
                    </span>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {!mobile && items.length > 1 && (
          <>
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="Previous"
              className="absolute start-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full grid place-items-center border border-white/15 bg-black/40 backdrop-blur hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] transition-all duration-500"
            >
              <ArrowLeft size={20} className="rtl:rotate-180" />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="Next"
              className="absolute end-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full grid place-items-center border border-white/15 bg-black/40 backdrop-blur hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] transition-all duration-500"
            >
              <ArrowRight size={20} className="rtl:rotate-180" />
            </button>
          </>
        )}
      </div>

      {/* Hint + filmstrip */}
      <div className="relative z-10 pb-4 md:pb-6">
        <p className="hidden md:flex items-center justify-center gap-2 text-[11px] text-white/45 mb-3">
          <MoveHorizontal size={14} className="text-[#D4AF37]" />
          {rtl ? 'اسحب يمين وشمال' : 'Swipe or use ← →'}
        </p>
        <div ref={stripRef} className="flex gap-2 px-4 md:px-8 overflow-x-auto [scrollbar-width:none] justify-start md:justify-center" data-lenis-prevent>
          {items.map((it, i) => (
            <button
              key={i}
              data-i={i}
              onClick={() => swiperRef.current?.slideTo(i)}
              aria-label={`Frame ${i + 1}`}
              className={`relative shrink-0 w-16 h-11 md:w-20 md:h-14 overflow-hidden rounded-md transition-all duration-500 ${
                i === index ? 'ring-2 ring-[#D4AF37] opacity-100 -translate-y-1' : 'opacity-35 hover:opacity-80'
              }`}
            >
              {it.type === 'video' ? (
                <span className="absolute inset-0 grid place-items-center bg-black text-[#D4AF37] text-xs">▶</span>
              ) : (
                <img src={it.src.replace(/\/(\d\d)\.webp$/, '/thumbs/$1.webp')} alt="" loading="lazy" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
