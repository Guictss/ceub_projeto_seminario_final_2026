import { Alert, Button, Container } from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProfessorRoute({ children }) {
  const { usuario } = useAuth();

  // Se nem logado está, PrivateRoute já cuidou — mas dupla segurança
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.papel !== "professor") {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>🚫 Acesso restrito</Alert.Heading>
          <p className="mb-3">
            Esta página é exclusiva para professores da FBVA. Seu papel atual
            é <strong>{usuario.papel}</strong>.
          </p>
          <Button as={Link} to="/" variant="outline-warning">
            Voltar ao Dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  return children;
}
