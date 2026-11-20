/**
 * SEO Utility Functions for Dynamic Media Alt-Text & Title Generation
 * Automatically generates keyword-rich, Google-optimized descriptions for all project media
 */

import type { Project } from '../data/projects';

/**
 * Category-specific keyword mappings for enhanced SEO
 */
const categoryKeywords: Record<string, string> = {
  'motion-video': 'Cinematic Video Editing & Motion Graphics',
  'brand-identity': 'Brand Identity & Logo Design',
  'ui-ux': 'UI/UX Design & Web Interface',
  'esports': 'Esports Branding & Gaming Visuals',
  'packaging': 'Luxury Packaging Design',
  'social-media': 'Social Media Ad Design & Content',
};

/**
 * Generates SEO-optimized alt text for project images
 * Used for portfolio gallery images and thumbnails
 */
export function generateImageAltText(
  project: Project,
  projectTitle: string,
  imageNumber?: number
): string {
  const categoryKeyword = categoryKeywords[project.category] || 'Graphic Design';
  const imageLabel = imageNumber ? `- Image ${imageNumber}` : '';
  
  return `Premium Design Project: ${projectTitle} - ${categoryKeyword} by Mazen Khaled - The Design Godfather ${imageLabel}`.trim();
}

/**
 * Generates SEO-optimized alt text for gallery thumbnails
 */
export function generateThumbnailAltText(
  project: Project,
  projectTitle: string,
  thumbnailIndex: number
): string {
  return `Mazen Khaled Portfolio Gallery: ${projectTitle} - Premium ${categoryKeywords[project.category] || 'Design'} - Thumbnail ${thumbnailIndex + 1}`;
}

/**
 * Generates title attribute for video elements
 * Used for video players and iframes
 */
export function generateVideoTitle(projectTitle: string): string {
  return `Cinematic Video: ${projectTitle} - Edited by The Design Godfather (Mazen Khaled)`;
}

/**
 * Generates aria-label for video elements
 * Ensures full accessibility for screen readers
 */
export function generateVideoAriaLabel(
  project: Project,
  projectTitle: string
): string {
  const categoryKeyword = categoryKeywords[project.category] || 'premium visual content';
  return `Professional ${categoryKeyword}: ${projectTitle} - Featuring cinematic editing, motion graphics, and visual effects by Mazen Khaled`;
}

/**
 * Generates aria-label for video thumbnails in lightbox
 */
export function generateVideoThumbnailAriaLabel(projectTitle: string): string {
  return `Play video for project: ${projectTitle} - Professional video editing by Mazen Khaled`;
}

/**
 * Master function: Generates all SEO attributes for a project media element
 * Returns an object with all necessary attributes for accessibility and SEO
 */
export function generateProjectMediaAttributes(
  project: Project,
  projectTitle: string,
  mediaType: 'image' | 'video' | 'thumbnail',
  index?: number
) {
  const isPriority = index === 0; // First image/video in sequence
  
  switch (mediaType) {
    case 'image':
      return {
        alt: generateImageAltText(project, projectTitle, index),
        loading: isPriority ? 'eager' : 'lazy' as const,
      };
      
    case 'video':
      return {
        title: generateVideoTitle(projectTitle),
        'aria-label': generateVideoAriaLabel(project, projectTitle),
      };
      
    case 'thumbnail':
      return {
        alt: generateThumbnailAltText(project, projectTitle, index || 0),
        'aria-label': generateVideoThumbnailAriaLabel(projectTitle),
        loading: 'lazy' as const,
      };
      
    default:
      return {};
  }
}

/**
 * Batch generator for multiple images in a gallery
 * Useful for rendering image galleries where you need different alt text per image
 */
export function generateGalleryAltTexts(
  project: Project,
  projectTitle: string,
  imageCount: number
): string[] {
  return Array.from({ length: imageCount }, (_, i) =>
    generateImageAltText(project, projectTitle, i + 1)
  );
}

/**
 * Generates optimized metadata for HTML head
 * Includes Open Graph and structured data hints
 */
export function generateProjectMetadata(
  project: Project,
  projectTitle: string,
  description?: string
) {
  const categoryKeyword = categoryKeywords[project.category] || 'Graphic Design';
  
  return {
    title: `${projectTitle} by Mazen Khaled - The Design Godfather | Portfolio`,
    description: description || `Professional ${categoryKeyword} project by Mazen Khaled. See how this premium design project was executed with precision and creativity.`,
    keywords: [
      projectTitle,
      'Mazen Khaled',
      'The Design Godfather',
      categoryKeyword,
      'Graphic Design',
      'Video Editing',
      'Motion Graphics',
      'Professional Designer Egypt',
    ].join(', '),
  };
}
