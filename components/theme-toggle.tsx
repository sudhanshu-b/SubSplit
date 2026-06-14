"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemeToggleProps = {
  variant?: "icon" | "menu-item";
};

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const savedTheme = window.localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export default function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Only sync the React state — don't re-apply the theme.
    // The inline <script> in layout.tsx already applied the correct theme on
    // page load, so calling applyTheme() here would cause a flash/switch
    // every time this component mounts (e.g. when the avatar dropdown opens).
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem("theme", nextTheme);
  }

  const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;
  const icon = theme === "dark" ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0L16.95 7.05M7.05 16.95l-1.414 1.414M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      />
    </svg>
  );

  if (variant === "menu-item") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 dark:border-slate-700 dark:text-slate-300">
          {icon}
        </span>
        <span>{theme === "dark" ? "Light theme" : "Dark theme"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}
