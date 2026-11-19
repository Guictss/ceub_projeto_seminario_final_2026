import { Button, Card, Container } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { usuario, logout } = useAuth();

  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h2 className="text-primary mb-3">🌊 Dashboard</h2>
          <hr />

          <p className="lead">
            Olá, <strong>{usuario.nome}</strong>! 👋
          </p>

          <ul className="list-unstyled">
            <li>
              <strong>E-mail:</strong> <code>{usuario.email}</code>
            </li>
            <li>
              <strong>Papel:</strong>{" "}
              <span className={`badge bg-${usuario.papel === "professor" ? "primary" : "info"}`}>
                {usuario.papel}
              </span>
            </li>
          </ul>

          <hr />
          <Button variant="outline-danger" onClick={logout}>
            Sair
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}
