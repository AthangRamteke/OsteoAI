import React from "react";
import ReactDOM from "react-dom/client";

import { ThemeProvider, CssBaseline } from "@mui/material";

import App from "./App";
import { createAppTheme } from "./theme/theme";
import { LanguageProvider } from "./context/LanguageContext";
import AuthProvider from "./context/AuthProvider";
import {
  ThemeModeProvider,
  useThemeMode,
} from "./context/ThemeModeContext";

import "./theme/tokens.css";

/** Rebuilds the MUI theme whenever the mode changes. */
function ThemedApp() {
  const { mode } = useThemeMode();

  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ThemedApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeModeProvider>
  </React.StrictMode>
);
