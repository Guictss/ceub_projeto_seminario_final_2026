import { useState, useEffect } from "react";
import {
  Alert, Box, Button, Container, Link as MuiLink,
  TextField, Typography, useMediaQuery, useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockResetIcon from "@mui/icons-material/LockReset";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Link, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const IMG = "/assets/img";

export default function RedefinirSenha() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState(null);
  const [erroCampos, setErroCampos] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Se já logado, vai pro dashboard
  if (usuario) return <Navigate to="/dashboard" replace />;

  // Se sem token, redireciona pra esqueci-senha
  useEffect(() => {
    if (!token) {
      navigate("/esqueci-senha", { replace: true });
    }
  }, [token, navigate]);

  function validarLocal() {
    const erros = {};
    if (!senha) {
      erros.senha = "Senha é obrigatória";
    } else if (senha.length < 8) {
      erros.senha = "Mínimo 8 caracteres";
    } else if (!/[a-zA-Z]/.test(senha)) {
      erros.senha = "Inclua uma letra";
    } else if (!/[0-9]/.test(senha)) {
      erros.senha = "Inclua um número";
    }
    if (senha !== confirmar) {
      erros.confirmar = "Senhas diferentes";
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
      await api.post("/auth/redefinir-senha", {
        token,
        nova_senha: senha,
      });
      setSucesso(true);
      // Após 3s, redireciona pro login com mensagem
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { sucesso: "Senha redefinida! Faça login com a nova senha." },
        });
      }, 2500);
    } catch (err) {
      const data = err.response?.data;
      if (data?.code === "VALIDATION_ERROR" && data.details) {
        const back = {};
        Object.entries(data.details).forEach(([k, v]) => {
          back[k === "nova_senha" ? "senha" : k] =
            Array.isArray(v) ? v[0] : String(v);
        });
        setErroCampos(back);
      } else {
        setErro(
          data?.error ||
          err.message ||
          "Erro ao redefinir a senha"
        );
      }
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
              Crie uma nova senha
            </Typography>
            <Typography sx={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "1.05rem",
              lineHeight: 1.6,
            }}>
              Escolha uma senha forte: mínimo 8 caracteres, incluindo letras
              e números.
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
              Nova senha
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Escolha uma senha forte e confirme
            </Typography>

            {sucesso ? (
              <Alert
                severity="success"
                icon={<CheckCircleIcon />}
                sx={{ mb: 2 }}
              >
                <strong>Senha redefinida com sucesso!</strong>
                <br />
                Redirecionando para a tela de login...
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
                    label="Nova senha"
                    type="password"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      if (erroCampos.senha) {
                        setErroCampos({ ...erroCampos, senha: null });
                      }
                    }}
                    error={!!erroCampos.senha}
                    helperText={erroCampos.senha || "Mínimo 8 caracteres, 1 letra e 1 número"}
                    required autoFocus fullWidth
                    placeholder="********"
                  />
                  <TextField
                    label="Confirmar senha"
                    type="password"
                    value={confirmar}
                    onChange={(e) => {
                      setConfirmar(e.target.value);
                      if (erroCampos.confirmar) {
                        setErroCampos({ ...erroCampos, confirmar: null });
                      }
                    }}
                    error={!!erroCampos.confirmar}
                    helperText={erroCampos.confirmar}
                    required fullWidth
                    placeholder="********"
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
                    {carregando ? "Redefinindo..." : "Redefinir senha"}
                  </Button>
                </Box>
              </>
            )}
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
