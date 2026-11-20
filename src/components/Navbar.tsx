import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, ArrowUpRight } from 'lucide-react';
import { FaInstagram, FaFacebookF, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { content, isCustom, pick } from '../data/content';
import { SITE, SOCIAL } from '../data/site';
import { scrollToId, getLenis } from '../lib/scroll';
import { projects, projectCover } from '../data/projects';
import { Magnetic } from './motion/Primitives';

const SECTIONS = ['hero', 'about', 'portfolio', 'services', 'contact'];
const SOCIAL_ICONS = [
  { href: SOCIAL.instagram, Icon: FaInstagram, label: 'Instagram' },
  { href: SOCIAL.facebook, Icon: FaFacebookF, label: 'Facebook' },
  { href: SOCIAL.telegram, Icon: FaTelegramPlane, label: 'Telegram' },
  { href: SOCIAL.whatsapp, Icon: FaWhatsapp, label: 'WhatsApp' },
].filter(s => s.href);

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('hero');
  const isHome = location.pathname === '/';

  const links = content.sections
    .filter(s => s.visible && s.type !== 'hero' && (s.type !== 'testimonials' || SITE.showTestimonials))
    .filter(s => !isCustom(s) || pick(s.label, language))
    .map(s => ({ id: s.id, label: isCustom(s) ? pick(s.label, language) : t(`nav.${s.type}`) }));

  // Condense on scroll, slide away while scrolling down, return when scrolling up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y > 500 && y > last + 6) setHidden(true);
      else if (y < last - 6 || y < 500) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active section indicator.
  useEffect(() => {
    if (!isHome) return;
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    const timer = setTimeout(
      () =>
        SECTIONS.forEach(id => {
          const el = document.getElementById(id);
          if (el) io.observe(el);
        }),
      500,
    );
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, [isHome]);

  // Lock page scroll while the mobile menu is open; close it on Escape.
  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    if (!isHome) navigate('/');
    scrollToId(id);
  };

  const allWork = language === 'en' ? 'All Work' : 'كل الأعمال';

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: hidden && !open ? -120 : 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 pointer-events-none"
      >
        <div
          className={`nav-shell pointer-events-auto mx-auto flex items-center justify-between gap-4 ${
            scrolled && !open
              ? 'nav-solid mt-3 max-w-[1120px] rounded-full ps-3 pe-2 py-2 shadow-[0_10px_40px_-15px_rgba(0,0,0,.6)]'
              : 'mt-0 max-w-[1480px] px-[clamp(1.1rem,4vw,3.5rem)] py-5 border border-transparent'
          }`}
          style={{ width: scrolled && !open ? 'calc(100% - 1.5rem)' : '100%' }}
        >
          <Link to="/" onClick={() => go('hero')} className="group flex items-center gap-3 shrink-0" aria-label="Mazen Khaled — home">
            <span className="relative w-10 h-10 grid place-items-center">
              <span className="absolute inset-0 rounded-full border border-gold/40 border-dashed group-hover:rotate-180 transition-transform duration-1000" />
              <span
                className="w-6 h-6 bg-gold"
                style={{
                  WebkitMaskImage: "url('/assets/img/logo.png')",
                  maskImage: "url('/assets/img/logo.png')",
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                }}
              />
            </span>
            <span className="hidden sm:flex flex-col leading-none" dir="ltr">
              <span className="font-oswald font-semibold tracking-[0.2em] text-[14px] text-foreground">MAZEN KHALED</span>
              <span className="font-oswald text-[9px] tracking-[0.42em] text-gold mt-1.5">DESIGN · MOTION · FILM</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center" aria-label="Main">
            {links.map(l => {
              const on = isHome && active === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className={`relative px-4 py-2 text-[13.5px] transition-colors duration-300 ${on ? 'text-foreground' : 'text-foreground/55 hover:text-foreground'}`}
                >
                  <span className={`u-link ${on ? 'active' : ''}`}>{l.label}</span>
                </button>
              );
            })}
            <Link
              to="/portfolio"
              className={`px-4 py-2 text-[13.5px] transition-colors ${location.pathname.startsWith('/portfolio') ? 'text-gold' : 'text-foreground/55 hover:text-foreground'}`}
            >
              <span className="u-link">{allWork}</span>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-10 h-10 rounded-full grid place-items-center border border-foreground/10 text-foreground/70 hover:text-gold hover:border-gold/50 transition-all"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid"
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </motion.span>
              </AnimatePresence>
            </button>
            <button
              id="lang-toggle-btn"
              onClick={toggleLanguage}
              aria-label="Toggle Language"
              className="h-10 min-w-10 px-3 rounded-full border border-foreground/10 text-xs font-semibold text-foreground/70 hover:text-gold hover:border-gold/50 transition-all"
            >
              {language === 'en' ? 'ع' : 'EN'}
            </button>
            <Magnetic className="hidden md:inline-block">
              <button onClick={() => go('contact')} className="btn btn-gold !h-10 !px-5 !text-[13px]">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-black/60 animate-ping" />
                  <span className="relative w-2 h-2 rounded-full bg-black/80" />
                </span>
                {t('nav.letsTalk')}
              </button>
            </Magnetic>
            <button
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="lg:hidden w-10 h-10 rounded-full grid place-items-center bg-gold text-black"
            >
              <span className="relative w-4 h-3">
                <span className={`absolute left-0 w-4 h-[1.5px] bg-current transition-all duration-500 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 w-4 h-[1.5px] bg-current transition-all duration-500 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden flex flex-col overflow-hidden"
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* film-strip panels sweep in (same language as page transitions) */}
            <div className="absolute inset-0 flex pointer-events-none">
              {Array.from({ length: 5 }, (_, i) => (
                <motion.span
                  key={i}
                  className="flex-1 bg-[#090909] border-e border-[#D4AF37]/10"
                  variants={{ closed: { scaleY: 0 }, open: { scaleY: 1 } }}
                  style={{ originY: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: [0.76, 0, 0.24, 1] }}
                />
              ))}
            </div>
            <motion.div
              className="absolute -top-40 -end-40 w-[30rem] h-[30rem] rounded-full bg-[#D4AF37]/15 blur-[100px] pointer-events-none"
              variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }}
              transition={{ duration: 0.6, delay: 0.25 }}
            />

            <nav className="relative flex-1 flex flex-col justify-center wrap pt-24 text-[#f4f1ea]" aria-label="Mobile">
              <motion.p
                className="font-oswald text-[10px] tracking-[0.4em] uppercase text-[#D4AF37]/80 mb-6"
                variants={{ closed: { opacity: 0, y: 10 }, open: { opacity: 1, y: 0 } }}
                transition={{ delay: 0.3 }}
              >
                {language === 'en' ? 'Menu' : 'القايمة'}
              </motion.p>
              {[{ id: 'hero', label: t('nav.home') }, ...links].map((l, i) => {
                const on = isHome && active === l.id;
                return (
                  <div key={l.id} className="overflow-hidden border-b border-white/[0.07]">
                    <motion.button
                      onClick={() => go(l.id)}
                      variants={{ closed: { y: '110%' }, open: { y: 0 } }}
                      transition={{ delay: 0.28 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="group w-full flex items-center justify-between gap-4 py-4 text-start"
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="font-oswald text-[11px] text-[#D4AF37] tracking-widest w-6">0{i + 1}</span>
                        <span className={`text-[2rem] leading-none font-semibold transition-colors ${on ? 'text-[#D4AF37]' : 'group-active:text-[#D4AF37]'}`}>
                          {l.label}
                        </span>
                      </span>
                      <span className={`w-9 h-9 rounded-full grid place-items-center border transition-all ${on ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'border-white/15 text-white/60'}`}>
                        <ArrowUpRight size={15} className="rtl:-scale-x-100" />
                      </span>
                    </motion.button>
                  </div>
                );
              })}

              {/* latest work */}
              <motion.div
                className="mt-8"
                variants={{ closed: { opacity: 0, y: 20 }, open: { opacity: 1, y: 0 } }}
                transition={{ delay: 0.55, duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-oswald text-[10px] tracking-[0.35em] uppercase text-white/45">{language === 'en' ? 'Latest work' : 'آخر الشغل'}</span>
                  <Link to="/portfolio" onClick={() => setOpen(false)} className="text-xs text-[#D4AF37] inline-flex items-center gap-1">
                    {allWork} <ArrowUpRight size={13} className="rtl:-scale-x-100" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {projects.slice(0, 2).map(p => (
                    <Link key={p.id} to={`/portfolio/${p.id}`} onClick={() => setOpen(false)} className="group relative aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-white/10">
                      <img src={projectCover(p)} alt="" className="w-full h-full object-cover" loading="lazy" />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <span className="absolute bottom-2 start-2 end-2 text-[11px] text-white leading-tight line-clamp-2">{t(`portfolio.projects.${p.id}.title`)}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </nav>

            <motion.div
              variants={{ closed: { opacity: 0, y: 20 }, open: { opacity: 1, y: 0 } }}
              transition={{ delay: 0.62 }}
              className="relative wrap pb-7 pt-5 border-t border-white/10 text-[#f4f1ea]"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <a href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-full bg-[#D4AF37] text-black text-sm font-semibold">
                  <FaWhatsapp size={16} /> {language === 'en' ? 'WhatsApp me' : 'كلمني واتساب'}
                </a>
                <button onClick={toggleLanguage} className="h-11 px-4 rounded-full border border-white/15 text-sm">{language === 'en' ? 'عربي' : 'EN'}</button>
                <button onClick={toggleTheme} aria-label="Toggle theme" className="w-11 h-11 rounded-full grid place-items-center border border-white/15">
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {SOCIAL_ICONS.filter(s => s.label !== 'WhatsApp').map(({ href, Icon, label }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-10 h-10 rounded-full grid place-items-center border border-white/15 text-white/70">
                      <Icon size={14} />
                    </a>
                  ))}
                </div>
                <span className="text-[11px] text-white/40 font-oswald tracking-[0.25em]" dir="ltr">GIZA · EG</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
