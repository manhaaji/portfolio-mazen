import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLocation } from 'react-router-dom';
import { prefersReducedMotion, setLenis, scrollToTop } from '../../lib/scroll';

gsap.registerPlugin(ScrollTrigger);

/** Inertia scrolling (Lenis) kept in sync with GSAP ScrollTrigger. */
export function SmoothScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ duration: 0.85, smoothWheel: true, wheelMultiplier: 1 });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(250, 33); // absorb stalls instead of jumping ahead
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // New page → start at the top (unless we're jumping to a section).
  useEffect(() => {
    if (!hash) scrollToTop(true);
    const id = setTimeout(() => ScrollTrigger.refresh(), 700);
    return () => clearTimeout(id);
  }, [pathname, hash]);

  return null;
}
