"""Blueprint de administração de usuários — /api/v1/usuarios/*

Regras de autorização:
 - GET /usuarios              → Professor (lista com filtros)
 - GET /usuarios/<id>         → Próprio ou professor
 - PUT /usuarios/<id>         → Próprio ou professor
   · Apenas professor pode alterar `papel`
 - DELETE /usuarios/<id>      → Professor, não pode excluir a si mesmo

Alteração de senha é fora deste escopo (precisa endpoint próprio futuramente
em /auth/password, que valida a senha atual antes de trocar).
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError
from sqlalchemy import or_

from extensions import db
from models import Usuario
from schemas.usuario_schema import UsuarioResponseSchema, UsuarioUpdateSchema
from utils.decorators import professor_required

usuarios_bp = Blueprint("usuarios", __name__)


# ── Helpers de resposta ────────────────────────────────────────────────────
def _validation_error(errors):
    return jsonify({
        "error": "Dados inválidos",
        "code": "VALIDATION_ERROR",
        "details": errors,
    }), 400


def _not_found():
    return jsonify({
        "error": "Usuário não encontrado",
        "code": "USER_NOT_FOUND",
    }), 404


def _forbidden(mensagem="Você não tem permissão para esta operação"):
    return jsonify({
        "error": mensagem,
        "code": "FORBIDDEN",
    }), 403


# ── GET /usuarios — lista (professor) ──────────────────────────────────────
@usuarios_bp.route("", methods=["GET"])
@jwt_required()
@professor_required
def listar_usuarios():
    """Lista usuários com filtros opcionais por papel e busca textual."""
    papel = (request.args.get("papel") or "").strip().lower()
    q = (request.args.get("q") or "").strip()

    try:
        page = max(int(request.args.get("page", 1)), 1)
        per_page = min(max(int(request.args.get("per_page", 20)), 1), 100)
    except ValueError:
        page, per_page = 1, 20

    query = Usuario.query

    if papel in ("aluno", "professor"):
        query = query.filter(Usuario.papel == papel)

    if q:
        query = query.filter(or_(
            Usuario.nome.ilike(f"%{q}%"),
            Usuario.email.ilike(f"%{q}%"),
        ))

    query = query.order_by(Usuario.nome.asc())
    pag = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "items": UsuarioResponseSchema(many=True).dump(pag.items),
        "page": pag.page,
        "per_page": pag.per_page,
        "total": pag.total,
        "pages": pag.pages,
    }), 200


# ── GET /usuarios/<id> — detalhes (próprio ou professor) ───────────────────
@usuarios_bp.route("/<int:usuario_id>", methods=["GET"])
@jwt_required()
def detalhar_usuario(usuario_id):
    user_id_atual = int(get_jwt_identity())
    usuario_atual = Usuario.query.get(user_id_atual)

    if not usuario_atual:
        return _forbidden("Token inválido")

    # Aluno só vê o próprio perfil; professor vê qualquer um
    if usuario_atual.papel != "professor" and user_id_atual != usuario_id:
        return _forbidden()

    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return _not_found()

    return jsonify(UsuarioResponseSchema().dump(usuario)), 200


# ── PUT /usuarios/<id> — editar (próprio ou professor) ─────────────────────
@usuarios_bp.route("/<int:usuario_id>", methods=["PUT"])
@jwt_required()
def editar_usuario(usuario_id):
    user_id_atual = int(get_jwt_identity())
    usuario_atual = Usuario.query.get(user_id_atual)

    if not usuario_atual:
        return _forbidden("Token inválido")

    eh_professor = usuario_atual.papel == "professor"
    eh_proprio = user_id_atual == usuario_id

    if not eh_professor and not eh_proprio:
        return _forbidden()

    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return _not_found()

    try:
        data = UsuarioUpdateSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _validation_error(err.messages)

    if not data:
        return jsonify({
            "error": "Envie ao menos um campo para atualizar",
            "code": "EMPTY_PAYLOAD",
        }), 400

    # Aluno NÃO pode alterar o próprio papel
    if not eh_professor and "papel" in data:
        return _forbidden("Apenas professores podem alterar o papel")

    # Verifica duplicação de e-mail
    if "email" in data and data["email"].lower() != usuario.email.lower():
        existente = Usuario.query.filter_by(email=data["email"]).first()
        if existente and existente.id != usuario.id:
            return jsonify({
                "error": "Este e-mail já está cadastrado",
                "code": "EMAIL_ALREADY_EXISTS",
            }), 409

    # Aplica mudanças (apenas campos enviados)
    for campo in ("nome", "email", "data_nascimento", "papel"):
        if campo in data:
            setattr(usuario, campo, data[campo])

    db.session.commit()

    return jsonify({
        "message": "Usuário atualizado com sucesso",
        "usuario": UsuarioResponseSchema().dump(usuario),
    }), 200


# ── DELETE /usuarios/<id> — excluir (professor, não próprio) ───────────────
@usuarios_bp.route("/<int:usuario_id>", methods=["DELETE"])
@jwt_required()
@professor_required
def excluir_usuario(usuario_id):
    user_id_atual = int(get_jwt_identity())

    # Professor não pode se auto-excluir (previne travamento do sistema)
    if user_id_atual == usuario_id:
        return jsonify({
            "error": "Você não pode excluir sua própria conta",
            "code": "CANNOT_DELETE_SELF",
        }), 400

    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return _not_found()

    db.session.delete(usuario)
    db.session.commit()

    return jsonify({
        "message": "Usuário excluído com sucesso",
    }), 200
