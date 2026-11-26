"""Blueprint de voluntários — /api/v1/voluntarios/*"""
from flask import Blueprint, jsonify, request
from marshmallow import ValidationError

from extensions import db, limiter
from models import Voluntario
from schemas.voluntario_schema import StatusUpdateSchema, VoluntarioRequestSchema, VoluntarioResponseSchema
from utils.decorators import professor_required
from utils.pagination import paginate

voluntarios_bp = Blueprint("voluntarios", __name__)


def _validation_error(errors):
    return jsonify({
        "error": "Dados inválidos",
        "code": "VALIDATION_ERROR",
        "details": errors,
    }), 400


def _not_found():
    return jsonify({
        "error": "Voluntário não encontrado",
        "code": "RESOURCE_NOT_FOUND",
    }), 404


# ── POST /voluntarios (público) ────────────────────────────────────────────
@voluntarios_bp.route("", methods=["POST"])
@limiter.limit("3 per minute")
def cadastrar():
    try:
        data = VoluntarioRequestSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _validation_error(err.messages)

    voluntario = Voluntario(
        nome=data["nome"],
        email=data["email"],
        mensagem=data["mensagem"],
        status="pendente",
    )
    db.session.add(voluntario)
    db.session.commit()

    return jsonify({
        "message": "Inscrição recebida! Entraremos em contato em breve.",
        "voluntario": VoluntarioResponseSchema().dump(voluntario),
    }), 201


# ── GET /voluntarios (professor) ───────────────────────────────────────────
@voluntarios_bp.route("", methods=["GET"])
@professor_required
def listar():
    query = Voluntario.query

    status = request.args.get("status")
    if status:
        query = query.filter(Voluntario.status == status)

    query = query.order_by(Voluntario.inscrito_em.desc())
    result = paginate(query, VoluntarioResponseSchema(), "voluntarios.listar")
    return jsonify(result), 200


# ── PATCH /voluntarios/<id>/status (professor) ─────────────────────────────
@voluntarios_bp.route("/<int:voluntario_id>/status", methods=["PATCH"])
@professor_required
def atualizar_status(voluntario_id: int):
    voluntario = db.session.get(Voluntario, voluntario_id)
    if not voluntario:
        return _not_found()

    try:
        data = StatusUpdateSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _validation_error(err.messages)

    voluntario.status = data["status"]
    db.session.commit()

    return jsonify(VoluntarioResponseSchema().dump(voluntario)), 200
