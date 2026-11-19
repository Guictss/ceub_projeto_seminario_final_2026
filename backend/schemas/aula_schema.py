"""Schemas Marshmallow para Aula."""
from datetime import date
from marshmallow import Schema, fields, validate, validates, ValidationError


class AulaRequestSchema(Schema):
    """Valida dados de criação/atualização de aula."""
    data = fields.Date(
        required=True,
        error_messages={"invalid": "Data inválida (use formato YYYY-MM-DD)"},
    )
    horario = fields.Time(
        required=True,
        error_messages={"invalid": "Horário inválido (use formato HH:MM)"},
    )
    duracao_min = fields.Integer(
        required=True,
        validate=validate.Range(min=15, max=480,
                                error="Duração deve estar entre 15 e 480 minutos"),
    )
    vagas = fields.Integer(
        required=True,
        validate=validate.Range(min=1, max=50,
                                error="Vagas deve estar entre 1 e 50"),
    )
    descricao = fields.String(
        allow_none=True,
        validate=validate.Length(max=255,
                                 error="Descrição pode ter no máximo 255 caracteres"),
    )

    @validates("data")
    def valida_data_futura(self, value, **kwargs):
        if value < date.today():
            raise ValidationError("Data da aula não pode ser no passado")


class ProfessorMiniSchema(Schema):
    """Mini-schema do professor para aninhar em respostas de aula."""
    id = fields.Integer()
    nome = fields.String()


class AulaResponseSchema(Schema):
    """Serializa uma Aula para resposta JSON."""
    id = fields.Integer()
    data = fields.Date()
    horario = fields.Method("fmt_horario")
    duracao_min = fields.Integer()
    vagas_total = fields.Integer(attribute="vagas")
    vagas_disponiveis = fields.Integer()
    descricao = fields.String()
    professor = fields.Nested(ProfessorMiniSchema)
    criado_em = fields.DateTime(format="iso")

    def fmt_horario(self, obj):
        return obj.horario.strftime("%H:%M")


class AulaDetalheSchema(AulaResponseSchema):
    """Igual à response, mas com inscritos_count (para GET /aulas/<id>)."""
    inscritos_count = fields.Integer()
