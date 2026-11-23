import { useState, useEffect } from "react";
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Container,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem,
  Paper, Select, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Tooltip, Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/People";
import RefreshIcon from "@mui/icons-material/Refresh";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function Usuarios() {
  const { usuario: usuarioAtual } = useAuth();

  // ── Estado da lista ────────────────────────────────────────────────────
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  // ── Filtros + paginação ────────────────────────────────────────────────
  const [filtroPapel, setFiltroPapel] = useState("");
  const [busca, setBusca] = useState("");
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  // ── Dialog de edição ───────────────────────────────────────────────────
  const [editando, setEditando] = useState(null);
  const [erroEdit, setErroEdit] = useState(null);
  const [erroEditCampos, setErroEditCampos] = useState({});
  const [salvando, setSalvando] = useState(false);

  // ── Dialog de exclusão ─────────────────────────────────────────────────
  const [excluindo, setExcluindo] = useState(null);
  const [excluindoLoading, setExcluindoLoading] = useState(false);

  // ── Carregar usuários ──────────────────────────────────────────────────
  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const params = new URLSearchParams();
      if (filtroPapel) params.set("papel", filtroPapel);
      if (busca.trim()) params.set("q", busca.trim());
      params.set("page", page + 1);
      params.set("per_page", perPage);

      const { data } = await api.get(`/usuarios?${params}`);
      setUsuarios(data.items);
      setTotal(data.total);
    } catch (err) {
      setErro(extrairMensagemErro(err));
    } finally {
      setCarregando(false);
    }
  }

  function extrairMensagemErro(err) {
    return err.response?.data?.error || err.message || "Erro inesperado";
  }

  // Recarrega quando muda filtro, página ou per_page
  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroPapel, page, perPage]);

  // Busca com debounce (reseta pra página 1)
  useEffect(() => {
    const t = setTimeout(() => {
      if (page !== 0) setPage(0);
      else carregar();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  // ── Ações de edição ────────────────────────────────────────────────────
  function abrirEdicao(u) {
    setEditando({ ...u });
    setErroEdit(null);
    setErroEditCampos({});
  }

  async function salvarEdicao() {
    if (!editando) return;
    setSalvando(true);
    setErroEdit(null);
    setErroEditCampos({});

    try {
      await api.put(`/usuarios/${editando.id}`, {
        nome: editando.nome,
        email: editando.email,
        data_nascimento: editando.data_nascimento,
        papel: editando.papel,
      });
      setEditando(null);
      setMensagemSucesso(`Usuário "${editando.nome}" atualizado com sucesso`);
      carregar();
    } catch (err) {
      const data = err.response?.data;
      if (data?.code === "VALIDATION_ERROR" && data.details) {
        const back = {};
        Object.entries(data.details).forEach(([k, v]) => {
          back[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setErroEditCampos(back);
      } else {
        setErroEdit(extrairMensagemErro(err));
      }
    } finally {
      setSalvando(false);
    }
  }

  // ── Ações de exclusão ──────────────────────────────────────────────────
  async function confirmarExclusao() {
    if (!excluindo) return;
    setExcluindoLoading(true);
    try {
      await api.delete(`/usuarios/${excluindo.id}`);
      setMensagemSucesso(`Usuário "${excluindo.nome}" excluído`);
      setExcluindo(null);
      carregar();
    } catch (err) {
      setErro(extrairMensagemErro(err));
      setExcluindo(null);
    } finally {
      setExcluindoLoading(false);
    }
  }

  // ── Helpers visuais ────────────────────────────────────────────────────
  function iniciais(nome) {
    return nome
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function formatarData(d) {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("pt-BR");
    } catch {
      return "—";
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
      {/* Título — mesmo padrão das outras páginas */}
      <Box className="flex items-center gap-2 mb-4">
        <PeopleIcon color="primary" sx={{ fontSize: 36 }} />
        <Typography variant="h4" color="primary" fontWeight="bold">
          Usuários
        </Typography>
      </Box>

      {mensagemSucesso && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setMensagemSucesso(null)}
        >
          {mensagemSucesso}
        </Alert>
      )}

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErro(null)}>
          {erro}
        </Alert>
      )}

      {/* ── Filtros ───────────────────────────────────────────────────── */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nome ou e-mail"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Perfil</InputLabel>
              <Select
                value={filtroPapel}
                label="Perfil"
                onChange={(e) => {
                  setFiltroPapel(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="aluno">Aluno</MenuItem>
                <MenuItem value="professor">Professor</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 2, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={carregar}
              disabled={carregando}
            >
              Atualizar
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 12, md: 2 }}>
            <Typography
              color="text.secondary"
              sx={{ textAlign: { xs: "right", sm: "right" } }}
            >
              {total} {total === 1 ? "usuário" : "usuários"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Tabela ────────────────────────────────────────────────────── */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#F3E6F7" }}>
              <TableCell sx={{ fontWeight: 600 }}>Usuário</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>E-mail</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Perfil</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nascimento</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Cadastro</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carregando ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : usuarios.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 6, color: "text.secondary" }}
                >
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((u) => {
                const souEu = u.id === usuarioAtual?.id;
                return (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "center" }}
                      >
                        <Avatar
                          sx={{
                            bgcolor:
                              u.papel === "professor" ? "#ec0089" : "#662c92",
                            color:
                              u.papel === "professor" ? "#323232" : "#ffffff",
                            width: 36,
                            height: 36,
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                        >
                          {iniciais(u.nome)}
                        </Avatar>
                        <Typography fontWeight={500}>{u.nome}</Typography>
                        {souEu && (
                          <Chip
                            label="você"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.7rem",
                              bgcolor: "#F3E6F7",
                              color: "#43054e",
                            }}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.papel === "professor" ? "Professor" : "Aluno"}
                        size="small"
                        sx={{
                          bgcolor:
                            u.papel === "professor" ? "#ec0089" : "#F3E6F7",
                          color:
                            u.papel === "professor" ? "#323232" : "#43054e",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatarData(u.data_nascimento)}</TableCell>
                    <TableCell>{formatarData(u.criado_em)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton
                          onClick={() => abrirEdicao(u)}
                          sx={{ color: "#662c92" }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={
                          souEu
                            ? "Você não pode excluir sua própria conta"
                            : "Excluir"
                        }
                      >
                        <span>
                          <IconButton
                            onClick={() => setExcluindo(u)}
                            disabled={souEu}
                            sx={{ color: souEu ? "#bdbdbd" : "#c62828" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={perPage}
          onRowsPerPageChange={(e) => {
            setPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="Por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count}`
          }
        />
      </TableContainer>

      {/* ── Dialog de edição ─────────────────────────────────────────── */}
      <Dialog
        open={!!editando}
        onClose={() => (!salvando ? setEditando(null) : null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: "#662c92", fontWeight: 700 }}>
          Editar usuário
        </DialogTitle>
        <DialogContent>
          {erroEdit && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {erroEdit}
            </Alert>
          )}
          {editando && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Nome completo"
                  value={editando.nome}
                  onChange={(e) =>
                    setEditando({ ...editando, nome: e.target.value })
                  }
                  error={!!erroEditCampos.nome}
                  helperText={erroEditCampos.nome}
                  disabled={salvando}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 7 }}>
                <TextField
                  fullWidth
                  type="email"
                  label="E-mail"
                  value={editando.email}
                  onChange={(e) =>
                    setEditando({ ...editando, email: e.target.value })
                  }
                  error={!!erroEditCampos.email}
                  helperText={erroEditCampos.email}
                  disabled={salvando}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data nasc."
                  value={editando.data_nascimento || ""}
                  onChange={(e) =>
                    setEditando({
                      ...editando,
                      data_nascimento: e.target.value,
                    })
                  }
                  error={!!erroEditCampos.data_nascimento}
                  helperText={erroEditCampos.data_nascimento}
                  slotProps={{ inputLabel: { shrink: true } }}
                  disabled={salvando}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth disabled={salvando}>
                  <InputLabel>Perfil</InputLabel>
                  <Select
                    label="Perfil"
                    value={editando.papel}
                    onChange={(e) =>
                      setEditando({ ...editando, papel: e.target.value })
                    }
                  >
                    <MenuItem value="aluno">Aluno</MenuItem>
                    <MenuItem value="professor">Professor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditando(null)} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            onClick={salvarEdicao}
            variant="contained"
            disabled={salvando}
            sx={{ bgcolor: "#662c92", "&:hover": { bgcolor: "#43054e" } }}
          >
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog de exclusão ───────────────────────────────────────── */}
      <Dialog
        open={!!excluindo}
        onClose={() => (!excluindoLoading ? setExcluindo(null) : null)}
      >
        <DialogTitle sx={{ color: "#c62828", fontWeight: 700 }}>
          Confirmar exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o usuário{" "}
            <strong>{excluindo?.nome}</strong>?
            <br />
            Esta ação <strong>não pode ser desfeita</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setExcluindo(null)} disabled={excluindoLoading}>
            Cancelar
          </Button>
          <Button
            onClick={confirmarExclusao}
            variant="contained"
            color="error"
            disabled={excluindoLoading}
          >
            {excluindoLoading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
