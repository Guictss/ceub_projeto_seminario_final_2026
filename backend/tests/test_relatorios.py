"""
Testes de /api/v1/relatorios/inscricoes.pdf
Smoke test: gera PDF, não quebra, tem mime type correto.
Também cobre o pdf_relatorio.py (serviço).
"""
from datetime import date, time, timedelta

import pytest

from extensions import db
from models import Aula, Inscricao


API = "/api/v1/relatorios/inscricoes.pdf"


class TestGerarRelatorioPdf:
    """Geração de PDF de inscrições — só professor."""

    def test_professor_gera_pdf_retorna_200(
        self, client, app, professor, aluno, aula, headers_professor
    ):
        # Cria inscrição pra ter dado no relatório
        db.session.add(Inscricao(aluno_id=aluno.id, aula_id=aula.id))
        db.session.commit()

        res = client.get(API, headers=headers_professor)
        assert res.status_code == 200
        assert res.content_type == "application/pdf" or \
               res.content_type.startswith("application/pdf")
        # Verifica assinatura de arquivo PDF (começa com "%PDF-")
        assert res.data[:5] == b"%PDF-"

    def test_sem_inscricoes_tambem_gera_pdf(self, client, headers_professor):
        """PDF vazio ou com placeholder ainda deve ser gerado."""
        res = client.get(API, headers=headers_professor)
        assert res.status_code == 200
        assert res.data[:5] == b"%PDF-"

    def test_aluno_nao_pode_gerar_relatorio_retorna_403(self, client, headers_aluno):
        res = client.get(API, headers=headers_aluno)
        assert res.status_code == 403

    def test_sem_autenticacao_retorna_401(self, client):
        res = client.get(API)
        assert res.status_code == 401

    def test_filtro_data_inicio(
        self, client, app, professor, aluno, headers_professor
    ):
        # Cria 2 aulas em datas diferentes
        aula_antiga = Aula(
            professor_id=professor.id,
            data=date.today() + timedelta(days=1),
            horario=time(9, 0), duracao_min=60, vagas=5,
            descricao="Aula antiga",
        )
        aula_futura = Aula(
            professor_id=professor.id,
            data=date.today() + timedelta(days=30),
            horario=time(9, 0), duracao_min=60, vagas=5,
            descricao="Aula futura",
        )
        db.session.add_all([aula_antiga, aula_futura])
        db.session.commit()
        db.session.add_all([
            Inscricao(aluno_id=aluno.id, aula_id=aula_antiga.id),
            Inscricao(aluno_id=aluno.id, aula_id=aula_futura.id),
        ])
        db.session.commit()

        data_inicio = (date.today() + timedelta(days=15)).isoformat()
        res = client.get(
            f"{API}?data_inicio={data_inicio}",
            headers=headers_professor,
        )
        assert res.status_code == 200
        assert res.data[:5] == b"%PDF-"

    def test_filtro_data_fim(
        self, client, app, professor, aluno, aula, headers_professor
    ):
        db.session.add(Inscricao(aluno_id=aluno.id, aula_id=aula.id))
        db.session.commit()

        data_fim = (date.today() + timedelta(days=100)).isoformat()
        res = client.get(
            f"{API}?data_fim={data_fim}",
            headers=headers_professor,
        )
        assert res.status_code == 200

    def test_filtro_professor_id(
        self, client, app, professor, aluno, aula, headers_professor
    ):
        db.session.add(Inscricao(aluno_id=aluno.id, aula_id=aula.id))
        db.session.commit()

        res = client.get(
            f"{API}?professor_id={professor.id}",
            headers=headers_professor,
        )
        assert res.status_code == 200


class TestRelatorioFiltrosCombinados:
    """Combinação de filtros."""

    def test_todos_filtros_juntos(
        self, client, app, professor, aluno, aula, headers_professor
    ):
        db.session.add(Inscricao(aluno_id=aluno.id, aula_id=aula.id))
        db.session.commit()

        params = (
            f"?data_inicio={date.today().isoformat()}"
            f"&data_fim={(date.today() + timedelta(days=60)).isoformat()}"
            f"&professor_id={professor.id}"
        )
        res = client.get(f"{API}{params}", headers=headers_professor)
        assert res.status_code == 200
        assert res.data[:5] == b"%PDF-"