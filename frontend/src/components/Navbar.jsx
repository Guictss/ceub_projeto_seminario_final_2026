import { useState } from "react";
import {
  AppBar, Toolbar, Typography, Button, Box, Chip,
  Menu, MenuItem, IconButton, Divider,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const ehProfessor = usuario?.papel === "professor";
  const [anchorEl, setAnchorEl] = useState(null);

  function handleLogout() {
    setAnchorEl(null);
    logout();
    navigate("/login", { replace: true });
  }

  const links = [
    { to: "/", label: "Dashboard", end: true },
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
    <AppBar position="sticky" elevation={2}>
      <Toolbar className="gap-4">
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            fontWeight: "bold",
            color: "inherit",
            textDecoration: "none",
            mr: 2,
          }}
        >
          🌊 Vela Para Todos
        </Typography>

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

        {usuario && (
          <>
            <IconButton
              color="inherit"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ borderRadius: 2, px: 1 }}
            >
              <AccountCircleIcon />
              <Typography className="!ml-2 hidden sm:inline">
                {usuario.nome}
              </Typography>
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
  );
}
