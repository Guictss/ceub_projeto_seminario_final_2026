"""Schemas Marshmallow para Notícia."""
from marshmallow import Schema, fields, validate


class NoticiaRequestSchema(Schema):
    """Valida a criação/atualização de uma notícia."""
    titulo = fields.String(
        required=True,
        validate=validate.Length(min=5, max=200,
                                 error="Título deve ter entre 5 e 200 caracteres"),
    )
    conteudo = fields.String(
        required=True,
        validate=validate.Length(min=20,
                                 error="Conteúdo deve ter no mínimo 20 caracteres"),
    )
    imagem = fields.String(
        allow_none=True,
        validate=validate.Length(max=255,
                                 error="Caminho da imagem muito longo"),
    )


class NoticiaListSchema(Schema):
    """Resposta usada em listagens (só resumo)."""
    id = fields.Integer()
    titulo = fields.String()
    resumo = fields.String()
    imagem = fields.String()
    publicado_em = fields.DateTime(format="iso")


class NoticiaDetailSchema(Schema):
    """Resposta usada em detalhes (conteúdo completo)."""
    id = fields.Integer()
    titulo = fields.String()
    conteudo = fields.String()
    imagem = fields.String()
    publicado_em = fields.DateTime(format="iso")
