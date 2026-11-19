"""Blueprint de notícias — /api/v1/noticias/*"""
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from extensions import db
from models import Noticia
from schemas.noticia_schema import (
    NoticiaRequestSchema, NoticiaListSchema, NoticiaDetailSchema
)
from utils.decorators import professor_required
from utils.pagination import paginate

noticias_bp = Blueprint("noticias", __name__)


def _validation_error(errors):
    return jsonify({
        "error": "Dados inválidos",
        "code": "VALIDATION_ERROR",
        "details": errors,
    }), 400


def _not_found():
    return jsonify({
        "error": "Notícia não encontrada",
        "code": "RESOURCE_NOT_FOUND",
    }), 404


# ── GET /noticias (público) ────────────────────────────────────────────────
@noticias_bp.route("", methods=["GET"])
def listar():
    query = Noticia.query.order_by(Noticia.publicado_em.desc())
    result = paginate(query, NoticiaListSchema(), "noticias.listar")
    return jsonify(result), 200


# ── GET /noticias/<id> (público) ───────────────────────────────────────────
@noticias_bp.route("/<int:noticia_id>", methods=["GET"])
def detalhes(noticia_id: int):
    noticia = db.session.get(Noticia, noticia_id)
    if not noticia:
        return _not_found()
    return jsonify(NoticiaDetailSchema().dump(noticia)), 200


# ── POST /noticias (professor) ─────────────────────────────────────────────
@noticias_bp.route("", methods=["POST"])
@professor_required
def criar():
    try:
        data = NoticiaRequestSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _validation_error(err.messages)

    noticia = Noticia(
        titulo=data["titulo"],
        conteudo=data["conteudo"],
        imagem=data.get("imagem"),
    )
    db.session.add(noticia)
    db.session.commit()
    return jsonify(NoticiaDetailSchema().dump(noticia)), 201


# ── PUT /noticias/<id> (professor) ─────────────────────────────────────────
@noticias_bp.route("/<int:noticia_id>", methods=["PUT"])
@professor_required
def atualizar(noticia_id: int):
    noticia = db.session.get(Noticia, noticia_id)
    if not noticia:
        return _not_found()

    try:
        data = NoticiaRequestSchema().load(request.get_json() or {})
    except ValidationError as err:
        return _validation_error(err.messages)

    noticia.titulo = data["titulo"]
    noticia.conteudo = data["conteudo"]
    noticia.imagem = data.get("imagem")
    db.session.commit()
    return jsonify(NoticiaDetailSchema().dump(noticia)), 200


# ── DELETE /noticias/<id> (professor) ──────────────────────────────────────
@noticias_bp.route("/<int:noticia_id>", methods=["DELETE"])
@professor_required
def excluir(noticia_id: int):
    noticia = db.session.get(Noticia, noticia_id)
    if not noticia:
        return _not_found()
    db.session.delete(noticia)
    db.session.commit()
    return "", 204
