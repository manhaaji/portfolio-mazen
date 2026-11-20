import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useInView } from '../hooks/useInView';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { content } from '../data/content';

interface Testimonial {
  id: string;
  nameKey: string;
  roleKey: string;
  textKey: string;
}

export function Testimonials() {
  const { t, language, isRTL } = useLanguage();
  const { theme } = useTheme();
  const [sectionRef, isInView] = useInView<HTMLElement>({ threshold: 0.2 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const themeColor = theme === 'dark' ? '#D4AF37' : '#2563eb';

  const testimonials: Testimonial[] = content.testimonials.map((_, i) => ({
    id: 'c' + i,
    nameKey: `testimonials.clients.c${i}.name`,
    roleKey: `testimonials.clients.c${i}.role`,
    textKey: `testimonials.clients.c${i}.text`,
  }));

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative section-padding overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ backgroundColor: `${themeColor}05` }}
        />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px" style={{ backgroundColor: themeColor }} />
            <span 
              className="text-sm font-medium tracking-wider uppercase"
              style={{ color: themeColor }}
            >
              {language === 'en' ? 'Testimonials' : 'الآراء'}
            </span>
            <div className="w-12 h-px" style={{ backgroundColor: themeColor }} />
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-oswald font-bold mb-6">
            <span className="text-blue-950 dark:text-white">{t('testimonials.title')}</span>
          </h2>

          <p className="text-lg text-gray-400">{t('testimonials.subtitle')}</p>
        </motion.div>

        {/* Testimonials Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Main Card */}
          <div 
            className="glass rounded-3xl p-8 md:p-12 relative"
            style={{ borderColor: `${themeColor}10` }}
          >
            {/* Quote Icon */}
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={isInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4, type: 'spring' }}
              className="absolute -top-6 left-8 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: themeColor }}
            >
              <Quote className="w-6 h-6 text-black" />
            </motion.div>

            {/* Testimonial Content */}
            <div className="relative min-h-[200px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 50 : -50 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8 italic">
                    "{t(testimonials[activeIndex].textKey)}"
                  </p>

                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <motion.div 
                      className="w-14 h-14 rounded-full flex items-center justify-center border-2"
                      style={{ 
                        backgroundColor: `${themeColor}10`,
                        borderColor: `${themeColor}30`
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <span 
                        className="text-xl font-oswald font-bold"
                        style={{ color: themeColor }}
                      >
                        {t(testimonials[activeIndex].nameKey).charAt(0)}
                      </span>
                    </motion.div>

                    <div>
                      <h4 className="text-blue-950 dark:text-white font-oswald font-bold">
                        {t(testimonials[activeIndex].nameKey)}
                      </h4>
                      <p 
                        className="text-sm"
                        style={{ color: themeColor }}
                      >
                        {t(testimonials[activeIndex].roleKey)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/10">
              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setActiveIndex(index);
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex ? 'w-8' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                    style={{ 
                      backgroundColor: index === activeIndex ? themeColor : undefined
                    }}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToPrev}
                  className="p-3 rounded-lg transition-all duration-300"
                  style={{ 
                    backgroundColor: `${themeColor}10`,
                    color: themeColor
                  }}
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToNext}
                  className="p-3 rounded-lg transition-all duration-300"
                  style={{ 
                    backgroundColor: `${themeColor}10`,
                    color: themeColor
                  }}
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
