
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
      // Light theme com cores mais suaves e consistentes com o projeto
      root.style.setProperty('--background', '248 248 248'); // #F8F8F8 - cinza muito claro
      root.style.setProperty('--foreground', '30 30 30'); // #1E1E1E - cinza escuro para texto
      root.style.setProperty('--card', '255 255 255'); // #FFFFFF - branco puro para cards
      root.style.setProperty('--card-foreground', '30 30 30'); // #1E1E1E
      root.style.setProperty('--popover', '255 255 255'); // #FFFFFF
      root.style.setProperty('--popover-foreground', '30 30 30'); // #1E1E1E
      root.style.setProperty('--primary', '303 45% 80%'); // #EEB3E7 - mantém a cor primária
      root.style.setProperty('--primary-foreground', '0 0% 0%'); // #000000
      root.style.setProperty('--secondary', '240 5% 84%'); // #D6D6D6 - cinza claro
      root.style.setProperty('--secondary-foreground', '30 30 30'); // #1E1E1E
      root.style.setProperty('--muted', '240 5% 90%'); // #E6E6E6 - cinza muito claro
      root.style.setProperty('--muted-foreground', '100 100 100'); // #646464 - cinza médio
      root.style.setProperty('--accent', '303 45% 85%'); // versão mais clara do rosa
      root.style.setProperty('--accent-foreground', '0 0% 0%'); // #000000
      root.style.setProperty('--border', '220 5% 85%'); // #D9D9D9 - borda sutil
      root.style.setProperty('--input', '220 5% 85%'); // #D9D9D9
      
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // Dark theme (mantém as cores originais)
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
