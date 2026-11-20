import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { getLenis } from '../lib/scroll';

export interface LightboxItem {
  type: 'image' | 'video';
  src: string;
  alt: string;
}

/**
 * Full-screen viewer: slides in the direction you travel, arrow keys / swipe /
 * filmstrip to move, Esc to close. Focus is trapped on the dialog while open.
 */
export function Lightbox({
  items,
  index,
  onClose,
  onIndex,
  rtl = false,
}: {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
  rtl?: boolean;
}) {
  const [dir, setDir] = useState(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const open = index !== null;

  const go = useCallback(
    (step: number) => {
      if (index === null) return;
      setDir(step);
      onIndex((index + step + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = 'hidden';
    const prevFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(rtl ? -1 : 1);
      if (e.key === 'ArrowLeft') go(rtl ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lenis?.start();
      document.body.style.overflow = '';
      prevFocus?.focus?.();
    };
  }, [open, go, onClose, rtl]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    if (index === null) return;
    stripRef.current?.querySelector<HTMLElement>(`[data-i="${index}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [index]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80) go(rtl ? -1 : 1);
    else if (info.offset.x > 80) go(rtl ? 1 : -1);
  };

  const item = index !== null ? items[index] : null;
  const pad = (n: number) => String(n).padStart(2, '0');

  return createPortal(
    <AnimatePresence>
      {open && item && (
        <motion.div
          ref={dialogRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={item.alt}
          className="fixed inset-0 z-[9000] bg-[#050505]/97 backdrop-blur-xl flex flex-col text-[#f4f1ea] outline-none"
          initial={{ clipPath: 'inset(50% 0% 50% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(50% 0% 50% 0%)' }}
          transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 md:px-8 py-4 font-oswald text-[11px] tracking-[0.3em] uppercase" dir="ltr">
            <span className="text-white/50">
              FRAME <span className="text-[#D4AF37]">{pad(index! + 1)}</span> / {pad(items.length)}
            </span>
            <span className="hidden md:block text-white/40 truncate max-w-[50%]">{item.alt}</span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-11 h-11 rounded-full grid place-items-center border border-white/15 hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] hover:rotate-90 transition-all duration-500"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stage */}
          <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 md:px-24 overflow-hidden">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={index}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ x: `${d * (rtl ? -18 : 18)}%`, opacity: 0, scale: 0.96, filter: 'blur(6px)' }),
                  center: { x: 0, opacity: 1, scale: 1, filter: 'blur(0px)' },
                  exit: (d: number) => ({ x: `${d * (rtl ? 18 : -18)}%`, opacity: 0, scale: 0.96, filter: 'blur(6px)' }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                drag={item.type === 'image' ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={onDragEnd}
                className="max-w-full max-h-full flex items-center justify-center"
              >
                {item.type === 'video' ? (
                  <video src={item.src} controls autoPlay playsInline className="max-h-[72vh] max-w-full rounded-sm shadow-2xl" />
                ) : (
                  <img src={item.src} alt={item.alt} draggable={false} className="max-h-[72vh] max-w-full object-contain select-none shadow-2xl" />
                )}
              </motion.div>
            </AnimatePresence>

            {items.length > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous"
                  className="absolute start-3 md:start-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full grid place-items-center border border-white/15 bg-black/40 hover:bg-[#D4AF37] hover:text-black transition-all"
                >
                  <ArrowLeft size={18} className="rtl:rotate-180" />
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label="Next"
                  className="absolute end-3 md:end-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full grid place-items-center border border-white/15 bg-black/40 hover:bg-[#D4AF37] hover:text-black transition-all"
                >
                  <ArrowRight size={18} className="rtl:rotate-180" />
                </button>
              </>
            )}
          </div>

          {/* Filmstrip */}
          {items.length > 1 && (
            <div ref={stripRef} className="flex gap-2 px-5 md:px-8 py-4 overflow-x-auto [scrollbar-width:none]" data-lenis-prevent>
              {items.map((it, i) => (
                <button
                  key={i}
                  data-i={i}
                  onClick={() => {
                    setDir(i > index! ? 1 : -1);
                    onIndex(i);
                  }}
                  aria-label={`Frame ${i + 1}`}
                  className={`relative shrink-0 w-20 h-14 md:w-24 md:h-16 overflow-hidden transition-all duration-500 ${
                    i === index ? 'ring-1 ring-[#D4AF37] opacity-100' : 'opacity-40 hover:opacity-80'
                  }`}
                >
                  {it.type === 'video' ? (
                    <video src={it.src} muted preload="metadata" className="w-full h-full object-cover" />
                  ) : (
                    <img src={it.src} alt="" loading="lazy" className="w-full h-full object-cover" />
                  )}
                  <span className="absolute bottom-0.5 start-1 font-oswald text-[9px] text-white/80">{it.type === 'video' ? '▶' : pad(i + 1)}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
