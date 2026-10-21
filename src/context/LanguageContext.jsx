import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import translations, { SUPPORTED_LANGUAGES } from "../i18n/translations";

const STORAGE_KEY = "osteoai-language";
const DEFAULT_LANGUAGE = "en";
const SUPPORTED_CODES = SUPPORTED_LANGUAGES.map((language) => language.code);

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key) => key,
});

// Read/write helper so any component can show and change the current
// language, and translate copy via `t()` (used by the Settings menu's
// Change Language selector).
export const useLanguage = () => useContext(LanguageContext);

const getInitialLanguage = () => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored && SUPPORTED_CODES.includes(stored)) {
    return stored;
  }

  return DEFAULT_LANGUAGE;
};

const resolvePath = (source, path) =>
  path
    .split(".")
    .reduce(
      (accumulator, key) =>
        accumulator && accumulator[key] !== undefined
          ? accumulator[key]
          : undefined,
      source
    );

const interpolate = (template, variables) => {
  if (!variables) {
    return template;
  }

  return Object.keys(variables).reduce(
    (text, key) =>
      text.split(`{${key}}`).join(String(variables[key])),
    template
  );
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // localStorage may be unavailable (e.g. private browsing) — ignore.
    }
  }, [language]);

  const setLanguage = (code) => {
    if (SUPPORTED_CODES.includes(code)) {
      setLanguageState(code);
    }
  };

  const t = useMemo(() => {
    return (path, variables) => {
      const value =
        resolvePath(translations[language], path) ??
        resolvePath(translations[DEFAULT_LANGUAGE], path);

      if (value === undefined) {
        return path;
      }

      if (typeof value === "string") {
        return interpolate(value, variables);
      }

      return value;
    };
  }, [language]);

  const contextValue = useMemo(
    () => ({ language, setLanguage, t, languages: SUPPORTED_LANGUAGES }),
    [language, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
