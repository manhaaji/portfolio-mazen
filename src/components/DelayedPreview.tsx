import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Hover-to-preview with intent: the video only starts after the pointer has
 * rested for `delay` ms (a ring fills meanwhile), so skimming past a project
 * never triggers a flash of motion.
 */
export function useDelayedPreview(videoRef: RefObject<HTMLVideoElement | null>, delay = 2000) {
  const timer = useRef<number | undefined>(undefined);
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle');

  const start = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setState('loading');
    v.preload = 'auto'; // fetch while the ring fills
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      v.currentTime = 0;
      v.play()
        .then(() => setState('playing'))
        .catch(() => setState('idle'));
    }, delay);
  }, [videoRef, delay]);

  const stop = useCallback(() => {
    window.clearTimeout(timer.current);
    videoRef.current?.pause();
    setState('idle');
  }, [videoRef]);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  return { state, start, stop };
}

/** Circular countdown shown while a preview is about to start. */
export function PreviewRing({ state, delay = 2000, label }: { state: 'idle' | 'loading' | 'playing'; delay?: number; label?: string }) {
  if (state !== 'loading') return null;
  return (
    <span className="absolute inset-0 grid place-items-center pointer-events-none z-[3]">
      <span className="relative w-16 h-16 grid place-items-center rounded-full bg-black/45 backdrop-blur-sm">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2" />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="176"
            strokeDashoffset="176"
            style={{ animation: `ring-fill ${delay}ms linear forwards` }}
          />
        </svg>
        <span className="font-oswald text-[9px] tracking-[0.2em] text-white/85 uppercase">{label || 'Preview'}</span>
      </span>
    </span>
  );
}
