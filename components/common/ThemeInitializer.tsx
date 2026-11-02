"use client";

import { useEffect } from "react";

export default function ThemeInitializer() {
  useEffect(() => {
    const applySavedTheme = () => {
      const savedTheme = localStorage.getItem("theme");

      if (!savedTheme || savedTheme === "default") {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", savedTheme);
      }
    };

    applySavedTheme();

    window.addEventListener("storage", applySavedTheme);

    return () => {
      window.removeEventListener("storage", applySavedTheme);
    };
  }, []);

  return null;
}