export type Theme = "light" | "dark";

// Must match the values used by the inline bootstrap script in index.html.
const THEME_COLORS: Record<Theme, string> = {
  light: "#ffffff",
  dark: "#020817",
};

// Saved choice wins; otherwise follow the OS/browser preference so a dark-mode
// phone opens the app (and its status bar) in dark on first launch.
export function getInitialTheme(): Theme {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  // color-scheme tells the UA the page renders its own light/dark surfaces, so
  // mobile browsers (e.g. Samsung Internet) stop forcing their own chrome color
  // onto the status bar and honor our theme-color instead.
  root.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
}
