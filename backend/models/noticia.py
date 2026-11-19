"""Model Noticia — publicações institucionais na landing page."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime

from extensions import db


class Noticia(db.Model):
    __tablename__ = "noticias"

    id = Column(Integer, primary_key=True)
    titulo = Column(String(200), nullable=False)
    conteudo = Column(Text, nullable=False)
    imagem = Column(String(255), nullable=True)
    publicado_em = Column(DateTime, nullable=False, default=datetime.utcnow)

    @property
    def resumo(self) -> str:
        """Primeiros 200 caracteres do conteúdo (sem HTML)."""
        import re
        texto = re.sub(r"<[^>]+>", "", self.conteudo)
        return (texto[:200] + "...") if len(texto) > 200 else texto

    def __repr__(self) -> str:
        return f"<Noticia {self.id} {self.titulo[:30]}>"
