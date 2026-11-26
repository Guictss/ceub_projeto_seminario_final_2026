"""Blueprint do Dashboard — /api/v1/dashboard/*

Retorna métricas agregadas para a tela inicial do sistema. Os dados variam
conforme o papel do usuário autenticado (professor x aluno).
"""
from datetime import datetime

from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import distinct, func

from extensions import db
from models import Aula, Doacao, Inscricao, Noticia, Usuario, Voluntario

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    """Retorna as métricas do dashboard do usuário autenticado."""
    user_id = int(get_jwt_identity())
    usuario = Usuario.query.get(user_id)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado",
                        "code": "USER_NOT_FOUND"}), 404

    hoje = datetime.now()
    inicio_mes = hoje.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    if usuario.papel == "professor":
        return _stats_professor(user_id, usuario, hoje, inicio_mes)
    return _stats_aluno(user_id, usuario, hoje)


# ── Professor ────────────────────────────────────────────────────────────
def _stats_professor(user_id, usuario, hoje, inicio_mes):
    minhas_aulas = (
        db.session.query(func.count(Aula.id))
        .filter_by(professor_id=user_id).scalar() or 0
    )
    total_inscricoes = (
        db.session.query(func.count(Inscricao.id))
        .join(Aula).filter(Aula.professor_id == user_id).scalar() or 0
    )
    alunos_unicos = (
        db.session.query(func.count(distinct(Inscricao.aluno_id)))
        .join(Aula).filter(Aula.professor_id == user_id).scalar() or 0
    )
    voluntarios_pendentes = (
        db.session.query(func.count(Voluntario.id))
        .filter_by(status="pendente").scalar() or 0
    )
    doacoes_mes_valor = (
        db.session.query(func.sum(Doacao.valor))
        .filter(Doacao.doado_em >= inicio_mes).scalar() or 0
    )
    doacoes_mes_count = (
        db.session.query(func.count(Doacao.id))
        .filter(Doacao.doado_em >= inicio_mes).scalar() or 0
    )

    # Próximas aulas minhas (5 mais próximas)
    proximas_q = (
        Aula.query
        .filter(Aula.professor_id == user_id, Aula.data >= hoje.date())
        .order_by(Aula.data.asc(), Aula.horario.asc())
        .limit(5).all()
    )
    proximas_aulas = [
        {
            "id": a.id,
            "descricao": a.descricao,
            "data": a.data.isoformat(),
            "horario": a.horario.strftime("%H:%M"),
            "vagas_total": a.vagas,
            "inscritos": len(a.inscricoes),
            "vagas_disponiveis": a.vagas - len(a.inscricoes),
        }
        for a in proximas_q
    ]

    # Doações do mês agrupadas por forma de pagamento (pra gráfico de pizza)
    doacoes_por_forma_q = (
        db.session.query(
            Doacao.forma_pagamento,
            func.count(Doacao.id).label("count"),
            func.sum(Doacao.valor).label("total"),
        )
        .filter(Doacao.doado_em >= inicio_mes)
        .group_by(Doacao.forma_pagamento).all()
    )
    doacoes_por_forma = [
        {
            "forma": r.forma_pagamento,
            "count": r.count,
            "total": float(r.total or 0),
        }
        for r in doacoes_por_forma_q
    ]

    return jsonify({
        "papel": "professor",
        "nome": usuario.nome,
        "metricas": {
            "minhas_aulas": minhas_aulas,
            "total_inscricoes": total_inscricoes,
            "alunos_unicos": alunos_unicos,
            "voluntarios_pendentes": voluntarios_pendentes,
            "doacoes_mes_valor": float(doacoes_mes_valor),
            "doacoes_mes_count": doacoes_mes_count,
        },
        "proximas_aulas": proximas_aulas,
        "doacoes_por_forma": doacoes_por_forma,
    }), 200


# ── Aluno ────────────────────────────────────────────────────────────────
def _stats_aluno(user_id, usuario, hoje):
    minhas_inscricoes = (
        db.session.query(func.count(Inscricao.id))
        .filter_by(aluno_id=user_id).scalar() or 0
    )

    # Próximas aulas em que estou inscrito
    proximas_q = (
        db.session.query(Aula).join(Inscricao)
        .filter(Inscricao.aluno_id == user_id, Aula.data >= hoje.date())
        .order_by(Aula.data.asc(), Aula.horario.asc())
        .limit(5).all()
    )
    proximas_aulas_inscritas = [
        {
            "id": a.id,
            "descricao": a.descricao,
            "data": a.data.isoformat(),
            "horario": a.horario.strftime("%H:%M"),
            "professor": a.professor.nome if a.professor else None,
        }
        for a in proximas_q
    ]

    # Count de aulas futuras com vagas (precisa iterar porque "vagas_disponiveis" é property)
    aulas_futuras_q = Aula.query.filter(Aula.data >= hoje.date()).all()
    aulas_disponiveis = sum(
        1 for a in aulas_futuras_q if len(a.inscricoes) < a.vagas
    )

    total_noticias = (
        db.session.query(func.count(Noticia.id)).scalar() or 0
    )

    noticias_recentes_q = (
        Noticia.query.order_by(Noticia.publicado_em.desc()).limit(3).all()
    )
    noticias_recentes = [
        {
            "id": n.id,
            "titulo": n.titulo,
            "publicado_em": n.publicado_em.isoformat()
            if n.publicado_em else None,
        }
        for n in noticias_recentes_q
    ]

    return jsonify({
        "papel": "aluno",
        "nome": usuario.nome,
        "metricas": {
            "minhas_inscricoes": minhas_inscricoes,
            "aulas_disponiveis": aulas_disponiveis,
            "total_noticias": total_noticias,
        },
        "proximas_aulas_inscritas": proximas_aulas_inscritas,
        "noticias_recentes": noticias_recentes,
    }), 200
