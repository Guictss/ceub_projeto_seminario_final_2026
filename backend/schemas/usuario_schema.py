"""Schemas Marshmallow para validação de dados de Usuário."""
from datetime import date
from marshmallow import Schema, fields, validate, validates, ValidationError
from dateutil.relativedelta import relativedelta


class RegisterSchema(Schema):
    """Valida dados de cadastro de novo usuário."""
    nome = fields.String(
        required=True,
        validate=validate.Length(min=3, max=100, error="Nome deve ter entre 3 e 100 caracteres"),
    )
    email = fields.Email(
        required=True,
        error_messages={"invalid": "E-mail inválido"},
    )
    senha = fields.String(
        required=True,
        validate=validate.Length(min=8, error="Senha deve ter no mínimo 8 caracteres"),
        load_only=True,
    )
    data_nascimento = fields.Date(
        required=True,
        error_messages={"invalid": "Data inválida (use formato YYYY-MM-DD)"},
    )
    papel = fields.String(
        required=True,
        validate=validate.OneOf(["aluno", "professor"],
                                error="Papel deve ser aluno ou professor"),
    )

    @validates("data_nascimento")
    def valida_idade(self, value, **kwargs):
        """Valida idade mínima de 14 anos e data não futura."""
        hoje = date.today()
        if value > hoje:
            raise ValidationError("Data de nascimento não pode ser no futuro")
        idade = relativedelta(hoje, value).years
        if idade < 14:
            raise ValidationError("Idade mínima para cadastro é 14 anos")

    @validates("senha")
    def valida_senha(self, value, **kwargs):
        """Senha precisa ter ao menos 1 letra e 1 número."""
        if not any(c.isalpha() for c in value):
            raise ValidationError("Senha deve conter pelo menos uma letra")
        if not any(c.isdigit() for c in value):
            raise ValidationError("Senha deve conter pelo menos um número")


class LoginSchema(Schema):
    """Valida dados de login."""
    email = fields.Email(required=True, error_messages={"invalid": "E-mail inválido"})
    senha = fields.String(required=True)


class UsuarioResponseSchema(Schema):
    """Serializa um Usuario para resposta JSON (sem senha_hash)."""
    id = fields.Integer()
    nome = fields.String()
    email = fields.String()
    papel = fields.String()
    data_nascimento = fields.Date()
    criado_em = fields.DateTime(format="iso")

class UsuarioUpdateSchema(Schema):
    nome = fields.String(
        validate=validate.Length(min=3, max=100, error="Nome deve ter entre 3 e 100 caracteres"),
    )
    email = fields.Email(
        error_messages={"invalid": "E-mail inválido"},
    )
    data_nascimento = fields.Date(
        error_messages={"invalid": "Data inválida (use formato YYYY-MM-DD)"},
    )
    papel = fields.String(
        validate=validate.OneOf(["aluno", "professor"],
                                error="Papel deve ser aluno ou professor"),
    )

    @validates("data_nascimento")
    def valida_idade(self, value, **kwargs):
        """Valida idade mínima de 14 anos e data não futura."""
        hoje = date.today()
        if value > hoje:
            raise ValidationError("Data de nascimento não pode ser no futuro")
        idade = relativedelta(hoje, value).years
        if idade < 14:
            raise ValidationError("Idade mínima é 14 anos")