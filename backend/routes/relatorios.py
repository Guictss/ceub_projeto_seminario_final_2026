"""Blueprint de relatórios — /api/v1/relatorios/*"""
from datetime import datetime

from flask import Blueprint, make_response, request, jsonify
from sqlalchemy.orm import joinedload

from extensions import db
from models import Aula, Inscricao, Usuario
from services.pdf_relatorio import gerar_pdf_inscricoes
from utils.decorators import professor_required

relatorios_bp = Blueprint("relatorios", __name__)


def _parse_data(valor):
    """Converte 'YYYY-MM-DD' em date, ou devolve None."""
    if not valor:
        return None
    try:
        return datetime.strptime(valor, "%Y-%m-%d").date()
    except ValueError:
        return "invalid"


@relatorios_bp.route("/inscricoes.pdf", methods=["GET"])
@professor_required
def inscricoes_pdf():
    # ── parse e validação dos filtros ─────────────────────────────────────
    data_inicio = _parse_data(request.args.get("data_inicio"))
    data_fim = _parse_data(request.args.get("data_fim"))
    professor_id = request.args.get("professor_id", type=int)

    for valor, nome in [(data_inicio, "data_inicio"), (data_fim, "data_fim")]:
        if valor == "invalid":
            return jsonify({
                "error": f"Formato inválido em '{nome}' (use YYYY-MM-DD)",
                "code": "VALIDATION_ERROR",
            }), 400

    # ── monta a query com eager loading para evitar N+1 ───────────────────
    query = Aula.query.options(
        joinedload(Aula.professor),
        joinedload(Aula.inscricoes).joinedload(Inscricao.aluno),
    )

    if data_inicio:
        query = query.filter(Aula.data >= data_inicio)
    if data_fim:
        query = query.filter(Aula.data <= data_fim)

    professor_nome = None
    if professor_id:
        query = query.filter(Aula.professor_id == professor_id)
        prof = db.session.get(Usuario, professor_id)
        professor_nome = prof.nome if prof else f"ID {professor_id}"

    aulas = query.order_by(Aula.data.asc(), Aula.horario.asc()).all()

    # ── gera o PDF ────────────────────────────────────────────────────────
    filtros = {
        "data_inicio": data_inicio.strftime("%d/%m/%Y") if data_inicio else None,
        "data_fim": data_fim.strftime("%d/%m/%Y") if data_fim else None,
        "professor_nome": professor_nome,
    }
    pdf_bytes = gerar_pdf_inscricoes(aulas, filtros=filtros)

    # ── resposta HTTP ─────────────────────────────────────────────────────
    nome_arquivo = (
        f"relatorio_inscricoes_"
        f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    )
    response = make_response(pdf_bytes)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = (
        f'attachment; filename="{nome_arquivo}"'
    )
    response.headers["Content-Length"] = str(len(pdf_bytes))
    return response

