import { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Card, CardActions, CardContent,
  Chip, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider,
  FormControlLabel, Grid, IconButton, Snackbar, Stack, Switch,
  TextField, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from "@mui/icons-material/FilterList";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function Aulas() {
  const { usuario } = useAuth();
  const ehProfessor = usuario?.papel === "professor";

  const [aulas, setAulas] = useState([]);
  const [meta, setMeta] = useState({
    page: 1, per_page: 9, total: 0, total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [filtros, setFiltros] = useState({
    data_inicio: "", data_fim: "", com_vagas: false,
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState({ page: 1 });

  const [modalAberto, setModalAberto] = useState(false);
  const [aulaEditando, setAulaEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false, message: "", severity: "success",
  });

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const params = {
        page: filtrosAplicados.page,
        per_page: 9,
      };
      if (filtrosAplicados.data_inicio)
        params.data_inicio = filtrosAplicados.data_inicio;
      if (filtrosAplicados.data_fim)
        params.data_fim = filtrosAplicados.data_fim;
      if (filtrosAplicados.com_vagas) params.com_vagas = "true";

      const { data } = await api.get("/aulas", { params });
      setAulas(data.data || []);
      setMeta(data.meta || { page: 1, per_page: 9, total: 0, total_pages: 1 });
    } catch (err) {
      setErro(err.response?.data?.error || "Erro ao carregar aulas");
    } finally {
      setLoading(false);
    }
  }, [filtrosAplicados]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function aplicarFiltros() {
    setFiltrosAplicados({ ...filtros, page: 1 });
  }

  function limparFiltros() {
    setFiltros({ data_inicio: "", data_fim: "", com_vagas: false });
    setFiltrosAplicados({ page: 1 });
  }

  function trocarPagina(nova) {
    setFiltrosAplicados({ ...filtrosAplicados, page: nova });
  }

  async function handleDeletar() {
    if (!confirmDelete) return;
    try {
      await api.delete(`/aulas/${confirmDelete.id}`);
      setSnackbar({
        open: true, message: "Aula removida com sucesso", severity: "success",
      });
      setConfirmDelete(null);
      carregar();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Erro ao remover aula",
        severity: "error",
      });
    }
  }

  async function handleInscrever(aula) {
    try {
      await api.post("/inscricoes", { aula_id: aula.id });
      setSnackbar({
        open: true, message: "Inscrição realizada!", severity: "success",
      });
      carregar();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || (err.response?.status === 409 ? "Voce ja esta inscrito nesta aula" : err.response?.status === 422 ? "Conflito de horario com outra inscricao sua" : "Erro ao se inscrever"),
        severity: "error",
      });
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <Typography variant="h4" color="primary" fontWeight="bold">
          Aulas
        </Typography>
        {ehProfessor && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setAulaEditando(null);
              setModalAberto(true);
            }}
          >
            Nova aula
          </Button>
        )}
      </Box>

      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Box className="flex items-center gap-2 mb-3">
            <FilterListIcon color="primary" />
            <Typography variant="subtitle1" fontWeight="bold">
              Filtros
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Data inicial"
                type="date"
                value={filtros.data_inicio}
                onChange={(e) =>
                  setFiltros({ ...filtros, data_inicio: e.target.value })
                }
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Data final"
                type="date"
                value={filtros.data_fim}
                onChange={(e) =>
                  setFiltros({ ...filtros, data_fim: e.target.value })
                }
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} className="flex items-center">
              <FormControlLabel
                control={
                  <Switch
                    checked={filtros.com_vagas}
                    onChange={(e) =>
                      setFiltros({ ...filtros, com_vagas: e.target.checked })
                    }
                  />
                }
                label="Só com vagas"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }} className="flex gap-2">
              <Button variant="contained" onClick={aplicarFiltros} fullWidth>
                Filtrar
              </Button>
              <Button variant="outlined" onClick={limparFiltros} fullWidth>
                Limpar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

      {loading && (
        <Box className="flex justify-center py-10">
          <CircularProgress />
        </Box>
      )}

      {!loading && aulas.length === 0 && !erro && (
        <Alert severity="info">
          Nenhuma aula encontrada com estes filtros.
        </Alert>
      )}

      {!loading && aulas.length > 0 && (
        <>
          <Grid container spacing={2}>
            {aulas.map((aula) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={aula.id}>
                <CardAula
                  aula={aula}
                  usuario={usuario}
                  onEditar={() => {
                    setAulaEditando(aula);
                    setModalAberto(true);
                  }}
                  onDeletar={() => setConfirmDelete(aula)}
                  onInscrever={() => handleInscrever(aula)}
                />
              </Grid>
            ))}
          </Grid>

          <Box className="flex justify-center items-center gap-3 mt-6 flex-wrap">
            <IconButton
              onClick={() => trocarPagina(meta.page - 1)}
              disabled={meta.page <= 1}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <Typography>
              Página <strong>{meta.page}</strong> de{" "}
              <strong>{meta.total_pages}</strong>
              <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                ({meta.total} aulas)
              </Typography>
            </Typography>
            <IconButton
              onClick={() => trocarPagina(meta.page + 1)}
              disabled={meta.page >= meta.total_pages}
            >
              <NavigateNextIcon />
            </IconButton>
          </Box>
        </>
      )}

      <ModalAula
        open={modalAberto}
        aula={aulaEditando}
        onClose={() => setModalAberto(false)}
        onSuccess={(msg) => {
          setSnackbar({ open: true, message: msg, severity: "success" });
          carregar();
        }}
      />

      <Dialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        fullWidth maxWidth="xs"
      >
        <DialogTitle>Confirmar remoção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover a aula{" "}
            <strong>"{confirmDelete?.descricao}"</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button onClick={handleDeletar} color="error" variant="contained">
            Remover
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

// ─── Card de uma aula ─────────────────────────────────────────
function CardAula({ aula, usuario, onEditar, onDeletar, onInscrever }) {
  const ehProfessor = usuario?.papel === "professor";
  const ehDonoDaAula = aula.professor?.id === usuario?.id;

  const dataFormatada = aula.data
    ? new Date(aula.data + "T00:00:00").toLocaleDateString("pt-BR", {
        weekday: "short", day: "2-digit", month: "2-digit",
      })
    : "—";

  // Schema real: vagas_total + vagas_disponiveis
  const vagasTotal = aula.vagas_total ?? 0;
  const vagasDisp = aula.vagas_disponiveis ?? 0;
  const inscritos = vagasTotal - vagasDisp;
  const temVagas = vagasDisp > 0;

  return (
    <Card elevation={2} className="h-full flex flex-col">
      <CardContent className="flex-grow">
        <Box className="flex justify-between items-start mb-2 gap-2">
          <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.3 }}>
            {aula.descricao}
          </Typography>
          <Chip
            label={temVagas ? `${vagasDisp} vaga${vagasDisp > 1 ? "s" : ""}` : "Lotada"}
            color={temVagas ? "success" : "default"}
            size="small"
          />
        </Box>
        <Divider sx={{ my: 1 }} />
        <Stack spacing={0.5}>
          <Typography variant="body2">
            <strong>Data:</strong> {dataFormatada} às{" "}
            {aula.horario?.substring(0, 5) || "—"}
          </Typography>
          <Typography variant="body2">
            <strong>Duração:</strong> {aula.duracao_min} min
          </Typography>
          <Typography variant="body2">
            <strong>Professor:</strong> {aula.professor?.nome || "—"}
          </Typography>
          <Typography variant="body2">
            <strong>Ocupação:</strong> {inscritos}/{vagasTotal}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions className="justify-end">
        {!ehProfessor && temVagas && (
          <Button size="small" variant="contained" onClick={onInscrever}>
            Inscrever-se
          </Button>
        )}
        {ehProfessor && ehDonoDaAula && (
          <>
            <IconButton size="small" color="primary" onClick={onEditar}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" color="error" onClick={onDeletar}>
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </CardActions>
    </Card>
  );
}

// ─── Modal criar/editar ─────────────────────────────────────────
function ModalAula({ open, aula, onClose, onSuccess }) {
  const editando = Boolean(aula);
  const [form, setForm] = useState({
    descricao: "", data: "", horario: "", duracao_min: 60, vagas: 10,
  });
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open && aula) {
      setForm({
        descricao: aula.descricao || "",
        data: aula.data || "",
        horario: aula.horario?.substring(0, 5) || "",
        duracao_min: aula.duracao_min || 60,
        // Ao editar, carrega o vagas_total atual
        vagas: aula.vagas_total || 10,
      });
    } else if (open) {
      setForm({ descricao: "", data: "", horario: "", duracao_min: 60, vagas: 10 });
    }
    setErro(null);
  }, [open, aula]);

  async function handleSalvar(e) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      // Backend aceita "HH:MM" direto — nao precisa adicionar :00
      if (editando) {
        await api.put(`/aulas/${aula.id}`, form);
        onSuccess("Aula atualizada com sucesso");
      } else {
        await api.post("/aulas", form);
        onSuccess("Aula criada com sucesso");
      }
      onClose();
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.error
        || (data?.details ? JSON.stringify(data.details) : null)
        || "Erro ao salvar aula";
      setErro(msg);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSalvar}>
        <DialogTitle>{editando ? "Editar aula" : "Nova aula"}</DialogTitle>
        <DialogContent>
          {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Descrição"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              required fullWidth autoFocus
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Data" type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                required fullWidth
              />
              <TextField
                label="Horário" type="time"
                value={form.horario}
                onChange={(e) => setForm({ ...form, horario: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                required fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Duração (min)" type="number"
                value={form.duracao_min}
                onChange={(e) =>
                  setForm({ ...form, duracao_min: parseInt(e.target.value) || 0 })
                }
                slotProps={{ htmlInput: { min: 15, max: 480 } }}
                required fullWidth
              />
              <TextField
                label="Vagas" type="number"
                value={form.vagas}
                onChange={(e) =>
                  setForm({ ...form, vagas: parseInt(e.target.value) || 0 })
                }
                slotProps={{ htmlInput: { min: 1, max: 100 } }}
                required fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}


