import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "./index.css";

import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext";

// ═══════════════════════════════════════════════════════════════════════
// BRANCH apresentacao-ceub — paleta oficial do CEUB no lugar do FBVA
// Para voltar à paleta FBVA: `git checkout main`
// ═══════════════════════════════════════════════════════════════════════
const ROXO        = "#662c92";   // antes: AZUL     #662c92
const ROXO_MED    = "#bf0087";   // antes: AZUL_MED #bf0087 (lilás CEUB)
const ROXO_DARK   = "#43054e";   // antes: AZUL_DARK #43054e
const AMARELO     = "#fde100";   // antes: AMARELO  #fde100 (amarelo CEUB)
const MAGENTA     = "#ec0089";   // antes: AMARELO_D #ec0089 (acento quente)
const DARK        = "#323232";
const GRAY        = "#4A4A4A";
const ROXO_LIGHT  = "#F3E6F7";   // antes: LIGHT_BLUE #F3E6F7 (derivado)

const theme = createTheme({
  palette: {
    primary: {
      main: ROXO,
      light: ROXO_MED,
      dark: ROXO_DARK,
      contrastText: "#fff",
    },
    secondary: {
      main: AMARELO,
      dark: MAGENTA,
      contrastText: "#000",
    },
    background: {
      default: "#F5F7FA",
      paper: "#ffffff",
    },
    text: {
      primary: DARK,
      secondary: GRAY,
    },
    // Alias "vela" mantido para não quebrar refs existentes no código
    vela: {
      azul: ROXO,
      azulMed: ROXO_MED,
      azulDark: ROXO_DARK,
      amarelo: AMARELO,
      amareloDark: MAGENTA,
      dark: DARK,
      gray: GRAY,
      lightBlue: ROXO_LIGHT,
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          transition: "all 0.2s",
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: ROXO_DARK,
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(102, 44, 146, 0.35)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "transform 0.2s, box-shadow 0.2s",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
