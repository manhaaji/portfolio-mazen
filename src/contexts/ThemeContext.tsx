import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Saved preference is read before the first paint, so there is no theme flash.
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  const isInitialized = true;

  useEffect(() => {
    if (!isInitialized) return;
    
    localStorage.setItem('theme', theme);
    
    const root = document.documentElement;
    
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      // Light theme becomes light gray / off-white with blue accents
      root.style.setProperty('--background', '#f1f5f9');
      root.style.setProperty('--foreground', '#0f172a');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--card-foreground', '#0f172a');
      root.style.setProperty('--popover', '#ffffff');
      root.style.setProperty('--popover-foreground', '#0f172a');
      root.style.setProperty('--primary', '#1d4ed8');
      root.style.setProperty('--primary-foreground', '#ffffff');
      root.style.setProperty('--secondary', '#e2e8f0');
      root.style.setProperty('--secondary-foreground', '#0f172a');
      root.style.setProperty('--muted', '#cbd5e1');
      root.style.setProperty('--muted-foreground', '#1e293b');
      root.style.setProperty('--accent', '#1d4ed8');
      root.style.setProperty('--accent-foreground', '#ffffff');
      root.style.setProperty('--border', 'rgba(29, 78, 216, 0.25)');
      root.style.setProperty('--input', '#e2e8f0');
      root.style.setProperty('--ring', '#1d4ed8');
      root.style.setProperty('--gold', '#1d4ed8');
      root.style.setProperty('--gold-50', 'rgba(37, 99, 235, 0.5)');
      root.style.setProperty('--gold-20', 'rgba(37, 99, 235, 0.2)');
      root.style.setProperty('--gold-10', 'rgba(37, 99, 235, 0.1)');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      // Dark theme colors - Black and Gold
      root.style.setProperty('--background', '#050505');
      root.style.setProperty('--foreground', '#ffffff');
      root.style.setProperty('--card', '#0a0a0a');
      root.style.setProperty('--card-foreground', '#ffffff');
      root.style.setProperty('--primary', '#D4AF37');
      root.style.setProperty('--primary-foreground', '#000000');
      root.style.setProperty('--secondary', '#111111');
      root.style.setProperty('--secondary-foreground', '#ffffff');
      root.style.setProperty('--muted', '#111111');
      root.style.setProperty('--muted-foreground', '#a0a0a0');
      root.style.setProperty('--accent', '#D4AF37');
      root.style.setProperty('--accent-foreground', '#000000');
      root.style.setProperty('--border', 'rgba(212, 175, 55, 0.2)');
      root.style.setProperty('--input', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--ring', '#D4AF37');
      root.style.setProperty('--gold', '#D4AF37');
      root.style.setProperty('--gold-50', 'rgba(212, 175, 55, 0.5)');
      root.style.setProperty('--gold-20', 'rgba(212, 175, 55, 0.2)');
      root.style.setProperty('--gold-10', 'rgba(212, 175, 55, 0.1)');
    }
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
