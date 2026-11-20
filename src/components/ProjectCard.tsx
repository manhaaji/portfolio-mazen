import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Play } from 'lucide-react';
import { LazyImage } from './ui/LazyImage';
import { Frame } from './motion/EditSuite';
import { useDelayedPreview, PreviewRing } from './DelayedPreview';
import { useLanguage } from '../contexts/LanguageContext';
import { projectCover, type Project } from '../data/projects';
import { generateImageAltText } from '../lib/seoUtils';

/**
 * Portfolio card: cover image, 3D tilt toward the pointer, and the project's
 * animation plays inside the card while hovered.
 */
export function ProjectCard({ project, index, isNew = false }: { project: Project; index: number; isNew?: boolean }) {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const preview = useDelayedPreview(videoRef);
  const playing = preview.state === 'playing';
  const title = t(`portfolio.projects.${project.id}.title`);
  const video = project.animationLink;

  const onMove = (e: React.PointerEvent) => {
    const el = cardRef.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg)`;
    el.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
    el.style.setProperty('--my', `${(py + 0.5) * 100}%`);
  };
  const onEnter = () => {
    if (video) preview.start();
  };
  const onLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = '';
    preview.stop();
  };

  return (
    <Link
      to={`/portfolio/${project.id}`}
      className="group block"
      data-cursor={video ? 'Play' : 'View'}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onPointerMove={onMove}
    >
      <Frame className="mb-6">
      <div
        ref={cardRef}
        className={`card-tilt card-media relative aspect-[4/3] overflow-hidden bg-card ${playing ? 'is-playing' : ''}`}
      >
        <LazyImage
          src={projectCover(project)}
          alt={generateImageAltText(project, title)}
          containerClassName="absolute inset-0 w-full h-full"
          className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        />
        {video && (
          <video
            ref={videoRef}
            src={video}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <PreviewRing state={preview.state} />

        {/* Spotlight that follows the pointer */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'radial-gradient(circle at var(--mx,50%) var(--my,50%), rgb(var(--gold-rgb) / 0.25), transparent 55%)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

        {/* Index + badges */}
        <span className="absolute top-4 start-4 text-[11px] font-oswald tracking-[0.3em] text-white/80">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="absolute top-4 end-4 flex gap-2">
          {isNew && (
            <span className="bg-gold text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
              {t('portfolio.new')}
            </span>
          )}
          {video && (
            <span className="w-7 h-7 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-gold">
              <Play size={11} className="fill-current ms-0.5" />
            </span>
          )}
        </div>

        <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between gap-4">
          <span className="px-3 py-1 text-[11px] font-medium rounded-full bg-white/10 backdrop-blur-md text-white border border-white/15">
            {t(`portfolio.filters.${project.category}.name`)}
          </span>
          <span className="w-11 h-11 shrink-0 rounded-full bg-gold text-black flex items-center justify-center translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 rtl:-scale-x-100">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
      </Frame>

      <div className="px-1">
        <h3 className="font-oswald text-2xl font-medium text-foreground mb-2 leading-snug group-hover:text-gold transition-colors duration-300">
          {title}
        </h3>
        <p className="text-foreground/55 text-sm line-clamp-2">{t(`portfolio.projects.${project.id}.description`)}</p>
      </div>
    </Link>
  );
}
