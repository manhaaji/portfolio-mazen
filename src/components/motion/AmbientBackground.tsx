import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../../lib/scroll';

/**
 * Site-wide living backdrop (behind every section that doesn't paint its own):
 * slow gold dust on a canvas, two thin orbit rings and a few drafting marks
 * that drift with scroll. Cheap by design: one canvas, ≤ 60 particles, paused
 * when the tab is hidden, static when the OS asks for reduced motion.
 */
export function AmbientBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const shapes = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    const count = window.innerWidth < 768 ? 14 : 30;
    const gold = () => getComputedStyle(document.documentElement).getPropertyValue('--gold-rgb').trim() || '212 175 55';
    let color = gold();

    const pts = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.5 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.00012,
      vy: -0.00008 - Math.random() * 0.00018,
      tw: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let mx = 0;
    let my = 0;
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / w - 0.5) * 2;
      my = (e.clientY / h - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const [r, g, b] = color.split(/\s+/);
      for (const p of pts) {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -0.02) p.y = 1.02;
          if (p.x < -0.02) p.x = 1.02;
          if (p.x > 1.02) p.x = -0.02;
        }
        const a = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.4 + p.tw));
        const px = p.x * w + mx * p.r * 6;
        const py = p.y * h + my * p.r * 6;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let visible = !document.hidden;
    const onVis = () => {
      visible = !document.hidden;
      color = gold();
    };
    document.addEventListener('visibilitychange', onVis);
    const themeObs = new MutationObserver(() => (color = gold()));
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    let frame = 0;
    const tick = (time: number) => {
      // Half rate is plenty for slow dust and halves the cost.
      if (visible && (frame++ & 1) === 0) draw(time);
    };
    if (reduced) draw(0);
    else gsap.ticker.add(tick);

    // Drafting marks drift against the scroll for depth.
    let st: gsap.core.Tween | undefined;
    if (!reduced && shapes.current) {
      st = gsap.to(shapes.current, { yPercent: -18, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1.2 } });
    }

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      themeObs.disconnect();
      st?.scrollTrigger?.kill();
      st?.kill();
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden>
      <canvas ref={canvas} className="absolute inset-0" />
      <div ref={shapes} className="absolute inset-0 h-[130%]">
        {/* orbit rings */}
        <svg className="absolute -top-[18vw] -end-[14vw] w-[52vw] h-[52vw] opacity-[0.12] spin-slow" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="98" fill="none" stroke="rgb(var(--gold-rgb))" strokeWidth=".4" />
          <circle cx="100" cy="100" r="78" fill="none" stroke="rgb(var(--gold-rgb))" strokeWidth=".3" strokeDasharray="1 4" />
          <circle cx="198" cy="100" r="2" fill="rgb(var(--gold-rgb))" />
        </svg>
        <svg className="absolute top-[55%] -start-[16vw] w-[40vw] h-[40vw] opacity-[0.1] [animation:spin_40s_linear_infinite_reverse]" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="98" fill="none" stroke="rgb(var(--gold-rgb))" strokeWidth=".4" strokeDasharray="2 6" />
          <circle cx="2" cy="100" r="2.4" fill="rgb(var(--gold-rgb))" />
        </svg>
        {/* drafting marks */}
        {[
          ['12%', '30%', 'plus'],
          ['82%', '22%', 'diamond'],
          ['68%', '64%', 'plus'],
          ['22%', '78%', 'diamond'],
          ['48%', '46%', 'cross'],
        ].map(([l, t, k], i) => (
          <svg key={i} className="absolute w-4 h-4 opacity-30 float-y" style={{ left: l, top: t, animationDelay: `${i * 0.9}s` }} viewBox="0 0 16 16">
            {k === 'plus' && <path d="M8 1v14M1 8h14" stroke="rgb(var(--gold-rgb))" strokeWidth="1" />}
            {k === 'cross' && <path d="M3 3l10 10M13 3L3 13" stroke="rgb(var(--gold-rgb))" strokeWidth="1" />}
            {k === 'diamond' && <path d="M8 1l7 7-7 7-7-7z" fill="none" stroke="rgb(var(--gold-rgb))" strokeWidth="1" />}
          </svg>
        ))}
      </div>
    </div>
  );
}
