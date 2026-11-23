import { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Container, FormControl, Grid, InputLabel, MenuItem, Select, Stack,
  Typography,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PaymentsIcon from "@mui/icons-material/Payments";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
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

function formatarMoeda(valor) {
  const n = typeof valor === "number" ? valor : parseFloat(valor);
  if (isNaN(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", {
    style: "currency", currency: "BRL",
  });
}

function formatarDataHora(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const FORMAS = [
  { value: "", label: "Todas as formas" },
  { value: "pix", label: "Pix" },
  { value: "transferencia", label: "Transferência" },
  { value: "paypal", label: "PayPal" },
];

const CORES_FORMA = {
  pix: "success",
  transferencia: "primary",
  paypal: "info",
};

export default function Doacoes() {
  const [doacoes, setDoacoes] = useState([]);
  const [meta, setMeta] = useState({
    page: 1, per_page: 12, total: 0, total_pages: 1,
  });
  const [resumo, setResumo] = useState(null); // { total_arrecadado, total_doacoes } se backend retornar
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [formaPagamento, setFormaPagamento] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const params = { page: paginaAtual, per_page: 12 };
      if (formaPagamento) params.forma_pagamento = formaPagamento;

      const { data } = await api.get("/doacoes", { params });
      setDoacoes(data.data || []);
      setMeta(data.meta || { page: 1, per_page: 12, total: 0, total_pages: 1 });
      // Resumo pode vir em data.resumo ou similar — ajustamos se necessario
      setResumo(data.resumo || null);
    } catch (err) {
      setErro(extrairMensagemErro(err.response?.data) || "Erro ao carregar doações");
    } finally {
      setLoading(false);
    }
  }, [paginaAtual, formaPagamento]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function handleFiltroChange(e) {
    setFormaPagamento(e.target.value);
    setPaginaAtual(1);
  }

  // Fallback: soma dos valores da pagina atual se resumo nao veio
  const totalPaginaAtual = doacoes.reduce(
    (acc, d) => acc + (parseFloat(d.valor) || 0),
    0,
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box className="flex items-center gap-2 mb-4">
        <PaymentsIcon color="primary" sx={{ fontSize: 36 }} />
        <Typography variant="h4" color="primary" fontWeight="bold">
          Doações
        </Typography>
      </Box>

      {/* Card de destaque */}
      <Card
        elevation={3}
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #662c92 0%, #2a8dd4 100%)",
          color: "white",
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 2, sm: 4 }}
            sx={{
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <Box className="flex items-center gap-2">
              <AttachMoneyIcon sx={{ fontSize: 48 }} />
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {resumo ? "Total arrecadado" : "Total nesta página"}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatarMoeda(resumo?.total_arrecadado ?? totalPaginaAtual)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {resumo ? "Total de doações" : "Doações nesta página"}
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {resumo?.total_doacoes ?? meta.total ?? 0}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Filtro */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth size="small">
            <InputLabel id="filtro-forma-label">
              Filtrar por forma de pagamento
            </InputLabel>
            <Select
              labelId="filtro-forma-label"
              value={formaPagamento}
              label="Filtrar por forma de pagamento"
              onChange={handleFiltroChange}
            >
              {FORMAS.map((f) => (
                <MenuItem key={f.value} value={f.value}>
                  {f.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

      {loading && (
        <Box className="flex justify-center py-10">
          <CircularProgress />
        </Box>
      )}

      {!loading && doacoes.length === 0 && !erro && (
        <Alert severity="info">
          {formaPagamento
            ? `Nenhuma doação encontrada para "${formaPagamento}".`
            : "Ainda não há doações registradas."}
        </Alert>
      )}

      {!loading && doacoes.length > 0 && (
        <>
          <Grid container spacing={2}>
            {doacoes.map((d) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={d.id}>
                <CardDoacao doacao={d} />
              </Grid>
            ))}
          </Grid>

          {meta.total_pages > 1 && (
            <Box className="flex justify-center items-center gap-3 mt-6 flex-wrap">
              <Button
                variant="outlined"
                startIcon={<NavigateBeforeIcon />}
                onClick={() => setPaginaAtual((p) => p - 1)}
                disabled={meta.page <= 1}
              >
                Anterior
              </Button>
              <Typography>
                Página <strong>{meta.page}</strong> de{" "}
                <strong>{meta.total_pages}</strong>
                <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                  ({meta.total} doações)
                </Typography>
              </Typography>
              <Button
                variant="outlined"
                endIcon={<NavigateNextIcon />}
                onClick={() => setPaginaAtual((p) => p + 1)}
                disabled={meta.page >= meta.total_pages}
              >
                Próxima
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

function CardDoacao({ doacao }) {
  const cor = CORES_FORMA[doacao.forma_pagamento] || "default";
  const labelForma = FORMAS.find((f) => f.value === doacao.forma_pagamento)?.label
    || doacao.forma_pagamento;

  return (
    <Card elevation={2} className="h-full flex flex-col">
      <CardContent className="flex-grow">
        <Chip
          label={labelForma}
          color={cor}
          size="small"
          sx={{ mb: 1.5, fontWeight: "bold" }}
        />
        <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
          {formatarMoeda(doacao.valor)}
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="body2">
            <strong>Doador:</strong> {doacao.nome_doador || "Anônimo"}
          </Typography>
          {doacao.email_doador && (
            <Typography variant="body2" color="text.secondary" sx={{
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              <strong>E-mail:</strong> {doacao.email_doador}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            <strong>Recebida em:</strong> {formatarDataHora(doacao.doado_em)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

