import { SITE } from './data/site';
import { useEffect, useLayoutEffect, useRef, useState, Suspense, lazy } from 'react';
import { Intro } from './components/Intro';
import { AmbientBackground } from './components/motion/AmbientBackground';
import { gsap } from 'gsap';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Navbar } from './components/Navbar';
import ContextMenu from './components/ContextMenu';
import { SmoothScroll } from './components/motion/SmoothScroll';
import { CustomCursor } from './components/motion/CustomCursor';
import { ScrollProgress } from './components/motion/Primitives';
import { markAppReady, prefersReducedMotion } from './lib/scroll';
import { TimecodeHUD } from './components/motion/EditSuite';
import './App.css';

// Lazy load pages for better performance
// The landing page ships in the main bundle so the first paint is content, not a spinner.
import { HomePage } from './pages/HomePage';
const PortfolioPage = lazy(() => import('./pages/PortfolioPage').then(m => ({ default: m.PortfolioPage })));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ReviewsLayer = lazy(() => import('./components/Reviews').then(m => ({ default: m.ReviewsLayer })));

// Page transition: the outgoing page dims away, then a gold curtain carrying
// the destination's name lifts off the incoming page (a cut, not a fade).
function routeLabel(path: string, ar: boolean) {
  if (path === '/') return ar ? 'الرئيسية' : 'Home';
  if (path === '/portfolio') return ar ? 'كل الأعمال' : 'All Work';
  if (path.startsWith('/portfolio/')) return path.split('/')[2];
  return '404';
}
function Curtain({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    const tl = gsap.timeline({ onComplete: () => { gsap.set(el, { display: 'none' }); } });
    tl.fromTo(q('.pt-logo'), { scale: 0.6, opacity: 0, rotate: -20 }, { scale: 1, opacity: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' }, 0)
      .fromTo(q('.pt-label'), { yPercent: 100 }, { yPercent: 0, duration: 0.35, ease: 'expo.out' }, 0.05)
      .fromTo(q('.pt-line'), { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'expo.inOut' }, 0.05)
      .to(q('.pt-mark-inner'), { opacity: 0, y: -16, duration: 0.25, ease: 'power2.in' }, 0.5)
      .to(q('.pt-col'), { yPercent: -100, duration: 0.6, ease: 'expo.inOut', stagger: { each: 0.045, from: 'start' } }, 0.55);
    return () => {
      tl.kill();
    };
  }, []);
  return (
    <div ref={ref} aria-hidden>
      <div className="pt">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="pt-col" />
        ))}
      </div>
      <div className="pt-mark">
        <div className="pt-mark-inner flex flex-col items-center gap-4">
          <span
            className="pt-logo w-14 h-14 bg-[#D4AF37]"
            style={{ WebkitMaskImage: "url('/assets/img/logo.png')", maskImage: "url('/assets/img/logo.png')", WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }}
          />
          <span className="overflow-hidden">
            <span className="pt-label block font-oswald text-white uppercase tracking-[0.3em] text-lg">{label}</span>
          </span>
          <span className="pt-line block w-24 h-px bg-[#D4AF37] origin-center" />
        </div>
      </div>
    </div>
  );
}
function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { language } = useLanguage();
  // The first entry (key "default") arrives under the intro, so no curtain.
  const showCurtain = location.key !== 'default' && !prefersReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {showCurtain && <Curtain label={routeLabel(location.pathname, language === 'ar')} />}
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          } 
        />
        <Route 
          path="/portfolio" 
          element={
            <PageTransition>
              <PortfolioPage />
            </PageTransition>
          } 
        />
        <Route 
          path="/portfolio/:projectId" 
          element={
            <PageTransition>
              <ProjectDetailPage />
            </PageTransition>
          } 
        />
        <Route 
          path="*" 
          element={
            <PageTransition>
              <NotFoundPage />
            </PageTransition>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  // The cinematic intro plays once per session, only when landing on the home
  // page, and never for visitors who asked the OS for reduced motion.
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return SITE.intro && window.location.pathname === '/' && !sessionStorage.getItem('intro-v2') && !prefersReducedMotion();
    } catch {
      return false;
    }
  });
  const introRef = useRef(showIntro);

  useEffect(() => {
    if (!introRef.current) markAppReady();
  }, []);

  const endIntro = () => {
    try { sessionStorage.setItem('intro-v2', '1'); } catch { /* private mode */ }
    setShowIntro(false);
    markAppReady();
  };

  return (
    <>
      {showIntro && <Intro onDone={endIntro} />}

      <div className="relative isolate min-h-screen bg-background text-foreground">
        <AmbientBackground />
        <Router>
          <SmoothScroll />
          <ScrollProgress />
          <TimecodeHUD />
          <Navbar />
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full"
              />
            </div>
          }>
            <AnimatedRoutes />
          </Suspense>
          <ContextMenu />
          {!showIntro && (
            <Suspense fallback={null}>
              <ReviewsLayer />
            </Suspense>
          )}
        </Router>
      </div>
      <CustomCursor />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
