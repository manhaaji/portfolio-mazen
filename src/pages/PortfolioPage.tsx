import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Search, ArrowLeft, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { projects, categories } from '../data/projects';
import { Footer } from '../components/Footer';
import { ProjectCard } from '../components/ProjectCard';
import { RevealText, Reveal } from '../components/motion/Primitives';

export function PortfolioPage() {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach(p => counts.set(p.category, (counts.get(p.category) || 0) + 1));
    return [
      { id: 'all', count: projects.length },
      ...categories.filter(c => c.id !== 'all' && counts.has(c.id)).map(c => ({ id: c.id, count: counts.get(c.id)! })),
    ];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(p => {
      if (activeFilter !== 'all' && p.category !== activeFilter) return false;
      if (!q) return true;
      const hay = [
        t(`portfolio.projects.${p.id}.title`),
        t(`portfolio.projects.${p.id}.description`),
        t(`portfolio.filters.${p.category}.name`),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, activeFilter, t]);

  return (
    <main className="min-h-screen">
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 start-1/4 w-[40rem] h-[40rem] rounded-full blur-[120px] bg-gold/5 pointer-events-none" />

        <div className="container-custom relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-foreground/50 hover:text-gold transition-colors duration-300 mb-10"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            <span>{language === 'en' ? 'Back to Home' : 'العودة للرئيسية'}</span>
          </Link>

          <div className="mb-12">
            <RevealText
              as="h1"
              text={t('portfolio.title')}
              className={`block text-6xl md:text-7xl lg:text-8xl font-bold text-foreground mb-5 ${language === 'en' ? 'font-oswald uppercase' : ''}`}
            />
            <Reveal delay={0.15}>
              <p className="text-lg text-foreground/60 max-w-2xl">{t('portfolio.subtitle')}</p>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-12">
            <LayoutGroup>
              <div className="flex flex-wrap gap-2 p-1.5 rounded-full glass w-fit" role="tablist">
                {filters.map(f => {
                  const active = activeFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveFilter(f.id)}
                      className={`relative px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-full transition-colors ${
                        active ? 'text-black' : 'text-foreground/70 hover:text-foreground'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="page-filter-pill"
                          className="absolute inset-0 rounded-full bg-gold"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">
                        {t(`portfolio.filters.${f.id}.name`)}
                        <sup className="ms-1 opacity-60">{f.count}</sup>
                      </span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>

            <div className="relative w-full md:w-80">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search projects…' : 'ابحث في المشاريع…'}
                className="form-input w-full ps-11 pe-10 py-3 rounded-full"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label={t('close')}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </Reveal>

          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            <AnimatePresence mode="popLayout">
              {filtered.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProjectCard project={project} index={index} isNew={project.id === projects[0]?.id} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-24 text-foreground/50">
              {language === 'en' ? 'No projects match your search.' : 'مفيش مشاريع مطابقة للبحث.'}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
