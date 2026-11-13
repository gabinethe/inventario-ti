"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("inventario_theme") as Theme | null;
      if (salvo === "light" || salvo === "dark") {
        setThemeState(salvo);
        aplicarTema(salvo);
      } else {
        const prefereEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const temaInicial = prefereEscuro ? "dark" : "light";
        setThemeState(temaInicial);
        aplicarTema(temaInicial);
      }
    } catch {
      // Fallback
    } finally {
      setMontado(true);
    }
  }, []);

  const aplicarTema = (novoTema: Theme) => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (novoTema === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      localStorage.setItem("inventario_theme", novoTema);
    }
  };

  const setTheme = (novoTema: Theme) => {
    setThemeState(novoTema);
    aplicarTema(novoTema);
  };

  const toggleTheme = () => {
    const novoTema = theme === "light" ? "dark" : "light";
    setTheme(novoTema);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser utilizado dentro de um ThemeProvider");
  }
  return context;
}
