import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Fonte oficial do Material Design
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

// MUI
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Tailwind
import "./index.css";

import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext";

// Tema com as cores da FBVA
const theme = createTheme({
  palette: {
    primary: {
      main: "#1D71B8",
      contrastText: "#fff",
    },
    secondary: {
      main: "#F9B233",
      contrastText: "#000",
    },
    background: {
      default: "#F5F7FA",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  shape: {
    borderRadius: 8,
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
