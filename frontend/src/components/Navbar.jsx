import { useState } from "react";
import {
  AppBar, Toolbar, Typography, Button, Box, Chip,
  Menu, MenuItem, IconButton, Divider,
  Drawer, List, ListItem, ListItemButton, ListItemText,
  useMediaQuery, useTheme,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const ehProfessor = usuario?.papel === "professor";

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleLogout() {
    setAnchorEl(null);
    logout();
    navigate("/login", { replace: true });
  }

  const links = [
    { to: "/dashboard", label: "Dashboard", end: true },
    { to: "/aulas", label: "Aulas" },
    { to: "/noticias", label: "Notícias" },
    ...(ehProfessor
      ? [
          { to: "/doacoes", label: "Doações" },
          { to: "/voluntarios", label: "Voluntários" },
          { to: "/relatorio", label: "Relatório" },
        ]
      : []),
  ];

  return (
    <>
      <AppBar position="sticky" elevation={2}>
        <Toolbar className="gap-2">
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              aria-label="abrir menu"
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={Link}
            to="/dashboard"
            sx={{
              fontWeight: "bold",
              color: "inherit",
              textDecoration: "none",
              flexGrow: isMobile ? 1 : 0,
              mr: 2,
            }}
          >
            🌊 {isMobile ? "Vela" : "Vela Para Todos"}
          </Typography>

          {!isMobile && (
            <Box className="flex gap-1 flex-grow">
              {links.map((link) => (
                <Button
                  key={link.to}
                  component={NavLink}
                  to={link.to}
                  end={link.end}
                  color="inherit"
                  sx={{
                    "&.active": {
                      bgcolor: "rgba(255,255,255,0.18)",
                      fontWeight: "bold",
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}

          {usuario && (
            <>
              <IconButton
                color="inherit"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ borderRadius: 2, px: 1 }}
              >
                <AccountCircleIcon />
                {!isMobile && (
                  <Typography className="!ml-2">{usuario.nome}</Typography>
                )}
                <Chip
                  label={usuario.papel}
                  color={ehProfessor ? "secondary" : "info"}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem disabled>{usuario.email}</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon className="!mr-2" fontSize="small" />
                  Sair
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer mobile */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 260 }} role="presentation">
          <Box sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
            <Typography variant="h6" fontWeight="bold">
              🌊 Vela Para Todos
            </Typography>
            {usuario && (
              <Typography variant="caption">
                {usuario.nome} · {usuario.papel}
              </Typography>
            )}
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
          </List>
        </Box>
      </Drawer>
    </>
  );
}


