const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    } else if (stored === "system") {
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) document.documentElement.setAttribute("data-theme", "dark");
    }
    // No stored preference at all: leave data-theme unset, which is light
    // (the CSS default) - a first visit is light regardless of OS setting.
  } catch (e) {}
})();
`;

/**
 * Resolves the theme before hydration so there's no flash of the wrong
 * theme. Light is the default look: data-theme is only set when the user
 * has explicitly chosen "light", "dark", or "system" (which is then
 * resolved against the OS preference at this moment) via the theme
 * toggle - an unset localStorage value (first visit) stays light.
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
