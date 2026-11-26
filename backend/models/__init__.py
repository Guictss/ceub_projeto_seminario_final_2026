"""Pacote de models SQLAlchemy — Projeto Vela Para Todos."""
from extensions import db

from .aula import Aula
from .doacao import Doacao
from .inscricao import Inscricao
from .noticia import Noticia
from .usuario import Usuario
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
