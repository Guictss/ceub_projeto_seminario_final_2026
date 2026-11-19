"""Schemas Marshmallow para Voluntário."""
from marshmallow import Schema, fields, validate


class VoluntarioRequestSchema(Schema):
    """Valida o cadastro público de um novo voluntário."""
    nome = fields.String(
        required=True,
        validate=validate.Length(min=3, max=100,
                                 error="Nome deve ter entre 3 e 100 caracteres"),
    )
    email = fields.Email(
        required=True,
        error_messages={"invalid": "E-mail inválido"},
    )
    mensagem = fields.String(
        required=True,
        validate=validate.Length(min=20, max=1000,
                                 error="Mensagem deve ter entre 20 e 1000 caracteres"),
    )


class StatusUpdateSchema(Schema):
    """Valida a atualização de status do voluntário."""
    status = fields.String(
        required=True,
        validate=validate.OneOf(["pendente", "aprovado", "recusado"],
                                error="Status inválido"),
    )


class VoluntarioResponseSchema(Schema):
    """Serializa um Voluntário para resposta JSON."""
    id = fields.Integer()
    nome = fields.String()
    email = fields.String()
    mensagem = fields.String()
    status = fields.String()
    inscrito_em = fields.DateTime(format="iso")
