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

// Paleta CEUB - branch apresentacao-ceub
const AZUL        = "#662c92";
const AZUL_MED    = "#bf0087";
const AZUL_DARK   = "#43054e";
const AMARELO     = "#fde100";
const AMARELO_D   = "#ec0089";
const DARK        = "#323232";
const GRAY        = "#4A4A4A";
const LIGHT_BLUE  = "#F3E6F7";

const theme = createTheme({
  palette: {
    primary: {
      main: AZUL,
      light: AZUL_MED,
      dark: AZUL_DARK,
      contrastText: "#fff",
    },
    secondary: {
      main: AMARELO,
      dark: AMARELO_D,
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
    // Cores extras acessiveis via theme.palette.vela.*
    vela: {
      azul: AZUL,
      azulMed: AZUL_MED,
      azulDark: AZUL_DARK,
      amarelo: AMARELO,
      amareloDark: AMARELO_D,
      dark: DARK,
      gray: GRAY,
      lightBlue: LIGHT_BLUE,
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
    // Botoes com estilo do PHP (border-radius 8, hover elevado)
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
            backgroundColor: AZUL_DARK,
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(102, 44, 146, 0.35)",
          },
        },
      },
    },
    // Cards com border-radius 12 e hover elevado (estilo PHP)
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "transform 0.2s, box-shadow 0.2s",
        },
      },
    },
    // Inputs com border mais grossa (estilo PHP)
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
