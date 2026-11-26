"""Model Aula — sessões de vela adaptada ministradas por professores."""
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Time
from sqlalchemy.orm import relationship

from extensions import db


class Aula(db.Model):
    __tablename__ = "aulas"

    id = Column(Integer, primary_key=True)
    professor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    data = Column(Date, nullable=False, index=True)
    horario = Column(Time, nullable=False)
    duracao_min = Column(Integer, nullable=False)
    vagas = Column(Integer, nullable=False)
    descricao = Column(String(255), nullable=True)
    criado_em = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relacionamentos
    professor = relationship("Usuario", back_populates="aulas_ministradas")
    inscricoes = relationship(
        "Inscricao", back_populates="aula", cascade="all, delete-orphan"
    )

    # ── Helpers ────────────────────────────────────────────────────
    @property
    def inscritos_count(self) -> int:
        return len(self.inscricoes)

    @property
    def vagas_disponiveis(self) -> int:
        return max(0, self.vagas - self.inscritos_count)

    @property
    def tem_vagas(self) -> bool:
        return self.vagas_disponiveis > 0

    def __repr__(self) -> str:
        return f"<Aula {self.id} {self.data} {self.horario}>"
