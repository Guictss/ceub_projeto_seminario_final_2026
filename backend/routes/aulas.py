"""Blueprint de aulas — /api/v1/aulas/*"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy import and_

from extensions import db
from models import Aula, Usuario
from schemas.aula_schema import (
    AulaRequestSchema, AulaResponseSchema, AulaDetalheSchema
)
from utils.decorators import professor_required
from utils.pagination import paginate

aulas_bp = Blueprint("aulas", __name__)


def _validation_error(errors):
    return jsonify({
        "error": "Dados inválidos",
        "code": "VALIDATION_ERROR",
        "details": errors,
    }), 400


def _not_found():
    return jsonify({
        "error": "Aula não encontrada",
        "code": "RESOURCE_NOT_FOUND",
    }), 404


# ── GET /aulas ─────────────────────────────────────────────────────────────
@aulas_bp.route("", methods=["GET"])
@jwt_required()
def listar():
    query = Aula.query

    # Filtros opcionais via query string
    data_inicio = request.args.get("data_inicio")
    data_fim = request.args.get("data_fim")
    professor_id = request.args.get("professor_id", type=int)
    com_vagas = request.args.get("com_vagas", "").lower() in ("true", "1")

    if data_inicio:
        query = query.filter(Aula.data >= data_inicio)
    if data_fim:
        query = query.filter(Aula.data <= data_fim)
    if professor_id:
        query = query.filter(Aula.professor_id == professor_id)

    query = query.order_by(Aula.data.asc(), Aula.horario.asc())

    # com_vagas filtra depois da query (precisa contar inscrições)
    result = paginate(query, AulaResponseSchema(), "aulas.listar")
    if com_vagas:
        result["data"] = [a for a in result["data"] if a["vagas_disponiveis"] > 0]

    return jsonify(result), 200


# ── GET /aulas/<id> ────────────────────────────────────────────────────────
@aulas_bp.route("/<int:aula_id>", methods=["GET"])
@jwt_required()
def detalhes(aula_id: int):
    aula = db.session.get(Aula, aula_id)
    if not aula:
        return _not_found()

    data = AulaDetalheSchema().dump(aula)
    data["inscritos_count"] = aula.inscritos_count
    return jsonify(data), 200


# ── POST /aulas ────────────────────────────────────────────────────────────
@aulas_bp.route("", methods=["POST"])
@professor_required
def criar():
    try:
        data = AulaRequestSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _validation_error(err.messages)

    professor_id = int(get_jwt_identity())

    aula = Aula(
        professor_id=professor_id,
        data=data["data"],
        horario=data["horario"],
        duracao_min=data["duracao_min"],
        vagas=data["vagas"],
        descricao=data.get("descricao"),
    )
    db.session.add(aula)
    db.session.commit()

    return jsonify(AulaResponseSchema().dump(aula)), 201


# ── PUT /aulas/<id> ────────────────────────────────────────────────────────
@aulas_bp.route("/<int:aula_id>", methods=["PUT"])
@professor_required
def atualizar(aula_id: int):
    aula = db.session.get(Aula, aula_id)
    if not aula:
        return _not_found()

    professor_id = int(get_jwt_identity())
    if aula.professor_id != professor_id:
        return jsonify({
            "error": "Você só pode editar suas próprias aulas",
            "code": "INSUFFICIENT_PERMISSION",
        }), 403

    try:
        data = AulaRequestSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _validation_error(err.messages)

    # Regra: não permite reduzir vagas abaixo do número de inscritos
    if data["vagas"] < aula.inscritos_count:
        return jsonify({
            "error": f"Não é possível reduzir vagas para {data['vagas']}: "
                     f"já existem {aula.inscritos_count} inscritos",
            "code": "VACANCIES_BELOW_ENROLLED",
        }), 422

    aula.data = data["data"]
    aula.horario = data["horario"]
    aula.duracao_min = data["duracao_min"]
    aula.vagas = data["vagas"]
    aula.descricao = data.get("descricao")

    db.session.commit()
    return jsonify(AulaResponseSchema().dump(aula)), 200


# ── DELETE /aulas/<id> ─────────────────────────────────────────────────────
@aulas_bp.route("/<int:aula_id>", methods=["DELETE"])
@professor_required
def excluir(aula_id: int):
    aula = db.session.get(Aula, aula_id)
    if not aula:
        return _not_found()

    professor_id = int(get_jwt_identity())
    if aula.professor_id != professor_id:
        return jsonify({
            "error": "Você só pode excluir suas próprias aulas",
            "code": "INSUFFICIENT_PERMISSION",
        }), 403

    db.session.delete(aula)  # cascade remove inscrições
    db.session.commit()
    return "", 204
