import { useEffect, useState } from "react";
import {
  AppBar, Alert, Box, Button, Card, CardContent, Chip, Container,
  FormControl, Grid, InputLabel, MenuItem, Select, Snackbar,
  Stack, TextField, Toolbar, Typography,
} from "@mui/material";
import SailingIcon from "@mui/icons-material/Sailing";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ArticleIcon from "@mui/icons-material/Article";
import LoginIcon from "@mui/icons-material/Login";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";

function extrairMensagemErro(data) {
  if (!data) return "Erro desconhecido";
  if (data.details) {
    const primeiraChave = Object.keys(data.details)[0];
    if (primeiraChave) {
      const msgs = data.details[primeiraChave];
      return Array.isArray(msgs) ? msgs[0] : String(msgs);
    }
  }
  return data.error || "Erro ao processar requisição";
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Landing() {
  const [snackbar, setSnackbar] = useState({
    open: false, message: "", severity: "success",
  });

  function notificar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  return (
    <Box>
      <NavbarPublica />
      <HeroSection />
      <SobreSection />
      <NoticiasSection />
      <DoacaoSection onResult={notificar} />
      <VoluntarioSection onResult={notificar} />
      <Footer />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ─── Navbar pública ───────────────────────────────────────────────────────
function NavbarPublica() {
  const location = useLocation();

  function handleLogoClick(e) {
    if (location.pathname === "/") {
      e.preventDefault();
      scrollToTop();
    }
  }

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          onClick={handleLogoClick}
          sx={{
            fontWeight: "bold",
            color: "inherit",
            textDecoration: "none",
            flexGrow: 1,
            cursor: "pointer",
          }}
        >
          🌊 Vela Para Todos
        </Typography>
        <Button
          component={Link}
          to="/login"
          color="inherit"
          startIcon={<LoginIcon />}
          variant="outlined"
          sx={{ borderColor: "rgba(255,255,255,0.5)" }}
        >
          Área do membro
        </Button>
      </Toolbar>
    </AppBar>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <Box
      sx={{
        minHeight: { xs: 400, md: 500 },
        background: "linear-gradient(135deg, #1D71B8 0%, #2a8dd4 50%, #F9B233 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        px: { xs: 3, md: 6 },
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="md">
        <Stack
          spacing={3}
          sx={{
            alignItems: { xs: "flex-start", md: "center" },
            textAlign: { xs: "left", md: "center" },
          }}
        >
          <SailingIcon sx={{ fontSize: { xs: 60, md: 90 } }} />
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{ fontSize: { xs: "2.2rem", md: "3.5rem" } }}
          >
            Vela Para Todos
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontSize: { xs: "1.1rem", md: "1.5rem" }, opacity: 0.95 }}
          >
            Levando a prática da vela para pessoas com deficiência em todo o Brasil.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ pt: 2 }}
          >
            <Button
              size="large" variant="contained" color="secondary"
              startIcon={<FavoriteIcon />}
              href="#doacao"
              sx={{ fontWeight: "bold", px: 4 }}
            >
              Fazer uma doação
            </Button>
            <Button
              size="large" variant="outlined"
              startIcon={<VolunteerActivismIcon />}
              href="#voluntario"
              sx={{ fontWeight: "bold", px: 4, color: "white", borderColor: "white" }}
            >
              Ser voluntário
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

// ─── Sobre ────────────────────────────────────────────────────────────────
function SobreSection() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, px: { xs: 3, sm: 4 } }}>
      <Typography
        variant="h3" color="primary" fontWeight="bold"
        sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, textAlign: "center", mb: 4 }}
      >
        Sobre o projeto
      </Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <SailingIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Inclusão
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Promovemos a prática da vela adaptada para pessoas com deficiência
                física, auditiva e visual.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <VolunteerActivismIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Esporte e Saúde
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A vela proporciona autonomia, confiança, condicionamento físico
                e integração com a natureza.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <FavoriteIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Comunidade
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Uma rede de atletas, voluntários e apoiadores unidos pela
                mesma paixão: o mar e a inclusão.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

// ─── Notícias recentes ────────────────────────────────────────────────────
function NoticiasSection() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/noticias", { params: { page: 1, per_page: 3 } })
      .then(({ data }) => setNoticias(data.data || []))
      .catch(() => setNoticias([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && noticias.length === 0) return null;

  return (
    <Box sx={{ bgcolor: "grey.100", py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 3, sm: 4 } }}>
        <Box className="flex items-center justify-center gap-2 mb-6">
          <ArticleIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography
            variant="h3" color="primary" fontWeight="bold"
            sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}
          >
            Últimas notícias
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {noticias.map((n) => (
            <Grid size={{ xs: 12, md: 4 }} key={n.id}>
              <Card elevation={2} sx={{ height: "100%" }}>
                {n.imagem && (
                  <Box
                    component="img" src={n.imagem} alt={n.titulo}
                    sx={{ width: "100%", height: 180, objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
                <CardContent>
                  <Chip
                    label={new Date(n.publicado_em).toLocaleDateString("pt-BR")}
                    size="small" color="primary" variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {n.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {n.resumo}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

// ─── Doação ───────────────────────────────────────────────────────────────
function DoacaoSection({ onResult }) {
  const [form, setForm] = useState({
    nome_doador: "", valor: "", forma_pagamento: "pix",
  });
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.post("/doacoes", {
        nome_doador: form.nome_doador,
        valor: parseFloat(form.valor),
        forma_pagamento: form.forma_pagamento,
      });
      onResult("💚 Doação registrada! Muito obrigado pela sua contribuição!", "success");
      setForm({ nome_doador: "", valor: "", forma_pagamento: "pix" });
    } catch (err) {
      onResult(extrairMensagemErro(err.response?.data), "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Box id="doacao" sx={{
      py: { xs: 6, md: 8 },
      background: "linear-gradient(135deg, #1D71B8 0%, #2a8dd4 100%)",
      color: "white",
    }}>
      <Container maxWidth="sm" sx={{ px: { xs: 3, sm: 4 } }}>
        <Box className="flex items-center justify-center gap-2 mb-2">
          <FavoriteIcon sx={{ fontSize: 40 }} />
          <Typography variant="h3" fontWeight="bold"
            sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
            Faça uma doação
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.95, textAlign: "center", mb: 4 }}>
          Sua contribuição mantém velas no mar e transforma vidas.
        </Typography>
        <Card elevation={4}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Seu nome" required fullWidth
                  value={form.nome_doador}
                  onChange={(e) => setForm({ ...form, nome_doador: e.target.value })}
                />
                <TextField
                  label="Valor (R$)" type="number" required fullWidth
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  slotProps={{ htmlInput: { min: 1, step: "0.01" } }}
                />
                <FormControl fullWidth>
                  <InputLabel>Forma de pagamento</InputLabel>
                  <Select
                    label="Forma de pagamento"
                    value={form.forma_pagamento}
                    onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value })}
                  >
                    <MenuItem value="pix">Pix</MenuItem>
                    <MenuItem value="transferencia">Transferência</MenuItem>
                    <MenuItem value="paypal">PayPal</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  type="submit" variant="contained" size="large" fullWidth
                  color="secondary" disabled={enviando}
                  startIcon={<FavoriteIcon />}
                  sx={{ fontWeight: "bold", py: 1.5 }}
                >
                  {enviando ? "Enviando..." : "Doar agora"}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

// ─── Voluntário ───────────────────────────────────────────────────────────
function VoluntarioSection({ onResult }) {
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });
  const [enviando, setEnviando] = useState(false);

  const mensagemOk = form.mensagem.length >= 20;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!mensagemOk) {
      onResult("A mensagem precisa ter pelo menos 20 caracteres.", "warning");
      return;
    }
    setEnviando(true);
    try {
      await api.post("/voluntarios", form);
      onResult("🤝 Inscrição recebida! Entraremos em contato em breve.", "success");
      setForm({ nome: "", email: "", mensagem: "" });
    } catch (err) {
      onResult(extrairMensagemErro(err.response?.data), "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Container id="voluntario" maxWidth="sm" sx={{ py: { xs: 6, md: 8 }, px: { xs: 3, sm: 4 } }}>
      <Box className="flex items-center justify-center gap-2 mb-2">
        <VolunteerActivismIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h3" color="primary" fontWeight="bold"
          sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
          Seja voluntário
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mb: 4 }}>
        Instrutores, enfermeiros, educadores, entusiastas da vela — sua ajuda é bem-vinda!
      </Typography>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Nome completo" required fullWidth
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                slotProps={{ htmlInput: { minLength: 3, maxLength: 100 } }}
              />
              <TextField
                label="E-mail" type="email" required fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <TextField
                label="Como pode ajudar?" required fullWidth multiline minRows={4}
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                slotProps={{ htmlInput: { minLength: 20, maxLength: 1000 } }}
                error={form.mensagem.length > 0 && !mensagemOk}
                helperText={`${form.mensagem.length} caracteres (mínimo 20)`}
              />
              <Button
                type="submit" variant="contained" size="large" fullWidth
                disabled={enviando || !mensagemOk}
                startIcon={<VolunteerActivismIcon />}
                sx={{ fontWeight: "bold", py: 1.5 }}
              >
                {enviando ? "Enviando..." : "Quero ser voluntário"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

// ─── Rodapé ───────────────────────────────────────────────────────────────
function Footer() {
  return (
    <Box sx={{
      bgcolor: "primary.main", color: "white", py: 4,
      textAlign: "center", px: 2,
    }}>
      <Container maxWidth="lg">
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          🌊 Vela Para Todos
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85, mb: 1 }}>
          Federação Brasileira de Vela Adaptada (FBVA)
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} · Projeto acadêmico CEUB · Desenvolvimento Web 2026/2
        </Typography>
      </Container>
    </Box>
  );
}
