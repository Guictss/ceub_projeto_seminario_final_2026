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

// Paleta FBVA oficial (do style.css do projeto PHP)
const AZUL        = "#1D71B8";
const AZUL_MED    = "#1F7AC4";
const AZUL_DARK   = "#19629E";
const AMARELO     = "#F9B233";
const AMARELO_D   = "#E09F2D";
const DARK        = "#323232";
const GRAY        = "#4A4A4A";
const LIGHT_BLUE  = "#E8F3FB";

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
            boxShadow: "0 4px 12px rgba(29, 113, 184, 0.3)",
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
