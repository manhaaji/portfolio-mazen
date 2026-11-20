import { useLanguage } from '../contexts/LanguageContext';
import { ClipMedia, Counter, ScrollHighlight } from '../components/motion/Kit';
import { Slate } from '../components/motion/EditSuite';
import { Reveal } from '../components/motion/Primitives';
import { projects } from '../data/projects';
import { content } from '../data/content';
import { SITE } from '../data/site';
import { translations } from '../data/translations';

const TOOLS = content.tools;

// Only figures the site itself backs up.
const STATS = [
  { value: content.settings.yearsExperience ?? 6, suffix: '+', key: 'stats.yearsExperience' },
  { value: projects.length, suffix: '', key: 'stats.caseStudies' },
  { value: content.settings.disciplines ?? 6, suffix: '', key: 'stats.disciplines' },
];

/**
 * "About" as a profile sheet: a framed portrait, one statement that lights up
 * as you read, a fact sheet in hairline rows, the toolkit as compact badges
 * and three verifiable numbers.
 */
export function About() {
  const { t, language } = useLanguage();

  const facts = ((translations[language].about as { facts?: { k: string; v: string }[] }).facts || []).map(f => [f.k, f.v]);

  return (
    <section id="about" className="section overflow-hidden scene-paper">
      <div className="wrap relative max-w-[1240px]">
        <Slate sc="01" title={t('about.subtitle')} meta={`${SITE.location} — Since ${SITE.since}`} />

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Portrait card */}
          <div className="lg:col-span-5 min-w-0">
            <div className="lg:sticky lg:top-28">
              <div className="pro-frame">
                <div className="pro-frame-bar" dir="ltr">
                  <span className="flex gap-1.5"><i /><i /><i /></span>
                  <span>CAM A — PORTRAIT</span>
                  <span className="pro-rec">● LIVE</span>
                </div>
                <ClipMedia className="pro-frame-media relative aspect-[4/5] bg-card" parallax={8}>
                  <img
                    src={SITE.portrait}
                    alt="Mazen Khaled — graphic designer and video editor in Giza, Egypt"
                    className="absolute inset-0 w-full h-[112%] -top-[6%] object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-5 flex items-end justify-between text-white">
                    <div>
                      <p className="font-oswald text-2xl uppercase tracking-wide leading-none" dir="ltr">Mazen Khaled</p>
                      <p className="t-serif text-[#D4AF37] text-lg mt-1">{t('about.role')}</p>
                    </div>
                    <span className="flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full bg-black/45 border border-white/15">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {t('about.available')}
                    </span>
                  </div>
                </ClipMedia>
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="lg:col-span-7 min-w-0">
            <p className="eyebrow mb-5">{t('about.profile')}</p>
            <ScrollHighlight text={t('about.statement')} className="text-[1.35rem] sm:text-[1.65rem] md:text-[1.9rem] leading-[1.45] font-medium tracking-[-0.01em] mb-10" />

            <Reveal>
              <p className="muted-2 leading-[1.85] text-[15px] sm:text-base max-w-2xl mb-10">{t('about.description')}</p>
            </Reveal>

            {/* Fact sheet */}
            <Reveal>
              <dl className="grid sm:grid-cols-2 border-t border-foreground/12">
                {facts.map(([k, v], i) => (
                  <div
                    key={k}
                    className={`flex items-baseline justify-between gap-4 py-4 border-b border-foreground/12 ${i % 2 === 0 ? 'sm:pe-6' : 'sm:ps-6 sm:border-s'}`}
                  >
                    <dt className="font-oswald text-[11px] tracking-[0.22em] uppercase muted-3 shrink-0">{k}</dt>
                    <dd className="text-sm sm:text-[15px] font-medium text-foreground text-end flex items-center gap-2">
                      {i === facts.length - 1 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {/* Toolkit */}
            <Reveal className="mt-10">
              <p className="eyebrow mb-4">{t('about.toolkit')}</p>
              <ul className="flex flex-wrap gap-2" dir="ltr">
                {TOOLS.map(tool => (
                  <li
                    key={tool.name}
                    className="group inline-flex items-center gap-2.5 ps-1.5 pe-3.5 py-1.5 rounded-full border border-foreground/12 bg-foreground/[0.03] hover:border-gold/60 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full grid place-items-center bg-gold/15 text-gold font-oswald font-semibold text-[11px] group-hover:bg-gold group-hover:text-black transition-colors">
                      {tool.mono}
                    </span>
                    <span className="text-[13px] text-foreground/80">{tool.name}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        {/* Numbers */}
        <div className="mt-16 md:mt-24 grid grid-cols-3 border-t border-foreground/12">
          {STATS.map((s, i) => (
            <Reveal key={s.key} delay={i * 0.06} className={`py-7 md:py-10 px-2 md:px-6 ${i > 0 ? 'border-s border-foreground/12' : ''}`}>
              <div className="font-oswald font-semibold text-[clamp(2.2rem,5.5vw,4.6rem)] leading-none text-foreground tabular-nums" dir="ltr">
                <Counter value={s.value} />
                <span className="text-gold">{s.suffix}</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm muted-2">{t(s.key)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
