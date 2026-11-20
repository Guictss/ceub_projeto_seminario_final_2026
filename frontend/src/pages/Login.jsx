import { useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Container,
  TextField, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  if (usuario) {
    const destino = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={destino} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await login(email, senha);
      const destino = location.state?.from?.pathname || "/dashboard";
      navigate(destino, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Erro ao conectar com o servidor";
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Box sx={{
        px: 2, py: 1.5, display: "flex", alignItems: "center",
        borderBottom: 1, borderColor: "divider", bgcolor: "white",
      }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          size="small"
          color="primary"
        >
          Voltar ao site
        </Button>
      </Box>

      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "center",
        px: 2, py: { xs: 4, md: 8 },
      }}>
        <Container maxWidth="xs">
          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" align="center" color="primary" fontWeight="bold" gutterBottom>
                🌊 Vela Para Todos
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                Acessar o sistema
              </Typography>

              {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField label="E-mail" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required autoFocus fullWidth />
                <TextField label="Senha" type="password" value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required fullWidth />
                <Button type="submit" variant="contained" size="large"
                  disabled={carregando} fullWidth>
                  {carregando ? "Entrando..." : "Entrar"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
