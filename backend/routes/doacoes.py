"""Blueprint de doações — /api/v1/doacoes/*"""
from flask import Blueprint, jsonify, request
from marshmallow import ValidationError
from sqlalchemy import func

from extensions import db, limiter
from models import Doacao
from schemas.doacao_schema import DoacaoRequestSchema, DoacaoResponseSchema
from utils.decorators import professor_required
from utils.pagination import paginate

doacoes_bp = Blueprint("doacoes", __name__)


def _validation_error(errors):
    return jsonify({
        "error": "Dados inválidos",
        "code": "VALIDATION_ERROR",
        "details": errors,
    }), 400


# ── GET /doacoes (professor) ───────────────────────────────────────────────
@doacoes_bp.route("", methods=["GET"])
@professor_required
def listar():
    query = Doacao.query

    # Filtros opcionais via query string
    forma = request.args.get("forma_pagamento")
    data_inicio = request.args.get("data_inicio")
    data_fim = request.args.get("data_fim")

    if forma:
        query = query.filter(Doacao.forma_pagamento == forma)
    if data_inicio:
        query = query.filter(Doacao.doado_em >= data_inicio)
    if data_fim:
        query = query.filter(Doacao.doado_em <= data_fim)

    # Resumo do filtro aplicado
    total_arrecadado = query.with_entities(
        func.coalesce(func.sum(Doacao.valor), 0)
    ).scalar()
    total_doacoes = query.count()

    query = query.order_by(Doacao.doado_em.desc())
    result = paginate(query, DoacaoResponseSchema(), "doacoes.listar")
    result["resumo"] = {
        "total_arrecadado": float(total_arrecadado),
        "total_doacoes": total_doacoes,
    }

    return jsonify(result), 200


# ── POST /doacoes (público) ────────────────────────────────────────────────
@doacoes_bp.route("", methods=["POST"])
@limiter.limit("10 per minute")
def doar():
    try:
        data = DoacaoRequestSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _validation_error(err.messages)

    doacao = Doacao(
        nome_doador=data["nome_doador"],
        valor=data["valor"],
        forma_pagamento=data["forma_pagamento"],
    )
    db.session.add(doacao)
    db.session.commit()

    return jsonify(DoacaoResponseSchema().dump(doacao)), 201
