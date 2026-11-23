import { useEffect, useState } from "react";
import {
  Alert, Avatar, Box, Card, CardContent, Chip, CircularProgress,
  Container, Grid, Stack, Typography,
} from "@mui/material";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import ArticleIcon from "@mui/icons-material/Article";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import EventIcon from "@mui/icons-material/Event";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PaymentsIcon from "@mui/icons-material/Payments";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats")
      .then(({ data }) => setStats(data))
      .catch((err) => setErro(err.response?.data?.error || err.message || "Erro ao carregar dashboard"))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (erro) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{erro}</Alert>
      </Container>
    );
  }

  const ehProfessor = stats?.papel === "professor";

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary" fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Bem-vindo de volta, <strong>{stats?.nome || usuario?.nome}</strong>
        </Typography>
      </Box>

      {ehProfessor
        ? <DashboardProfessor stats={stats} />
        : <DashboardAluno stats={stats} />}
    </Container>
  );
}

/* ─── Dashboard do Professor ────────────────────────────────────────── */
function DashboardProfessor({ stats }) {
  const m = stats.metricas;

  const dadosOcupacao = stats.proximas_aulas.map((a) => ({
    nome: a.descricao.length > 18
      ? a.descricao.slice(0, 18) + "..."
      : a.descricao,
    Inscritos: a.inscritos,
    "Total de vagas": a.vagas_total,
  }));

  const CORES_PIZZA = ["#1D71B8", "#F9B233", "#19629E", "#1F7AC4"];
  const LABELS_FORMA = {
    pix: "Pix",
    transferencia: "Transferência",
    paypal: "PayPal",
  };
  const dadosPizza = stats.doacoes_por_forma.map((d) => ({
    ...d,
    nome: LABELS_FORMA[d.forma] || d.forma,
  }));

  return (
    <>
      {/* Cards de métricas */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <MetricCard
          icon={<SchoolIcon />}
          label="Minhas aulas"
          value={m.minhas_aulas}
          color="#1D71B8"
        />
        <MetricCard
          icon={<HowToRegIcon />}
          label="Inscrições recebidas"
          value={m.total_inscricoes}
          color="#1D71B8"
        />
        <MetricCard
          icon={<PeopleIcon />}
          label="Alunos únicos"
          value={m.alunos_unicos}
          color="#1D71B8"
        />
        <MetricCard
          icon={<VolunteerActivismIcon />}
          label="Voluntários pendentes"
          value={m.voluntarios_pendentes}
          color="#F9B233"
          destaque={m.voluntarios_pendentes > 0}
        />
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary"
                sx={{ mb: 2 }}
              >
                Ocupação das próximas aulas
              </Typography>
              {dadosOcupacao.length === 0 ? (
                <Alert severity="info">
                  Nenhuma aula futura cadastrada
                </Alert>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosOcupacao}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis dataKey="nome" fontSize={11} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #E0E0E0",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Inscritos" fill="#1D71B8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Total de vagas" fill="#F9B233" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <PaymentsIcon fontSize="small" />
                Doações do mês
              </Typography>

              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  R$ {Number(m.doacoes_mes_valor).toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  em {m.doacoes_mes_count} {m.doacoes_mes_count === 1 ? "doação" : "doações"}
                </Typography>
              </Box>

              {dadosPizza.length === 0 ? (
                <Alert severity="info">Sem doações este mês</Alert>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={dadosPizza}
                      dataKey="total"
                      nameKey="nome"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={(entry) => entry.nome}
                      fontSize={11}
                    >
                      {dadosPizza.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CORES_PIZZA[i % CORES_PIZZA.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => `R$ ${Number(v).toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista próximas aulas */}
      <Card elevation={2}>
        <CardContent>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="primary"
            sx={{ mb: 2 }}
          >
            Próximas aulas
          </Typography>
          {stats.proximas_aulas.length === 0 ? (
            <Alert severity="info">Nenhuma aula futura cadastrada</Alert>
          ) : (
            <Stack
              divider={<Box sx={{ borderBottom: "1px solid #E8F3FB" }} />}
            >
              {stats.proximas_aulas.map((a) => {
                const taxa = a.vagas_total > 0
                  ? a.inscritos / a.vagas_total
                  : 0;
                const corChip = a.vagas_disponiveis === 0
                  ? "error"
                  : taxa >= 0.8 ? "warning" : "success";
                return (
                  <Box
                    key={a.id}
                    sx={{
                      py: 1.5,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography fontWeight={500}>
                        {a.descricao}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(a.data).toLocaleDateString("pt-BR")}
                        {" às "}
                        {a.horario}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${a.inscritos}/${a.vagas_total} inscritos`}
                      size="small"
                      color={corChip}
                    />
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>
    </>
  );
}

/* ─── Dashboard do Aluno ────────────────────────────────────────────── */
function DashboardAluno({ stats }) {
  const m = stats.metricas;

  return (
    <>
      {/* Cards de métricas */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <MetricCard
          icon={<EventIcon />}
          label="Minhas inscrições"
          value={m.minhas_inscricoes}
          color="#1D71B8"
        />
        <MetricCard
          icon={<SchoolIcon />}
          label="Aulas com vagas"
          value={m.aulas_disponiveis}
          color="#1D71B8"
        />
        <MetricCard
          icon={<ArticleIcon />}
          label="Notícias disponíveis"
          value={m.total_noticias}
          color="#F9B233"
        />
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary"
                sx={{ mb: 2 }}
              >
                Minhas próximas aulas
              </Typography>
              {stats.proximas_aulas_inscritas.length === 0 ? (
                <Alert severity="info">
                  Você ainda não está inscrito em nenhuma aula futura
                </Alert>
              ) : (
                <Stack
                  divider={<Box sx={{ borderBottom: "1px solid #E8F3FB" }} />}
                >
                  {stats.proximas_aulas_inscritas.map((a) => (
                    <Box key={a.id} sx={{ py: 1.5 }}>
                      <Typography fontWeight={500}>
                        {a.descricao}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(a.data).toLocaleDateString("pt-BR")}
                        {" às "}
                        {a.horario}
                        {a.professor && ` · Professor ${a.professor}`}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={2} sx={{ height: "100%" }}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary"
                sx={{ mb: 2 }}
              >
                Notícias recentes
              </Typography>
              {stats.noticias_recentes.length === 0 ? (
                <Alert severity="info">Nenhuma notícia publicada ainda</Alert>
              ) : (
                <Stack
                  divider={<Box sx={{ borderBottom: "1px solid #E8F3FB" }} />}
                >
                  {stats.noticias_recentes.map((n) => (
                    <Box key={n.id} sx={{ py: 1.5 }}>
                      <Typography
                        fontWeight={500}
                        sx={{ fontSize: "0.95rem", lineHeight: 1.3 }}
                      >
                        {n.titulo}
                      </Typography>
                      {n.publicado_em && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {new Date(n.publicado_em).toLocaleDateString("pt-BR")}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

/* ─── Card de métrica reutilizável ──────────────────────────────────── */
function MetricCard({ icon, label, value, color, destaque }) {
  const corFinal = destaque ? "#F9B233" : color;
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Card
        elevation={2}
        sx={{
          height: "100%",
          borderLeft: `4px solid ${corFinal}`,
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 16px rgba(29, 113, 184, 0.15)",
          },
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", mb: 1.5 }}
          >
            <Avatar
              sx={{
                bgcolor: corFinal,
                color: destaque ? "#323232" : "white",
                width: 36,
                height: 36,
              }}
            >
              {icon}
            </Avatar>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
            >
              {label}
            </Typography>
          </Stack>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: corFinal }}
          >
            {value}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}
