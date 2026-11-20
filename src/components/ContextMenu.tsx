import { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Languages, Link as LinkIcon, Mail, SunMoon } from 'lucide-react';

export default function ContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    
    // Prevent menu from overflowing the screen
    const x = e.clientX + 220 > window.innerWidth ? window.innerWidth - 230 : e.clientX;
    const y = e.clientY + 250 > window.innerHeight ? window.innerHeight - 260 : e.clientY;
    
    setPosition({ x, y });
    setIsOpen(true);
  }, []);

  const handleClick = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleClick);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleClick);
    };
  }, [handleContextMenu, handleClick]);

  if (!isOpen) return null;

  const menuItems = [
    { icon: <Copy size={16} />, label: 'نسخ النص', action: () => document.execCommand('copy') },
    { icon: <RefreshCw size={16} />, label: 'إعادة تحميل', action: () => window.location.reload() },
    { 
      icon: <Languages size={16} />, 
      label: 'ترجمة الموقع', 
      action: () => {
        // Note to AI: Trigger the exact language toggle button present in the Navbar
        const langBtn = document.getElementById('lang-toggle-btn') || document.querySelector('button[aria-label="Toggle Language"]');
        if (langBtn) (langBtn as HTMLElement).click();
      } 
    },
    { 
      icon: <SunMoon size={16} />,
      label: 'تغيير المظهر',
      action: () => {
        const themeBtn = document.getElementById('theme-toggle-btn') || document.querySelector('button[aria-label="Toggle Theme"]') || document.querySelector('.theme-toggle');
        if (themeBtn) (themeBtn as HTMLElement).click();
      }
    },
    { icon: <LinkIcon size={16} />, label: 'نسخ رابط البورتفوليو', action: () => navigator.clipboard.writeText(window.location.origin) },
    { icon: <Mail size={16} />, label: 'تواصل معي', action: () => window.location.href = '/#contact' },
  ];

  return (
    <div
      className="fixed z-[9999] w-56 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-blue-500/30 dark:border-[#D4AF37]/30 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200 text-right origin-top-left"
      style={{ top: position.y, left: position.x }}
      dir="rtl"
    >
      <div className="space-y-1">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-white/10 rounded-xl transition-all duration-200 group"
          >
            <span>{item.label}</span>
            <span className="text-blue-600 dark:text-[#D4AF37] group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </span>
          </button>
        ))}
      </div>
      
      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-200 dark:via-white/10 to-transparent my-2" />
      
      <div className="text-center px-2 pb-1 cursor-not-allowed select-none">
        <span className="text-[10px] font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-400 dark:from-[#D4AF37] dark:to-yellow-200 opacity-70">
          Mazen Khaled © 2026
        </span>
      </div>
    </div>
  );
}
