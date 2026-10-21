import { createTheme } from "@mui/material/styles";

/*
 * MUI needs real colour values (it computes hovers and contrast text
 * from them), so each mode has its own palette here. Component styling
 * uses the CSS tokens in tokens.css; this palette covers the MUI
 * internals such as menus, inputs and ripples.
 */
const palettes = {
  light: {
    mode: "light",
    primary: { main: "#2563EB" },
    secondary: { main: "#14B8A6" },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#475569" },
    success: { main: "#22C55E" },
    warning: { main: "#F59E0B" },
    error: { main: "#EF4444" },
    divider: "#E2E8F0",
  },

  dark: {
    mode: "dark",
    primary: { main: "#60A5FA" },
    secondary: { main: "#2DD4BF" },
    background: { default: "#070B14", paper: "#131C2E" },
    text: { primary: "#F1F5F9", secondary: "#C3CEDD" },
    success: { main: "#4ADE80" },
    warning: { main: "#FBBF24" },
    error: { main: "#F87171" },
    divider: "rgba(148, 170, 205, 0.18)",
  },
};

const baseTheme = {

  typography: {
    fontFamily: [
      "Inter",
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),

    h1: {
      fontWeight: 700,
      fontSize: "3rem",
    },

    h2: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },

    body1: {
      fontSize: "1rem",
    },
  },

  shape: {
    borderRadius: 14,
  },
};

export const createAppTheme = (mode = "light") =>
  createTheme({
    ...baseTheme,
    palette: palettes[mode] || palettes.light,
  });

export default createAppTheme("light");