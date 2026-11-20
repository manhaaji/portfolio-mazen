import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Film, Sparkles, Palette, Layers, PenTool, Box, ArrowUpRight, Plus, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Slate } from '../components/motion/EditSuite';
import { RevealText, Reveal, Magnetic } from '../components/motion/Primitives';
import { scrollToId } from '../lib/scroll';

interface ProcessStep {
  title: string;
  description: string;
}
interface Service {
  id: string;
  icon: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }>;
  title: string;
  description: string;
  features: string[];
  deliverables: string[];
  process: ProcessStep[];
  pricing: {
    price: string;
    timeline: string;
  };
}

/**
 * Services as an index: big numbered rows. Hovering a row floats a preview
 * chip beside the pointer; clicking opens the row to show scope and process.
 */
export function Services() {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<Service | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isAr = language === 'ar';

  const services: Service[] = [
    {
      id: 'videoEditing',
      icon: Film,
      title: t('services.items.videoEditing.title'),
      description: t('services.items.videoEditing.description'),
      features: ['Color Grading', 'Motion Graphics', 'Sound Design', '4K/8K Editing'],
      deliverables: ['Edited Video File', 'Color-graded footage', 'SRT Subtitles', 'Master File'],
      process: [
        { title: 'Analysis', description: 'Reviewing footage and understanding the desired mood.' },
        { title: 'Primary Edit', description: 'Assembling clips, cuts, and establishing the timeline.' },
        { title: 'Creative Grade', description: 'Applying color grading and cinematic look.' },
        { title: 'Final Output', description: 'Exporting in multiple formats and resolutions.' },
      ],
      pricing: { price: '$500', timeline: '3-7 days' },
    },
    {
      id: 'motionGraphics',
      icon: Sparkles,
      title: t('services.items.motionGraphics.title'),
      description: t('services.items.motionGraphics.description'),
      features: ['2D Animation', '3D Motion', 'Logo Animation', 'Title Sequences'],
      deliverables: ['MP4 Video', 'Animated Graphics', 'Project Files', 'Source Assets'],
      process: [
        { title: 'Concept', description: 'Designing the visual direction and animation style.' },
        { title: 'Storyboard', description: 'Creating visual timeline and keyframes.' },
        { title: 'Animation', description: 'Building and refining motion with effects.' },
        { title: 'Render', description: 'Exporting high-quality video output.' },
      ],
      pricing: { price: '$800', timeline: '5-10 days' },
    },
    {
      id: 'colorGrading',
      icon: Palette,
      title: t('services.items.colorGrading.title'),
      description: t('services.items.colorGrading.description'),
      features: ['Cinematic Look', 'LUT Creation', 'Scene Matching', 'HDR Grading'],
      deliverables: ['Color-graded footage', 'Custom LUTs', 'Before/After comparison', 'Technical documentation'],
      process: [
        { title: 'Analysis', description: 'Reviewing footage and understanding the desired mood.' },
        { title: 'Primary Grade', description: 'Balancing exposure, contrast, and white balance.' },
        { title: 'Creative Grade', description: 'Applying the cinematic look and color palette.' },
        { title: 'Final Output', description: 'Exporting in required formats with LUTs.' },
      ],
      pricing: { price: '$400', timeline: '2-5 days' },
    },
    {
      id: 'graphicDesign',
      icon: Layers,
      title: t('services.items.graphicDesign.title'),
      description: t('services.items.graphicDesign.description'),
      features: ['Social Media', 'Print Design', 'UI/UX Design', 'Illustrations'],
      deliverables: ['High-res PNG/PDF', 'Editable Files', 'Brand Guidelines', 'Design System'],
      process: [
        { title: 'Discovery', description: 'Understanding your brand, goals, and target audience.' },
        { title: 'Concepts', description: 'Creating multiple design concepts and variations.' },
        { title: 'Refinement', description: 'Incorporating feedback and perfecting details.' },
        { title: 'Delivery', description: 'Providing final files in all required formats.' },
      ],
      pricing: { price: '$300', timeline: '3-7 days' },
    },
    {
      id: 'brandIdentity',
      icon: PenTool,
      title: t('services.items.brandIdentity.title'),
      description: t('services.items.brandIdentity.description'),
      features: ['Logo Design', 'Brand Guidelines', 'Visual Systems', 'Rebranding'],
      deliverables: ['Logo Files', 'Brand Guidelines', 'Color Palette', 'Typography Guide'],
      process: [
        { title: 'Strategy', description: 'Defining brand essence, values, and positioning.' },
        { title: 'Ideation', description: 'Generating logo concepts and brand identity options.' },
        { title: 'Development', description: 'Refining designs and creating comprehensive guidelines.' },
        { title: 'Documentation', description: 'Compiling all assets into a brand guide.' },
      ],
      pricing: { price: '$1200', timeline: '2-3 weeks' },
    },
    {
      id: 'threeD',
      icon: Box,
      title: t('services.items.threeD.title'),
      description: t('services.items.threeD.description'),
      features: ['Product Renders', 'Architectural Viz', 'Character Modeling', 'Animation'],
      deliverables: ['High-res Renders', 'Animation Video', '3D Model File', 'Turntable Video'],
      process: [
        { title: 'Modeling', description: 'Creating detailed 3D models from specifications.' },
        { title: 'Texturing', description: 'Applying materials and textures for realism.' },
        { title: 'Lighting', description: 'Setting up professional lighting and rendering parameters.' },
        { title: 'Post-production', description: 'Final color correction and composition adjustments.' },
      ],
      pricing: { price: '$2000', timeline: '1-2 weeks' },
    },
  ];

  useEffect(() => {
    const el = previewRef.current;
    if (!el || !window.matchMedia('(pointer: fine)').matches) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3' });
    const move = (e: PointerEvent) => {
      xTo(e.clientX + 28);
      yTo(e.clientY - 60);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  return (
    <section id="services" className="section">
      <div className="wrap relative">
        <Slate sc="03" title={t('nav.services')} meta={`${services.length} ${isAr ? 'خدمات' : 'Disciplines'}`} />

        <div className="grid lg:grid-cols-12 gap-8 mb-14 md:mb-20 items-end">
          <h2 className="lg:col-span-8 t-h1 text-foreground">
            {isAr ? (
              <>
                <RevealText text="ماذا" /> <span className="t-serif text-gold">أُقدّم؟</span>
              </>
            ) : (
              <>
                <RevealText text="What I" /> <span className="t-serif text-gold">do</span>
              </>
            )}
          </h2>
          <Reveal className="lg:col-span-4" delay={0.1}>
            <p className="muted-2 leading-relaxed">{t('services.subtitle')}</p>
          </Reveal>
        </div>

        <ul onPointerLeave={() => setHover(null)}>
          {services.map((s, i) => {
            const isOpen = open === s.id;
            return (
              <li key={s.id} className={`svc-row ${isOpen ? 'open' : ''}`} onPointerEnter={() => setHover(s)}>
                <span className="svc-fill" />
                <button
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  aria-expanded={isOpen}
                  className="w-full grid grid-cols-[auto_1fr_auto] md:grid-cols-[5rem_1fr_16rem_auto] items-center gap-4 md:gap-8 py-7 md:py-9 text-start"
                >
                  <span className="font-oswald text-sm text-gold tracking-[0.2em]">0{i + 1}</span>
                  <span className="svc-title t-h2 text-foreground">{s.title}</span>
                  <span className="hidden md:block text-sm muted-3 truncate" dir="ltr">{s.features.slice(0, 2).join(' · ')}</span>
                  <span
                    className={`w-11 h-11 rounded-full border grid place-items-center transition-all duration-500 ${
                      isOpen ? 'bg-gold text-black border-gold rotate-45' : 'border-foreground/15 text-foreground/70'
                    }`}
                  >
                    <Plus size={18} />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid md:grid-cols-12 gap-8 md:gap-10 pb-12 md:ps-[7rem]">
                        <div className="md:col-span-5">
                          <p className="text-lg leading-relaxed text-foreground/80 mb-6">{s.description}</p>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {s.features.map(f => (
                              <span key={f} className="text-xs px-3 py-1.5 rounded-full border border-gold/30 text-gold">
                                {f}
                              </span>
                            ))}
                          </div>
                          <p className="flex items-center gap-2 text-sm muted-2" dir="ltr">
                            <Clock size={14} className="text-gold" /> {s.pricing.timeline}
                          </p>
                        </div>
                        <ol className="md:col-span-7 grid sm:grid-cols-2 gap-x-8 gap-y-6" dir="ltr">
                          {s.process.map((p, pi) => (
                            <motion.li
                              key={p.title}
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.15 + pi * 0.07 }}
                              className="border-t border-foreground/10 pt-4"
                            >
                              <p className="font-oswald text-[11px] text-gold tracking-[0.25em] mb-1">STEP {pi + 1}</p>
                              <p className="font-medium text-foreground mb-1">{p.title}</p>
                              <p className="text-sm muted-2 leading-relaxed">{p.description}</p>
                            </motion.li>
                          ))}
                        </ol>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        <Reveal className="mt-16 md:mt-24 grid md:grid-cols-12 gap-8 items-center">
          <p className="md:col-span-8 t-lead text-foreground/85">{t('services.cta')}</p>
          <div className="md:col-span-4 md:text-end">
            <Magnetic>
              <button onClick={() => scrollToId('contact')} className="btn btn-gold">
                <span className="btn-icon">
                  <ArrowUpRight size={14} className="rtl:-scale-x-100" />
                </span>
                {t('services.getInTouch')}
              </button>
            </Magnetic>
          </div>
        </Reveal>
      </div>

      {/* Pointer-following preview */}
      <div ref={previewRef} className="fixed top-0 left-0 z-30 pointer-events-none hidden lg:block" aria-hidden>
        <AnimatePresence>
          {hover && open !== hover.id && (
            <motion.div
              key={hover.id}
              initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotate: 8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-56 p-5 rounded-2xl bg-gold text-black shadow-2xl"
            >
              <hover.icon size={26} />
              <p className="mt-4 font-oswald text-lg leading-tight uppercase">{hover.title}</p>
              <p className="mt-2 text-xs opacity-75" dir="ltr">{hover.features.join(' · ')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
