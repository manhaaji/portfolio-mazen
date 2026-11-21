// Project data lives in projects.json — it is written by the "Mazen Studio"
// desktop CMS (D:\موقعي\portfolio\studio). Do not hand-edit the list here.
import data from './projects.json';
import { content, type MediaVideo, type VideoKind } from './content';

export interface ProjectText {
  title: string;
  description: string;
  details?: string;
  client?: string;
  services?: string[];
  liveUrl?: string;
  date?: string;
}

export interface ProjectRecord {
  id: string;
  category: string;
  folder: string;
  imagesCount: number;
  sizes?: [number, number][];
  video?: string;
  videoKind?: VideoKind;
  videos?: MediaVideo[];
  added?: string;
  month?: string;
  order?: number;
  hidden?: boolean;
  en: ProjectText;
  ar: ProjectText;
}

export interface Project {
  id: string;
  category: string;
  folderName: string;
  imagesCount: number;
  /** [width, height] per image, 01 first (the cover). */
  sizes: [number, number][];
  videoUrl?: string;
  mainVideoUrl?: string;
  animationLink?: string;
  videoKind?: VideoKind;
  videos?: MediaVideo[];
  // Backward compatibility for old projects
  oldImage?: string;
  oldGallery?: string[];
}

export const projectRecords: ProjectRecord[] = (data.projects as ProjectRecord[]).filter(p => !p.hidden);

// Newest first (the publisher appends new projects at the end of the file).
export const projects: Project[] = [...projectRecords]
  .sort((a, b) =>
    typeof a.order === 'number' && typeof b.order === 'number' ? a.order - b.order : (b.added || '').localeCompare(a.added || ''),
  )
  .map(p => ({
    id: p.id,
    category: p.category,
    folderName: p.folder,
    imagesCount: p.imagesCount,
    sizes: p.sizes || [],
    animationLink: p.video,
    videoKind: p.videoKind,
    videos: p.videos,
  }));

export const projectCover = (p: Pick<Project, 'category' | 'folderName' | 'oldImage'>) =>
  p.oldImage || `/assets/portfolio/${p.category}/${p.folderName}/01.webp`;

/** CSS aspect-ratio of image `i` (0 = cover); 16/9 when unknown. */
export const ratioOf = (p: Pick<Project, 'sizes'>, i = 0) => {
  const s = p.sizes?.[i];
  return s && s[0] && s[1] ? `${s[0]} / ${s[1]}` : '16 / 9';
};

export const projectImage = (p: Pick<Project, 'category' | 'folderName'>, i: number, size: 'full' | 'mid' | 'thumbs' = 'full') =>
  `/assets/portfolio/${p.category}/${p.folderName}/${size === 'full' ? '' : size + '/'}${String(i + 1).padStart(2, '0')}.webp`;

/** Responsive source set: the browser picks the 1200px or the full file by screen size. */
export const projectSrcSet = (p: Pick<Project, 'category' | 'folderName' | 'sizes'>, i: number) => {
  const w = p.sizes?.[i]?.[0];
  return w && w > 1200 ? `${projectImage(p, i, 'mid')} 1200w, ${projectImage(p, i)} ${w}w` : undefined;
};

export function projectTexts(lang: 'en' | 'ar') {
  const map: Record<string, ProjectText> = {};
  for (const p of projectRecords) {
    const fallback = lang === 'ar' ? p.en : p.ar;
    const t = p[lang] || fallback;
    map[p.id] = {
      ...t,
      title: t.title || fallback.title,
      description: t.description || fallback.description,
      details: t.details || t.description || fallback.description,
      client: t.client || '',
      services: t.services || [],
      liveUrl: t.liveUrl || '',
      date: t.date || '',
    };
  }
  return map;
}

export const categories = [
  { id: 'all', label: 'All', labelAr: 'الجميع' },
  ...content.categories.map(c => ({ id: c.id, label: c.name.en || c.id, labelAr: c.name.ar || c.name.en || c.id })),
];
