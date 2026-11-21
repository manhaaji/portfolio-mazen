import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useInView } from '../hooks/useInView';
import { ChevronLeft, ChevronRight, Quote, PenLine } from 'lucide-react';
import { content } from '../data/content';
import { reviewsEnabled } from '../lib/reviews';
import { useApprovedReviews, openReviewForm, Avatar, Stars } from '../components/Reviews';

interface Item {
  id: string;
  name: string;
  role: string;
  text: string;
  photo?: string;
  rating?: number;
}

/** Quotes added in Mazen Studio + approved visitor reviews (Google/Facebook sign-in). */
export function Testimonials() {
  const { t, isRTL } = useLanguage();
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.2 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const reviews = useApprovedReviews(isInView);

  const items: Item[] = [
    ...content.testimonials.map((_, i) => ({
      id: 'c' + i,
      name: t(`testimonials.clients.c${i}.name`),
      role: t(`testimonials.clients.c${i}.role`),
      text: t(`testimonials.clients.c${i}.text`),
    })),
    ...reviews.map(r => ({ id: r.id, name: r.name, role: r.role || '', text: r.text, photo: r.photo, rating: r.rating })),
  ];
  const current = items[activeIndex % Math.max(1, items.length)];

  useEffect(() => {
    if (!isAutoPlaying || items.length < 2) return;
    const interval = setInterval(() => setActiveIndex(prev => (prev + 1) % items.length), 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  const go = (d: number) => {
    setIsAutoPlaying(false);
    setActiveIndex(prev => (prev + d + items.length) % items.length);
  };

  return (
    <section ref={sectionRef} id="testimonials" className="relative section-padding overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl bg-gold/[.03] pointer-events-none" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gold" />
            <span className="text-sm font-medium tracking-wider uppercase text-gold">{isRTL ? 'الآراء' : 'Testimonials'}</span>
            <div className="w-12 h-px bg-gold" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-oswald font-bold mb-6 text-foreground">{t('testimonials.title')}</h2>
          <p className="text-lg muted-2">{t('testimonials.subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="glass rounded-3xl p-8 md:p-12 relative">
            <div className="absolute -top-6 start-8 w-12 h-12 rounded-xl flex items-center justify-center bg-gold">
              <Quote className="w-6 h-6 text-black" />
            </div>

            <div className="relative min-h-[200px]">
              {current ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRTL ? 40 : -40 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {current.rating && (
                      <div className="mb-4">
                        <Stars value={current.rating} size={16} />
                      </div>
                    )}
                    <p className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-8">“{current.text}”</p>
                    <div className="flex items-center gap-4">
                      <Avatar name={current.name} photo={current.photo} size={56} />
                      <div>
                        <h4 className="text-foreground font-oswald font-bold">{current.name}</h4>
                        {current.role && <p className="text-sm text-gold">{current.role}</p>}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="min-h-[200px] grid place-items-center text-center muted-2">
                  {isRTL ? 'لسه مفيش آراء — كن أول واحد يكتب رأيه.' : 'No reviews yet — be the first to write one.'}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-8 border-t border-foreground/10">
              <div className="flex gap-2">
                {items.map((it, index) => (
                  <button
                    key={it.id}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setActiveIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-gold' : 'w-2 bg-foreground/20 hover:bg-foreground/40'}`}
                    aria-label={`${index + 1}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {reviewsEnabled && (
                  <button onClick={openReviewForm} className="h-11 px-5 rounded-full bg-gold text-black text-sm font-semibold inline-flex items-center gap-2 hover:brightness-110 transition">
                    <PenLine size={15} /> {isRTL ? 'اكتب رأيك' : 'Write a review'}
                  </button>
                )}
                {items.length > 1 && (
                  <>
                    <button onClick={() => go(-1)} className="p-3 rounded-lg bg-gold/10 text-gold" aria-label="Previous">
                      <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                    </button>
                    <button onClick={() => go(1)} className="p-3 rounded-lg bg-gold/10 text-gold" aria-label="Next">
                      <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
