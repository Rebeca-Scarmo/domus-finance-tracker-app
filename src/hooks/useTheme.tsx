
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'dark';
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    localStorage.setItem('theme', theme);

    let resolvedTheme: 'light' | 'dark' = 'dark';

    if (theme === 'auto') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolvedTheme = theme;
    }

    setActualTheme(resolvedTheme);

    const root = document.documentElement;
    
    if (resolvedTheme === 'light') {
      root.style.setProperty('--background', '255 255 255');
      root.style.setProperty('--foreground', '0 0 0');
      root.style.setProperty('--card', '255 255 255');
      root.style.setProperty('--card-foreground', '0 0 0');
      root.style.setProperty('--popover', '255 255 255');
      root.style.setProperty('--popover-foreground', '0 0 0');
      root.style.setProperty('--primary', '303 45% 80%');
      root.style.setProperty('--primary-foreground', '0 0% 0%');
      root.style.setProperty('--secondary', '0 0% 87%');
      root.style.setProperty('--secondary-foreground', '0 0% 0%');
      root.style.setProperty('--muted', '0 0% 87%');
      root.style.setProperty('--muted-foreground', '0 0% 0%');
      root.style.setProperty('--accent', '0 0% 87%');
      root.style.setProperty('--accent-foreground', '0 0% 0%');
      root.style.setProperty('--border', '0 0% 87%');
      root.style.setProperty('--input', '0 0% 87%');
      
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.style.setProperty('--background', '0 0% 0%');
      root.style.setProperty('--foreground', '0 0% 87%');
      root.style.setProperty('--card', '0 0% 0%');
      root.style.setProperty('--card-foreground', '0 0% 87%');
      root.style.setProperty('--popover', '0 0% 0%');
      root.style.setProperty('--popover-foreground', '0 0% 87%');
      root.style.setProperty('--primary', '303 45% 80%');
      root.style.setProperty('--primary-foreground', '0 0% 0%');
      root.style.setProperty('--secondary', '0 0% 49%');
      root.style.setProperty('--secondary-foreground', '0 0% 87%');
      root.style.setProperty('--muted', '0 0% 49%');
      root.style.setProperty('--muted-foreground', '0 0% 87%');
      root.style.setProperty('--accent', '0 0% 49%');
      root.style.setProperty('--accent-foreground', '0 0% 87%');
      root.style.setProperty('--border', '0 0% 49%');
      root.style.setProperty('--input', '0 0% 49%');
      
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  const value = {
    theme,
    setTheme,
    actualTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
