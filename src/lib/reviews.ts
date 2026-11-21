// Visitor reviews on Firebase (free Spark plan): sign in with Google/Facebook,
// write a review, it shows on the site once the owner approves it.
// The SDK is loaded only when reviews are actually needed.
import { content } from '../data/content';

export interface Review {
  id: string;
  uid: string;
  name: string;
  photo?: string;
  text: string;
  rating: number;
  role?: string;
  approved: boolean;
  createdAt?: number;
}

export interface ReviewUser {
  uid: string;
  name: string;
  photo?: string;
}

const cfg = content.settings.firebase;
export const reviewsEnabled = !!(cfg?.apiKey && cfg?.projectId && content.settings.reviews !== false);

type Sdk = Awaited<ReturnType<typeof load>>;
let sdk: Promise<Sdk> | null = null;

async function load() {
  const [{ initializeApp }, auth, fs] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]);
  const app = initializeApp(cfg!);
  return { auth, fs, a: auth.getAuth(app), db: fs.getFirestore(app) };
}
const getSdk = () => (sdk ||= load());

const toReview = (id: string, d: Record<string, unknown>): Review => ({
  id,
  uid: String(d.uid || ''),
  name: String(d.name || ''),
  photo: (d.photo as string) || undefined,
  text: String(d.text || ''),
  rating: Number(d.rating) || 5,
  role: (d.role as string) || undefined,
  approved: !!d.approved,
  createdAt: (d.createdAt as { toMillis?: () => number })?.toMillis?.() ?? undefined,
});

export async function approvedReviews(): Promise<Review[]> {
  const { fs, db } = await getSdk();
  // Filter only (sorted here) so no composite index has to be created in the console.
  const q = fs.query(fs.collection(db, 'reviews'), fs.where('approved', '==', true), fs.limit(50));
  const snap = await fs.getDocs(q);
  return snap.docs.map(d => toReview(d.id, d.data())).sort((x, y) => (y.createdAt || 0) - (x.createdAt || 0));
}

export async function onUser(cb: (u: ReviewUser | null) => void) {
  const { auth, a } = await getSdk();
  return auth.onAuthStateChanged(a, u => cb(u ? { uid: u.uid, name: u.displayName || 'Guest', photo: u.photoURL || undefined } : null));
}

export async function signIn(provider: 'google' | 'facebook') {
  const { auth, a } = await getSdk();
  const p = provider === 'google' ? new auth.GoogleAuthProvider() : new auth.FacebookAuthProvider();
  try {
    await auth.signInWithPopup(a, p);
  } catch (e) {
    // Popups are often blocked inside in-app browsers (Instagram, Facebook): fall back to a full redirect.
    if ((e as { code?: string }).code === 'auth/popup-blocked') await auth.signInWithRedirect(a, p);
    else throw e;
  }
}

export async function signOut() {
  const { auth, a } = await getSdk();
  await auth.signOut(a);
}

export async function submitReview(user: ReviewUser, text: string, rating: number, role: string) {
  const { fs, db } = await getSdk();
  await fs.setDoc(fs.doc(db, 'reviews', user.uid), {
    uid: user.uid,
    name: user.name.slice(0, 60),
    photo: user.photo || '',
    text: text.trim().slice(0, 600),
    rating: Math.max(1, Math.min(5, Math.round(rating))),
    role: role.trim().slice(0, 60),
    approved: false,
    createdAt: fs.serverTimestamp(),
  });
}

/** Owner only (the security rules decide): every review, waiting ones first. Throws for anyone else. */
export async function allReviews(): Promise<Review[]> {
  const { fs, db } = await getSdk();
  const snap = await fs.getDocs(fs.query(fs.collection(db, 'reviews'), fs.orderBy('createdAt', 'desc'), fs.limit(200)));
  return snap.docs.map(d => toReview(d.id, d.data())).sort((x, y) => Number(x.approved) - Number(y.approved));
}

export async function setApproved(id: string, approved: boolean) {
  const { fs, db } = await getSdk();
  await fs.updateDoc(fs.doc(db, 'reviews', id), { approved });
}

export async function removeReview(id: string) {
  const { fs, db } = await getSdk();
  await fs.deleteDoc(fs.doc(db, 'reviews', id));
}
