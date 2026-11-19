"""Blueprint de autenticação — /api/v1/auth/*"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from marshmallow import ValidationError

from extensions import db, limiter
from models import Usuario
from schemas.usuario_schema import (
    RegisterSchema, LoginSchema, UsuarioResponseSchema
)

auth_bp = Blueprint("auth", __name__)

# Blocklist em memória para tokens invalidados (no logout).
# Em produção, migrar para Redis.
_blocklist = set()


# ── Blocklist checker (consultado automaticamente pelo Flask-JWT-Extended) ──
def check_if_token_revoked(jwt_header, jwt_payload):
    return jwt_payload["jti"] in _blocklist


# ── Helper: resposta padronizada de erro de validação ──────────────────────
def _validation_error(errors):
    return jsonify({
        "error": "Dados inválidos",
        "code": "VALIDATION_ERROR",
        "details": errors,
    }), 400


# ── POST /auth/register ────────────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
@limiter.limit("3 per minute")
def register():
    try:
        data = RegisterSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _validation_error(err.messages)

    # Verifica se o e-mail já existe
    if Usuario.query.filter_by(email=data["email"]).first():
        return jsonify({
            "error": "Este e-mail já está cadastrado",
            "code": "EMAIL_ALREADY_EXISTS",
        }), 409

    # Cria usuário
    usuario = Usuario(
        nome=data["nome"],
        email=data["email"],
        data_nascimento=data["data_nascimento"],
        papel=data["papel"],
    )
    usuario.set_senha(data["senha"])

    db.session.add(usuario)
    db.session.commit()

    return jsonify({
        "message": "Cadastro realizado com sucesso",
        "usuario": UsuarioResponseSchema().dump(usuario),
    }), 201


# ── POST /auth/login ───────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    try:
        data = LoginSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _validation_error(err.messages)

    usuario = Usuario.query.filter_by(email=data["email"]).first()
    if not usuario or not usuario.check_senha(data["senha"]):
        return jsonify({
            "error": "E-mail ou senha incorretos",
            "code": "INVALID_CREDENTIALS",
        }), 401

    # Claims adicionais vão no payload do JWT
    additional = {"nome": usuario.nome, "papel": usuario.papel}
    access = create_access_token(identity=str(usuario.id), additional_claims=additional)
    refresh = create_refresh_token(identity=str(usuario.id), additional_claims=additional)

    return jsonify({
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "Bearer",
        "expires_in": int(current_app.config["JWT_ACCESS_TOKEN_EXPIRES"].total_seconds()),
        "usuario": UsuarioResponseSchema().dump(usuario),
    }), 200


# ── POST /auth/refresh ─────────────────────────────────────────────────────
@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    usuario = Usuario.query.get(int(user_id))
    if not usuario:
        return jsonify({"error": "Usuário não encontrado", "code": "TOKEN_INVALID"}), 401

    additional = {"nome": usuario.nome, "papel": usuario.papel}
    new_access = create_access_token(identity=str(usuario.id), additional_claims=additional)

    return jsonify({
        "access_token": new_access,
        "token_type": "Bearer",
        "expires_in": int(current_app.config["JWT_ACCESS_TOKEN_EXPIRES"].total_seconds()),
    }), 200


# ── POST /auth/logout ──────────────────────────────────────────────────────
@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    _blocklist.add(jti)
    return jsonify({"message": "Logout realizado com sucesso"}), 200


# ── GET /auth/me ───────────────────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    usuario = Usuario.query.get(user_id)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado", "code": "RESOURCE_NOT_FOUND"}), 404
    return jsonify(UsuarioResponseSchema().dump(usuario)), 200
