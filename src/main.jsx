import React from "react";
import ReactDOM from "react-dom/client";

import { ThemeProvider, CssBaseline } from "@mui/material";

import App from "./App";
import theme from "./theme/theme";
import { LanguageProvider } from "./context/LanguageContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
);