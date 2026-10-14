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

  const setMode = useCallback((next) => {
    const root = document.documentElement;

    // Only animate an actual switch, so first paint is not a fade.
    root.setAttribute("data-theme-animating", "");
    setModeState(next);

    window.setTimeout(() => root.removeAttribute("data-theme-animating"), 500);
  }, []);

  const toggleMode = useCallback(
    () => setMode(mode === "dark" ? "light" : "dark"),
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
