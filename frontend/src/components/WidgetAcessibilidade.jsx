import { useState, useEffect } from "react";
import {
  Box, IconButton, Paper, Stack, Tooltip, Typography,
} from "@mui/material";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import TextIncreaseIcon from "@mui/icons-material/TextIncrease";
import TextDecreaseIcon from "@mui/icons-material/TextDecrease";
import ContrastIcon from "@mui/icons-material/Contrast";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";

// ── Limites da escala de fonte ────────────────────────────────────────────
const ESCALA_MIN = 0.85;   // 85%
const ESCALA_MAX = 1.50;   // 150%
const ESCALA_STEP = 0.10;  // 10% por clique
const ESCALA_PADRAO = 1.0;

const STORAGE_KEY = "fbva_acessibilidade";

// ── Lê o storage uma vez para inicializar o estado ─────────────────────
// Usar lazy initial state (função dentro do useState) é a forma correta de
// hidratar de localStorage em React 18+ com StrictMode — evita o bug de o
// efeito de persistência rodar antes do efeito de carga e sobrescrever tudo.
function lerPreferencias() {
  try {
    const salvo = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const escala =
      typeof salvo.escala === "number"
        ? Math.min(Math.max(salvo.escala, ESCALA_MIN), ESCALA_MAX)
        : ESCALA_PADRAO;
    const contraste =
      typeof salvo.contraste === "boolean" ? salvo.contraste : false;
    return { escala, contraste };
  } catch {
    return { escala: ESCALA_PADRAO, contraste: false };
  }
}

export default function WidgetAcessibilidade() {
  const [aberto, setAberto] = useState(false);
  // Lazy initial state — só roda UMA vez, mesmo com StrictMode
  const [escala, setEscala] = useState(() => lerPreferencias().escala);
  const [contraste, setContraste] = useState(() => lerPreferencias().contraste);

  // ── Aplica escala no :root (afeta todas as unidades rem) ─────────────
  useEffect(() => {
    document.documentElement.style.fontSize = `${escala * 16}px`;
  }, [escala]);

  // ── Aplica/remove classe de alto contraste no body ───────────────────
  useEffect(() => {
    if (contraste) {
      document.body.classList.add("alto-contraste");
    } else {
      document.body.classList.remove("alto-contraste");
    }
  }, [contraste]);

  // ── Persistir preferências ────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ escala, contraste })
      );
    } catch {
      // ignora erros de storage (privacidade/quota)
    }
  }, [escala, contraste]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const aumentarFonte = () =>
    setEscala((e) => Math.min(Number((e + ESCALA_STEP).toFixed(2)), ESCALA_MAX));

  const diminuirFonte = () =>
    setEscala((e) => Math.max(Number((e - ESCALA_STEP).toFixed(2)), ESCALA_MIN));

  const alternarContraste = () => setContraste((c) => !c);

  const resetar = () => {
    setEscala(ESCALA_PADRAO);
    setContraste(false);
  };

  const estaNoPadrao = escala === ESCALA_PADRAO && !contraste;
  const percentual = Math.round(escala * 100);

  return (
    <>
      {/* ── FAB principal (canto direito, acima do VLibras) ─────────── */}
      <Tooltip title="Acessibilidade" placement="left">
        <IconButton
          onClick={() => setAberto((a) => !a)}
          aria-label={aberto ? "Fechar menu de acessibilidade" : "Abrir menu de acessibilidade"}
          aria-expanded={aberto}
          sx={{
            position: "fixed",
            right: 20,
            bottom: 100, // acima do VLibras que fica em ~20
            zIndex: 1300,
            width: 56,
            height: 56,
            bgcolor: "#1D71B8",
            color: "white",
            boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
            transition: "all 0.25s ease",
            "&:hover": {
              bgcolor: "#19629E",
              transform: "scale(1.05)",
            },
          }}
        >
          {aberto ? <CloseIcon /> : <AccessibilityNewIcon />}
        </IconButton>
      </Tooltip>

      {/* ── Painel com botões (abre ao lado do FAB) ──────────────────── */}
      {aberto && (
        <Paper
          elevation={10}
          sx={{
            position: "fixed",
            right: 20,
            bottom: 170, // acima do próprio FAB
            zIndex: 1300,
            borderRadius: 2,
            width: 260,
            overflow: "hidden",
            animation: "fadeInUp 0.25s ease",
            "@keyframes fadeInUp": {
              from: { opacity: 0, transform: "translateY(10px)" },
              to:   { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {/* Cabeçalho */}
          <Box
            sx={{
              bgcolor: "#1D71B8",
              color: "white",
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AccessibilityNewIcon fontSize="small" />
            <Typography fontWeight={700}>Acessibilidade</Typography>
          </Box>

          {/* Botões */}
          <Stack sx={{ p: 1 }} spacing={0.5}>
            <BotaoAcessibilidade
              icon={<TextIncreaseIcon />}
              label="Aumentar fonte"
              detalhe={`Atual: ${percentual}%`}
              onClick={aumentarFonte}
              desabilitado={escala >= ESCALA_MAX}
            />
            <BotaoAcessibilidade
              icon={<TextDecreaseIcon />}
              label="Diminuir fonte"
              detalhe={`Atual: ${percentual}%`}
              onClick={diminuirFonte}
              desabilitado={escala <= ESCALA_MIN}
            />
            <BotaoAcessibilidade
              icon={<ContrastIcon />}
              label={contraste ? "Desligar alto contraste" : "Ativar alto contraste"}
              onClick={alternarContraste}
              ativo={contraste}
            />
            <Box sx={{ borderTop: "1px solid #E0E0E0", my: 0.5 }} />
            <BotaoAcessibilidade
              icon={<RestartAltIcon />}
              label="Restaurar padrão"
              onClick={resetar}
              desabilitado={estaNoPadrao}
            />
          </Stack>
        </Paper>
      )}
    </>
  );
}

// ── Botão interno reutilizável ──────────────────────────────────────────
function BotaoAcessibilidade({ icon, label, detalhe, onClick, ativo, desabilitado }) {
  return (
    <Box
      component="button"
      onClick={onClick}
      disabled={desabilitado}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        width: "100%",
        px: 1.5,
        py: 1,
        border: "none",
        borderRadius: 1,
        bgcolor: ativo ? "#E8F3FB" : "transparent",
        color: desabilitado ? "#bdbdbd" : "#323232",
        textAlign: "left",
        fontFamily: "inherit",
        cursor: desabilitado ? "not-allowed" : "pointer",
        transition: "background 0.15s",
        "&:hover:not(:disabled)": {
          bgcolor: ativo ? "#D7EAF7" : "#F5F5F5",
        },
      }}
    >
      <Box
        sx={{
          color: ativo ? "#1D71B8" : (desabilitado ? "#bdbdbd" : "#4A4A4A"),
          display: "flex",
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          fontSize="0.9rem"
          fontWeight={ativo ? 600 : 500}
          sx={{ lineHeight: 1.2 }}
        >
          {label}
        </Typography>
        {detalhe && (
          <Typography
            fontSize="0.72rem"
            sx={{ color: "#8B8B8B", lineHeight: 1.2, mt: 0.25 }}
          >
            {detalhe}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
