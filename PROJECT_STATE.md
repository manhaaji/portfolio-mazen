# PROJECT STATE: Mazen Khaled Portfolio
## The Architect's Memory Bank

*Last Updated: April 25, 2026*

---

## 🎨 UI DNA (Design System Core)

### Color Palette
- **Dark Mode (Godfather Gold)**: `#D4AF37`
  - Variants: `#F4D03F` (light), `#B8941F` (dark)
  - Opacity levels: `rgba(212, 175, 55, 0.5)`, `rgba(212, 175, 55, 0.2)`, `rgba(212, 175, 55, 0.1)`
- **Light Mode (Blue)**: `#0066CC`
  - Variants: `#3399FF` (light), `#004C99` (dark)

### Glassmorphism Rules
```css
/* Core glass effect */
backdrop-blur-xl
bg-white/80 dark:bg-black/80
border border-white/10 dark:border-gold/30

/* Enhanced glass with theme-aware borders */
backdrop-blur-2xl
border border-blue-500/30 dark:border-[#D4AF37]/30
```

### Shimmer/Skeleton Animation Logic
```css
/* Tailwind config keyframes */
"shimmer": {
  "0%": { backgroundPosition: "-200% 0" },
  "100%": { backgroundPosition: "200% 0" }
}

/* Implementation */
animate-shimmer
bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent
```

---

## 🧩 Custom Components Registry

### LazyImage.tsx
**Purpose**: Progressive image loading with professional shimmer effect
**Key Features**:
- Native lazy loading (`loading="lazy"`)
- Shimmer skeleton during load
- Smooth opacity fade-in transition
- Theme-aware shimmer colors

**Critical Logic**:
```tsx
const [isLoaded, setIsLoaded] = useState(false);

// Shimmer container
<div className="absolute inset-0 z-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />

// Image with fade-in
<img
  className={cn(
    'transition-opacity duration-700 ease-in-out',
    isLoaded ? 'opacity-100' : 'opacity-0'
  )}
/>
```

### ContextMenu.tsx
**Purpose**: Custom right-click menu with theme/language controls
**Key Features**:
- Position-aware menu placement (prevents overflow)
- Theme toggle integration
- Language switcher
- RTL support for Arabic
- Glassmorphism styling

**Integration Points**:
- Triggers `#theme-toggle-btn` and `#lang-toggle-btn`
- Uses `navigator.clipboard` for copy actions
- `window.location.reload()` for refresh

### ImageLightbox.tsx
**Purpose**: Full-screen image gallery with touch/swipe support
**Key Features**:
- Touch gestures (swipe left/right)
- Keyboard navigation (arrow keys)
- Professional skeleton shimmer
- Aspect ratio preservation (1:1 fix)
- Theme-aware borders and shadows

**Critical Fix Applied**:
```tsx
// Golden Responsive Image Fix
className="max-w-full max-h-[70vh] md:max-h-[80vh] w-auto h-auto object-contain mx-auto"
containerClassName="flex items-center justify-center w-full"
```

---

## 📱 UX & Business Rules

### Mobile Optimization Rules
- **Horizontal Overflow Prevention**: `overflow-x: hidden` applied globally to prevent mobile shaking
- **Custom Cursor Disabled**: Mobile devices use `cursor-default` (no custom cursors)
- **Touch-First Interactions**: All interactive elements optimized for touch

### Performance & Media Rules
- **Video Format Mandatory**: All videos must use **WebM** format for optimal performance
- **Lazy Loading**: All images use native `loading="lazy"` with shimmer fallbacks
- **GPU Acceleration**: Critical animations use `transform-gpu` and `will-change`

### Interaction Patterns
- **Right-Click Context Menu**: Custom menu replaces browser default
- **Theme Persistence**: User theme choice saved and restored
- **Language Switching**: Real-time UI language toggle (EN/AR)

---

## 🏗️ Architecture Map

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/ui component library
│   │   └── LazyImage.tsx # ⭐ Custom lazy loading component
│   ├── ContextMenu.tsx   # ⭐ Custom right-click menu
│   ├── ImageLightbox.tsx # ⭐ Full-screen gallery viewer
│   ├── CustomVideoPlayer.tsx
│   └── [12 more components]
├── contexts/            # React context providers
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
├── data/               # Static data & translations
│   ├── projects.ts     # Portfolio project definitions
│   └── translations.ts # Multi-language support
├── hooks/              # Custom React hooks
│   ├── use-mobile.ts
│   ├── useInView.ts
│   └── useScrollPosition.ts
├── lib/                # Utility functions
│   ├── seoUtils.ts     # SEO optimization helpers
│   └── utils.ts        # General utilities
├── pages/              # Route-level page components
│   ├── HomePage.tsx
│   ├── PortfolioPage.tsx
│   ├── ProjectDetailPage.tsx
│   └── NotFoundPage.tsx
└── sections/           # Page section components
    ├── Hero.tsx
    ├── About.tsx
    ├── Portfolio.tsx
    ├── Services.tsx
    ├── Contact.tsx
    ├── Statistics.tsx
    └── Testimonials.tsx
```

---

## 🔧 Technical Decisions Log

### Image Loading Strategy
- **Primary**: Native `loading="lazy"` for performance
- **Fallback**: Custom LazyImage with shimmer for UX enhancement
- **Aspect Ratio**: Strict preservation using `object-contain` + responsive sizing

### Theme System
- **CSS Variables**: Dynamic theme switching via CSS custom properties
- **Tailwind Integration**: Theme-aware classes with `dark:` prefixes
- **Persistence**: Local storage for user preference retention

### Animation Philosophy
- **Performance First**: GPU acceleration for smooth 60fps animations
- **Progressive Enhancement**: Shimmer effects during loading states
- **Theme Consistency**: All animations respect current theme colors

### Mobile-First Approach
- **Touch Optimization**: All interactive elements sized for touch (44px minimum)
- **Performance Budget**: Lazy loading prevents mobile bandwidth waste
- **Overflow Prevention**: Global `overflow-x: hidden` eliminates horizontal scroll
- **Deployment**: Built with Vite (`npm run build`), generating a static `dist` folder deployed on GitHub Pages.
- **Contact Form**: Serverless approach. Form submissions are intercepted, formatted, and redirected to the WhatsApp Click-to-Chat API (`wa.me`).

---

## 🎯 Quality Assurance Checklist

### ✅ Implemented Features
- [x] Lazy loading with shimmer effects across all images
- [x] Theme switching (Dark Gold/Light Blue)
- [x] Multi-language support (EN/AR)
- [x] Image lightbox with touch/swipe support
- [x] Custom context menu
- [x] Mobile-responsive design
- [x] Performance optimizations (GPU acceleration)
- [x] SEO optimization utilities

### 🔄 Active Patterns
- **Component Naming**: PascalCase for React components
- **File Organization**: Feature-based folder structure
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React Context for global state
- **Animation**: Framer Motion for complex interactions

---

## 📈 Performance Metrics

### Loading Performance
- **Image Lazy Loading**: Implemented across all `<img>` tags
- **Skeleton Shimmer**: 700ms fade-in transition
- **Bundle Optimization**: Vite build system with code splitting

### Mobile Performance
- **Scroll Optimization**: GPU acceleration on scroll-triggered animations
- **Touch Gestures**: Native touch event handling
- **Memory Management**: Lazy loading prevents unnecessary image downloads

---

*This document serves as the single source of truth for all UI decisions, technical implementations, and architectural patterns in the Mazen Khaled portfolio project. Update this file whenever new patterns are established or existing ones are modified.*