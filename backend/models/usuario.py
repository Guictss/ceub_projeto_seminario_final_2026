"""Model Usuario — alunos e professores do sistema."""
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Enum, Integer, String
from sqlalchemy.orm import relationship
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True, index=True)
    senha_hash = Column(String(255), nullable=False)
    data_nascimento = Column(Date, nullable=False)
    papel = Column(Enum("aluno", "professor", name="papel_enum"),
                   nullable=False, default="aluno")
    criado_em = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relacionamentos
    aulas_ministradas = relationship(
        "Aula", back_populates="professor", cascade="all, delete-orphan"
    )
    inscricoes = relationship(
        "Inscricao", back_populates="aluno", cascade="all, delete-orphan"
    )

    # ── Métodos de senha ──────────────────────────────────────────
    def set_senha(self, senha: str) -> None:
        """Gera hash seguro da senha (PBKDF2-SHA256)."""
        self.senha_hash = generate_password_hash(senha)

    def check_senha(self, senha: str) -> bool:
        """Verifica se a senha informada bate com o hash armazenado."""
        return check_password_hash(self.senha_hash, senha)

    # ── Helpers ────────────────────────────────────────────────────
    @property
    def is_professor(self) -> bool:
        return self.papel == "professor"

    @property
    def is_aluno(self) -> bool:
        return self.papel == "aluno"

    def __repr__(self) -> str:
        return f"<Usuario {self.id} {self.nome} ({self.papel})>"
