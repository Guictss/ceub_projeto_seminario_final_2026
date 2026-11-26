"""Blueprint de inscrições — /api/v1/inscricoes/* e /aulas/<id>/inscricoes"""
from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy.orm import joinedload

from extensions import db
from models import Aula, Inscricao, Usuario
from schemas.inscricao_schema import (
    InscricaoCreatedSchema,
    InscricaoRequestSchema,
    InscricaoResponseSchema,
    InscritoAulaSchema,
)
from utils.decorators import aluno_required, professor_required
from utils.pagination import paginate

inscricoes_bp = Blueprint("inscricoes", __name__)
inscricoes_aula_bp = Blueprint("inscricoes_aula", __name__)


def _validation_error(errors):
    return jsonify({
        "error": "Dados inválidos",
        "code": "VALIDATION_ERROR",
        "details": errors,
    }), 400


# ── GET /inscricoes (minhas inscrições) ────────────────────────────────────
@inscricoes_bp.route("", methods=["GET"])
@aluno_required
def minhas_inscricoes():
    aluno_id = int(get_jwt_identity())
    futuras = request.args.get("futuras", "").lower() in ("true", "1")

    query = (
        Inscricao.query
        .options(joinedload(Inscricao.aula).joinedload(Aula.professor))
        .filter(Inscricao.aluno_id == aluno_id)
        .join(Aula, Inscricao.aula_id == Aula.id)
    )

    if futuras:
        query = query.filter(Aula.data >= date.today())

    query = query.order_by(Aula.data.asc(), Aula.horario.asc())

    result = paginate(query, InscricaoResponseSchema(), "inscricoes.minhas_inscricoes")
    return jsonify(result), 200


# ── POST /inscricoes (criar inscrição) ─────────────────────────────────────
@inscricoes_bp.route("", methods=["POST"])
@aluno_required
def inscrever():
    try:
        data = InscricaoRequestSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _validation_error(err.messages)

    aluno_id = int(get_jwt_identity())
    aula_id = data["aula_id"]

    aula = db.session.get(Aula, aula_id)
    if not aula:
        return jsonify({
            "error": "Aula não encontrada",
            "code": "RESOURCE_NOT_FOUND",
        }), 404

    # Regra 1: Aula precisa estar no futuro
    if aula.data < date.today():
        return jsonify({
            "error": "Não é possível se inscrever em aulas passadas",
            "code": "AULA_NO_PASSADO",
        }), 422

    # Regra 2: Já inscrito?
    existente = Inscricao.query.filter_by(
        aluno_id=aluno_id, aula_id=aula_id
    ).first()
    if existente:
        return jsonify({
            "error": "Você já está inscrito nesta aula",
            "code": "ALREADY_ENROLLED",
        }), 409

    # Regra 3: Vagas disponíveis?
    if not aula.tem_vagas:
        return jsonify({
            "error": "Esta aula não possui vagas disponíveis",
            "code": "NO_VACANCIES",
        }), 422

    # Regra 4: Conflito de horário na mesma data?
    conflito = (
        Inscricao.query
        .join(Aula, Inscricao.aula_id == Aula.id)
        .filter(
            Inscricao.aluno_id == aluno_id,
            Aula.data == aula.data,
            Aula.horario == aula.horario,
        )
        .first()
    )
    if conflito:
        return jsonify({
            "error": "Você já tem uma aula neste horário",
            "code": "SCHEDULE_CONFLICT",
        }), 422

    inscricao = Inscricao(aluno_id=aluno_id, aula_id=aula_id)
    db.session.add(inscricao)
    db.session.commit()

    return jsonify(InscricaoCreatedSchema().dump(inscricao)), 201


# ── DELETE /inscricoes/<id> (cancelar inscrição) ───────────────────────────
@inscricoes_bp.route("/<int:inscricao_id>", methods=["DELETE"])
@aluno_required
def cancelar(inscricao_id: int):
    inscricao = db.session.get(Inscricao, inscricao_id)
    if not inscricao:
        return jsonify({
            "error": "Inscrição não encontrada",
            "code": "RESOURCE_NOT_FOUND",
        }), 404

    aluno_id = int(get_jwt_identity())
    if inscricao.aluno_id != aluno_id:
        return jsonify({
            "error": "Você só pode cancelar suas próprias inscrições",
            "code": "INSUFFICIENT_PERMISSION",
        }), 403

    # Regra: só cancela aulas futuras
    if inscricao.aula.data < date.today():
        return jsonify({
            "error": "Não é possível cancelar inscrição em aulas passadas",
            "code": "AULA_NO_PASSADO",
        }), 422

    db.session.delete(inscricao)
    db.session.commit()
    return "", 204


# ── GET /aulas/<id>/inscricoes (professor vê inscritos) ────────────────────
@inscricoes_aula_bp.route("/<int:aula_id>/inscricoes", methods=["GET"])
@professor_required
def listar_inscritos(aula_id: int):
    aula = db.session.get(Aula, aula_id)
    if not aula:
        return jsonify({
            "error": "Aula não encontrada",
            "code": "RESOURCE_NOT_FOUND",
        }), 404

    professor_id = int(get_jwt_identity())
    if aula.professor_id != professor_id:
        return jsonify({
            "error": "Você só pode ver inscritos de suas próprias aulas",
            "code": "INSUFFICIENT_PERMISSION",
        }), 403

    query = (
        Inscricao.query
        .options(joinedload(Inscricao.aluno))
        .filter(Inscricao.aula_id == aula_id)
        .join(Usuario, Inscricao.aluno_id == Usuario.id)
        .order_by(Usuario.nome.asc())
    )

    result = paginate(query, InscritoAulaSchema(), "inscricoes_aula.listar_inscritos", aula_id=aula_id)
    return jsonify(result), 200
