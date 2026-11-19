"""Schemas Marshmallow para Doação."""
from decimal import Decimal
from marshmallow import Schema, fields, validate


class DoacaoRequestSchema(Schema):
    """Valida o registro de uma nova doação."""
    nome_doador = fields.String(
        required=True,
        validate=validate.Length(min=3, max=100,
                                 error="Nome deve ter entre 3 e 100 caracteres"),
    )
    valor = fields.Decimal(
        required=True,
        as_string=False,
        places=2,
        validate=validate.Range(min=Decimal("0.01"), max=Decimal("999999.99"),
                                error="Valor deve ser entre 0.01 e 999999.99"),
    )
    forma_pagamento = fields.String(
        required=True,
        validate=validate.OneOf(["pix", "transferencia", "paypal"],
                                error="Forma de pagamento inválida"),
    )


class DoacaoResponseSchema(Schema):
    """Serializa uma Doação para resposta JSON."""
    id = fields.Integer()
    nome_doador = fields.String()
    valor = fields.Decimal(as_string=False, places=2)
    forma_pagamento = fields.String()
    doado_em = fields.DateTime(format="iso")
