/** Runs before React; must stay a separate entry so MV3 CSP allows it (no inline scripts). */
const stored = localStorage.getItem("theme")
const scheme =
  stored === "dark" || stored === "light"
    ? stored
    : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
document.documentElement.classList.add(scheme)
