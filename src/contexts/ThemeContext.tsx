import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  /** What the person chose (system = follow the device). */
  preference: ThemePreference;
  /** What is actually painted right now. */
  theme: ResolvedTheme;
  setPreference: (p: ThemePreference) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'safemarq-theme';
const THEME_COLORS: Record<ResolvedTheme, string> = { light: '#FFFFFF', dark: '#0A101B' };

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {
    /* storage blocked (private mode): fall back to system */
  }
  return 'system';
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference);
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme);

  // Follow live OS changes while the preference is "system".
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystem(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const theme: ResolvedTheme = preference === 'system' ? system : preference;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    // A forced theme must override the media-scoped theme-color tags in index.html.
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
      m.setAttribute('content', THEME_COLORS[theme]);
    });
  }, [theme]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setPreference]);

  const value = useMemo(
    () => ({ preference, theme, setPreference, toggleTheme }),
    [preference, theme, setPreference, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
