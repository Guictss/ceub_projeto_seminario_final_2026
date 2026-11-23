import { useState } from "react";
import {
  AppBar, Avatar, Box, Button, Chip, Container, Divider,
  Drawer, IconButton, List, ListItem, ListItemButton, ListItemText,
  Toolbar, Typography, useMediaQuery, useTheme,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const IMG = "/assets/img";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const ehProfessor = usuario?.papel === "professor";
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  const links = [
    { to: "/dashboard", label: "Dashboard", end: true },
    { to: "/aulas", label: "Aulas" },
    { to: "/noticias", label: "Notícias" },
    ...(ehProfessor
      ? [
          { to: "/doacoes", label: "Doações" },
          { to: "/voluntarios", label: "Voluntários" },
          { to: "/usuarios", label: "Usuários" },
          { to: "/relatorio", label: "Relatório" },
        ]
      : []),
  ];

  const inicial = usuario?.nome?.charAt(0)?.toUpperCase() || "?";

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "white",
          color: "text.primary",
          borderBottom: "4px solid #fde100",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ gap: 1.5, py: 1, px: { xs: 1, md: 2 } }}>
            {/* Logo */}
            <Box
              component={Link}
              to="/dashboard"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                flexGrow: isMobile ? 1 : 0,
                mr: 2,
              }}
            >
              <Box
                component="img"
                src={`${IMG}/logo-horizontal.png`}
                alt="Vela Para Todos"
                sx={{ height: 40 }}
              />
            </Box>

            {/* Links desktop */}
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
                {links.map((link) => (
                  <Button
                    key={link.to}
                    component={NavLink}
                    to={link.to}
                    end={link.end}
                    disableElevation
                    sx={{
                      color: "primary.dark",
                      border: "1.5px solid",
                      borderColor: "primary.main",
                      bgcolor: "transparent",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      px: 1.5,
                      py: 0.4,
                      whiteSpace: "nowrap",
                      "&:hover": {
                        bgcolor: "primary.main",
                        color: "white",
                      },
                      "&.active": {
                        bgcolor: "primary.main",
                        color: "white",
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Desktop: pill do usuário + botão Sair amarelo */}
            {usuario && !isMobile && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    px: 1.5,
                    py: 0.5,
                    bgcolor: "#F3E6F7",
                    borderRadius: 30,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 34, height: 34,
                      bgcolor: "primary.main",
                      color: "white",
                      fontSize: "1rem",
                      fontWeight: "bold",
                    }}
                  >
                    {inicial}
                  </Avatar>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <Typography
                      sx={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "primary.dark",
                        lineHeight: 1.1,
                      }}
                    >
                      {usuario.nome}
                    </Typography>
                    <Chip
                      label={usuario.papel}
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: "0.65rem",
                        fontWeight: "bold",
                        mt: 0.3,
                        bgcolor: ehProfessor ? "secondary.main" : "primary.light",
                        color: ehProfessor ? "black" : "white",
                        "& .MuiChip-label": { px: 0.8 },
                      }}
                    />
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    fontWeight: "bold",
                    color: "black",
                    px: 2,
                    "&:hover": {
                      bgcolor: "secondary.dark",
                    },
                  }}
                >
                  Sair
                </Button>
              </>
            )}

            {/* Mobile: avatar pequeno + hamburger */}
            {isMobile && usuario && (
              <>
                <Avatar
                  sx={{
                    width: 34, height: 34,
                    bgcolor: "primary.main",
                    color: "white",
                    fontSize: "0.95rem",
                    fontWeight: "bold",
                  }}
                >
                  {inicial}
                </Avatar>
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    setDrawerOpen(true);
                  }}
                  aria-label="abrir menu"
                >
                  <MenuIcon />
                </IconButton>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer mobile */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 280 }} role="presentation">
          <Box
            sx={{
              p: 2,
              bgcolor: "primary.main",
              color: "white",
              borderBottom: "4px solid #fde100",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Avatar sx={{
                width: 40, height: 40,
                bgcolor: "secondary.main",
                color: "black",
                fontWeight: "bold",
              }}>
                {inicial}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {usuario?.nome}
                </Typography>
                <Chip
                  label={usuario?.papel}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    bgcolor: "secondary.main",
                    color: "black",
                  }}
                />
              </Box>
            </Box>
          </Box>
          <List>
            {links.map((link) => (
              <ListItem key={link.to} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={link.to}
                  end={link.end}
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    "&.active": {
                      bgcolor: "action.selected",
                      borderLeft: 4,
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  color: "secondary.dark",
                  fontWeight: "bold",
                }}
              >
                <LogoutIcon sx={{ mr: 2 }} fontSize="small" />
                <ListItemText primary="Sair" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
