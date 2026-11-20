// Links and switches — all edited from the Mazen Studio CMS (content.json).
import { content, sectionVisible } from './content';

export const SOCIAL = content.social as {
  instagram?: string;
  facebook?: string;
  telegram?: string;
  whatsapp?: string;
  behance?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
};

export const SITE = {
  showTestimonials: sectionVisible('testimonials') && content.testimonials.length > 0,
  intro: content.settings.intro !== false,
  showreel: content.settings.showreel || '/images/intro.webm',
  portrait: content.settings.portrait || '/images/Mazen.jpeg',
  location: content.settings.location || 'Giza, Egypt',
  since: content.settings.since || '2019',
};
