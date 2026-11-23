import { useState } from "react";
import {
  Alert, Box, Button, Container, Link as MuiLink,
  TextField, Typography, useMediaQuery, useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockResetIcon from "@mui/icons-material/LockReset";
import { Link, Navigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const IMG = "/assets/img";

export default function EsqueciSenha() {
  const { usuario } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [email, setEmail] = useState("");
  const [erro, setErro] = useState(null);
  const [erroCampos, setErroCampos] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // Se já logado, vai pro dashboard
  if (usuario) return <Navigate to="/dashboard" replace />;

  function validarLocal() {
    const erros = {};
    if (!email.trim()) {
      erros.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      erros.email = "E-mail inválido";
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
      await api.post("/auth/esqueci-senha", { email: email.trim() });
      setEnviado(true);
    } catch (err) {
      setErro(
        err.response?.data?.error ||
        err.message ||
        "Erro ao solicitar redefinição"
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* ═══ Coluna esquerda (só desktop) ═══ */}
      {!isMobile && (
        <Box sx={{
          flex: 1,
          background: "linear-gradient(135deg, #19629E 0%, #1F7AC4 100%)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}>
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

            <Box
              component="img"
              src={`${IMG}/mascote.png`}
              alt="Zoé - mascote"
              sx={{
                width: { md: 260, lg: 300 },
                mb: 4,
                display: "block",
                mx: "auto",
                filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.35))",
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
              Esqueceu sua senha?
            </Typography>
            <Typography sx={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "1.05rem",
              lineHeight: 1.6,
            }}>
              Sem problemas. Informe seu e-mail e enviaremos as instruções
              para redefinir sua senha.
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
        <Box sx={{
          px: { xs: 2, md: 3 },
          py: 1.5,
          borderBottom: isMobile ? "1px solid" : "none",
          borderColor: "divider",
        }}>
          <Button
            component={Link}
            to="/login"
            startIcon={<ArrowBackIcon />}
            size="small"
            color="primary"
          >
            Voltar ao login
          </Button>
        </Box>

        <Box sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, md: 4 },
          py: { xs: 3, md: 6 },
        }}>
          <Container maxWidth="xs" sx={{ width: "100%" }}>
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
              Redefinir senha
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Informe o e-mail da sua conta
            </Typography>

            {enviado ? (
              <Alert
                severity="success"
                icon={<LockResetIcon />}
                sx={{ mb: 2 }}
              >
                <strong>Solicitação recebida!</strong>
                <br />
                Se o e-mail estiver cadastrado, enviaremos as instruções de
                redefinição em instantes. Verifique sua caixa de entrada.
              </Alert>
            ) : (
              <>
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
                      if (erroCampos.email) {
                        setErroCampos({ ...erroCampos, email: null });
                      }
                    }}
                    error={!!erroCampos.email}
                    helperText={erroCampos.email}
                    required autoFocus fullWidth
                    placeholder="seu@email.com"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={carregando}
                    fullWidth
                    startIcon={<LockResetIcon />}
                    sx={{ py: 1.5, fontWeight: "bold", fontSize: "1rem" }}
                  >
                    {carregando ? "Enviando..." : "Enviar instruções"}
                  </Button>
                </Box>
              </>
            )}

            <Typography sx={{
              mt: 4,
              textAlign: "center",
              color: "text.secondary",
            }}>
              Lembrou a senha?{" "}
              <MuiLink
                component={Link}
                to="/login"
                fontWeight="bold"
                color="primary"
                underline="hover"
              >
                Fazer login
              </MuiLink>
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
