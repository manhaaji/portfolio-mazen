import type Lenis from 'lenis';

let lenis: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  lenis = l;
};
export const getLenis = () => lenis;

// Motion is on by default. Many Windows machines report "reduce motion" only
// because window animations were switched off for speed, which would silently
// strip the whole experience; visitors who need calm get an explicit toggle
// (footer + mobile menu) that is remembered.
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('motion') === 'off';
  } catch {
    return false;
  }
};
export function setMotion(on: boolean) {
  try {
    localStorage.setItem('motion', on ? 'on' : 'off');
  } catch {
    /* storage blocked */
  }
  window.location.reload();
}

/** Smooth-scroll to an element id. Retries while the target page is still mounting. */
export function scrollToId(id: string, tries = 40) {
  const el = document.getElementById(id);
  if (!el) {
    if (tries > 0) setTimeout(() => scrollToId(id, tries - 1), 60);
    return;
  }
  if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

export function scrollToTop(immediate = false) {
  if (lenis) lenis.scrollTo(0, { immediate, duration: 1.2 });
  else window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
}

/** Fired by the preloader when the intro is gone, so hero animations start on cue. */
export const APP_READY = 'app:ready';
export function onAppReady(cb: () => void) {
  if ((window as unknown as { __appReady?: boolean }).__appReady) {
    cb();
    return () => {};
  }
  window.addEventListener(APP_READY, cb, { once: true });
  return () => window.removeEventListener(APP_READY, cb);
}
export function markAppReady() {
  (window as unknown as { __appReady?: boolean }).__appReady = true;
  window.dispatchEvent(new Event(APP_READY));
}
