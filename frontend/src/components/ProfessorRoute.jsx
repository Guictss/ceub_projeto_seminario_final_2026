import { Alert, AlertTitle, Button, Container } from "@mui/material";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProfessorRoute({ children }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.papel !== "professor") {
    return (
      <Container maxWidth="sm" className="py-10">
        <Alert severity="warning">
          <AlertTitle>🚫 Acesso restrito</AlertTitle>
          <p className="mb-4">
            Esta página é exclusiva para professores da FBVA. Seu papel atual é{" "}
            <strong>{usuario.papel}</strong>.
          </p>
          <Button component={Link} to="/dashboard" variant="outlined" color="warning">
            Voltar ao Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  return children;
}