"""
Testes de /api/v1/inscricoes/*
Cobre: criar (aluno), cancelar, regras: aula cheia, dupla inscrição, listar minhas.
"""
from datetime import date, time, timedelta

import pytest

from extensions import db
from models import Aula, Inscricao

API = "/api/v1/inscricoes"


# ═══════════════════════════════════════════════════════════════
# POST /inscricoes (aluno se inscreve)
# ═══════════════════════════════════════════════════════════════

class TestCriarInscricao:
    """Inscrição em aula — só aluno pode."""

    def test_aluno_se_inscreve_retorna_201(self, client, aula, headers_aluno):
        res = client.post(API, json={"aula_id": aula.id}, headers=headers_aluno)
        assert res.status_code == 201

    def test_sem_autenticacao_retorna_401(self, client, aula):
        res = client.post(API, json={"aula_id": aula.id})
        assert res.status_code == 401

    def test_professor_nao_pode_se_inscrever_retorna_403(
        self, client, aula, headers_professor
    ):
        res = client.post(API, json={"aula_id": aula.id}, headers=headers_professor)
        assert res.status_code == 403

    def test_dupla_inscricao_na_mesma_aula_falha(
        self, client, aula, aluno, headers_aluno
    ):
        # Primeira inscrição: OK
        res1 = client.post(API, json={"aula_id": aula.id}, headers=headers_aluno)
        assert res1.status_code == 201

        # Segunda tentativa: deve falhar (unique constraint)
        res2 = client.post(API, json={"aula_id": aula.id}, headers=headers_aluno)
        assert res2.status_code in (400, 409, 422)

    def test_inscricao_em_aula_cheia_retorna_erro(
        self, client, aula_lotada, aluno, outro_aluno, headers_aluno
    ):
        # outro_aluno pega a única vaga
        db.session.add(Inscricao(aluno_id=outro_aluno.id, aula_id=aula_lotada.id))
        db.session.commit()

        # aluno tenta se inscrever — vaga já acabou
        res = client.post(API, json={"aula_id": aula_lotada.id}, headers=headers_aluno)
        assert res.status_code in (400, 409, 422)

    def test_inscricao_em_aula_inexistente_retorna_404(self, client, headers_aluno):
        res = client.post(API, json={"aula_id": 99999}, headers=headers_aluno)
        assert res.status_code in (400, 404, 422)

    def test_body_sem_aula_id_retorna_400(self, client, headers_aluno):
        res = client.post(API, json={}, headers=headers_aluno)
        assert res.status_code == 400


# ═══════════════════════════════════════════════════════════════
# DELETE /inscricoes/<id> (cancelar)
# ═══════════════════════════════════════════════════════════════

class TestCancelarInscricao:
    """Cancelamento — aluno cancela a própria inscrição."""

    def _criar_inscricao(self, app, aluno, aula):
        """Helper: cria uma inscrição direto no banco e retorna o objeto."""
        i = Inscricao(aluno_id=aluno.id, aula_id=aula.id)
        db.session.add(i)
        db.session.commit()
        return i

    def test_aluno_cancela_propria_inscricao_retorna_200(
        self, client, app, aula, aluno, headers_aluno
    ):
        inscricao = self._criar_inscricao(app, aluno, aula)
        res = client.delete(f"{API}/{inscricao.id}", headers=headers_aluno)
        assert res.status_code in (200, 204)

    def test_outro_aluno_nao_pode_cancelar_inscricao_alheia_retorna_403(
        self, client, app, aula, aluno, outro_aluno
    ):
        # inscrição do primeiro aluno
        inscricao = self._criar_inscricao(app, aluno, aula)

        # outro_aluno tenta cancelar
        res_login = client.post("/api/v1/auth/login", json={
            "email": outro_aluno.email,
            "senha": "Senha123!",
        })
        token = res_login.get_json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = client.delete(f"{API}/{inscricao.id}", headers=headers)
        assert res.status_code == 403

    def test_cancelar_sem_auth_retorna_401(self, client, app, aula, aluno):
        inscricao = self._criar_inscricao(app, aluno, aula)
        res = client.delete(f"{API}/{inscricao.id}")
        assert res.status_code == 401

    def test_cancelar_inscricao_inexistente_retorna_404(self, client, headers_aluno):
        res = client.delete(f"{API}/99999", headers=headers_aluno)
        assert res.status_code == 404


# ═══════════════════════════════════════════════════════════════
# GET /inscricoes/minhas (aluno vê suas inscrições)
# ═══════════════════════════════════════════════════════════════

class TestMinhasInscricoes:
    """Aluno vê a lista das próprias inscrições."""

    def test_aluno_ve_suas_inscricoes(
        self, client, app, aula, aluno, headers_aluno
    ):
        aula2 = Aula(
            professor_id=aula.professor_id,
            data=date.today() + timedelta(days=10),
            horario=time(10, 0),
            duracao_min=60,
            vagas=5,
            descricao="Segunda aula de teste",
        )
        db.session.add(aula2)
        db.session.commit()
        db.session.add_all([
            Inscricao(aluno_id=aluno.id, aula_id=aula.id),
            Inscricao(aluno_id=aluno.id, aula_id=aula2.id),
        ])
        db.session.commit()

        res = client.get(API, headers=headers_aluno)
        assert res.status_code == 200
        data = res.get_json()
        assert "data" in data
        assert len(data["data"]) == 2

    def test_aluno_sem_inscricoes_retorna_lista_vazia(self, client, headers_aluno):
        res = client.get(API, headers=headers_aluno)
        assert res.status_code == 200
        data = res.get_json()
        assert "data" in data
        assert len(data["data"]) == 0

    def test_sem_autenticacao_retorna_401(self, client):
        res = client.get(API)
        assert res.status_code == 401
