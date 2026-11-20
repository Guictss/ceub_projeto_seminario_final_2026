import { useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, CircularProgress,
  Container, Grid, Snackbar, Stack, TextField, Typography,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import api from "../services/api";

export default function Relatorio() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [baixando, setBaixando] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false, message: "", severity: "success",
  });

  async function handleGerar() {
    if (dataInicio && dataFim && dataInicio > dataFim) {
      setSnackbar({
        open: true,
        message: "Data inicial deve ser anterior à data final",
        severity: "warning",
      });
      return;
    }

    setBaixando(true);
    try {
      const params = {};
      if (dataInicio) params.data_inicio = dataInicio;
      if (dataFim) params.data_fim = dataFim;

      const response = await api.get("/relatorios/inscricoes.pdf", {
        params,
        responseType: "blob",
      });

      // Abre o PDF em uma nova aba (visualizador do navegador)
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Revoga a URL apos um tempo — a aba ja carregou o conteudo
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);

      setSnackbar({
        open: true,
        message: "Relatório gerado e baixado com sucesso!",
        severity: "success",
      });
    } catch (err) {
      // Se deu erro, o response pode ser um blob contendo JSON de erro
      let msg = "Erro ao gerar relatório";
      if (err.response?.data instanceof Blob) {
        try {
          const texto = await err.response.data.text();
          const parsed = JSON.parse(texto);
          msg = parsed.error || msg;
        } catch {
          // mantem msg padrao
        }
      } else if (err.response?.data?.error) {
        msg = err.response.data.error;
      }
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setBaixando(false);
    }
  }

  function limparFiltros() {
    setDataInicio("");
    setDataFim("");
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
      <Box className="flex items-center gap-2 mb-4">
        <PictureAsPdfIcon color="primary" sx={{ fontSize: 36 }} />
        <Typography variant="h4" color="primary" fontWeight="bold">
          Relatório de Inscrições
        </Typography>
      </Box>

      {/* Card explicativo */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            📋 O que contém o relatório?
          </Typography>
          <Stack spacing={1.2} sx={{ mb: 2 }}>
            <Typography variant="body2">
              🔵 <strong>Cabeçalho institucional</strong> com a identidade visual da FBVA
            </Typography>
            <Typography variant="body2">
              📊 <strong>Resumo executivo</strong> com total de aulas, inscrições, alunos únicos e taxa de ocupação
            </Typography>
            <Typography variant="body2">
              📝 <strong>Detalhamento por aula</strong> — título, professor, data/hora, ocupação e lista completa de inscritos
            </Typography>
            <Typography variant="body2">
              📄 <strong>Rodapé com paginação</strong> em todas as páginas
            </Typography>
          </Stack>
          <Alert severity="info" sx={{ mt: 2 }}>
            Você pode filtrar por período para gerar relatórios específicos.
            Deixe os campos em branco para incluir <strong>todas</strong> as aulas.
          </Alert>
        </CardContent>
      </Card>

      {/* Formulario de filtros */}
      <Card elevation={1} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            🔍 Filtros (opcionais)
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Data inicial"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
                helperText="Apenas aulas a partir desta data"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Data final"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
                helperText="Apenas aulas até esta data"
              />
            </Grid>
          </Grid>
          {(dataInicio || dataFim) && (
            <Button
              size="small"
              onClick={limparFiltros}
              sx={{ mt: 2 }}
            >
              Limpar filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Botao de gerar */}
      <Box className="flex justify-center mt-6">
        <Button
          variant="contained"
          size="large"
          startIcon={
            baixando
              ? <CircularProgress size={22} color="inherit" />
              : <DownloadIcon />
          }
          onClick={handleGerar}
          disabled={baixando}
          sx={{
            px: 6, py: 2,
            fontSize: "1.1rem",
            fontWeight: "bold",
            boxShadow: 4,
          }}
        >
          {baixando ? "Gerando..." : "Gerar e baixar relatório"}
        </Button>
      </Box>

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
    </Container>
  );
}

