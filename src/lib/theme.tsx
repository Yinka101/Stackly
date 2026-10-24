import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type AgeBand = 'sprouts' | 'builders' | 'investors';

interface ThemeContextValue {
  theme: AgeBand;
  setTheme: (t: AgeBand) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'builders',
  setTheme: () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AgeBand>(() => {
    return (localStorage.getItem('stackly_theme') as AgeBand) ?? 'builders';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('stackly_theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
