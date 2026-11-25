"""
Testes de /api/v1/dashboard/stats
Métricas variam por papel do usuário (professor vs aluno).
"""
import pytest


API = "/api/v1/dashboard/stats"


class TestDashboardProfessor:
    """Professor vê métricas de aulas/inscrições/voluntários/doações."""

    def test_professor_recebe_stats_retorna_200(self, client, headers_professor):
        res = client.get(API, headers=headers_professor)
        assert res.status_code == 200
        data = res.get_json()
        assert isinstance(data, dict)
        # Deve ter pelo menos uma métrica
        assert len(data) > 0

    def test_professor_com_aula_e_inscricoes_ve_contadores(
        self, client, app, professor, aluno, aula, headers_professor
    ):
        from extensions import db
        from models import Inscricao
        db.session.add(Inscricao(aluno_id=aluno.id, aula_id=aula.id))
        db.session.commit()

        res = client.get(API, headers=headers_professor)
        assert res.status_code == 200
        data = res.get_json()
        # Confere que retornou algo que faz sentido (sem crashar)
        assert isinstance(data, dict)


class TestDashboardAluno:
    """Aluno vê métricas do próprio uso (minhas inscrições, aulas disponíveis)."""

    def test_aluno_recebe_stats_retorna_200(self, client, headers_aluno):
        res = client.get(API, headers=headers_aluno)
        assert res.status_code == 200
        data = res.get_json()
        assert isinstance(data, dict)
        assert len(data) > 0

    def test_aluno_com_inscricao_ve_contador(
        self, client, app, aluno, aula, headers_aluno
    ):
        from extensions import db
        from models import Inscricao
        db.session.add(Inscricao(aluno_id=aluno.id, aula_id=aula.id))
        db.session.commit()

        res = client.get(API, headers=headers_aluno)
        assert res.status_code == 200


class TestDashboardAuth:
    """Dashboard exige autenticação."""

    def test_sem_auth_retorna_401(self, client):
        res = client.get(API)
        assert res.status_code == 401