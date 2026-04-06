import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "brutalist";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: string;
};

const initialState: ThemeProviderState = {
  theme: "brutalist",
  setTheme: () => null,
  resolvedTheme: "brutalist",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children, defaultTheme = "brutalist", storageKey = "sidequest-theme", ...props }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("brutalist");

  const resolvedTheme = "brutalist";

  useEffect(() => {
    const root = window.document.documentElement;
    root.className = "";
  }, [theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
