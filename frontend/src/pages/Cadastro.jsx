import { useState } from "react";
import {
  Alert, Box, Button, Container, FormControl, Grid, InputLabel,
  Link as MuiLink, MenuItem, Select, TextField, Typography,
  useMediaQuery, useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const IMG = "/assets/img";

export default function Cadastro() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [papel, setPapel] = useState("aluno");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erro, setErro] = useState(null);
  const [erroCampos, setErroCampos] = useState({});
  const [carregando, setCarregando] = useState(false);

  // Se já logado, vai pro dashboard
  if (usuario) return <Navigate to="/dashboard" replace />;

  // ── Validações locais ──────────────────────────────────────────────────
  function validarLocal() {
    const erros = {};

    if (!nome.trim() || nome.trim().length < 3) {
      erros.nome = "Nome deve ter ao menos 3 caracteres";
    } else if (nome.trim().length > 100) {
      erros.nome = "Nome não pode ter mais de 100 caracteres";
    }

    if (!email.trim()) {
      erros.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      erros.email = "E-mail inválido";
    }

    if (!dataNascimento) {
      erros.dataNascimento = "Data obrigatória";
    } else {
      const nasc = new Date(dataNascimento);
      const hoje = new Date();
      if (nasc > hoje) {
        erros.dataNascimento = "Data não pode ser futura";
      } else {
        const idade = Math.floor(
          (hoje - nasc) / (365.25 * 24 * 60 * 60 * 1000)
        );
        if (idade < 14) erros.dataNascimento = "Idade mínima: 14 anos";
      }
    }

    if (!senha) {
      erros.senha = "Senha obrigatória";
    } else if (senha.length < 8) {
      erros.senha = "Mínimo 8 caracteres";
    } else if (!/[a-zA-Z]/.test(senha)) {
      erros.senha = "Inclua uma letra";
    } else if (!/[0-9]/.test(senha)) {
      erros.senha = "Inclua um número";
    }

    if (senha !== confirmarSenha) {
      erros.confirmarSenha = "Senhas diferentes";
    }

    setErroCampos(erros);
    return Object.keys(erros).length === 0;
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    if (!validarLocal()) return;

    setCarregando(true);
    try {
      await api.post("/auth/register", {
        nome: nome.trim(),
        email: email.trim(),
        senha,
        data_nascimento: dataNascimento,
        papel,
      });
      navigate("/login", {
        replace: true,
        state: { sucesso: "Cadastro realizado! Faça login para continuar." },
      });
    } catch (err) {
      const data = err.response?.data;
      if (data?.code === "VALIDATION_ERROR" && data.details) {
        const back = {};
        Object.entries(data.details).forEach(([k, v]) => {
          back[k === "data_nascimento" ? "dataNascimento" : k] =
            Array.isArray(v) ? v[0] : String(v);
        });
        setErroCampos(back);
      } else {
        setErro(data?.error || err.message || "Erro ao cadastrar");
      }
    } finally {
      setCarregando(false);
    }
  }

  // ── Coluna esquerda (azul com Zoé) ─────────────────────────────────────
  const colunaEsquerda = (
    <Box
      sx={{
        flex: 1,
        background: "linear-gradient(135deg, #662c92 0%, #43054e 100%)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${IMG}/pattern-hexagonal.jpg)`,
          backgroundSize: "cover",
          opacity: 0.12,
          mixBlendMode: "overlay",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <Box
          component="img"
          src={`${IMG}/logo-vertical.png`}
          alt="FBVA"
          sx={{
            display: "block",
            mx: "auto",
            height: 110,
            mb: 3,
            filter: "brightness(0) invert(1)",
          }}
        />

        <Box
          component="img"
          src={`${IMG}/mascote-ceub.png`}
          alt="Zoé mascote"
          sx={{
            display: "block",
            mx: "auto",
            height: 220,
            mb: 3,
            animation: "flutuar 3s ease-in-out infinite",
            "@keyframes flutuar": {
              "0%,100%": { transform: "translateY(0)" },
              "50%":     { transform: "translateY(-15px)" },
            },
          }}
        />

        <Typography
          variant="h4"
          sx={{
            color: "#ffffff !important",
            fontWeight: 700,
            mb: 1,
          }}
        >
          Junte-se a nós!
        </Typography>
        <Typography
          sx={{
            color: "#F3E6F7 !important",
            fontSize: "1.05rem",
            maxWidth: 360,
            mx: "auto",
          }}
        >
          Cadastre-se e faça parte da maior iniciativa de vela adaptada do Brasil.
        </Typography>
      </Box>
    </Box>
  );

  // ── Coluna direita (formulário) ────────────────────────────────────────
  const colunaDireita = (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        bgcolor: "#ffffff",
        p: { xs: 3, sm: 5 },
        overflowY: "auto",
      }}
    >
      <Container maxWidth="sm" disableGutters>
        {/* Voltar ao início */}
        <MuiLink
          component={Link}
          to="/"
          underline="none"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            color: "#4A4A4A",
            fontSize: "0.9rem",
            mb: 3,
            "&:hover": { color: "#662c92" },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
          Voltar ao início
        </MuiLink>

        {/* Logo pequeno (só mobile) */}
        {isMobile && (
          <Box
            component="img"
            src={`${IMG}/logo-horizontal.png`}
            alt="FBVA"
            sx={{ display: "block", mx: "auto", height: 48, mb: 3 }}
          />
        )}

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#662c92",
            mb: 0.5,
          }}
        >
          Criar conta
        </Typography>
        <Typography sx={{ color: "#4A4A4A", mb: 3 }}>
          Preencha os dados para se cadastrar
        </Typography>

        {erro && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {erro}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            {/* Nome — linha inteira */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nome completo"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                error={!!erroCampos.nome}
                helperText={erroCampos.nome}
                disabled={carregando}
                autoFocus
                required
              />
            </Grid>

            {/* E-mail + Data nascimento — 2 colunas */}
            <Grid size={{ xs: 12, sm: 7 }}>
              <TextField
                fullWidth
                type="email"
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!erroCampos.email}
                helperText={erroCampos.email}
                disabled={carregando}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                fullWidth
                type="date"
                label="Data nasc."
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                error={!!erroCampos.dataNascimento}
                helperText={erroCampos.dataNascimento}
                disabled={carregando}
                slotProps={{ inputLabel: { shrink: true } }}
                required
              />
            </Grid>

            {/* Perfil — linha inteira */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth disabled={carregando} required>
                <InputLabel id="papel-label">Perfil</InputLabel>
                <Select
                  labelId="papel-label"
                  label="Perfil"
                  value={papel}
                  onChange={(e) => setPapel(e.target.value)}
                >
                  <MenuItem value="aluno">Aluno</MenuItem>
                  <MenuItem value="professor">Professor</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Senha + Confirmar — 2 colunas */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="password"
                label="Senha"
                placeholder="********"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                error={!!erroCampos.senha}
                helperText={erroCampos.senha || "Mín. 8 caracteres"}
                disabled={carregando}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="password"
                label="Confirmar"
                placeholder="********"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                error={!!erroCampos.confirmarSenha}
                helperText={erroCampos.confirmarSenha || " "}
                disabled={carregando}
                required
              />
            </Grid>

            {/* Botão — linha inteira */}
            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={carregando}
                sx={{
                  py: 1.4,
                  mt: 1,
                  fontWeight: 600,
                  fontSize: "1rem",
                  bgcolor: "#fde100",
                  color: "#323232",
                  "&:hover": { bgcolor: "#ec0089" },
                }}
              >
                {carregando ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Typography sx={{ textAlign: "center", mt: 3, color: "#4A4A4A" }}>
          Já tem conta?{" "}
          <MuiLink
            component={Link}
            to="/login"
            sx={{
              color: "#662c92",
              fontWeight: 600,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Faça login
          </MuiLink>
        </Typography>
      </Container>
    </Box>
  );

  // ── Layout responsivo ──────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
      {!isMobile && colunaEsquerda}
      {colunaDireita}
    </Box>
  );
}
