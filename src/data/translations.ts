// UI text comes from content.json (edited in the Mazen Studio CMS); project
// texts and category names are attached here so `t('portfolio.projects.X.title')`
// and `t('portfolio.filters.X.name')` keep working everywhere.
import { projectTexts } from './projects';
import { content, pick, type Lang } from './content';

function build(lang: Lang) {
  const base = structuredClone(content.text[lang] || content.text.en) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const filters: Record<string, { name: string; desc: string }> = { all: { name: lang === 'ar' ? 'الجميع' : 'All', desc: '' } };
  for (const c of content.categories) filters[c.id] = { name: pick(c.name, lang), desc: pick(c.desc, lang) };
  base.portfolio = { ...(base.portfolio || {}), filters, projects: projectTexts(lang) };
  const clients: Record<string, { name: string; role: string; text: string }> = {};
  content.testimonials.forEach((c, i) => (clients['c' + i] = { name: pick(c.name, lang), role: pick(c.role, lang), text: pick(c.text, lang) }));
  base.testimonials = { ...(base.testimonials || {}), clients };
  return base;
}

export const translations = { en: build('en'), ar: build('ar') };
