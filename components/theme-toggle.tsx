"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    const saved = (localStorage.getItem("rezo-theme") as Theme | null) ?? "system";
    setTheme(saved);
    const dark = saved === "dark" || (saved === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, []);
  function toggle() {
    const next: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    setTheme(next); localStorage.setItem("rezo-theme", next);
    document.documentElement.dataset.theme = next;
  }
  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches);
  return <button className="icon-button" onClick={toggle} aria-label="Switch color theme" title="Switch color theme">{isDark ? <Sun size={17} /> : <Moon size={17} />}</button>;
}
