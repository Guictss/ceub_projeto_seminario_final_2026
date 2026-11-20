import { useCallback, useEffect, useState } from "react";
import {
  Alert, Box, Button, Card, CardActions, CardContent,
  Chip, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider,
  Grid, IconButton, InputAdornment, Snackbar, Stack,
  TextField, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ArticleIcon from "@mui/icons-material/Article";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function formatarData(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

// Pega a 1a mensagem de erro dos details do Marshmallow
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

export default function Noticias() {
  const { usuario } = useAuth();
  const ehProfessor = usuario?.papel === "professor";

  const [noticias, setNoticias] = useState([]);
  const [meta, setMeta] = useState({
    page: 1, per_page: 9, total: 0, total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [modalEdit, setModalEdit] = useState({ aberto: false, noticia: null });
  const [modalLer, setModalLer] = useState({ aberto: false, noticiaId: null, preview: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false, message: "", severity: "success",
  });

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const params = { page: paginaAtual, per_page: 9 };
      if (buscaAplicada) params.q = buscaAplicada;
      const { data } = await api.get("/noticias", { params });
      setNoticias(data.data || []);
      setMeta(data.meta || { page: 1, per_page: 9, total: 0, total_pages: 1 });
    } catch (err) {
      setErro(extrairMensagemErro(err.response?.data) || "Erro ao carregar notícias");
    } finally {
      setLoading(false);
    }
  }, [paginaAtual, buscaAplicada]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleDeletar() {
    if (!confirmDelete) return;
    try {
      await api.delete(`/noticias/${confirmDelete.id}`);
      setSnackbar({
        open: true, message: "Notícia removida", severity: "success",
      });
      setConfirmDelete(null);
      carregar();
    } catch (err) {
      setSnackbar({
        open: true,
        message: extrairMensagemErro(err.response?.data) || "Erro ao remover",
        severity: "error",
      });
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <Box className="flex items-center gap-2">
          <ArticleIcon color="primary" sx={{ fontSize: 36 }} />
          <Typography variant="h4" color="primary" fontWeight="bold">
            Notícias
          </Typography>
        </Box>
        {ehProfessor && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalEdit({ aberto: true, noticia: null })}
          >
            Nova notícia
          </Button>
        )}
      </Box>

      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setBuscaAplicada(busca);
              setPaginaAtual(1);
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                placeholder="Buscar por título..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                fullWidth size="small"
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
              <Button type="submit" variant="contained" sx={{ minWidth: 120 }}>
                Buscar
              </Button>
              {buscaAplicada && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setBusca("");
                    setBuscaAplicada("");
                    setPaginaAtual(1);
                  }}
                >
                  Limpar
                </Button>
              )}
            </Stack>
          </form>
        </CardContent>
      </Card>

      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

      {loading && (
        <Box className="flex justify-center py-10">
          <CircularProgress />
        </Box>
      )}

      {!loading && noticias.length === 0 && !erro && (
        <Alert severity="info">
          {buscaAplicada
            ? `Nenhuma notícia encontrada para "${buscaAplicada}".`
            : "Ainda não há notícias publicadas."}
        </Alert>
      )}

      {!loading && noticias.length > 0 && (
        <>
          <Grid container spacing={2}>
            {noticias.map((n) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={n.id}>
                <CardNoticia
                  noticia={n}
                  ehProfessor={ehProfessor}
                  onLer={() =>
                    setModalLer({ aberto: true, noticiaId: n.id, preview: n })
                  }
                  onEditar={() =>
                    setModalEdit({ aberto: true, noticia: n })
                  }
                  onDeletar={() => setConfirmDelete(n)}
                />
              </Grid>
            ))}
          </Grid>

          {meta.total_pages > 1 && (
            <Box className="flex justify-center items-center gap-3 mt-6 flex-wrap">
              <Button
                variant="outlined"
                onClick={() => setPaginaAtual((p) => p - 1)}
                disabled={meta.page <= 1}
              >
                ← Anterior
              </Button>
              <Typography>
                Página <strong>{meta.page}</strong> de{" "}
                <strong>{meta.total_pages}</strong>
                <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                  ({meta.total} notícias)
                </Typography>
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setPaginaAtual((p) => p + 1)}
                disabled={meta.page >= meta.total_pages}
              >
                Próxima →
              </Button>
            </Box>
          )}
        </>
      )}

      <ModalEditarNoticia
        aberto={modalEdit.aberto}
        noticia={modalEdit.noticia}
        onClose={() => setModalEdit({ aberto: false, noticia: null })}
        onSuccess={(msg) => {
          setSnackbar({ open: true, message: msg, severity: "success" });
          carregar();
        }}
      />

      <ModalLerNoticia
        aberto={modalLer.aberto}
        noticiaId={modalLer.noticiaId}
        preview={modalLer.preview}
        onClose={() =>
          setModalLer({ aberto: false, noticiaId: null, preview: null })
        }
      />

      <Dialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        fullWidth maxWidth="xs"
      >
        <DialogTitle>Confirmar remoção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover a notícia{" "}
            <strong>"{confirmDelete?.titulo}"</strong>?
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

// ─── Card ───
function CardNoticia({ noticia, ehProfessor, onLer, onEditar, onDeletar }) {
  return (
    <Card elevation={2} className="h-full flex flex-col">
      {noticia.imagem && (
        <Box
          component="img"
          src={noticia.imagem}
          alt={noticia.titulo}
          sx={{
            width: "100%",
            height: 160,
            objectFit: "cover",
            borderBottom: 1,
            borderColor: "divider",
          }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      )}
      <CardContent className="flex-grow">
        <Chip
          label={formatarData(noticia.publicado_em)}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mb: 1.5 }}
        />
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, lineHeight: 1.3 }}>
          {noticia.titulo}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {noticia.resumo}
        </Typography>
      </CardContent>
      <CardActions className="justify-between">
        <Button size="small" onClick={onLer}>
          Ler mais
        </Button>
        {ehProfessor && (
          <Box>
            <IconButton size="small" color="primary" onClick={onEditar}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" color="error" onClick={onDeletar}>
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </CardActions>
    </Card>
  );
}

// ─── Modal Ler — faz GET /noticias/:id pra pegar conteudo completo ───
function ModalLerNoticia({ aberto, noticiaId, preview, onClose }) {
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!aberto || !noticiaId) return;
    setNoticia(null);
    setErro(null);
    setLoading(true);
    api.get(`/noticias/${noticiaId}`)
      .then(({ data }) => setNoticia(data))
      .catch((err) =>
        setErro(extrairMensagemErro(err.response?.data) || "Erro ao carregar notícia")
      )
      .finally(() => setLoading(false));
  }, [aberto, noticiaId]);

  // Enquanto carrega, mostra os dados do preview (titulo da lista)
  const dadosExibir = noticia || preview;
  if (!dadosExibir) return null;

  return (
    <Dialog open={aberto} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold" color="primary" component="div">
          {dadosExibir.titulo}
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          Publicado em {formatarData(dadosExibir.publicado_em)}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box className="flex justify-center py-6">
            <CircularProgress />
          </Box>
        )}
        {erro && <Alert severity="error">{erro}</Alert>}
        {noticia && (
          <>
            {noticia.imagem && (
              <Box
                component="img"
                src={noticia.imagem}
                alt={noticia.titulo}
                sx={{ width: "100%", maxHeight: 400, objectFit: "cover", mb: 2, borderRadius: 1 }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
              {noticia.conteudo}
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Modal Editar/Criar ───
function ModalEditarNoticia({ aberto, noticia, onClose, onSuccess }) {
  const editando = Boolean(noticia);
  const [form, setForm] = useState({ titulo: "", conteudo: "", imagem: "" });
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);

  // Ao abrir pra editar, busca o conteudo completo (lista nao traz)
  useEffect(() => {
    if (!aberto) return;
    setErro(null);
    if (editando && noticia) {
      setCarregandoDetalhe(true);
      api.get(`/noticias/${noticia.id}`)
        .then(({ data }) => {
          setForm({
            titulo: data.titulo || "",
            conteudo: data.conteudo || "",
            imagem: data.imagem || "",
          });
        })
        .catch(() => {
          setForm({
            titulo: noticia.titulo || "",
            conteudo: "",
            imagem: noticia.imagem || "",
          });
        })
        .finally(() => setCarregandoDetalhe(false));
    } else {
      setForm({ titulo: "", conteudo: "", imagem: "" });
    }
  }, [aberto, noticia, editando]);

  async function handleSalvar(e) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      // Nao envia 'imagem' se estiver vazia (backend aceita null)
      const payload = { titulo: form.titulo, conteudo: form.conteudo };
      if (form.imagem?.trim()) payload.imagem = form.imagem.trim();

      if (editando) {
        await api.put(`/noticias/${noticia.id}`, payload);
        onSuccess("Notícia atualizada com sucesso");
      } else {
        await api.post("/noticias", payload);
        onSuccess("Notícia publicada com sucesso");
      }
      onClose();
    } catch (err) {
      setErro(extrairMensagemErro(err.response?.data) || "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  const tituloValido = form.titulo.length >= 5 && form.titulo.length <= 200;
  const conteudoValido = form.conteudo.length >= 20;

  return (
    <Dialog open={aberto} onClose={onClose} fullWidth maxWidth="md">
      <form onSubmit={handleSalvar}>
        <DialogTitle>{editando ? "Editar notícia" : "Nova notícia"}</DialogTitle>
        <DialogContent>
          {carregandoDetalhe && (
            <Box className="flex justify-center py-4">
              <CircularProgress />
            </Box>
          )}
          {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
          {!carregandoDetalhe && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Título"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                required fullWidth autoFocus
                slotProps={{ htmlInput: { minLength: 5, maxLength: 200 } }}
                error={form.titulo.length > 0 && !tituloValido}
                helperText={`${form.titulo.length}/200 (mínimo 5)`}
              />
              <TextField
                label="Conteúdo"
                value={form.conteudo}
                onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                required fullWidth multiline minRows={8} maxRows={15}
                slotProps={{ htmlInput: { minLength: 20 } }}
                error={form.conteudo.length > 0 && !conteudoValido}
                helperText={`${form.conteudo.length} caracteres (mínimo 20)`}
              />
              <TextField
                label="URL da imagem (opcional)"
                value={form.imagem}
                onChange={(e) => setForm({ ...form, imagem: e.target.value })}
                fullWidth
                placeholder="https://exemplo.com/imagem.jpg"
                slotProps={{ htmlInput: { maxLength: 255 } }}
                helperText="URL completa de uma imagem para ilustrar a notícia"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            type="submit" variant="contained"
            disabled={salvando || carregandoDetalhe || !tituloValido || !conteudoValido}
          >
            {salvando ? "Publicando..." : editando ? "Salvar alterações" : "Publicar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
