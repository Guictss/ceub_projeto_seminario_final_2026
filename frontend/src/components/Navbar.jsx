import { Badge, Container, Dropdown, Nav, Navbar as BsNavbar } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const ehProfessor = usuario?.papel === "professor";

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <BsNavbar bg="primary" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        {/* Marca */}
        <BsNavbar.Brand as={Link} to="/" className="fw-bold">
          🌊 Vela Para Todos
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="main-navbar" />

        <BsNavbar.Collapse id="main-navbar">
          {/* Links à esquerda */}
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Dashboard
            </Nav.Link>
            <Nav.Link as={NavLink} to="/aulas">
              Aulas
            </Nav.Link>
            <Nav.Link as={NavLink} to="/noticias">
              Notícias
            </Nav.Link>

            {ehProfessor && (
              <>
                <Nav.Link as={NavLink} to="/doacoes">
                  Doações
                </Nav.Link>
                <Nav.Link as={NavLink} to="/voluntarios">
                  Voluntários
                </Nav.Link>
                <Nav.Link as={NavLink} to="/relatorio">
                  Relatório
                </Nav.Link>
              </>
            )}
          </Nav>

          {/* Menu do usuário à direita */}
          <Nav>
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" id="user-menu" size="sm">
                <span className="me-2">{usuario?.nome}</span>
                <Badge bg={ehProfessor ? "warning" : "info"} text="dark">
                  {usuario?.papel}
                </Badge>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Header>{usuario?.email}</Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  🚪 Sair
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}
