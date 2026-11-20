import { useEffect, useRef, useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import type { VideoKind } from '../data/content';
import { useDelayedPreview, PreviewRing } from './DelayedPreview';

/**
 * One player, three presentations — chosen per video in the CMS:
 *  reel → a phone frame (9:16) that previews silently, tap for sound
 *  film → a cinema frame (16:9 letterbox) with poster, plays with sound + controls
 *  loop → a monitor frame that just loops (motion graphics, logo animations)
 */
export function VideoFrame({
  src,
  poster,
  kind = 'loop',
  title,
  isAr,
  className = '',
}: {
  src: string;
  poster?: string;
  kind?: VideoKind;
  title?: string;
  isAr?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const preview = useDelayedPreview(ref);
  const [muted, setMuted] = useState(true);
  const [filmOn, setFilmOn] = useState(false);
  const startPreview = preview.start;

  // Previews start when the frame scrolls into view.
  useEffect(() => {
    if (kind === 'film') return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) startPreview();
        else el.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [kind, startPreview]);

  if (kind === 'reel') {
    return (
      <div className={`vf-phone mx-auto ${className}`}>
        <div className="vf-phone-notch" />
        <div className="relative w-full h-full overflow-hidden rounded-[2rem] bg-black">
          {poster && <img src={poster} alt={title || ''} className="absolute inset-0 w-full h-full object-cover" />}
          <video
            ref={ref}
            src={src}
            poster={poster}
            muted={muted}
            loop
            playsInline
            preload="metadata"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${preview.state === 'playing' ? 'opacity-100' : 'opacity-0'}`}
          />
          <PreviewRing state={preview.state} label={isAr ? 'تحميل' : 'Loading'} />
          <button
            type="button"
            onClick={() => {
              const v = ref.current;
              if (!v) return;
              v.muted = !muted;
              setMuted(!muted);
              if (v.paused) v.play().catch(() => {});
            }}
            className="absolute bottom-4 end-4 w-11 h-11 rounded-full bg-black/55 border border-white/20 text-white grid place-items-center backdrop-blur-sm hover:bg-[#D4AF37] hover:text-black transition-colors"
            aria-label={muted ? (isAr ? 'شغّل الصوت' : 'Unmute') : isAr ? 'اكتم الصوت' : 'Mute'}
            data-cursor={muted ? 'Sound' : 'Mute'}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>
    );
  }

  if (kind === 'film') {
    return (
      <div className={`pro-frame ${className}`}>
        <div className="pro-frame-bar" dir="ltr">
          <span className="flex gap-1.5"><i /><i /><i /></span>
          <span className="truncate">{title || 'FILM'}</span>
          <span className="pro-rec">● 16:9</span>
        </div>
        <div className="pro-frame-media relative aspect-video bg-black">
          {filmOn ? (
            <video src={src} poster={poster} controls autoPlay playsInline className="absolute inset-0 w-full h-full object-contain bg-black" />
          ) : (
            <button type="button" onClick={() => setFilmOn(true)} className="group absolute inset-0 w-full h-full" data-cursor="Play" aria-label={isAr ? 'شغّل الفيلم' : 'Play film'}>
              {poster ? (
                <img src={poster} alt={title || ''} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              ) : (
                <video src={src + '#t=1'} muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
              <span className="vf-bars" />
              <span className="absolute inset-0 grid place-items-center">
                <span className="w-20 h-20 rounded-full bg-[#D4AF37] text-black grid place-items-center shadow-[0_0_60px_rgba(212,175,55,.45)] group-hover:scale-110 transition-transform duration-500">
                  <Play size={26} className="fill-current ms-1" />
                </span>
              </span>
              <span className="absolute bottom-5 start-6 text-white text-sm tracking-wide">{isAr ? 'شغّل بالصوت' : 'Play with sound'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`pro-frame ${className}`}>
      <div className="pro-frame-bar" dir="ltr">
        <span className="flex gap-1.5"><i /><i /><i /></span>
        <span className="truncate">{title || 'MOTION'}</span>
        <span className="pro-rec">● LOOP</span>
      </div>
      <div className="pro-frame-media relative bg-black">
        {poster && <img src={poster} alt={title || ''} className="absolute inset-0 w-full h-full object-cover" />}
        <video
          ref={ref}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          className={`relative block w-full h-auto transition-opacity duration-700 ${preview.state === 'playing' ? 'opacity-100' : 'opacity-0'}`}
        />
        <PreviewRing state={preview.state} label={isAr ? 'تحميل' : 'Loading'} />
      </div>
    </div>
  );
}
