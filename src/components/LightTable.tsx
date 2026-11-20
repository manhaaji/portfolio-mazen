import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { projects } from '../data/projects';
import { useLanguage } from '../contexts/LanguageContext';
import { prefersReducedMotion, onAppReady } from '../lib/scroll';

/**
 * "Light table": every real frame from the portfolio laid out on an endless,
 * seamlessly tiled surface. Drag (or swipe) to pan with inertia; the board
 * also drifts on its own and leans toward the pointer. Clicking a frame opens
 * its project. Pattern after Codrops' infinite parallax grid, built on GSAP's
 * ticker so it shares one rAF loop with Lenis.
 */

interface Frame {
  src: string;
  projectId: string;
  title: string;
  n: number;
}
interface Placed extends Frame {
  x: number;
  y: number;
  w: number;
  h: number;
  depth: number;
}

// Deterministic pseudo-random so the layout is identical on every visit.
const rand = (i: number) => {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

function layout(frames: Frame[], cell: number, cols: number) {
  const placed: Placed[] = [];
  const colH = new Array(cols).fill(0);
  frames.forEach((f, i) => {
    const c = colH.indexOf(Math.min(...colH));
    const ratio = [1.25, 0.8, 1, 1.4, 0.75][Math.floor(rand(i) * 5)];
    const w = cell * (0.62 + rand(i + 7) * 0.22);
    const h = w * ratio;
    const gap = cell * 0.18;
    const x = c * cell + (cell - w) / 2 + (rand(i + 3) - 0.5) * cell * 0.12;
    const y = colH[c] + gap * (0.6 + rand(i + 11));
    colH[c] = y + h;
    placed.push({ ...f, x, y, w, h, depth: 0.6 + rand(i + 5) * 0.8 });
  });
  const H = Math.max(...colH) + cell * 0.2;
  return { placed, W: cols * cell, H };
}

export function LightTable({ onHoverTitle, onFirstDrag }: { onHoverTitle?: (t: string | null) => void; onFirstDrag?: () => void }) {
  const firstDrag = useRef(onFirstDrag);
  useEffect(() => {
    firstDrag.current = onFirstDrag;
  }, [onFirstDrag]);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(() => window.innerWidth);

  const frames = useMemo<Frame[]>(() => {
    const list: Frame[] = [];
    projects.forEach(p => {
      for (let i = 1; i <= p.imagesCount; i++) {
        list.push({
          src: `/assets/portfolio/${p.category}/${p.folderName}/thumbs/${String(i).padStart(2, '0')}.webp`,
          projectId: p.id,
          title: p.id,
          n: i,
        });
      }
    });
    // Interleave projects so neighbouring frames come from different work.
    return list.sort((a, b) => a.n - b.n || a.projectId.localeCompare(b.projectId));
  }, []);

  const mobile = vw < 768;
  const cols = mobile ? 4 : 6;
  const cell = mobile ? Math.max(150, vw / 2.6) : Math.max(230, vw / 5.2);
  // Repeat the frames until the tile is comfortably taller than the screen.
  const { placed, W, H } = useMemo(() => {
    if (!frames.length) return { placed: [], W: 0, H: 0 };
    const pool: Frame[] = [];
    while (pool.length < cols * 6) pool.push(...frames);
    return layout(pool.slice(0, Math.max(cols * 6, frames.length)), cell, cols);
  }, [frames, cell, cols]);

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const el = root.current;
    const b = board.current;
    if (!el || !b || !W || !H) return;
    const reduced = prefersReducedMotion();
    const items = [...b.querySelectorAll<HTMLElement>('.lt-item')];


    let x = -W * 0.25;
    let y = -H * 0.2;
    let tx = x;
    let ty = y;
    let vx = 0;
    let vy = 0;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let mx = 0;
    let my = 0;
    let visible = true;

    // Entrance: frames develop onto the table.
    gsap.set(items, { opacity: 0, scale: 0.7 });
    const off = onAppReady(() => {
      gsap.to(items, {
        opacity: 1,
        scale: 1,
        duration: reduced ? 0.01 : 0.8,
        ease: 'expo.out',
        stagger: { each: 0.005, from: 'center', grid: 'auto' },
      });
      // A gentle push on arrival shows, without words, that the table moves.
      if (!reduced) vx = -26;
    });

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const tick = () => {
      if (!visible) return;
      if (!dragging && !reduced) {
        tx += vx;
        ty += vy;
        vx *= 0.94;
        vy *= 0.94;
        tx -= 0.25; // slow drift
        ty -= 0.12;
      }
      x += (tx + mx - x) * 0.08;
      y += (ty + my - y) * 0.08;
      const ox = ((x % W) + W) % W;
      const oy = ((y % H) + H) % H;
      b.style.transform = `translate3d(${-ox}px, ${-oy}px, 0)`;
    };
    gsap.ticker.add(tick);

    const down = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      vx = vy = 0;
      el.classList.add('is-dragging');
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (!reduced && e.pointerType === 'mouse') {
        mx = ((e.clientX - r.left) / r.width - 0.5) * -60;
        my = ((e.clientY - r.top) / r.height - 0.5) * -40;
      }
      if (!dragging) return;
      if (moved > 30 && firstDrag.current) {
        firstDrag.current();
        firstDrag.current = undefined;
      }
      const dx = e.clientX - lastX;
      const dy = e.pointerType === 'touch' ? 0 : e.clientY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      tx -= dx * 1.15;
      ty -= dy * 1.15;
      vx = -dx * 0.9;
      vy = -dy * 0.9;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const up = () => {
      dragging = false;
      el.classList.remove('is-dragging');
    };
    const click = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const item = (e.target as HTMLElement).closest<HTMLElement>('.lt-item');
      if (item?.dataset.project) navigate(`/portfolio/${item.dataset.project}`);
    };

    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    el.addEventListener('click', click, true);
    return () => {
      off();
      io.disconnect();
      gsap.ticker.remove(tick);
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      el.removeEventListener('click', click, true);
    };
  }, [W, H, navigate]);

  // 2×2 copies of the tile cover any viewport the tile is at least as big as.
  const copies = [
    [0, 0],
    [W, 0],
    [0, H],
    [W, H],
  ];

  return (
    <div ref={root} className="light-table absolute inset-0 overflow-hidden" data-cursor="Drag" aria-hidden>
      <div ref={board} className="absolute top-0 left-0 will-change-transform" style={{ width: W * 2, height: H * 2 }} dir="ltr">
        {copies.map(([cx, cy], ci) =>
          placed.map((p, i) => (
            <div
              key={`${ci}-${i}`}
              className="lt-item absolute"
              data-project={p.projectId}
              data-cursor="Open"
              style={{ left: cx + p.x, top: cy + p.y, width: p.w, height: p.h }}
              onPointerEnter={() => onHoverTitle?.(p.projectId)}
              onPointerLeave={() => onHoverTitle?.(null)}
            >
              <img src={p.src} alt="" draggable={false} loading={ci === 0 ? 'eager' : 'lazy'} decoding="async" />
              <span className="lt-tag" dir="ltr">
                {p.projectId} · {String(p.n).padStart(2, '0')}
              </span>
            </div>
          )),
        )}
      </div>
      <span className="sr-only">{language === 'ar' ? 'معرض أعمال قابل للسحب' : 'Draggable board of work'}</span>
    </div>
  );
}
