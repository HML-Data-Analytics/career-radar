const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;

/**
 * Sets data-theme before hydration so there's no flash of the wrong theme
 * when a user has picked light/dark explicitly (persisted in localStorage).
 * Omitting data-theme entirely leaves the CSS media-query default in
 * control, i.e. "system".
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
