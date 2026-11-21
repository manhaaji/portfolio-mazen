import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Modal } from './Modal';
import { scrollToId, prefersReducedMotion, setMotion } from '../lib/scroll';
import { ArrowUpRight } from 'lucide-react';

export function Footer() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  // The wordmark lights up letter by letter on its own while it is on screen.
  const markRef = useRef<HTMLDivElement>(null);
  const [markOn, setMarkOn] = useState(false);
  useEffect(() => {
    const el = markRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setMarkOn(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const themeColor = theme === 'dark' ? '#D4AF37' : '#2563eb';

  const handleNavClick = (path: string) => {
    if (path.startsWith('/#')) {
      const targetId = path.replace('/#', '');
      navigate('/');
      scrollToId(targetId);
    } else {
      navigate(path);
    }
  };

  const quickLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/#about', label: t('nav.about') },
    { path: '/portfolio', label: t('nav.portfolio') },
    { path: '/#services', label: t('nav.services') },
    { path: '/#contact', label: t('nav.contact') },
  ];

  const socialLinks = [
    { name: 'WhatsApp', url: 'https://wa.me/201019094352', initial: 'W' },
    { name: 'Facebook', url: 'https://www.facebook.com/mazen1862002', initial: 'F' },
    { name: 'Instagram', url: 'https://www.instagram.com/mazen.ve', initial: 'I' },
    { name: 'Telegram', url: 'https://t.me/Mazen_ve', initial: 'T' },
  ];

  const PrivacyContent = () => (
    <div className="space-y-6 text-gray-300 max-h-[60vh] overflow-y-auto pr-4">
      <div className="border-b border-foreground/10 pb-4">
        <h3 className="text-2xl font-oswald font-bold text-white mb-2">
          {language === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}
        </h3>
        <p className="text-sm text-gray-500">
          {language === 'en' ? 'Last updated: March 2026' : 'آخر تحديث: مارس 2026'}
        </p>
      </div>

      <section>
        <h4 className="text-lg font-bold text-white mb-3">
          {language === 'en' ? '1. Introduction' : '1. مقدمة'}
        </h4>
        <p className="leading-relaxed">
          {language === 'en'
            ? 'At Mazen Portfolio, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information when you use our website and services.'
            : 'في استوديو مازن، نأخذ خصوصيتك على محمل الجد. تصف سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدام موقعنا وخدماتنا.'}
        </p>
      </section>

      <section>
        <h4 className="text-lg font-bold text-white mb-3">
          {language === 'en' ? '2. Information We Collect' : '2. المعلومات التي نجمعها'}
        </h4>
        <p className="leading-relaxed mb-3">
          {language === 'en'
            ? 'We may collect personal information such as:'
            : 'قد نجمع معلومات شخصية مثل:'}
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>{language === 'en' ? 'Name and contact information' : 'الاسم ومعلومات الاتصال'}</li>
          <li>{language === 'en' ? 'Email address' : 'عنوان البريد الإلكتروني'}</li>
          <li>{language === 'en' ? 'Phone number' : 'رقم الهاتف'}</li>
          <li>{language === 'en' ? 'Project details and requirements' : 'تفاصيل المشروع والمتطلبات'}</li>
        </ul>
      </section>

      <section>
        <h4 className="text-lg font-bold text-white mb-3">
          {language === 'en' ? '3. How We Use Your Information' : '3. كيف نستخدم معلوماتك'}
        </h4>
        <p className="leading-relaxed">
          {language === 'en'
            ? 'We use your information to provide our services, communicate with you about your projects, and improve our offerings. We never sell your personal information to third parties.'
            : 'نستخدم معلوماتك لتقديم خدماتنا والتواصل معك بشأن مشاريعك وتحسين عروضنا. لا نبيع معلوماتك الشخصية أبداً لأطراف ثالثة.'}
        </p>
      </section>

      <section>
        <h4 className="text-lg font-bold text-white mb-3">
          {language === 'en' ? '4. Data Security' : '4. أمان البيانات'}
        </h4>
        <p className="leading-relaxed">
          {language === 'en'
            ? 'We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.'
            : 'ننفذ تدابير أمان مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفصاح.'}
        </p>
      </section>

      <section>
        <h4 className="text-lg font-bold text-white mb-3">
          {language === 'en' ? '5. Contact Us' : '5. اتصل بنا'}
        </h4>
        <p className="leading-relaxed">
          {language === 'en'
            ? 'If you have any questions about this Privacy Policy, please contact us at:'
            : 'إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا على:'}
        </p>
        <p className="mt-2" style={{ color: themeColor }}>mazen186venom@gmail.com</p>
      </section>
    </div>
  );

  const TermsContent = () => (
    <div className="space-y-6 text-gray-300 max-h-[60vh] overflow-y-auto pr-4">
      <div className="border-b border-foreground/10 pb-4">
        <h3 className="text-2xl font-oswald font-bold text-white mb-2">
          {language === 'en' ? 'Terms of Service' : 'شروط الخدمة'}
        </h3>
        <p className="text-sm text-gray-500">
          {language === 'en' ? 'Last updated: March 2026' : 'آخر تحديث: مارس 2026'}
        </p>
      </div>

      <section>
        <h4 className="text-lg font-bold text-white mb-3">
          {language === 'en' ? '1. Acceptance of Terms' : '1. قبول الشروط'}
        </h4>
        <p className="leading-relaxed">
          {language === 'en'
            ? 'By accessing and using the Mazen Portfolio website and services, you agree to be bound by these Terms of Service.'
            : 'من خلال الوصول إلى موقع استوديو مازن واستخدامه وخدماته، فإنك توافق على الالتزام بشروط الخدمة هذه.'}
        </p>
      </section>

      <section>
        <h4 className="text-lg font-bold text-white mb-3">
          {language === 'en' ? '2. Services' : '2. الخدمات'}
        </h4>
        <p className="leading-relaxed">
          {language === 'en'
            ? 'Mazen Portfolio provides graphic design, video editing, motion graphics, and related creative services. All projects are subject to agreement on scope, timeline, and payment terms.'
            : 'يقدم استوديو مازن خدمات التصميم الجرافيكي ومونتاج الفيديو والرسوم المتحركة والخدمات الإبداعية ذات الصلة. جميع المشاريع خاضعة للاتفاق على النطاق والجدول الزمني وشروط الدفع.'}
        </p>
      </section>

      <section>
        <h4 className="text-lg font-bold text-white mb-3">
          {language === 'en' ? '3. Intellectual Property' : '3. الملكية الفكرية'}
        </h4>
        <p className="leading-relaxed">
          {language === 'en'
            ? 'All content on this website, including designs, logos, and text, is the property of Mazen Portfolio and protected by copyright laws. Client projects are governed by individual agreements.'
            : 'جميع المحتويات على هذا الموقع، بما في ذلك التصاميم والشعارات والنصوص، هي ملك لاستوديو مازن ومحمية بموجب قوانين حقوق النشر. تحكم مشاريع العملاء اتفاقيات فردية.'}
        </p>
      </section>

      <section>
        <h4 className="text-lg font-bold text-white mb-3">
          {language === 'en' ? '4. Payment Terms' : '4. شروط الدفع'}
        </h4>
        <p className="leading-relaxed">
          {language === 'en'
            ? 'Payment terms are specified in project agreements. Typically, a 50% deposit is required to begin work, with the balance due upon completion.'
            : 'يتم تحديد شروط الدفع في اتفاقيات المشروع. عادةً، يُطلب دفع 50% كعربون لبدء العمل، مع استحقاق الرصيد عند الانتهاء.'}
        </p>
      </section>

      <section>
        <h4 className="text-lg font-bold text-white mb-3">
          {language === 'en' ? '5. Contact' : '5. الاتصال'}
        </h4>
        <p className="leading-relaxed">
          {language === 'en'
            ? 'For questions about these terms, contact us at:'
            : 'للأسئلة حول هذه الشروط، اتصل بنا على:'}
        </p>
        <p className="mt-2" style={{ color: themeColor }}>mazen186venom@gmail.com</p>
      </section>
    </div>
  );

  const goTop = () => {
    navigate('/');
    scrollToId('hero');
  };

  return (
    <footer className="relative overflow-hidden border-t border-foreground/10">
      <div className="wrap pt-20 md:pt-28">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-12 md:gap-12 pb-16 md:pb-24">
          <div className="col-span-2 md:col-span-5">
            <p className="eyebrow mb-5">{language === 'en' ? 'Next scene' : 'المشهد الجاي'}</p>
            <p className="t-h2 text-foreground mb-8 max-w-md">{t('footer.tagline')}</p>
            <button onClick={() => handleNavClick('/#contact')} className="btn btn-line">
              <span className="btn-icon"><ArrowUpRight size={14} className="rtl:-scale-x-100" /></span>
              {t('nav.letsTalk')}
            </button>
          </div>

          <nav className="col-span-1 md:col-span-2 md:col-start-7" aria-label={t('footer.quickLinks')}>
            <p className="font-oswald text-[11px] tracking-[0.3em] uppercase muted-3 mb-5">{t('footer.quickLinks')}</p>
            <ul className="space-y-2.5 text-[15px]">
              {quickLinks.map(link => (
                <li key={link.path}>
                  <button onClick={() => handleNavClick(link.path)} className="u-link text-foreground/75 hover:text-foreground transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-1 md:col-span-2">
            <p className="font-oswald text-[11px] tracking-[0.3em] uppercase muted-3 mb-5">Social</p>
            <ul className="space-y-2.5 text-[15px]">
              {socialLinks.map(social => (
                <li key={social.name}>
                  <a href={social.url} target="_blank" rel="noopener noreferrer" className="u-link text-foreground/75 hover:text-gold transition-colors">
                    {social.name}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-2 pt-6 md:pt-0 border-t md:border-t-0 border-foreground/10">
            <p className="font-oswald text-[11px] tracking-[0.3em] uppercase muted-3 mb-5">{t('footer.legal')}</p>
            <ul className="space-y-2.5 text-[15px]">
              <li>
                <button onClick={() => setIsPrivacyOpen(true)} className="u-link text-foreground/75 hover:text-foreground transition-colors">
                  {t('footer.privacyPolicy')}
                </button>
              </li>
              <li>
                <button onClick={() => setIsTermsOpen(true)} className="u-link text-foreground/75 hover:text-foreground transition-colors">
                  {t('footer.termsOfService')}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Giant wordmark: letters fill with gold under the pointer */}
      <div ref={markRef} className="relative select-none" dir="ltr" aria-hidden>
        <div className={`wordmark text-center px-2 -mb-[0.12em] ${markOn ? 'wm-on' : ''}`}>
          {[...'MAZEN KHALED'].map((c, i) => (
            <span
              key={i}
              className="wm-char inline-block transition-colors duration-500 hover:text-gold hover:[-webkit-text-stroke:0] hover:-translate-y-2 hover:duration-200"
              style={{ transitionProperty: 'color, transform', ['--i' as string]: i }}
            >
              {c === ' ' ? ' ' : c}
            </span>
          ))}
        </div>
      </div>

      <div className="relative border-t border-foreground/10 bg-background">
        <div className="wrap py-6 md:pb-20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs muted-3">
          <p>© {new Date().getFullYear()} {t('footer.copyright')}</p>
          <p className="font-oswald tracking-[0.25em] uppercase text-center" dir="ltr">Designed & edited in Giza, Egypt</p>
          <button
            onClick={() => setMotion(prefersReducedMotion())}
            className="inline-flex items-center gap-2 hover:text-gold transition-colors"
            aria-pressed={!prefersReducedMotion()}
          >
            <span className={`relative w-7 h-4 rounded-full transition-colors ${prefersReducedMotion() ? 'bg-foreground/20' : 'bg-gold'}`}>
              <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-background transition-all ${prefersReducedMotion() ? 'start-0.5' : 'start-3.5'}`} />
            </span>
            {language === 'en' ? 'Motion' : 'الحركة'}
          </button>
          <button onClick={goTop} className="u-link hover:text-gold transition-colors">
            {language === 'en' ? 'Back to top' : 'لأعلى'} ↑
          </button>
        </div>
      </div>

      <Modal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} title={t('footer.privacyPolicy')} size="lg">
        {PrivacyContent()}
      </Modal>
      <Modal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} title={t('footer.termsOfService')} size="lg">
        {TermsContent()}
      </Modal>
    </footer>
  );
}
