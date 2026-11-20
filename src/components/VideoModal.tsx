import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const themeColor = theme === 'dark' ? '#D4AF37' : '#2563eb';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Convert various video URLs to embed format
  const getEmbedUrl = (url: string): string => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    
    return url;
  };

  const isNativeVideo = videoUrl?.toLowerCase().includes('.webm') || videoUrl?.toLowerCase().includes('.mp4');
  const embedUrl = isNativeVideo ? videoUrl : getEmbedUrl(videoUrl);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl" 
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Absolutely positioned at top-right */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="absolute -top-12 right-0 z-50 p-2 rounded-lg transition-all duration-300"
              style={{ 
                backgroundColor: `${themeColor}20`,
                color: themeColor
              }}
              aria-label={t('close')}
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Video Container */}
            <div 
              className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border"
              style={{ borderColor: `${themeColor}30` }}
            >
              {isNativeVideo ? (
                <video
                  src={embedUrl}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  className="w-full h-full rounded-2xl object-contain bg-black outline-none"
                  onError={() => console.error(`Failed to load video at: ${videoUrl}`)}
                />
              ) : (
                <iframe
                  src={embedUrl}
                  title={title || 'Premium Cinematic Video - Professional Video Editing by Mazen Khaled'}
                  aria-label={title ? `Cinematic Video: ${title} - Edited by The Design Godfather` : 'Professional video featuring cinematic editing, motion graphics, and premium visual effects by Mazen Khaled'}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Title */}
            {title && (
              <div className="mt-4 text-center">
                <h3 
                  className="text-xl font-oswald font-bold"
                  style={{ color: themeColor }}
                >
                  {title}
                </h3>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
