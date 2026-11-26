"""
Testes de /api/v1/voluntarios/*
Cobre: cadastrar (público), listar (professor) com filtro, aprovar/recusar.
"""
import pytest

from extensions import db
from models import Voluntario

API = "/api/v1/voluntarios"


# ═══════════════════════════════════════════════════════════════
# POST /voluntarios (público)
# ═══════════════════════════════════════════════════════════════

class TestCadastrarVoluntario:
    """Cadastro de voluntário é público."""

    def _body_valido(self):
        return {
            "nome": "Voluntario Novo",
            "email": "novo.vol@teste.com",
            "mensagem": "Tenho experiencia em vela e posso ajudar nos fins de semana",
        }

    def test_cadastro_publico_retorna_201(self, client):
        res = client.post(API, json=self._body_valido())
        assert res.status_code == 201

    def test_nome_curto_retorna_400(self, client):
        body = self._body_valido()
        body["nome"] = "ab"  # min 3
        res = client.post(API, json=body)
        assert res.status_code == 400

    def test_email_invalido_retorna_400(self, client):
        body = self._body_valido()
        body["email"] = "nao-eh-email-valido"
        res = client.post(API, json=body)
        assert res.status_code == 400

    def test_mensagem_curta_retorna_400(self, client):
        body = self._body_valido()
        body["mensagem"] = "curto"  # min 20
        res = client.post(API, json=body)
        assert res.status_code == 400


# ═══════════════════════════════════════════════════════════════
# GET /voluntarios (professor)
# ═══════════════════════════════════════════════════════════════

class TestListarVoluntarios:
    """Lista admin — só professor vê."""

    def test_professor_ve_lista(self, client, voluntario, headers_professor):
        res = client.get(API, headers=headers_professor)
        assert res.status_code == 200
        data = res.get_json()
        assert "data" in data

    def test_aluno_nao_ve_retorna_403(self, client, voluntario, headers_aluno):
        res = client.get(API, headers=headers_aluno)
        assert res.status_code == 403

    def test_sem_auth_retorna_401(self, client, voluntario):
        res = client.get(API)
        assert res.status_code == 401

    def test_filtro_status_aprovado(self, client, app, headers_professor):
        db.session.add_all([
            Voluntario(nome="Pend", email="p1@t.com", mensagem="a" * 25, status="pendente"),
            Voluntario(nome="Aprov", email="a1@t.com", mensagem="b" * 25, status="aprovado"),
        ])
        db.session.commit()

        res = client.get(f"{API}?status=aprovado", headers=headers_professor)
        data = res.get_json()
        assert all(v["status"] == "aprovado" for v in data["data"])


# ═══════════════════════════════════════════════════════════════
# PATCH /voluntarios/<id>/status (professor aprova/recusa)
# ═══════════════════════════════════════════════════════════════

class TestAtualizarStatusVoluntario:
    """Professor aprova ou recusa voluntário pendente."""

    def test_professor_aprova_voluntario(self, client, voluntario, headers_professor):
        res = client.patch(
            f"{API}/{voluntario.id}/status",
            json={"status": "aprovado"},
            headers=headers_professor,
        )
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "aprovado"

    def test_professor_recusa_voluntario(self, client, voluntario, headers_professor):
        res = client.patch(
            f"{API}/{voluntario.id}/status",
            json={"status": "recusado"},
            headers=headers_professor,
        )
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "recusado"

    def test_status_invalido_retorna_400(self, client, voluntario, headers_professor):
        res = client.patch(
            f"{API}/{voluntario.id}/status",
            json={"status": "statusquenao_existe"},
            headers=headers_professor,
        )
        assert res.status_code == 400

    def test_aluno_nao_pode_aprovar_retorna_403(self, client, voluntario, headers_aluno):
        res = client.patch(
            f"{API}/{voluntario.id}/status",
            json={"status": "aprovado"},
            headers=headers_aluno,
        )
        assert res.status_code == 403

    def test_sem_auth_retorna_401(self, client, voluntario):
        res = client.patch(
            f"{API}/{voluntario.id}/status",
            json={"status": "aprovado"},
        )
        assert res.status_code == 401

    def test_voluntario_inexistente_retorna_404(self, client, headers_professor):
        res = client.patch(
            f"{API}/99999/status",
            json={"status": "aprovado"},
            headers=headers_professor,
        )
        assert res.status_code == 404
