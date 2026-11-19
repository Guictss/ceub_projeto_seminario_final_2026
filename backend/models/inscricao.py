"""Model Inscricao — tabela de junção entre alunos e aulas."""
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from extensions import db


class Inscricao(db.Model):
    __tablename__ = "inscricoes"
    __table_args__ = (
        UniqueConstraint("aluno_id", "aula_id", name="uq_aluno_aula"),
    )

    id = Column(Integer, primary_key=True)
    aluno_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    aula_id = Column(Integer, ForeignKey("aulas.id"), nullable=False, index=True)
    inscrito_em = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relacionamentos
    aluno = relationship("Usuario", back_populates="inscricoes")
    aula = relationship("Aula", back_populates="inscricoes")

    def __repr__(self) -> str:
        return f"<Inscricao {self.id} aluno={self.aluno_id} aula={self.aula_id}>"
