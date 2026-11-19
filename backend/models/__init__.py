"""Pacote de models SQLAlchemy — Projeto Vela Para Todos."""
from extensions import db

from .usuario import Usuario
from .aula import Aula
from .inscricao import Inscricao
from .noticia import Noticia
from .doacao import Doacao
from .voluntario import Voluntario

__all__ = [
    "db",
    "Usuario",
    "Aula",
    "Inscricao",
    "Noticia",
    "Doacao",
    "Voluntario",
]
