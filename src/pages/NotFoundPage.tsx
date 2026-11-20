import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Magnetic } from '../components/motion/Primitives';

/** "Signal lost" — the 404 as a dropped feed in the edit suite. */
export default function NotFoundPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  return (
    <main className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      {/* Colour bars, the universal "no signal" card */}
      <div className="absolute inset-x-0 top-0 h-2 flex opacity-80" aria-hidden>
        {['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'].map(c => (
          <span key={c} className="flex-1" style={{ background: c }} />
        ))}
      </div>
      <div className="wrap relative">
        <p className="font-oswald text-[11px] tracking-[0.35em] uppercase text-red-500 flex items-center gap-2 mb-6" dir="ltr">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> SIGNAL LOST — 00:00:04:04
        </p>
        <h1 className="t-display text-foreground" aria-label="404">
          4<span className="text-stroke">0</span>4
        </h1>
        <div className="mt-8 grid md:grid-cols-12 gap-8 items-end">
          <p className="md:col-span-6 t-lead text-foreground/75">
            {isAr ? 'المشهد ده اتشال من التايملاين — أو عمره ما اتصوّر.' : 'This scene was cut from the timeline — or never shot at all.'}
          </p>
          <div className="md:col-span-6 flex flex-wrap gap-3 md:justify-end">
            <Magnetic>
              <Link to="/" className="btn btn-gold">
                <span className="btn-icon">
                  <ArrowUpRight size={14} className="rtl:-scale-x-100" />
                </span>
                {isAr ? 'ارجع للرئيسية' : 'Back to the opening'}
              </Link>
            </Magnetic>
            <Magnetic>
              <Link to="/portfolio" className="btn btn-line">
                {isAr ? 'كل الأعمال' : 'All work'}
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>
    </main>
  );
}
