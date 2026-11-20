import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Copy, Check, Send } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { Slate } from '../components/motion/EditSuite';
import { Reveal, Magnetic } from '../components/motion/Primitives';
import { prefersReducedMotion } from '../lib/scroll';
import { SOCIAL } from '../data/site';

gsap.registerPlugin(ScrollTrigger);

const EMAIL = 'mazen186venom@gmail.com';
const WA_NUMBER = '201019094352';

/**
 * Closing scene: an oversized call-to-action that assembles as you scroll in,
 * a direct-lines column, and a form that opens a pre-filled WhatsApp chat.
 */
export function Contact() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const titleRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ name: '', contact: '', subject: '', message: '' });
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const big = isAr ? ['خلّينا', 'نعمل حاجة', 'ماتتنسيش'] : ["Let's make", 'something', 'unforgettable'];

  useEffect(() => {
    const el = titleRef.current;
    if (!el || prefersReducedMotion()) return;
    const lines = el.querySelectorAll('.cta-line');
    const tw = gsap.fromTo(
      lines,
      { xPercent: (i: number) => (i % 2 ? 18 : -18) * (isAr ? -1 : 1), opacity: 0.15 },
      {
        xPercent: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 95%', end: 'center 55%', scrub: 0.6 },
      },
    );
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, [isAr]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = isAr
      ? `أهلاً مازن،\n\nالاسم: ${form.name}\nالتواصل: ${form.contact}\nالموضوع: ${form.subject}\n\n${form.message}`
      : `Hi Mazen,\n\nName: ${form.name}\nContact: ${form.contact}\nSubject: ${form.subject}\n\n${form.message}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    setSent(true);
    setForm({ name: '', contact: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <section id="contact" className="section overflow-hidden">
      <div className="ambient w-[44rem] h-[44rem] -bottom-80 left-1/2 -translate-x-1/2 opacity-70" />
      <div className="wrap relative">
        <Slate sc="04" title={t('contact.sectionLabel')} meta={isAr ? 'رد خلال 24 ساعة' : 'Reply within 24h'} />

        <div ref={titleRef} className="t-display text-foreground mb-16 md:mb-24" aria-label={big.join(' ')}>
          {big.map((line, i) => (
            <div
              key={i}
              aria-hidden
              className={`cta-line ${i === 1 ? 'text-end' : ''} ${i === 2 ? 't-serif text-gold' : ''}`}
              style={{ fontSize: i === 2 ? '0.95em' : undefined }}
            >
              {line}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-14 lg:gap-20">
          {/* Direct lines */}
          <div className="lg:col-span-5 space-y-10">
            <Reveal>
              <p className="t-lead text-foreground/80">{t('contact.subtitle')}</p>
            </Reveal>

            <Reveal delay={0.1} className="space-y-0">
              <div className="border-t border-foreground/10 py-6">
                <p className="eyebrow mb-3">{t('contact.info.email')}</p>
                <div className="flex items-center gap-3">
                  <a href={`mailto:${EMAIL}`} className="u-link text-[15px] sm:text-lg md:text-xl text-foreground hover:text-gold transition-colors min-w-0" dir="ltr">
                    {EMAIL}
                  </a>
                  <button
                    onClick={copyEmail}
                    aria-label={isAr ? 'انسخ الإيميل' : 'Copy email'}
                    className="shrink-0 w-9 h-9 rounded-full grid place-items-center border border-foreground/15 text-foreground/60 hover:text-gold hover:border-gold/50 transition-all"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                  <span className={`text-xs text-emerald-400 transition-opacity ${copied ? 'opacity-100' : 'opacity-0'}`}>
                    {isAr ? 'اتنسخ' : 'Copied'}
                  </span>
                </div>
              </div>
              <div className="border-t border-foreground/10 py-6">
                <p className="eyebrow mb-3">WhatsApp</p>
                <a href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 text-lg md:text-xl text-foreground hover:text-gold transition-colors" dir="ltr">
                  <FaWhatsapp className="text-gold" /> +20 101 909 4352
                  <ArrowUpRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:rotate-45 transition-all duration-500" />
                </a>
              </div>
              <div className="border-y border-foreground/10 py-6">
                <p className="eyebrow mb-3">{t('contact.info.address')}</p>
                <p className="text-lg text-foreground">{isAr ? 'الجيزة، مصر — متاح لمشاريع حول العالم' : 'Giza, Egypt — working worldwide'}</p>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal delay={0.15} className="lg:col-span-7">
            <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
              {(
                [
                  ['name', t('contact.form.name'), 'text', 'name'],
                  ['contact', isAr ? 'إيميل أو رقم' : 'Email or phone', 'text', 'email'],
                ] as const
              ).map(([name, label, type, auto]) => (
                <div key={name} className="f-field">
                  <input id={`f-${name}`} name={name} type={type} autoComplete={auto} required placeholder=" " value={form[name]} onChange={onChange} />
                  <label htmlFor={`f-${name}`}>{label}</label>
                  <span className="f-line" />
                </div>
              ))}
              <div className="f-field sm:col-span-2">
                <input id="f-subject" name="subject" type="text" placeholder=" " value={form.subject} onChange={onChange} />
                <label htmlFor="f-subject">{t('contact.form.subject')}</label>
                <span className="f-line" />
              </div>
              <div className="f-field sm:col-span-2">
                <textarea id="f-message" name="message" rows={4} required placeholder=" " value={form.message} onChange={onChange} />
                <label htmlFor="f-message">{t('contact.form.message')}</label>
                <span className="f-line" />
              </div>
              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-4 pt-4">
                <p className="text-xs muted-3 max-w-xs">
                  {isAr ? 'هيفتحلك واتساب برسالتك جاهزة — مفيش بيانات بتتحفظ على الموقع.' : 'Opens WhatsApp with your message ready — nothing is stored on this site.'}
                </p>
                <Magnetic>
                  <button type="submit" className="btn btn-gold">
                    <span className="btn-icon">
                      {sent ? <Check size={14} /> : <Send size={13} className="rtl:-scale-x-100" />}
                    </span>
                    {sent ? (isAr ? 'اتفتح واتساب' : 'WhatsApp opened') : t('contact.form.send')}
                  </button>
                </Magnetic>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
