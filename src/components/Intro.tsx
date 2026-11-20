import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { VolumeX } from 'lucide-react';
import { projects } from '../data/projects';
import { getLenis } from '../lib/scroll';

/**
 * Opening hook (once per session).
 *
 * Act 1 — hello (natural pace)
 *   a gold mascot drops in and lands · waves · speech bubble "HI!" → "I'M MAZEN"
 *   · puts its shades on · subtitle-style caption: WELCOME TO MY PORTFOLIO
 * Act 2 — transformation (fast)
 *   eyes shut · inflates · energy rings converge · implodes into a glowing dot
 * Act 3 — pinball (fast, hard)
 *   the dot slams right → top → left → bottom walls, squashing against each
 *   wall with a ripple and a directional shake, then returns to centre
 * Act 4 — reel
 *   opens into a frame · a run of cuts through real work · BOOM · logo lockup
 *   · the screen splits open.
 *
 * QA: localStorage.introDebug = '1' exposes the timeline as window.__intro.
 */

type Sfx = 'drop' | 'swish' | 'tick' | 'riser' | 'boom' | 'bed' | 'pop' | 'land' | 'suck';
const SFX: Sfx[] = ['drop', 'swish', 'tick', 'riser', 'boom', 'bed', 'pop', 'land', 'suck'];

const MASK = {
  WebkitMaskImage: "url('/assets/img/logo.png')",
  maskImage: "url('/assets/img/logo.png')",
  WebkitMaskSize: 'contain',
  maskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
} as const;

function useSfx() {
  const ctx = useRef<AudioContext | null>(null);
  const buffers = useRef<Partial<Record<Sfx, AudioBuffer>>>({});
  const raw = useRef<Partial<Record<Sfx, ArrayBuffer>>>({});

  useEffect(() => {
    SFX.forEach(n =>
      fetch(`/sfx/${n}.mp3`)
        .then(r => r.arrayBuffer())
        .then(b => (raw.current[n] = b))
        .catch(() => {}),
    );
  }, []);

  const unlock = async () => {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx.current = new AC();
      await ctx.current.resume();
      await Promise.all(
        SFX.map(async n => {
          const b = raw.current[n] || (await fetch(`/sfx/${n}.mp3`).then(r => r.arrayBuffer()));
          if (b) buffers.current[n] = await ctx.current!.decodeAudioData(b.slice(0));
        }),
      );
    } catch {
      ctx.current = null;
    }
  };

  const play = (n: Sfx, gain = 1, rate = 1) => {
    const c = ctx.current;
    const b = buffers.current[n];
    if (!c || !b) return;
    const src = c.createBufferSource();
    src.buffer = b;
    src.playbackRate.value = rate;
    const g = c.createGain();
    g.gain.value = gain;
    src.connect(g).connect(c.destination);
    src.start();
  };

  const close = () => setTimeout(() => ctx.current?.close().catch(() => {}), 3000);
  return { unlock, play, close };
}

/** The mascot: a polished gold sphere with a face and a floating glove. */
function Character() {
  return (
    <svg viewBox="0 0 220 220" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id="ch-gold" cx="36%" cy="30%" r="78%">
          <stop offset="0" stopColor="#FFF4C2" />
          <stop offset=".18" stopColor="#F7D96B" />
          <stop offset=".55" stopColor="#D9A92C" />
          <stop offset=".85" stopColor="#9C6A10" />
          <stop offset="1" stopColor="#6E4705" />
        </radialGradient>
        <radialGradient id="ch-glove" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#FFF7D6" />
          <stop offset=".5" stopColor="#F1D06A" />
          <stop offset="1" stopColor="#A87414" />
        </radialGradient>
        <linearGradient id="ch-rim" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FFE7A0" stopOpacity=".9" />
          <stop offset=".5" stopColor="#FFE7A0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse className="ch-shadow" cx="110" cy="212" rx="60" ry="8" fill="#000" opacity=".55" />
      <circle cx="110" cy="110" r="92" fill="url(#ch-gold)" />
      <circle cx="110" cy="110" r="91" fill="none" stroke="url(#ch-rim)" strokeWidth="3" />
      <ellipse cx="76" cy="60" rx="30" ry="16" fill="#fff" opacity=".45" transform="rotate(-32 76 60)" />
      <circle cx="57" cy="77" r="5" fill="#fff" opacity=".7" />
      <g className="ch-face">
        <ellipse cx="78" cy="130" rx="13" ry="7" fill="#E9713F" opacity=".28" />
        <ellipse cx="142" cy="130" rx="13" ry="7" fill="#E9713F" opacity=".28" />
        <g className="ch-eyes" style={{ transformOrigin: '110px 96px' }}>
          <rect x="76" y="80" width="15" height="31" rx="7.5" fill="#2A1B04" />
          <rect x="129" y="80" width="15" height="31" rx="7.5" fill="#2A1B04" />
          <circle cx="86" cy="88" r="3.6" fill="#fff" />
          <circle cx="139" cy="88" r="3.6" fill="#fff" />
        </g>
        <path className="ch-smile" d="M84 134 Q110 158 136 134" stroke="#2A1B04" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path className="ch-open" d="M88 130 Q110 134 132 130 Q130 162 110 162 Q90 162 88 130 Z" fill="#2A1B04" opacity="0" />
      </g>
      <g className="ch-hand" style={{ transformOrigin: '178px 116px' }}>
        <ellipse cx="192" cy="76" rx="22" ry="25" fill="url(#ch-glove)" stroke="#8A5E0E" strokeWidth="2" />
        <ellipse cx="172" cy="84" rx="8" ry="11" fill="url(#ch-glove)" stroke="#8A5E0E" strokeWidth="2" transform="rotate(-30 172 84)" />
        <path d="M186 60 v14 M196 58 v16 M205 64 v12" stroke="#8A5E0E" strokeWidth="2" strokeLinecap="round" opacity=".55" />
        <rect x="182" y="98" width="20" height="9" rx="4.5" fill="#fff" stroke="#8A5E0E" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/** Bold shades with a gold rim, sized to the mascot's eye line. */
function Shades() {
  return (
    <svg viewBox="0 0 240 80" className="w-full h-auto overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="sh-lens" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3a3a" />
          <stop offset=".45" stopColor="#0a0a0a" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <linearGradient id="sh-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9a7414" />
          <stop offset=".5" stopColor="#F4D03F" />
          <stop offset="1" stopColor="#9a7414" />
        </linearGradient>
      </defs>
      <path d="M6 14 H234" stroke="url(#sh-rim)" strokeWidth="6" strokeLinecap="round" />
      <path d="M14 14 h92 c2 34 -12 58 -46 58 c-34 0 -48 -24 -46 -58 z" fill="url(#sh-lens)" stroke="url(#sh-rim)" strokeWidth="3.5" />
      <path d="M134 14 h92 c2 34 -12 58 -46 58 c-34 0 -48 -24 -46 -58 z" fill="url(#sh-lens)" stroke="url(#sh-rim)" strokeWidth="3.5" />
      <path d="M106 18 q14 -8 28 0" stroke="url(#sh-rim)" strokeWidth="4" fill="none" />
      <g className="sh-glint" opacity="0">
        <path d="M30 26 l22 -6 M38 40 l12 -3" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <path d="M150 26 l22 -6 M158 40 l12 -3" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

const CAPTION = ['WELCOME', 'TO', 'MY', 'PORTFOLIO'];

export function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'gate' | 'run'>('gate');
  const [starting, setStarting] = useState(false);
  const sfx = useSfx();
  const done = useRef(false);

  const frames = useMemo(() => {
    const list: string[] = [];
    projects.forEach(p => {
      for (let i = 1; i <= p.imagesCount; i++) list.push(`/assets/portfolio/${p.category}/${p.folderName}/mid/${String(i).padStart(2, '0')}.webp`);
    });
    const a = list.filter((_, i) => i % 2 === 0);
    const b = list.filter((_, i) => i % 2 === 1);
    return [...a, ...b].slice(0, 16);
  }, []);

  useEffect(() => {
    frames.forEach(src => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, [frames]);

  useEffect(() => {
    getLenis()?.stop();
    document.body.style.overflow = 'hidden';
    return () => {
      getLenis()?.start();
      document.body.style.overflow = '';
    };
  }, []);

  // Gate entrance.
  useEffect(() => {
    if (!root.current) return;
    const q = gsap.utils.selector(root);
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from(q('.g-corner'), { scale: 0, opacity: 0, duration: 0.6, stagger: 0.04 })
      .from(q('.g-logo'), { scale: 0.5, opacity: 0, rotate: -40, duration: 0.8 }, 0.05)
      .from(q('.g-line'), { yPercent: 110, duration: 0.6, stagger: 0.06 }, 0.15)
      .from(q('.g-cta'), { scale: 0.6, opacity: 0, duration: 0.7, ease: 'back.out(1.8)', stagger: 0.08 }, 0.3);
    return () => {
      tl.kill();
    };
  }, []);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    sfx.close();
    onDone();
  };

  const start = async (withSound: boolean) => {
    if (starting) return;
    setStarting(true);
    if (withSound) await sfx.unlock();
    setPhase('run');
  };

  useEffect(() => {
    if (phase !== 'run' || !root.current) return;
    const q = gsap.utils.selector(root);
    const el = root.current;
    const hero = q('.ch-hero')[0] as HTMLElement;
    const body = q('.ch-body')[0] as HTMLElement;
    const dot = q('.in-dot')[0] as HTMLElement;
    const frame = q('.in-frame')[0] as HTMLElement;
    const img = q('.in-img')[0] as HTMLImageElement;
    const bg = q('.in-img-bg')[0] as HTMLImageElement;
    const counter = q('.in-count')[0] as HTMLElement;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw < 768;
    const D = mobile ? 92 : 132;
    const ex = vw / 2 - D / 2; // centre → wall distance
    const ey = vh / 2 - D / 2;
    const fw = Math.min(vw * (mobile ? 0.88 : 0.6), 920);
    const fh = Math.min(fw * (mobile ? 1.15 : 0.62), vh * 0.64);

    const tl = gsap.timeline({ onComplete: finish });
    if (localStorage.getItem('introDebug') === '1') (window as unknown as { __intro: gsap.core.Timeline }).__intro = tl;

    // Camera shake along a direction (dx, dy) with decaying bounces.
    const shake = (at: number, amp: number, dx = 1, dy = 0.5) =>
      tl.to(
        el,
        {
          keyframes: [
            { x: amp * dx, y: amp * dy, rotate: 0.9 * dx },
            { x: -amp * 0.8 * dx, y: -amp * 0.8 * dy, rotate: -0.7 * dx },
            { x: amp * 0.5 * dx, y: amp * 0.5 * dy, rotate: 0.35 * dx },
            { x: -amp * 0.25 * dx, y: -amp * 0.25 * dy, rotate: 0 },
            { x: 0, y: 0, rotate: 0 },
          ],
          duration: 0.3,
          ease: 'none',
        },
        at,
      );

    // Initial states for the run.
    gsap.set(hero, { autoAlpha: 1, y: -vh * 0.75 });
    gsap.set(q('.ch-hand'), { scale: 0 });
    gsap.set(q('.ch-shades'), { y: -vh * 0.6, rotate: -14, autoAlpha: 1 });
    gsap.set(q('.bub'), { scale: 0, autoAlpha: 0 });
    gsap.set(q('.cap'), { autoAlpha: 0, y: 14 });
    gsap.set(q('.lk-char'), { yPercent: 115 });
    gsap.set(q('.lk-rule'), { scaleX: 0 });

    // =================== ACT 1 — hello (natural pace) ===================
    tl.to(q('.in-gate'), { autoAlpha: 0, scale: 0.96, duration: 0.25, ease: 'power2.in' }, 0)
      // drop + land
      .to(hero, { y: 0, duration: 0.5, ease: 'power3.in' }, 0.15)
      .to(body, { scaleX: 1.2, scaleY: 0.78, duration: 0.08, ease: 'power2.out' }, 0.65)
      .to(body, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, 0.73)
      .call(() => {
        sfx.play('land', 1, 0.9);
        sfx.play('drop', 0.7);
      }, [], 0.65)
      .fromTo(q('.ch-ring'), { scale: 0.7, autoAlpha: 0.8 }, { scale: 2.2, autoAlpha: 0, duration: 0.7, ease: 'expo.out', immediateRender: false }, 0.65);
    shake(0.65, 10, 0, 1);

    // wave
    tl.to(q('.ch-hand'), { scale: 1, duration: 0.3, ease: 'back.out(2.4)' }, 1.0)
      .to(q('.ch-hand'), { keyframes: { rotate: [0, 26, -6, 26, -6, 22, 0] }, duration: 1.1, ease: 'sine.inOut' }, 1.15)
      .to(body, { keyframes: { rotate: [0, -4, 3, -3, 0], y: [0, -6, 0, -4, 0] }, duration: 1.1, ease: 'sine.inOut' }, 1.15)
      .call(() => sfx.play('swish', 0.35, 1.8), [], 1.2)
      .call(() => sfx.play('swish', 0.3, 2), [], 1.6)
      .to(q('.ch-eyes'), { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1 }, 1.95);

    // speech bubble 1: HI!
    const talk = (at: number, len: number) =>
      tl.to(q('.ch-smile'), { opacity: 0, duration: 0.04 }, at)
        .to(q('.ch-open'), { opacity: 1, duration: 0.04 }, at)
        .to(q('.ch-open'), { opacity: 0, duration: 0.04 }, at + len)
        .to(q('.ch-smile'), { opacity: 1, duration: 0.04 }, at + len);
    tl.to(q('.bub-1'), { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(2.2)' }, 1.25)
      .call(() => sfx.play('pop', 1, 1.1), [], 1.25);
    talk(1.25, 0.35);
    // bubble 2: I'M MAZEN
    tl.to(q('.bub-1'), { scale: 0, autoAlpha: 0, duration: 0.2, ease: 'back.in(2)' }, 2.25)
      .to(q('.bub-2'), { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(2.2)' }, 2.4)
      .call(() => sfx.play('pop', 1, 0.95), [], 2.4);
    talk(2.4, 0.5);
    tl.to(q('.ch-hand'), { scale: 0, duration: 0.25, ease: 'back.in(2)' }, 2.6);

    // shades on
    tl.to(q('.bub-2'), { scale: 0, autoAlpha: 0, duration: 0.2, ease: 'back.in(2)' }, 3.3)
      .to(q('.ch-shades'), { y: 0, rotate: 0, duration: 0.42, ease: 'power3.in' }, 3.35)
      .to(q('.ch-shades'), { y: -8, duration: 0.08, yoyo: true, repeat: 1 }, 3.77)
      .to(body, { scaleY: 0.92, scaleX: 1.06, duration: 0.08, yoyo: true, repeat: 1 }, 3.77)
      .call(() => sfx.play('land', 1), [], 3.77)
      .to(q('.sh-glint'), { opacity: 1, duration: 0.1, yoyo: true, repeat: 1 }, 4.0)
      .call(() => sfx.play('pop', 0.8, 1.7), [], 4.0);
    shake(3.77, 6, 0, 1);

    // subtitle caption, word by word (current word lit in gold)
    tl.to(q('.cap'), { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' }, 4.2);
    const words = q('.cap-w');
    words.forEach((w, i) => {
      const at = 4.35 + i * 0.32;
      tl.fromTo(w, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power3.out', immediateRender: false }, at)
        .to(w, { color: '#F4D03F', duration: 0.05 }, at)
        .call(() => sfx.play('tick', 1, 0.95 + i * 0.07), [], at);
      if (i > 0) tl.to(words[i - 1], { color: '#f4f1ea', duration: 0.12 }, at);
    });
    const capEnd = 4.35 + words.length * 0.32 + 0.45;
    tl.to(q('.cap'), { autoAlpha: 0, y: -10, duration: 0.25 }, capEnd);

    // =================== ACT 2 — transformation (fast) ===================
    const T = capEnd + 0.15;
    const ballPx = hero.offsetWidth * (184 / 220); // drawn ball diameter
    tl.call(() => sfx.play('suck', 1), [], T)
      .to(q('.ch-eyes, .ch-shades'), { scaleY: 0.1, duration: 0.08 }, T)
      .to(q('.ch-face, .ch-shades, .ch-shadow'), { autoAlpha: 0, duration: 0.14 }, T + 0.08)
      .to(body, { scale: 1.12, duration: 0.14, ease: 'power2.out' }, T + 0.05)
      .fromTo(q('.ch-conv'), { scale: 2.6, autoAlpha: 0 }, { scale: 0.35, autoAlpha: 0.9, duration: 0.3, ease: 'power3.in', stagger: 0.05, immediateRender: false }, T + 0.05)
      .to(hero, { scale: D / ballPx, duration: 0.2, ease: 'expo.in' }, T + 0.2)
      .set(q('.ch-conv'), { autoAlpha: 0 }, T + 0.42)
      .set(hero, { autoAlpha: 0 }, T + 0.4)
      .set(dot, { autoAlpha: 1, x: 0, y: 0 }, T + 0.4)
      .fromTo(dot, { scale: 1.45 }, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.45)', immediateRender: false }, T + 0.4)
      .fromTo(q('.in-flash'), { autoAlpha: 0.35 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, T + 0.4)
      .call(() => {
        sfx.play('land', 1, 0.8);
        sfx.play('drop', 0.9);
      }, [], T + 0.4);
    shake(T + 0.4, mobile ? 12 : 18, 0.7, 0.7);

    // =================== ACT 3 — pinball (fast, hard) ===================
    type Wall = 'r' | 't' | 'l' | 'b';
    const hits: { wall: Wall; x: number; y: number }[] = [
      { wall: 'r', x: ex, y: -vh * 0.12 },
      { wall: 't', x: vw * 0.16, y: -ey },
      { wall: 'l', x: -ex, y: vh * 0.06 },
      { wall: 'b', x: -vw * 0.12, y: ey },
    ];
    let p = T + 0.85;
    hits.forEach((h, i) => {
      const travel = i === 0 ? 0.17 : 0.15;
      const horiz = h.wall === 'r' || h.wall === 'l';
      const sx = h.wall === 'r' ? 1 : h.wall === 'l' ? -1 : 0;
      const sy = h.wall === 'b' ? 1 : h.wall === 't' ? -1 : 0;
      tl.call(() => sfx.play('swish', 0.9, 1.15 + i * 0.05), [], p)
        .to(dot, { x: h.x, y: h.y, scaleX: horiz ? 1.35 : 0.8, scaleY: horiz ? 0.8 : 1.35, duration: travel, ease: 'power3.in' }, p)
        .to(dot, { scaleX: horiz ? 0.48 : 1.5, scaleY: horiz ? 1.5 : 0.48, duration: 0.05, ease: 'power2.out' }, p + travel)
        .to(dot, { scaleX: 1, scaleY: 1, duration: 0.32, ease: 'elastic.out(1, 0.35)' }, p + travel + 0.05)
        .set(q('.in-ripple'), { x: h.x + (D / 2) * sx, y: h.y + (D / 2) * sy }, p + travel)
        .fromTo(q('.in-ripple'), { scale: 0.3, autoAlpha: 1 }, { scale: 5, autoAlpha: 0, duration: 0.55, ease: 'expo.out', stagger: 0.06, immediateRender: false }, p + travel)
        .fromTo(q('.in-flash'), { autoAlpha: 0.12 }, { autoAlpha: 0, duration: 0.18, immediateRender: false }, p + travel)
        .call(() => {
          sfx.play('land', 1, 0.85 + i * 0.04);
          sfx.play('drop', 1, 0.95);
        }, [], p + travel);
      shake(p + travel, mobile ? 16 : 28, sx || 0.3, sy || 0.3);
      p += travel + 0.13;
    });
    tl.to(dot, { x: 0, y: 0, duration: 0.24, ease: 'power3.out' }, p);

    // =================== ACT 4 — reel ===================
    const F = p + 0.32;
    tl.set(frame, { width: D, height: D, borderRadius: 999, autoAlpha: 1 }, F)
      .set(dot, { autoAlpha: 0 }, F)
      .to(frame, { width: fw, height: fh, borderRadius: 16, duration: 0.42, ease: 'expo.inOut' }, F)
      .call(() => sfx.play('swish', 0.6, 0.85), [], F);

    let t = F + 0.45;
    let gap = 0.26;
    frames.forEach((src, i) => {
      tl.call(
        () => {
          img.src = src;
          bg.src = src;
          counter.textContent = `FRAME ${String(i + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`;
          gsap.fromTo(img, { scale: 1.08 }, { scale: 1, duration: Math.max(0.22, gap), ease: 'power2.out' });
          sfx.play('tick', 0.85, 0.92 + (i % 4) * 0.07);
        },
        [],
        t,
      );
      t += gap;
      gap = Math.max(0.08, gap * 0.88);
    });
    const boomAt = t + 0.08;
    tl.call(() => sfx.play('riser', 0.85), [], boomAt - 0.85);
    tl.call(() => sfx.play('bed', 0.75), [], Math.max(0, boomAt - 3.25));

    tl.call(() => sfx.play('boom', 1), [], boomAt)
      .set(q('.lk'), { autoAlpha: 1 }, boomAt)
      .to(frame, { scale: 0, autoAlpha: 0, duration: 0.18, ease: 'power4.in' }, boomAt - 0.14)
      .fromTo(q('.in-flash'), { autoAlpha: 0.9 }, { autoAlpha: 0, duration: 0.55, ease: 'power2.out', immediateRender: false }, boomAt)
      .fromTo(q('.in-wave'), { scale: 0.2, autoAlpha: 0.9 }, { scale: 8, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, immediateRender: false }, boomAt)
      .fromTo(q('.lk-logo'), { scale: 2.4, autoAlpha: 0, rotate: -20 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: 0.7, ease: 'expo.out', immediateRender: false }, boomAt)
      .fromTo(q('.lk-ring'), { strokeDashoffset: 380 }, { strokeDashoffset: 0, duration: 0.9, ease: 'expo.out', immediateRender: false }, boomAt + 0.1)
      .to(q('.lk-char'), { yPercent: 0, duration: 0.55, ease: 'expo.out', stagger: 0.028 }, boomAt + 0.22)
      .to(q('.lk-rule'), { scaleX: 1, duration: 0.5, ease: 'expo.inOut' }, boomAt + 0.42)
      .fromTo(q('.lk-sub'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, immediateRender: false }, boomAt + 0.55)
      .to(q('.in-center'), { autoAlpha: 0, scale: 0.95, duration: 0.3 }, boomAt + 1.5)
      .to(q('.in-top'), { yPercent: -100, duration: 0.75, ease: 'expo.inOut' }, boomAt + 1.55)
      .to(q('.in-bottom'), { yPercent: 100, duration: 0.75, ease: 'expo.inOut' }, boomAt + 1.55);
    shake(boomAt, mobile ? 20 : 32, 1, 0.6);

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <div ref={root} className="fixed inset-0 z-[10001] text-[#f4f1ea] select-none" role="dialog" aria-label="Intro" dir="ltr">
      <div className="in-top absolute inset-x-0 top-0 h-1/2 bg-[#050505] pointer-events-none" />
      <div className="in-bottom absolute inset-x-0 bottom-0 h-1/2 bg-[#050505] pointer-events-none" />

      <div className="in-center absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vmin] h-[70vmin] rounded-full bg-[#D4AF37]/10 blur-[110px] pointer-events-none" />

        {/* ---------- Gate ---------- */}
        {phase === 'gate' && (
          <div className="in-gate absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            {['top-6 left-6 border-t border-l', 'top-6 right-6 border-t border-r', 'bottom-6 left-6 border-b border-l', 'bottom-6 right-6 border-b border-r'].map(c => (
              <span key={c} className={`g-corner absolute w-10 h-10 border-[#D4AF37]/60 pointer-events-none ${c}`} />
            ))}
            <span className="g-logo block w-20 h-20 sm:w-24 sm:h-24 mb-7 bg-[#D4AF37] pointer-events-none" style={MASK} />
            <div className="overflow-hidden pointer-events-none">
              <p className="g-line font-oswald font-semibold uppercase tracking-[0.34em] ps-[0.34em] text-2xl sm:text-4xl">Mazen Khaled</p>
            </div>
            <div className="overflow-hidden mt-1 pointer-events-none">
              <p className="g-line t-serif text-[#D4AF37] text-lg sm:text-2xl">design · motion · film</p>
            </div>
            <div className="mt-12 flex items-center gap-5">
              <button
                onClick={() => start(true)}
                disabled={starting}
                className="g-cta group relative w-36 h-36 rounded-full grid place-items-center disabled:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                aria-label="Enter with sound"
              >
                <span className="absolute inset-0 rounded-full border border-[#D4AF37]/50" />
                <span className="absolute inset-2 rounded-full border border-dashed border-[#D4AF37]/30 spin-slow" />
                <span className="absolute inset-5 rounded-full bg-gradient-to-br from-[#F4D03F] via-[#D4AF37] to-[#9a7414] shadow-[0_0_50px_rgba(212,175,55,.5)] group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute -inset-2 rounded-full border border-[#D4AF37]/30 animate-ping [animation-duration:2.4s]" />
                <span className="relative flex flex-col items-center gap-1 text-black">
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                    <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                  </svg>
                  <span className="font-oswald font-semibold tracking-[0.3em] text-[11px] uppercase ms-[0.3em]">Enter</span>
                </span>
              </button>
              <button
                onClick={() => start(false)}
                disabled={starting}
                className="g-cta w-11 h-11 rounded-full grid place-items-center border border-white/15 text-white/50 hover:text-[#D4AF37] hover:border-[#D4AF37]/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70"
                aria-label="Enter without sound"
                title="Enter without sound"
              >
                <VolumeX size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ---------- Act 1: mascot, speech bubbles, caption ---------- */}
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="relative">
            <div className="ch-hero relative w-44 h-44 sm:w-56 sm:h-56 opacity-0">
              <span className="ch-ring absolute inset-[8%] rounded-full border-2 border-[#D4AF37] opacity-0" />
              {[0, 1, 2].map(i => (
                <span key={i} className="ch-conv absolute inset-[8%] rounded-full border-2 border-[#F4D03F] opacity-0" />
              ))}
              <div className="ch-body absolute inset-0" style={{ transformOrigin: '50% 90%' }}>
                <Character />
                <div className="ch-shades absolute left-[24%] right-[24%] top-[33%] opacity-0">
                  <Shades />
                </div>
              </div>

              {/* speech bubbles: above-right on desktop, above-centre on phones */}
              {[
                { cls: 'bub-1', text: 'HI!' },
                { cls: 'bub-2', text: "I'M MAZEN" },
              ].map(b => (
                <div
                  key={b.cls}
                  className={`bub ${b.cls} absolute opacity-0 bottom-[96%] left-1/2 -translate-x-1/2 sm:bottom-[80%] sm:left-[78%] sm:translate-x-0 origin-bottom sm:origin-bottom-left`}
                >
                  <div className="relative whitespace-nowrap rounded-2xl bg-[#f4f1ea] text-[#0b0b0b] px-5 py-2.5 sm:px-6 sm:py-3 shadow-[0_20px_50px_-15px_rgba(0,0,0,.7)] font-oswald font-bold tracking-wide text-2xl sm:text-4xl">
                    {b.text === "I'M MAZEN" ? (
                      <>
                        I&apos;M <span className="text-[#B8891A]">MAZEN</span>
                      </>
                    ) : (
                      b.text
                    )}
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 sm:left-5 sm:translate-x-0 w-5 h-5 bg-[#f4f1ea] rotate-45 rounded-[3px]" />
                  </div>
                </div>
              ))}
            </div>

            {/* subtitle caption */}
            <div className="cap absolute top-full left-1/2 -translate-x-1/2 mt-8 sm:mt-10 opacity-0">
              <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap rounded-md bg-black/70 border border-white/10 px-4 py-2 sm:px-5 sm:py-2.5 font-oswald font-semibold tracking-[0.12em] text-xl sm:text-3xl">
                {CAPTION.map(w => (
                  <span key={w} className="cap-w opacity-0">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Act 2–3: the dot + wall ripples ---------- */}
        <span className="in-dot absolute w-[92px] h-[92px] sm:w-[132px] sm:h-[132px] rounded-full opacity-0 pointer-events-none bg-[radial-gradient(circle_at_35%_30%,#FFF4C2,#F7D96B_20%,#D9A92C_55%,#8a6410)] shadow-[0_0_90px_rgba(212,175,55,.8),inset_-10px_-12px_24px_rgba(0,0,0,.28)]" />
        {[0, 1].map(i => (
          <span key={i} className="in-ripple absolute w-32 h-32 rounded-full border-[3px] border-[#F4D03F] opacity-0 pointer-events-none" />
        ))}

        {/* ---------- Act 4: frame ---------- */}
        <div className="in-frame absolute w-0 h-0 overflow-hidden bg-black opacity-0 ring-1 ring-[#D4AF37]/60 shadow-[0_30px_120px_-20px_rgba(212,175,55,.45)] pointer-events-none">
          <img className="in-img-bg absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-50" alt="" src={frames[0]} />
          <img className="in-img absolute inset-0 w-full h-full object-contain" alt="" src={frames[0]} />
          <span className="in-count absolute top-3 left-3 font-oswald text-[10px] tracking-[0.3em] text-white/85 bg-black/50 px-2 py-1 rounded" />
          <span className="absolute top-3 right-3 flex items-center gap-1.5 font-oswald text-[10px] tracking-[0.3em] text-red-500">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> REC
          </span>
        </div>

        {/* ---------- boom + lockup ---------- */}
        {[0, 1, 2].map(i => (
          <span key={i} className="in-wave absolute w-40 h-40 rounded-full border-2 border-[#D4AF37] opacity-0 pointer-events-none" />
        ))}
        <div className="lk absolute flex flex-col items-center pointer-events-none opacity-0">
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 grid place-items-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 130 130" aria-hidden>
              <circle className="lk-ring" cx="65" cy="65" r="60" fill="none" stroke="#D4AF37" strokeWidth="1.2" strokeDasharray="380" strokeDashoffset="380" />
            </svg>
            <span className="lk-logo block w-20 h-20 sm:w-24 sm:h-24 opacity-0 bg-[#D4AF37]" style={MASK} />
          </div>
          <div className="mt-6 overflow-hidden font-oswald font-semibold uppercase tracking-[0.32em] ps-[0.32em] text-[2rem] sm:text-5xl leading-none">
            {[...'Mazen Khaled'].map((c, i) => (
              <span key={i} className="lk-char inline-block">
                {c === ' ' ? ' ' : c}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <span className="lk-rule block w-10 sm:w-16 h-px bg-[#D4AF37] origin-right" />
            <span className="lk-sub opacity-0 t-serif text-[#D4AF37] text-xl sm:text-2xl">design · motion · film</span>
            <span className="lk-rule block w-10 sm:w-16 h-px bg-[#D4AF37] origin-left" />
          </div>
        </div>
        <div className="in-flash absolute inset-0 bg-white opacity-0 pointer-events-none" />
      </div>

      <button onClick={finish} className="absolute bottom-6 right-6 z-10 font-oswald text-[11px] tracking-[0.3em] uppercase text-white/45 hover:text-[#D4AF37] transition-colors px-3 py-2">
        Skip intro
      </button>
    </div>
  );
}
