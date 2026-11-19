"""Schemas Marshmallow para Inscricao."""
from marshmallow import Schema, fields, validate


class InscricaoRequestSchema(Schema):
    """Valida a criação de uma inscrição."""
    aula_id = fields.Integer(
        required=True,
        validate=validate.Range(min=1, error="aula_id inválido"),
    )


class AulaMiniSchema(Schema):
    """Mini-schema de aula para aninhar em respostas de inscrição."""
    id = fields.Integer()
    data = fields.Date()
    horario = fields.Method("fmt_horario")
    duracao_min = fields.Integer()
    professor_nome = fields.Method("get_professor_nome")

    def fmt_horario(self, obj):
        return obj.horario.strftime("%H:%M")

    def get_professor_nome(self, obj):
        return obj.professor.nome if obj.professor else None


class AlunoMiniSchema(Schema):
    """Mini-schema de aluno para listar inscritos."""
    id = fields.Integer()
    nome = fields.String()
    email = fields.String()


class InscricaoResponseSchema(Schema):
    """Resposta de inscrição do ponto de vista do aluno."""
    id = fields.Integer()
    inscrito_em = fields.DateTime(format="iso")
    aula = fields.Nested(AulaMiniSchema)


class InscricaoCreatedSchema(Schema):
    """Resposta direta logo após criar uma inscrição."""
    id = fields.Integer()
    aluno_id = fields.Integer()
    aula_id = fields.Integer()
    inscrito_em = fields.DateTime(format="iso")


class InscritoAulaSchema(Schema):
    """Resposta usada pelo professor ao listar quem se inscreveu em sua aula."""
    id = fields.Integer()
    inscrito_em = fields.DateTime(format="iso")
    aluno = fields.Nested(AlunoMiniSchema)
