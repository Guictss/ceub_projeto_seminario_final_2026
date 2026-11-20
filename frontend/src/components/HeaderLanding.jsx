import { useState } from "react";
import {
  AppBar, Box, Button, Container, Drawer, IconButton,
  List, ListItem, ListItemButton, ListItemText,
  Toolbar, Typography, useMediaQuery, useTheme,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation } from "react-router-dom";

const IMG = "/assets/img";

const LINKS = [
  { href: "informacoes", label: "Informações" },
  { href: "quem-somos", label: "Quem somos" },
  { href: "noticias", label: "Notícias" },
  { href: "doacao", label: "Doações" },
  { href: "voluntario", label: "Voluntários" },
  { href: "acessibilidade", label: "Acessibilidade" },
  { href: "contato", label: "Contato" },
];

export default function HeaderLanding() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  function scrollTo(id) {
    return (e) => {
      e.preventDefault();
      setDrawerOpen(false);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
  }

  function handleLogo(e) {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "white",
          color: "text.primary",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ gap: 2, justifyContent: "space-between" }}>
            <Box
              component={Link}
              to="/"
              onClick={handleLogo}
              sx={{
                display: "flex", alignItems: "center",
                textDecoration: "none", cursor: "pointer",
              }}
            >
              <Box
                component="img"
                src={`${IMG}/logo-horizontal.png`}
                alt="Programa Vela Para Todos"
                sx={{ height: { xs: 36, md: 50 } }}
              />
            </Box>

            {/* Links desktop */}
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 2.5, alignItems: "center" }}>
                {LINKS.map((l) => (
                  <Typography
                    key={l.href}
                    component="a"
                    href={`#${l.href}`}
                    onClick={scrollTo(l.href)}
                    sx={{
                      color: "text.secondary",
                      fontWeight: 500,
                      textDecoration: "none",
                      cursor: "pointer",
                      transition: "color 0.2s",
                      whiteSpace: "nowrap",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    {l.label}
                  </Typography>
                ))}
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                startIcon={<LoginIcon />}
              >
                Login
              </Button>
              {isMobile && (
                <IconButton
                  color="primary"
                  onClick={(e) => { e.currentTarget.blur(); setDrawerOpen(true); }}
                  aria-label="abrir menu"
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer mobile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 260 }} role="presentation">
          <Box sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
            <Typography variant="h6" fontWeight="bold">
              🌊 Vela Para Todos
            </Typography>
            <Typography variant="caption">Menu de navegação</Typography>
          </Box>
          <List>
            {LINKS.map((l) => (
              <ListItem key={l.href} disablePadding>
                <ListItemButton
                  component="a"
                  href={`#${l.href}`}
                  onClick={scrollTo(l.href)}
                >
                  <ListItemText primary={l.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

