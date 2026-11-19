import { Container, Typography } from "@mui/material";

export default function Aulas() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
        Aulas
      </Typography>
      <Typography color="text.secondary">
        Pagina em construcao - proximo encontro.
      </Typography>
    </Container>
  );
}
