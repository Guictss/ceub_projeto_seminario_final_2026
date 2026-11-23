import { useState } from "react";
import {
  Alert, Box, Button, Container, Link as MuiLink,
  TextField, Typography, useMediaQuery, useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const IMG = "/assets/img";

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [erroCampos, setErroCampos] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(location.state?.sucesso || null);

  if (usuario) {
    const destino = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={destino} replace />;
  }

  // ── Validação local (igual padrão Cadastro) ────────────────────────────
  function validarLocal() {
    const erros = {};
    if (!email.trim()) {
      erros.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      erros.email = "E-mail inválido";
    }
    if (!senha) {
      erros.senha = "Senha é obrigatória";
    }
    setErroCampos(erros);
    return Object.keys(erros).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    if (!validarLocal()) return;

    setCarregando(true);
    try {
      await login(email, senha);
      const destino = location.state?.from?.pathname || "/dashboard";
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(
        err.response?.data?.error ||
        err.message ||
        "Erro ao conectar com o servidor"
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* ═══ Coluna esquerda: visual (só desktop) ═══ */}
      {!isMobile && (
        <Box sx={{
          flex: 1,
          background: "linear-gradient(135deg, #43054e 0%, #bf0087 100%)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",

          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-15px)" },
          },
        }}>
          {/* Padrão hexagonal com opacity baixa */}
          <Box sx={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${IMG}/pattern-hexagonal.jpg)`,
            backgroundSize: "500px",
            opacity: 0.08,
          }} />

          <Box sx={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            px: 4, py: 6,
            maxWidth: 520,
          }}>
            {/* Logo branca */}
            <Box
              component="img"
              src={`${IMG}/logo-horizontal.png`}
              alt="Programa Vela Para Todos"
              sx={{
                width: 220,
                mb: 4,
                display: "block",
                mx: "auto",
                filter: "brightness(0) invert(1)",
              }}
            />

            {/* Mascote Zoé animando */}
            <Box
              component="img"
              src={`${IMG}/mascote-ceub.png`}
              alt="Zoé - mascote"
              sx={{
                width: { md: 280, lg: 340 },
                mb: 4,
                display: "block",
                mx: "auto",
                filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.35))",
                animation: "float 4s ease-in-out infinite",
              }}
            />

            <Typography
              variant="h4"
              sx={{
                color: "#ffffff !important",
                fontWeight: 700,
                mb: 1.5,
                fontSize: { md: "1.8rem", lg: "2.2rem" },
              }}
            >
              Bem-vindo de volta!
            </Typography>
            <Typography sx={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "1.05rem",
              lineHeight: 1.6,
            }}>
              Acesse sua conta e continue navegando rumo à inclusão pelo esporte.
            </Typography>
          </Box>
        </Box>
      )}

      {/* ═══ Coluna direita: form ═══ */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        minHeight: "100vh",
      }}>
        {/* Barra superior com botão voltar */}
        <Box sx={{
          px: { xs: 2, md: 3 },
          py: 1.5,
          borderBottom: isMobile ? "1px solid" : "none",
          borderColor: "divider",
        }}>
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBackIcon />}
            size="small"
            color="primary"
          >
            Voltar ao início
          </Button>
        </Box>

        {/* Form centralizado verticalmente */}
        <Box sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, md: 4 },
          py: { xs: 3, md: 6 },
        }}>
          <Container maxWidth="xs" sx={{ width: "100%" }}>
            {/* No mobile, mostra logo pequena no topo do form */}
            {isMobile && (
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Box
                  component="img"
                  src={`${IMG}/logo-horizontal.png`}
                  alt="Programa Vela Para Todos"
                  sx={{ width: 180 }}
                />
              </Box>
            )}

            <Typography
              variant="h4"
              color="primary"
              fontWeight="bold"
              sx={{ mb: 0.5, fontSize: { xs: "1.8rem", md: "2.2rem" } }}
            >
              Acesse sua conta
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Entre com seus dados para continuar
            </Typography>

            {sucesso && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSucesso(null)}>
                {sucesso}
              </Alert>
            )}

            {erro && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {erro}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              <TextField
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (erroCampos.email) setErroCampos({ ...erroCampos, email: null });
                }}
                error={!!erroCampos.email}
                helperText={erroCampos.email}
                required autoFocus fullWidth
                placeholder="seu@email.com"
              />
              <TextField
                label="Senha"
                type="password"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  if (erroCampos.senha) setErroCampos({ ...erroCampos, senha: null });
                }}
                error={!!erroCampos.senha}
                helperText={erroCampos.senha}
                required fullWidth
                placeholder="********"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={carregando}
                fullWidth
                sx={{ py: 1.5, fontWeight: "bold", fontSize: "1rem" }}
              >
                {carregando ? "Entrando..." : "Entrar"}
              </Button>
            </Box>

            <Typography sx={{
              mt: 4,
              textAlign: "center",
              color: "text.secondary",
            }}>
              Não tem uma conta?{" "}
              <MuiLink
                component={Link}
                to="/cadastro"
                fontWeight="bold"
                color="primary"
                underline="hover"
              >
                Cadastre-se
              </MuiLink>
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
