"""Blueprint de autenticação — /api/v1/auth/*"""
from datetime import timedelta

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)
from marshmallow import ValidationError

from extensions import db, limiter
from models import Usuario
from schemas.usuario_schema import (
    EsqueciSenhaSchema,
    LoginSchema,
    RedefinirSenhaSchema,
    RegisterSchema,
    UsuarioResponseSchema,
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
    usuario = db.session.get(Usuario, int(user_id))
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
    usuario = db.session.get(Usuario, int(user_id))
    if not usuario:
        return jsonify({"error": "Usuário não encontrado", "code": "RESOURCE_NOT_FOUND"}), 404
    return jsonify(UsuarioResponseSchema().dump(usuario)), 200


# ── POST /auth/esqueci-senha ───────────────────────────────────────────────
@auth_bp.route("/esqueci-senha", methods=["POST"])
@limiter.limit("3 per minute")
def esqueci_senha():
    """Gera um token de reset de senha válido por 1h.

    Sempre retorna 200 com mensagem genérica para evitar enumeração de usuários
    (não revela se o e-mail existe no sistema). Em desenvolvimento, imprime o
    token no log do backend para permitir o teste. Em produção, deve enviar
    por e-mail.
    """
    try:
        data = EsqueciSenhaSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _validation_error(err.messages)

    email = data["email"].lower().strip()
    usuario = Usuario.query.filter_by(email=email).first()

    if usuario:
        # Gera token JWT com claim 'type' distinto pra não ser confundido com access token
        reset_token = create_access_token(
            identity=str(usuario.id),
            additional_claims={"type": "password_reset"},
            expires_delta=timedelta(hours=1),
        )

        # LOG DE DESENVOLVIMENTO — em produção, substituir por envio de e-mail
        current_app.logger.info(
            f"\n{'=' * 70}\n"
            f"RESET DE SENHA SOLICITADO\n"
            f"  E-mail: {email}\n"
            f"  Usuário: {usuario.nome} (id={usuario.id})\n"
            f"  Link de reset (válido por 1h):\n"
            f"    http://localhost:5173/redefinir-senha?token={reset_token}\n"
            f"{'=' * 70}\n"
        )

    # Resposta GENÉRICA — não revela se o e-mail existe
    return jsonify({
        "message": "Se o e-mail estiver cadastrado, enviaremos instruções "
                   "de redefinição de senha em instantes."
    }), 200


# ── POST /auth/redefinir-senha ─────────────────────────────────────────────
@auth_bp.route("/redefinir-senha", methods=["POST"])
@limiter.limit("5 per minute")
def redefinir_senha():
    """Redefine a senha usando o token gerado em /esqueci-senha."""
    try:
        data = RedefinirSenhaSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _validation_error(err.messages)

    # Tenta decodificar o token
    try:
        payload = decode_token(data["token"])
    except Exception:
        return jsonify({
            "error": "Token inválido ou expirado. Solicite um novo link de redefinição.",
            "code": "TOKEN_INVALID",
        }), 400

    # Garante que é um token do tipo password_reset (não um access token roubado)
    if payload.get("type") != "password_reset":
        return jsonify({
            "error": "Token inválido para redefinição de senha.",
            "code": "TOKEN_WRONG_TYPE",
        }), 400

    user_id = payload.get("sub")
    if not user_id:
        return jsonify({
            "error": "Token malformado.",
            "code": "TOKEN_MALFORMED",
        }), 400

    usuario = db.session.get(Usuario, int(user_id))
    if not usuario:
        return jsonify({
            "error": "Usuário não encontrado.",
            "code": "USER_NOT_FOUND",
        }), 404

    # Atualiza a senha
    usuario.set_senha(data["nova_senha"])
    db.session.commit()

    current_app.logger.info(
        f"Senha redefinida com sucesso para {usuario.email} (id={usuario.id})"
    )

    return jsonify({
        "message": "Senha redefinida com sucesso. Faça login com a nova senha.",
    }), 200
