"""Model Voluntario — inscrições de voluntários no programa."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum

from extensions import db


class Voluntario(db.Model):
    __tablename__ = "voluntarios"

    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    mensagem = Column(Text, nullable=True)
    status = Column(
        Enum("pendente", "aprovado", "recusado", name="status_voluntario_enum"),
        nullable=False, default="pendente",
    )
    inscrito_em = Column(DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Voluntario {self.id} {self.nome} ({self.status})>"
