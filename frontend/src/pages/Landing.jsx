import { useEffect, useState } from "react";
import {
  AppBar, Alert, Box, Button, Card, CardContent, Chip, Container,
  FormControl, Grid, InputLabel, MenuItem, Select, Snackbar,
  Stack, TextField, Toolbar, Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import LoginIcon from "@mui/icons-material/Login";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import SignLanguageIcon from "@mui/icons-material/SignLanguage";
import ContrastIcon from "@mui/icons-material/Contrast";
import TextIncreaseIcon from "@mui/icons-material/TextIncrease";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import SailingIcon from "@mui/icons-material/Sailing";
import { Link, useLocation } from "react-router-dom";
import HeaderLanding from "../components/HeaderLanding";
import MapaLocalizacao from "../components/MapaLocalizacao";
import api from "../services/api";

const IMG = "/assets/img";

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

export default function Landing() {
  const [snackbar, setSnackbar] = useState({
    open: false, message: "", severity: "success",
  });
  function notificar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  return (
    <Box>
      <PatternAmarelo />
      <HeaderLanding />
      <HeroSection />
      <CardsPrincipais />
      <MascoteZoe />
      <NoticiasSection />
      <AcessibilidadeSection />
      <DoacaoSection onResult={notificar} />
      <VoluntarioSection onResult={notificar} />
      <OndeEstamosSection />
      <PatternAmarelo invertido />
      <FooterLanding />

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

function PatternAmarelo({ invertido }) {
  return (
    <Box
      sx={{
        height: { xs: 50, md: 80 },
        backgroundImage: `url(${IMG}/pattern-amarelo.jpg)`,
        backgroundSize: { xs: "300px", md: "400px" },
        backgroundRepeat: "repeat-x",
        transform: invertido ? "rotate(180deg)" : "none",
      }}
    />
  );
}

function HeroSection() {
  return (
    <Box
      id="informacoes"
      sx={{
        minHeight: { xs: 380, md: 480 },
        background: "linear-gradient(135deg, #43054e 0%, #bf0087 100%)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        px: 2,
      }}
    >
      <Box
        sx={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${IMG}/pattern-triangulos.jpg)`,
          backgroundSize: "600px",
          opacity: 0.08,
        }}
      />
      <Container maxWidth="md" sx={{ position: "relative", textAlign: "center" }}>
        <Typography
          variant="h1"
          sx={{
            color: "#ffffff !important",
            fontWeight: 700,
            fontSize: { xs: "2.2rem", md: "4rem" },
            lineHeight: 1.2, mb: 3,
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          Conheça e participe do Projeto Vela Para Todos!
        </Typography>
        <Button
          variant="contained" size="large"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("quem-somos")?.scrollIntoView({ behavior: "smooth" });
          }}
          sx={{ px: 5, py: 1.5, fontSize: "1.1rem" }}
        >
          Saiba mais
        </Button>
      </Container>
    </Box>
  );
}

function CardsPrincipais() {
  const cards = [
    {
      titulo: "Infraestrutura",
      imagem: `${IMG}/infraestrutura.jpg`,
      texto: "Contamos com uma infraestrutura completa, com barcos adaptados, profissionais preparados e restaurantes de ótima qualidade.",
    },
    {
      titulo: "Sobre a modalidade",
      imagem: `${IMG}/modalidade.jpg`,
      texto: '"A modalidade pode ser praticada por qualquer deficiente físico e tem o modo de competição e as regras idênticas a vela regular."',
    },
  ];

  return (
    <Container id="quem-somos" maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
      <Grid container spacing={4}>
        {cards.map((c) => (
          <Grid size={{ xs: 12, md: 6 }} key={c.titulo}>
            <Card
              elevation={3}
              sx={{
                overflow: "hidden",
                height: "100%",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(102, 44, 146, 0.2)",
                },
              }}
            >
              <Box
                sx={{
                  height: { xs: 200, md: 260 },
                  backgroundImage: `url(${c.imagem})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
                  {c.titulo}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {c.texto}
                </Typography>
                <Typography
                  component="a"
                  href="#"
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": { color: "primary.dark" },
                  }}
                >
                  Saiba mais →
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

// ─── Mascote Zoé: MAIOR, balão só no hover, estrelas piscando ─────────────
function MascoteZoe() {
  return (
    <Box
      sx={{
        py: { xs: 6, md: 12 },
        background: "linear-gradient(135deg, #F3E6F7 0%, #E8D5F0 100%)",
        position: "relative",
        overflow: "hidden",

        // Animações
        "@keyframes float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-18px)" },
        },
        "@keyframes twinkle": {
          "0%, 100%": { opacity: 0, transform: "scale(0.7) rotate(0deg)" },
          "50%": { opacity: 0.8, transform: "scale(1.15) rotate(10deg)" },
        },
        "@keyframes twinkle2": {
          "0%, 100%": { opacity: 0, transform: "scale(0.6)" },
          "50%": { opacity: 0.7, transform: "scale(1.2)" },
        },
      }}
    >
      {/* Estrelas piscando — várias posições com delays diferentes */}
      {[
        { top: "15%", left: "8%",  size: "2.5rem", delay: "0s",   anim: "twinkle" },
        { top: "25%", left: "22%", size: "1.5rem", delay: "1s",   anim: "twinkle2" },
        { top: "60%", left: "12%", size: "2rem",   delay: "0.5s", anim: "twinkle" },
        { top: "80%", left: "30%", size: "1.3rem", delay: "2s",   anim: "twinkle2" },
        { top: "20%", right: "10%", size: "2.2rem", delay: "0.8s", anim: "twinkle" },
        { top: "55%", right: "5%",  size: "1.7rem", delay: "1.5s", anim: "twinkle2" },
        { top: "75%", right: "20%", size: "1.4rem", delay: "0.3s", anim: "twinkle" },
      ].map((s, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            top: s.top,
            left: s.left,
            right: s.right,
            fontSize: s.size,
            animation: `${s.anim} 3s ease-in-out infinite`,
            animationDelay: s.delay,
            pointerEvents: "none",
          }}
        >
          {i % 2 === 0 ? "✨" : "⭐"}
        </Box>
      ))}

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Grid container spacing={4} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 5 }} sx={{ textAlign: "center" }}>
            <Box
              sx={{
                position: "relative",
                display: "inline-block",
                cursor: "pointer",

                // Balão: invisível por padrão, aparece no hover
                "&:hover .balao-zoe": {
                  opacity: 1,
                  transform: "translate(-50%, 0) scale(1)",
                },
              }}
            >
              {/* Balão — posicionado ACIMA da Zoé pra não invadir texto */}
              <Box
                className="balao-zoe"
                sx={{
                  position: "absolute",
                  top: -20,
                  left: "50%",
                  transform: "translate(-50%, 10px) scale(0.85)",
                  bgcolor: "white",
                  px: 3, py: 1.5,
                  borderRadius: 4,
                  boxShadow: "0 8px 24px rgba(102,44,146,0.25)",
                  fontSize: { xs: "1rem", md: "1.15rem" },
                  fontWeight: 600,
                  color: "primary.dark",
                  whiteSpace: "nowrap",
                  opacity: 0,
                  transition: "all 0.4s ease",
                  zIndex: 3,
                  pointerEvents: "none",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    border: "10px solid transparent",
                    borderTopColor: "white",
                  },
                }}
              >
                Olá! Sou a Zoe 👋
              </Box>

              <Box
                component="img"
                src={`${IMG}/mascote-ceub.png`}
                alt="Zoé - mascote"
                sx={{
                  width: { xs: 300, md: 480 },
                  animation: "float 4s ease-in-out infinite",
                  filter: "drop-shadow(0 16px 36px rgba(102,44,146,0.3))",
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "scale(1.03)" },
                }}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={4} sx={{ p: { xs: 3, md: 5 }, bgcolor: "white" }}>
              <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom
                sx={{ fontSize: { xs: "2rem", md: "2.5rem" } }}>
                Conheça a Zoe!
              </Typography>
              <Typography variant="body1" color="text.primary" sx={{ fontSize: "1.1rem", mb: 2, lineHeight: 1.7 }}>
                Zoe é a mascote do Programa Vela Para Todos. Inspirada na liberdade dos pássaros e na força do vento que move as velas, ela representa a missão do projeto: levar a alegria de velejar para todas as pessoas, sem exceção.
              </Typography>
              <Typography variant="body1" color="text.primary" sx={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
                Junte-se a nós nessa jornada por mais inclusão, autonomia e esporte adaptado.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, fontStyle: "italic" }}>
                💡 Passe o mouse sobre a Zoe para ela dizer olá!
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// ─── Notícias FIXAS com imagens reais do PHP ──────────────────────────────
function NoticiasSection() {
  const NOTICIAS = [
    {
      titulo: "Projeto social ensina pessoas com deficiência a velejar",
      imagem: `${IMG}/noticia-1.jpg`,
      resumo: "A TV Record Brasília exibiu uma reportagem no programa DF no AR sobre o projeto social Vela Para Todos.",
    },
    {
      titulo: "Lago Paranoá recebe Copa BRB da Vela Adaptada",
      imagem: `${IMG}/noticia-2.jpg`,
      resumo: "Competição para pessoas com deficiência será realizada neste sábado, na Semana da Pessoa com Deficiência.",
    },
    {
      titulo: "Brasiliense é a primeira brasileira campeã mundial de vela adaptada",
      imagem: `${IMG}/noticia-3.jpg`,
      resumo: "Do Correio Braziliense — A gaúcha radicada em Brasília Ana Paula Marques se tornou campeã mundial aos 35 anos.",
    },
  ];

  return (
    <Box id="noticias"
      sx={{
        background: "linear-gradient(135deg, #43054e 0%, #bf0087 100%)",
        position: "relative",
        py: { xs: 6, md: 10 },
      }}
    >
      <Box sx={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${IMG}/pattern-hexagonal.jpg)`,
        backgroundSize: "500px",
        opacity: 0.1,
      }} />
      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Typography
          variant="h2"
          sx={{
            color: "#ffffff !important",
            fontWeight: 700,
            textAlign: "center",
            fontSize: { xs: "2rem", md: "3rem" },
            mb: 6,
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          Notícias
        </Typography>
        <Grid container spacing={3}>
          {NOTICIAS.map((n, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Card
                elevation={6}
                sx={{
                  overflow: "hidden", height: "100%",
                  display: "flex", flexDirection: "column",
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "translateY(-6px)" },
                }}
              >
                <Box sx={{
                  width: "100%", height: 220,
                  backgroundImage: `url(${n.imagem})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }} />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom
                    sx={{ lineHeight: 1.3 }}>
                    {n.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {n.resumo}
                  </Typography>
                  <Typography
                    component="a" href="#"
                    sx={{
                      color: "primary.main",
                      fontWeight: 600,
                      textDecoration: "none",
                      "&:hover": { color: "primary.dark" },
                    }}
                  >
                    Saiba mais →
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

// ─── Acessibilidade com ícones MUI ────────────────────────────────────────
function AcessibilidadeSection() {
  const recursos = [
    { icon: <SignLanguageIcon />, titulo: "Tradução em Libras (VLibras)", texto: "Tradutor automático para Língua Brasileira de Sinais." },
    { icon: <ContrastIcon />, titulo: "Alto contraste", texto: "Aumente o contraste visual da página para facilitar a leitura." },
    { icon: <TextIncreaseIcon />, titulo: "Ajuste de fonte", texto: "Aumente ou diminua o tamanho do texto conforme sua necessidade." },
    { icon: <KeyboardIcon />, titulo: "Navegação por teclado", texto: "Todo o site é navegável apenas com a tecla Tab e atalhos de teclado." },
  ];

  return (
    <Container id="acessibilidade" maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Typography variant="h2" color="primary" fontWeight="bold"
          sx={{ fontSize: { xs: "2rem", md: "3rem" }, mb: 2 }}>
          Acessibilidade e Inclusão
        </Typography>
        <Typography variant="body1" color="text.secondary"
          sx={{ fontSize: "1.1rem", maxWidth: 700, mx: "auto" }}>
          Nosso compromisso é fazer com que todos possam navegar e participar
        </Typography>
      </Box>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.8, mb: 2, fontSize: "1.05rem" }}>
            A acessibilidade digital é parte fundamental da missão do <strong>Programa Vela Para Todos</strong>. Acreditamos que a inclusão começa muito antes do contato com a água — começa na forma como as pessoas com deficiência acessam, compreendem e interagem com nossas informações.
          </Typography>
          <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.8, fontSize: "1.05rem" }}>
            Este site segue as diretrizes da <strong>Lei Brasileira de Inclusão (LBI 13.146/2015)</strong> e as recomendações do <strong>WCAG 2.1</strong>, padrão internacional de acessibilidade na web.
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2} sx={{ bgcolor: "#F3E6F7", border: "1px solid #E8D5F0" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccessibilityNewIcon /> Recursos disponíveis
              </Typography>
              <Stack spacing={2}>
                {recursos.map((r, idx) => (
                  <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                    <Box sx={{
                      minWidth: 44, height: 44, borderRadius: 2,
                      bgcolor: "white", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      color: "primary.main", border: "1px solid #E8D5F0",
                    }}>
                      {r.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" color="primary" fontWeight="bold">
                        {r.titulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {r.texto}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

// ─── Doação com MAIS PERSONALIDADE ────────────────────────────────────────
function DoacaoSection({ onResult }) {
  const [form, setForm] = useState({ nome_doador: "", valor: "", forma_pagamento: "pix" });
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
      onResult("💚 Doação registrada! Muito obrigado!", "success");
      setForm({ nome_doador: "", valor: "", forma_pagamento: "pix" });
    } catch (err) {
      onResult(extrairMensagemErro(err.response?.data), "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Box id="doacao" sx={{
      py: { xs: 6, md: 10 },
      background: "linear-gradient(135deg, #43054e 0%, #bf0087 100%)",
      color: "white",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Padrão de fundo sutil */}
      <Box sx={{
        position: "absolute", inset: 0,
        backgroundImage: `url(${IMG}/pattern-triangulos.jpg)`,
        backgroundSize: "600px",
        opacity: 0.06,
      }} />
      {/* Corações decorativos flutuando */}
      {[
        { top: "10%", left: "8%", size: 50, delay: "0s" },
        { top: "70%", left: "5%", size: 35, delay: "1.5s" },
        { top: "20%", right: "10%", size: 40, delay: "0.8s" },
        { top: "75%", right: "7%", size: 45, delay: "2s" },
      ].map((p, i) => (
        <FavoriteIcon key={i} sx={{
          position: "absolute",
          top: p.top, left: p.left, right: p.right,
          fontSize: p.size,
          opacity: 0.15,
          color: "#fde100",
          animation: `float 5s ease-in-out infinite`,
          animationDelay: p.delay,
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-15px)" },
          },
        }} />
      ))}

      <Container maxWidth="sm" sx={{ position: "relative" }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box sx={{
            display: "inline-flex",
            width: 90, height: 90, borderRadius: "50%",
            bgcolor: "#fde100",
            alignItems: "center", justifyContent: "center",
            mb: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}>
            <FavoriteIcon sx={{ fontSize: 50, color: "#43054e" }} />
          </Box>
          <Typography variant="h3" sx={{ color: "#fff !important", fontWeight: 700, fontSize: { xs: "2rem", md: "2.8rem" } }}>
            Faça uma doação
          </Typography>
          <Typography sx={{ opacity: 0.95, mt: 1, fontSize: "1.1rem" }}>
            Sua contribuição mantém velas no mar e <strong>transforma vidas</strong>.
          </Typography>
        </Box>
        <Card elevation={8} sx={{ borderTop: "6px solid #fde100" }}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField label="Seu nome" required fullWidth
                  value={form.nome_doador}
                  onChange={(e) => setForm({ ...form, nome_doador: e.target.value })}
                />
                <TextField label="Valor (R$)" type="number" required fullWidth
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  slotProps={{ htmlInput: { min: 1, step: "0.01" } }}
                />
                <FormControl fullWidth>
                  <InputLabel>Forma de pagamento</InputLabel>
                  <Select label="Forma de pagamento"
                    value={form.forma_pagamento}
                    onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value })}
                  >
                    <MenuItem value="pix">💠 Pix</MenuItem>
                    <MenuItem value="transferencia">🏦 Transferência</MenuItem>
                    <MenuItem value="paypal">💳 PayPal</MenuItem>
                  </Select>
                </FormControl>
                <Button type="submit" variant="contained" size="large" fullWidth
                  color="secondary" disabled={enviando}
                  startIcon={<FavoriteIcon />}
                  sx={{ fontWeight: "bold", py: 1.8, fontSize: "1.1rem" }}
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

// ─── Voluntário com MAIS PERSONALIDADE ────────────────────────────────────
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
    <Box id="voluntario" sx={{
      py: { xs: 6, md: 10 },
      bgcolor: "#F3E6F7",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Elementos decorativos */}
      {[
        { top: "15%", left: "6%", size: 70, color: "primary.main", opacity: 0.08, delay: "0s" },
        { top: "70%", left: "8%", size: 45, color: "secondary.main", opacity: 0.1, delay: "1s" },
        { top: "25%", right: "5%", size: 60, color: "secondary.main", opacity: 0.1, delay: "1.5s" },
        { top: "80%", right: "10%", size: 50, color: "primary.main", opacity: 0.08, delay: "0.5s" },
      ].map((p, i) => (
        <SailingIcon key={i} sx={{
          position: "absolute",
          top: p.top, left: p.left, right: p.right,
          fontSize: p.size,
          color: p.color,
          opacity: p.opacity,
          animation: `float 6s ease-in-out infinite`,
          animationDelay: p.delay,
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-10px)" },
          },
        }} />
      ))}

      <Container maxWidth="sm" sx={{ position: "relative" }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box sx={{
            display: "inline-flex",
            width: 90, height: 90, borderRadius: "50%",
            bgcolor: "primary.main",
            alignItems: "center", justifyContent: "center",
            mb: 2, boxShadow: "0 8px 24px rgba(102,44,146,0.3)",
          }}>
            <VolunteerActivismIcon sx={{ fontSize: 50, color: "#fde100" }} />
          </Box>
          <Typography variant="h3" color="primary" fontWeight="bold"
            sx={{ fontSize: { xs: "2rem", md: "2.8rem" } }}>
            Seja voluntário
          </Typography>
          <Typography color="text.primary" sx={{ mt: 1, fontSize: "1.1rem" }}>
            Instrutores, enfermeiros, educadores — <strong>sua ajuda é bem-vinda!</strong>
          </Typography>
        </Box>
        <Card elevation={6} sx={{ borderTop: "6px solid #662c92" }}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField label="Nome completo" required fullWidth
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  slotProps={{ htmlInput: { minLength: 3, maxLength: 100 } }}
                />
                <TextField label="E-mail" type="email" required fullWidth
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <TextField label="Como pode ajudar?" required fullWidth multiline minRows={4}
                  value={form.mensagem}
                  onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                  slotProps={{ htmlInput: { minLength: 20, maxLength: 1000 } }}
                  error={form.mensagem.length > 0 && !mensagemOk}
                  helperText={`${form.mensagem.length} caracteres (mínimo 20)`}
                />
                <Button type="submit" variant="contained" size="large" fullWidth
                  disabled={enviando || !mensagemOk}
                  startIcon={<VolunteerActivismIcon />}
                  sx={{ fontWeight: "bold", py: 1.8, fontSize: "1.1rem" }}
                >
                  {enviando ? "Enviando..." : "Quero ser voluntário"}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

function OndeEstamosSection() {
  return (
    <Box id="contato" sx={{ py: { xs: 6, md: 10 }, bgcolor: "white" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h2" color="primary" fontWeight="bold"
            sx={{ fontSize: { xs: "2rem", md: "3rem" }, mb: 1 }}>
            Onde estamos
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "1.1rem" }}>
            Venha nos visitar no Clube Cultural e Recreativo Nipo Brasileiro
          </Typography>
        </Box>
        <Grid container spacing={4} sx={{ alignItems: "stretch" }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <MapaLocalizacao />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card elevation={2} sx={{ bgcolor: "#F3E6F7", height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <InfoLinha icon={<LocationOnIcon />} titulo="ENDEREÇO"
                    texto="Clube Cultural e Recreativo Nipo Brasileiro — SCES Sul, Trecho 1, Lote 1 · Brasília-DF" />
                  <InfoLinha icon={<PhoneIcon />} titulo="TELEFONE" texto="(61) 99962-9868" />
                  <InfoLinha icon={<EmailIcon />} titulo="E-MAIL" texto="contato@fbva.esp.br" />
                  <InfoLinha icon={<AccessTimeIcon />} titulo="HORÁRIO DE FUNCIONAMENTO"
                    texto="Terça a domingo, das 8h às 17h" />
                </Stack>
                <Button fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.5 }}
                  href="https://maps.google.com/?q=Clube+Nipo+Brasileiro+Brasília"
                  target="_blank" rel="noopener"
                >
                  Como chegar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function InfoLinha({ icon, titulo, texto }) {
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Box sx={{
        minWidth: 40, height: 40, borderRadius: 2,
        bgcolor: "white", display: "flex",
        alignItems: "center", justifyContent: "center",
        color: "primary.main", border: "1px solid #E8D5F0",
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="primary" fontWeight="bold" sx={{ letterSpacing: 1 }}>
          {titulo}
        </Typography>
        <Typography variant="body2" color="text.primary">
          {texto}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Footer REFORMULADO (tudo centralizado) ───────────────────────────────
function FooterLanding() {
  return (
    <Box sx={{
      bgcolor: "primary.dark",
      color: "white",
      py: { xs: 5, md: 6 },
      px: 2,
    }}>
      <Container maxWidth="sm">
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}>
          <Box
            component="img"
            src={`${IMG}/logo-horizontal.png`}
            alt="Programa Vela Para Todos"
            sx={{
              height: { xs: 50, md: 70 },
              mb: 3,
              filter: "brightness(0) invert(1)",
            }}
          />
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: "#fff" }}>
            Federação Brasileira de Vela Adaptada (FBVA)
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mb: 3 }}>
            Clube Cultural e Recreativo Nipo Brasileiro · Brasília-DF
          </Typography>
          <Box sx={{
            width: "100%",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            pt: 2,
          }}>
            <Typography variant="caption" sx={{ opacity: 0.7, display: "block" }}>
              © {new Date().getFullYear()} · Projeto acadêmico CEUB · Desenvolvimento Web 2026/2
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}



