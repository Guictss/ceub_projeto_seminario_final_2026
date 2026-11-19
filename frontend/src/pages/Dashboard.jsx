import {
  Box, Button, Card, CardContent, Chip, Container,
  Divider, Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { usuario, logout } = useAuth();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
            🌊 Dashboard
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Olá, <strong>{usuario.nome}</strong>! 👋
          </Typography>

          <Box className="flex flex-col gap-2 mb-6">
            <Typography>
              <strong>E-mail:</strong>{" "}
              <code className="bg-slate-100 px-2 py-1 rounded text-sm">
                {usuario.email}
              </code>
            </Typography>
            <Typography component="div">
              <strong>Papel:</strong>{" "}
              <Chip
                label={usuario.papel}
                color={usuario.papel === "professor" ? "primary" : "info"}
                size="small"
              />
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={logout}
          >
            Sair
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
