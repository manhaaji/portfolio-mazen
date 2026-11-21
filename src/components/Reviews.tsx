import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Star, X, Check, Trash2, LogOut, MessageSquareQuote } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  reviewsEnabled,
  approvedReviews,
  allReviews,
  onUser,
  signIn,
  signOut,
  submitReview,
  setApproved,
  removeReview,
  inAppBrowser,
  reviewsPrompt,
  facebookLogin,
  type Review,
  type ReviewUser,
} from '../lib/reviews';
import { getLenis } from '../lib/scroll';

export const openReviewForm = () => window.dispatchEvent(new Event('open-review'));

/** Approved reviews, fetched once per visit and shared by the section and the toast. */
let cache: Promise<Review[]> | null = null;
export function useApprovedReviews(active = true) {
  const [list, setList] = useState<Review[]>([]);
  useEffect(() => {
    if (!reviewsEnabled || !active) return;
    (cache ||= approvedReviews().catch(() => [])).then(setList);
  }, [active]);
  return list;
}

export function Stars({ value, onPick, size = 14 }: { value: number; onPick?: (n: number) => void; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" dir="ltr" aria-label={`${value}/5`}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={!onPick}
          onClick={() => onPick?.(n)}
          className={`${onPick ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          aria-label={`${n}`}
        >
          <Star size={size} className={n <= value ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white/25'} />
        </button>
      ))}
    </span>
  );
}

export function Avatar({ name, photo, size = 44 }: { name: string; photo?: string; size?: number }) {
  const [broken, setBroken] = useState(false);
  return photo && !broken ? (
    <img
      src={photo}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className="rounded-full object-cover ring-2 ring-[#D4AF37]/40 shrink-0"
      style={{ width: size, height: size }}
    />
  ) : (
    <span className="rounded-full grid place-items-center bg-[#D4AF37]/15 text-[#D4AF37] font-oswald font-bold shrink-0" style={{ width: size, height: size }}>
      {name.charAt(0) || '?'}
    </span>
  );
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path fill="#fff" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
  </svg>
);

/** Sign in → write a review. The owner signing in also gets the approval list. */
function ReviewModal({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage();
  // The window has its own AR/EN switch, independent of the site language.
  const [lang, setLang] = useState(language);
  const ar = lang === 'ar';
  const [user, setUser] = useState<ReviewUser | null | undefined>(undefined);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [state, setState] = useState<'idle' | 'busy' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [admin, setAdmin] = useState<Review[] | null>(null);

  useEffect(() => {
    let off: (() => void) | undefined;
    onUser(u => {
      setUser(u);
      setAdmin(null);
      if (u) allReviews().then(setAdmin, () => setAdmin(null));
    }).then(f => (off = f));
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    return () => {
      off?.();
      lenis?.start();
      document.documentElement.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const login = async (p: 'google' | 'facebook') => {
    setError('');
    try {
      await signIn(p);
    } catch (e) {
      const code = (e as { code?: string }).code || '';
      if (code === 'auth/popup-blocked')
        setError(ar ? 'المتصفح منع نافذة الدخول — اسمح بالنوافذ المنبثقة للموقع وجرّب تاني.' : 'The browser blocked the sign-in window — allow pop-ups for this site and try again.');
      else if (code === 'auth/account-exists-with-different-credential')
        setError(ar ? 'الإيميل ده متسجل بطريقة تانية — جرّب الدخول بجوجل.' : 'This email already uses another sign-in method — try Google.');
      else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request')
        setError(ar ? 'تسجيل الدخول مكملش — جرّب تاني.' : 'Sign-in did not complete — please try again.');
    }
  };

  const send = async () => {
    if (!user || text.trim().length < 10) {
      setError(ar ? 'اكتب رأيك في 10 حروف على الأقل.' : 'Please write at least 10 characters.');
      return;
    }
    setState('busy');
    setError('');
    try {
      await submitReview(user, text, rating);
      setState('sent');
      try {
        localStorage.setItem('reviewed', '1');
      } catch {
        /* private mode */
      }
    } catch {
      setState('idle');
      setError(ar ? 'حصلت مشكلة في الإرسال — جرّب تاني.' : 'Could not send — please try again.');
    }
  };

  const moderate = async (r: Review, action: 'approve' | 'hide' | 'delete') => {
    if (action === 'delete') await removeReview(r.id);
    else await setApproved(r.id, action === 'approve');
    cache = null;
    setAdmin(await allReviews());
  };

  return createPortal(
    <div className="fixed inset-0 z-[9100] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" dir={ar ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-lg max-h-[92svh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#0d0d0d] text-[#f4f1ea] ring-1 ring-[#D4AF37]/25 shadow-[0_40px_120px_-30px_rgba(212,175,55,.35)] p-6 sm:p-8 animate-[deckIn_.45s_cubic-bezier(.16,1,.3,1)]"
        data-lenis-prevent
      >
        <div className="absolute top-4 end-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(ar ? 'en' : 'ar')}
            className="h-9 px-3 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold tracking-wide"
            aria-label={ar ? 'English' : 'عربي'}
          >
            {ar ? 'EN' : 'ع'}
          </button>
          <button onClick={onClose} className="w-9 h-9 rounded-full grid place-items-center bg-white/5 hover:bg-white/10" aria-label={ar ? 'اقفل' : 'Close'}>
            <X size={16} />
          </button>
        </div>
        <p className="font-oswald text-[11px] tracking-[0.3em] uppercase text-[#D4AF37] mb-2 pe-24">{ar ? 'رأيك يهمني' : 'Your review'}</p>
        <h3 className="text-2xl font-bold mb-6">{ar ? 'اشتغلنا مع بعض؟ قول رأيك' : 'Worked together? Leave a review'}</h3>

        {user === undefined ? (
          <div className="h-24 grid place-items-center text-white/40 text-sm">…</div>
        ) : !user ? (
          <div className="space-y-3">
            <p className="text-sm text-white/55 mb-4">
              {ar ? 'سجّل دخول عشان رأيك يظهر باسمك وصورتك. مش هنشوف أي بيانات تانية.' : 'Sign in so your review shows with your name and photo. Nothing else is shared.'}
            </p>
            {inAppBrowser() && (
              <div className="rounded-xl bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]/40 p-3 text-sm text-[#f4d38a] mb-2">
                {ar
                  ? 'إنت فاتح من جوه إنستجرام/فيسبوك، والتسجيل مش بيشتغل هنا. دوس ⋯ فوق واختار "فتح في المتصفح" (Chrome أو Safari).'
                  : 'You are inside the Instagram/Facebook browser, where sign-in is blocked. Tap ⋯ and choose "Open in browser".'}
              </div>
            )}
            <button onClick={() => login('google')} className="w-full h-12 rounded-full bg-white text-black font-medium inline-flex items-center justify-center gap-3 hover:bg-white/90 transition-colors">
              <GoogleIcon /> {ar ? 'الدخول بجوجل' : 'Continue with Google'}
            </button>
            {facebookLogin && (
              <button onClick={() => login('facebook')} className="w-full h-12 rounded-full bg-[#1877F2] text-white font-medium inline-flex items-center justify-center gap-3 hover:brightness-110 transition">
                <FacebookIcon /> {ar ? 'الدخول بفيسبوك' : 'Continue with Facebook'}
              </button>
            )}
          </div>
        ) : state === 'sent' ? (
          <div className="text-center py-6">
            <span className="mx-auto mb-4 w-14 h-14 rounded-full grid place-items-center bg-[#D4AF37] text-black">
              <Check size={26} />
            </span>
            <p className="text-lg font-semibold mb-1">{ar ? 'شكرًا يا ' + user.name.split(' ')[0] + '!' : 'Thank you, ' + user.name.split(' ')[0] + '!'}</p>
            <p className="text-sm text-white/55">{ar ? 'رأيك وصل، وهيظهر على الموقع بعد المراجعة.' : 'Your review will appear once it is approved.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} photo={user.photo} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{user.name}</p>
                <Stars value={rating} onPick={setRating} size={18} />
              </div>
              <button onClick={() => signOut()} className="text-white/40 hover:text-white/80" title={ar ? 'خروج' : 'Sign out'}>
                <LogOut size={16} />
              </button>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={600}
              rows={4}
              placeholder={ar ? 'اكتب تجربتك…' : 'Tell people about working together…'}
              className="w-full px-4 py-3 rounded-xl bg-white/5 ring-1 ring-white/10 focus:ring-[#D4AF37]/60 outline-none text-sm leading-relaxed resize-none"
            />
            <div className="flex items-center justify-between text-[11px] text-white/35">
              <span>{text.length}/600</span>
            </div>
            <button
              onClick={send}
              disabled={state === 'busy'}
              className="w-full h-12 rounded-full bg-[#D4AF37] text-black font-semibold hover:brightness-110 disabled:opacity-60 transition"
            >
              {state === 'busy' ? (ar ? 'بيبعت…' : 'Sending…') : ar ? 'ابعت رأيك' : 'Send review'}
            </button>
          </div>
        )}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {admin && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="font-oswald text-[11px] tracking-[0.3em] uppercase text-[#D4AF37] mb-4">
              {ar ? 'مراجعة الآراء' : 'Moderation'} · {admin.filter(r => !r.approved).length} {ar ? 'مستني' : 'waiting'}
            </p>
            <ul className="space-y-3">
              {admin.map(r => (
                <li key={r.id} className={`rounded-xl p-4 ring-1 ${r.approved ? 'ring-white/10 bg-white/[.02]' : 'ring-[#D4AF37]/40 bg-[#D4AF37]/5'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar name={r.name} photo={r.photo} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{r.name}</p>
                      <Stars value={r.rating} size={11} />
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.approved ? 'bg-green-500/15 text-green-400' : 'bg-[#D4AF37]/15 text-[#D4AF37]'}`}>
                      {r.approved ? (ar ? 'ظاهر' : 'live') : ar ? 'مستني' : 'waiting'}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed mb-3">{r.text}</p>
                  <div className="flex gap-2">
                    <button onClick={() => moderate(r, r.approved ? 'hide' : 'approve')} className="h-8 px-3 rounded-full text-xs bg-white/10 hover:bg-[#D4AF37] hover:text-black transition-colors inline-flex items-center gap-1.5">
                      <Check size={13} /> {r.approved ? (ar ? 'إخفاء' : 'Hide') : ar ? 'اعتمد' : 'Approve'}
                    </button>
                    <button onClick={() => confirm(ar ? 'تمسح الرأي ده؟' : 'Delete this review?') && moderate(r, 'delete')} className="h-8 px-3 rounded-full text-xs bg-white/5 hover:bg-red-500/80 transition-colors inline-flex items-center gap-1.5">
                      <Trash2 size={13} /> {ar ? 'مسح' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Site-wide: after a visitor has stayed 10 s, approved reviews slide in one by
 * one at the corner (with "write yours"). Also hosts the review form.
 */
export function ReviewsLayer() {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [form, setForm] = useState(false);
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem('reviewsToast') === 'off';
    } catch {
      return false;
    }
  });
  const [i, setI] = useState(0);
  const list = useApprovedReviews(ready);
  const closeForm = useCallback(() => setForm(false), []);

  useEffect(() => {
    const open = () => setForm(true);
    window.addEventListener('open-review', open);
    // Owner shortcut: mazen.manhaaji.com/?reviews opens the form (and the approval list).
    if (new URLSearchParams(location.search).has('reviews')) setForm(true);
    const t = window.setTimeout(async () => {
      setReady(true);
      if (!reviewsEnabled || !reviewsPrompt) return;
      // Once per visit, and never for someone who already sent a review.
      try {
        if (localStorage.getItem('reviewed') === '1' || sessionStorage.getItem('reviewPrompted') === '1') return;
        sessionStorage.setItem('reviewPrompted', '1');
      } catch {
        /* private mode */
      }
      // After 10 s a visitor who is not signed in gets the review window (closable).
      // Wait for Firebase's first answer (it restores a saved sign-in asynchronously), then stop listening.
      let off: (() => void) | undefined;
      let done = false;
      off = await onUser(u => {
        if (done) return;
        done = true;
        if (!u) setForm(true);
        window.setTimeout(() => off?.(), 0);
      });
      if (done) off();
    }, 10000);
    return () => {
      window.removeEventListener('open-review', open);
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!ready || hidden || list.length < 2) return;
    const t = window.setInterval(() => setI(n => (n + 1) % list.length), 7000);
    return () => window.clearInterval(t);
  }, [ready, hidden, list.length]);

  if (!reviewsEnabled) return null;
  const close = () => {
    setHidden(true);
    try {
      sessionStorage.setItem('reviewsToast', 'off');
    } catch {
      /* private mode */
    }
  };
  const r = list[i];

  return (
    <>
      {ready && !hidden && !form && (
        <div
          key={r?.id || 'invite'}
          className="fixed bottom-4 start-4 z-[8000] w-[min(340px,calc(100vw-2rem))] rounded-2xl bg-[#0d0d0d]/92 backdrop-blur-md text-[#f4f1ea] ring-1 ring-[#D4AF37]/25 shadow-[0_24px_70px_-20px_rgba(0,0,0,.8)] p-4 animate-[toastIn_.6s_cubic-bezier(.16,1,.3,1)]"
          dir={ar ? 'rtl' : 'ltr'}
          role="status"
        >
          <button onClick={close} className="absolute top-2.5 end-2.5 w-7 h-7 rounded-full grid place-items-center text-white/40 hover:text-white hover:bg-white/10" aria-label={ar ? 'اقفل' : 'Close'}>
            <X size={14} />
          </button>
          {r ? (
            <>
              <div className="flex items-center gap-3 mb-2 pe-6">
                <Avatar name={r.name} photo={r.photo} size={36} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{r.name}</p>
                  <Stars value={r.rating} size={11} />
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-white/75 line-clamp-3 mb-3">“{r.text}”</p>
            </>
          ) : (
            <div className="flex items-center gap-3 mb-3 pe-6">
              <span className="w-9 h-9 rounded-full grid place-items-center bg-[#D4AF37]/15 text-[#D4AF37]">
                <MessageSquareQuote size={17} />
              </span>
              <p className="text-sm text-white/75">{ar ? 'اشتغلنا مع بعض قبل كده؟ يسعدني أسمع رأيك.' : 'Worked with me before? I would love your review.'}</p>
            </div>
          )}
          <button onClick={() => setForm(true)} className="text-xs font-semibold text-[#D4AF37] hover:underline">
            {ar ? '+ اكتب رأيك' : '+ Write a review'}
          </button>
        </div>
      )}
      {form && <ReviewModal onClose={closeForm} />}
    </>
  );
}
