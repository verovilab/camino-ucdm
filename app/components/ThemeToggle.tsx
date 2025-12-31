"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "mystic";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme | null) ?? "light";
    setTheme(saved);
    document.body.dataset.theme = saved === "mystic" ? "mystic" : "light";
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "mystic" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.body.dataset.theme = next === "mystic" ? "mystic" : "light";
  }

  return (
    <button className="button" onClick={toggle} type="button">
      {theme === "light" ? "Modo místico ✨" : "Modo claro ☀️"}
    </button>
  );
}
