/**
 * Envolve rotas que exigem login. Se não houver usuário:
 *   - enquanto ainda carrega -> mostra spinner
 *   - se não autenticado -> redireciona para /login (lembrando de onde veio)
 */
import { Navigate, useLocation } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
