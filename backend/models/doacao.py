"""Model Doacao — contribuições financeiras recebidas pelo projeto."""
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Integer, Numeric, String

from extensions import db


class Doacao(db.Model):
    __tablename__ = "doacoes"

    id = Column(Integer, primary_key=True)
    nome_doador = Column(String(100), nullable=False)
    valor = Column(Numeric(10, 2), nullable=False)
    forma_pagamento = Column(
        Enum("pix", "transferencia", "paypal", name="forma_pagamento_enum"),
        nullable=False,
    )
    doado_em = Column(DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Doacao {self.id} R$ {self.valor} ({self.forma_pagamento})>"
