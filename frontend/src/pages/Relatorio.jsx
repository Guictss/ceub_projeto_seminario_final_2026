import { Button, Container } from "react-bootstrap";

export default function Relatorio() {
  return (
    <Container className="py-4">
      <h2 className="text-primary mb-4">Relatório de Inscrições</h2>
      <p className="text-muted">Página em construção — próximo encontro.</p>
      <Button variant="primary" disabled>
        📄 Baixar PDF (em breve)
      </Button>
    </Container>
  );
}
