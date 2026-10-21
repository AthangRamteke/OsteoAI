import { flushSync } from "react-dom";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "osteoai-theme";

const ThemeModeContext = createContext({
  mode: "light",
  toggleMode: () => {},
  setMode: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

function readStoredMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : "light";
  } catch {
    return "light";
  }
}

/*
 * Light / dark mode.
 *
 * The chosen mode is written to <html data-theme>, which is what the
 * colour tokens in tokens.css key off. Light stays the default, so the
 * app looks exactly as it did before dark mode existed.
 */
export function ThemeModeProvider({ children }) {
  const [mode, setModeState] = useState(readStoredMode);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = mode;

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Storage unavailable; the mode still applies for this session.
    }
  }, [mode]);

  /*
   * Switching theme reveals the new look as a circle growing from the
   * toggle (View Transitions API). The browser snapshots the old and new
   * page once and animates between them, so nothing repaints
   * element by element. Browsers without it, and users who prefer
   * reduced motion, just switch instantly.
   */
  const setMode = useCallback((next, origin) => {
    const root = document.documentElement;

    const apply = () => {
      root.dataset.theme = next;
      flushSync(() => setModeState(next));
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (typeof document.startViewTransition !== "function" || reduceMotion) {
      apply();
      return;
    }

    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? 0;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(apply);

    transition.ready
      .then(() =>
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 650,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        )
      )
      .catch(() => {});
  }, []);

  const toggleMode = useCallback(
    (origin) => setMode(mode === "dark" ? "light" : "dark", origin),
    [mode, setMode]
  );

  const value = useMemo(
    () => ({ mode, setMode, toggleMode }),
    [mode, setMode, toggleMode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export default ThemeModeContext;
