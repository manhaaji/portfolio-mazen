// Everything editable on the site lives in content.json — written by the
// "Mazen Studio" desktop CMS (D:\موقعي\portfolio\studio). Components read it
// through these typed helpers.
import raw from './content.json';

export type Lang = 'en' | 'ar';
export type Bi = { en?: string; ar?: string };
export type VideoKind = 'loop' | 'reel' | 'film';

export interface MediaImage {
  src: string;
  thumb?: string;
  w?: number;
  h?: number;
}
export interface MediaVideo {
  src: string;
  poster?: string;
  kind?: VideoKind;
  w?: number;
  h?: number;
}

export interface SectionBase {
  id: string;
  type: string;
  visible: boolean;
  label?: Bi; // short name for the navigation / slate
}
export interface CustomSection extends SectionBase {
  type: 'gallery' | 'video' | 'text' | 'cta';
  title?: Bi;
  subtitle?: Bi;
  body?: Bi;
  images?: MediaImage[];
  video?: MediaVideo;
  layout?: 'grid' | 'masonry' | 'strip';
  button?: { label?: Bi; url?: string };
}
export type Section = SectionBase | CustomSection;

export interface Category {
  id: string;
  prefix: string;
  name: Bi;
  desc?: Bi;
}

export interface Testimonial {
  name: Bi;
  role?: Bi;
  text: Bi;
}

export interface Content {
  settings: {
    intro: boolean;
    showreel?: string;
    portrait?: string;
    location?: string;
    since?: string;
    yearsExperience?: number;
    disciplines?: number;
  };
  social: Record<string, string>;
  tools: { mono: string; name: string }[];
  sections: Section[];
  testimonials: Testimonial[];
  categories: Category[];
  text: Record<Lang, Record<string, unknown>>;
}

export const content = raw as unknown as Content;

/** Pick the visitor's language, falling back to the other one. */
export const pick = (b: Bi | undefined, lang: Lang) => (b ? b[lang] || b[lang === 'ar' ? 'en' : 'ar'] || '' : '');

export const isCustom = (s: Section): s is CustomSection => ['gallery', 'video', 'text', 'cta'].includes(s.type);
export const sectionVisible = (type: string) => content.sections.some(s => s.type === type && s.visible);
