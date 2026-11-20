import { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Card, CardActions, CardContent,
  Chip, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider,
  FormControl, Grid, InputLabel, MenuItem, Select, Snackbar,
  Stack, Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
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

function formatarDataHora(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS = [
  { value: "", label: "Todos os status" },
  { value: "pendente", label: "Pendentes" },
  { value: "aprovado", label: "Aprovados" },
  { value: "recusado", label: "Recusados" },
];

const CORES_STATUS = {
  pendente: "warning",
  aprovado: "success",
  recusado: "error",
};

const LABELS_STATUS = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

export default function Voluntarios() {
  const [voluntarios, setVoluntarios] = useState([]);
  const [meta, setMeta] = useState({
    page: 1, per_page: 9, total: 0, total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [status, setStatus] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [confirmAcao, setConfirmAcao] = useState(null); // { voluntario, novoStatus }
  const [snackbar, setSnackbar] = useState({
    open: false, message: "", severity: "success",
  });

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const params = { page: paginaAtual, per_page: 9 };
      if (status) params.status = status;

      const { data } = await api.get("/voluntarios", { params });
      setVoluntarios(data.data || []);
      setMeta(data.meta || { page: 1, per_page: 9, total: 0, total_pages: 1 });
    } catch (err) {
      setErro(extrairMensagemErro(err.response?.data) || "Erro ao carregar voluntários");
    } finally {
      setLoading(false);
    }
  }, [paginaAtual, status]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function handleFiltroChange(e) {
    setStatus(e.target.value);
    setPaginaAtual(1);
  }

  async function handleConfirmar() {
    if (!confirmAcao) return;
    const { voluntario, novoStatus } = confirmAcao;
    try {
      await api.patch(`/voluntarios/${voluntario.id}/status`, { status: novoStatus });
      setSnackbar({
        open: true,
        message: `Voluntário ${novoStatus === "aprovado" ? "aprovado" : "recusado"} com sucesso`,
        severity: novoStatus === "aprovado" ? "success" : "info",
      });
      setConfirmAcao(null);
      carregar();
    } catch (err) {
      setSnackbar({
        open: true,
        message: extrairMensagemErro(err.response?.data) || "Erro ao atualizar status",
        severity: "error",
      });
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box className="flex items-center gap-2 mb-4">
        <VolunteerActivismIcon color="primary" sx={{ fontSize: 36 }} />
        <Typography variant="h4" color="primary" fontWeight="bold">
          Voluntários
        </Typography>
      </Box>

      {/* Filtro */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth size="small">
            <InputLabel id="filtro-status-label">
              Filtrar por status
            </InputLabel>
            <Select
              labelId="filtro-status-label"
              value={status}
              label="Filtrar por status"
              onChange={handleFiltroChange}
            >
              {STATUS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
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

      {!loading && voluntarios.length === 0 && !erro && (
        <Alert severity="info">
          {status
            ? `Nenhum voluntário com status "${status}".`
            : "Ainda não há voluntários inscritos."}
        </Alert>
      )}

      {!loading && voluntarios.length > 0 && (
        <>
          <Grid container spacing={2}>
            {voluntarios.map((v) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={v.id}>
                <CardVoluntario
                  voluntario={v}
                  onAprovar={() =>
                    setConfirmAcao({ voluntario: v, novoStatus: "aprovado" })
                  }
                  onRecusar={() =>
                    setConfirmAcao({ voluntario: v, novoStatus: "recusado" })
                  }
                />
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
                  ({meta.total} voluntários)
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

      {/* Dialog de confirmação */}
      <Dialog
        open={Boolean(confirmAcao)}
        onClose={() => setConfirmAcao(null)}
        fullWidth maxWidth="xs"
      >
        <DialogTitle>
          {confirmAcao?.novoStatus === "aprovado"
            ? "Aprovar voluntário?"
            : "Recusar voluntário?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja{" "}
            <strong>
              {confirmAcao?.novoStatus === "aprovado" ? "aprovar" : "recusar"}
            </strong>{" "}
            o(a) voluntário(a){" "}
            <strong>{confirmAcao?.voluntario?.nome}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAcao(null)}>Cancelar</Button>
          <Button
            onClick={handleConfirmar}
            color={confirmAcao?.novoStatus === "aprovado" ? "success" : "error"}
            variant="contained"
          >
            {confirmAcao?.novoStatus === "aprovado" ? "Aprovar" : "Recusar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
    </Container>
  );
}

function CardVoluntario({ voluntario, onAprovar, onRecusar }) {
  const ehPendente = voluntario.status === "pendente";
  const cor = CORES_STATUS[voluntario.status] || "default";
  const label = LABELS_STATUS[voluntario.status] || voluntario.status;

  return (
    <Card elevation={2} className="h-full flex flex-col">
      <CardContent className="flex-grow">
        <Box className="flex justify-between items-start mb-2 gap-2">
          <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.3 }}>
            {voluntario.nome}
          </Typography>
          <Chip
            label={label}
            color={cor}
            size="small"
            sx={{ fontWeight: "bold", flexShrink: 0 }}
          />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          📧 {voluntario.email}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography
          variant="body2"
          sx={{
            mb: 1.5,
            whiteSpace: "pre-wrap",
            display: "-webkit-box",
            WebkitLineClamp: 5,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {voluntario.mensagem}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Inscrito em {formatarDataHora(voluntario.inscrito_em)}
        </Typography>
      </CardContent>
      {ehPendente && (
        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={onAprovar}
          >
            Aprovar
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={onRecusar}
          >
            Recusar
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
