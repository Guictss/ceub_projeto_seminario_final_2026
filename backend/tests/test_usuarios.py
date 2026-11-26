"""
Testes de /api/v1/usuarios/*
Cobre: listar (prof), detalhar (próprio ou prof), editar (regra papel), deletar (CANNOT_DELETE_SELF).
"""
from datetime import date

import pytest

from extensions import db
from models import Usuario

API = "/api/v1/usuarios"


# ═══════════════════════════════════════════════════════════════
# GET /usuarios (professor)
# ═══════════════════════════════════════════════════════════════

class TestListarUsuarios:
    """Lista admin — só professor."""

    def test_professor_ve_lista(self, client, professor, aluno, headers_professor):
        res = client.get(API, headers=headers_professor)
        assert res.status_code == 200
        data = res.get_json()
        assert "items" in data
        assert len(data["items"]) >= 2

    def test_aluno_nao_ve_lista_retorna_403(self, client, aluno, headers_aluno):
        res = client.get(API, headers=headers_aluno)
        assert res.status_code == 403

    def test_sem_auth_retorna_401(self, client):
        res = client.get(API)
        assert res.status_code == 401

    def test_filtro_papel(self, client, professor, aluno, outro_aluno, headers_professor):
        res = client.get(f"{API}?papel=aluno", headers=headers_professor)
        data = res.get_json()
        assert all(u["papel"] == "aluno" for u in data["items"])

    def test_busca_q_por_nome(self, client, professor, aluno, headers_professor):
        res = client.get(f"{API}?q=Carlos", headers=headers_professor)
        data = res.get_json()
        assert any("Carlos" in u["nome"] for u in data["items"])

    def test_busca_q_por_email(self, client, professor, aluno, headers_professor):
        res = client.get(f"{API}?q=prof@", headers=headers_professor)
        data = res.get_json()
        assert any("prof@" in u["email"] for u in data["items"])


# ═══════════════════════════════════════════════════════════════
# GET /usuarios/<id> (próprio ou professor)
# ═══════════════════════════════════════════════════════════════

class TestDetalharUsuario:
    """Detalhe — próprio ou professor."""

    def test_professor_ve_qualquer_usuario(self, client, aluno, headers_professor):
        res = client.get(f"{API}/{aluno.id}", headers=headers_professor)
        assert res.status_code == 200
        assert res.get_json()["id"] == aluno.id

    def test_aluno_ve_proprio_perfil(self, client, aluno, headers_aluno):
        res = client.get(f"{API}/{aluno.id}", headers=headers_aluno)
        assert res.status_code == 200
        assert res.get_json()["email"] == aluno.email

    def test_aluno_nao_ve_outro_usuario_retorna_403(
        self, client, outro_aluno, headers_aluno
    ):
        res = client.get(f"{API}/{outro_aluno.id}", headers=headers_aluno)
        assert res.status_code == 403

    def test_sem_auth_retorna_401(self, client, aluno):
        res = client.get(f"{API}/{aluno.id}")
        assert res.status_code == 401

    def test_inexistente_retorna_404(self, client, headers_professor):
        res = client.get(f"{API}/99999", headers=headers_professor)
        assert res.status_code == 404


# ═══════════════════════════════════════════════════════════════
# PUT /usuarios/<id> (próprio ou professor, só prof muda papel)
# ═══════════════════════════════════════════════════════════════

class TestEditarUsuario:
    """Edição — regras: aluno edita próprio, mas só professor muda papel."""

    def test_aluno_edita_proprio_nome(self, client, aluno, headers_aluno):
        res = client.put(f"{API}/{aluno.id}", json={
            "nome": "Nome Editado Aluno",
        }, headers=headers_aluno)
        assert res.status_code == 200

        res2 = client.get(f"{API}/{aluno.id}", headers=headers_aluno)
        assert res2.get_json()["nome"] == "Nome Editado Aluno"

    def test_professor_edita_qualquer_usuario(
        self, client, aluno, headers_professor
    ):
        res = client.put(f"{API}/{aluno.id}", json={
            "nome": "Editado pelo professor",
        }, headers=headers_professor)
        assert res.status_code == 200

    def test_aluno_nao_pode_mudar_proprio_papel(self, client, aluno, headers_aluno):
        """Aluno tentando virar professor via API deve falhar."""
        res = client.put(f"{API}/{aluno.id}", json={
            "papel": "professor",
        }, headers=headers_aluno)
        # Pode ser 400 (validação), 403 (sem permissão), ou 200 ignorando o campo
        if res.status_code == 200:
            # se aceitou, verifica que o papel NÃO mudou
            assert res.get_json()["papel"] == "aluno"
        else:
            assert res.status_code in (400, 403, 422)

    def test_professor_muda_papel_de_outro(
        self, client, aluno, headers_professor
    ):
        res = client.put(f"{API}/{aluno.id}", json={
            "papel": "professor",
        }, headers=headers_professor)
        assert res.status_code == 200

        # Confirma mudança via GET
        res2 = client.get(f"{API}/{aluno.id}", headers=headers_professor)
        assert res2.get_json()["papel"] == "professor"

    def test_aluno_nao_edita_outro_usuario_retorna_403(
        self, client, outro_aluno, headers_aluno
    ):
        res = client.put(f"{API}/{outro_aluno.id}", json={
            "nome": "Hack",
        }, headers=headers_aluno)
        assert res.status_code == 403

    def test_sem_auth_retorna_401(self, client, aluno):
        res = client.put(f"{API}/{aluno.id}", json={"nome": "x"})
        assert res.status_code == 401


# ═══════════════════════════════════════════════════════════════
# DELETE /usuarios/<id> (professor, nunca próprio)
# ═══════════════════════════════════════════════════════════════

class TestDeletarUsuario:
    """Exclusão — só professor, nunca a si mesmo (CANNOT_DELETE_SELF)."""

    def test_professor_deleta_aluno_retorna_204_ou_200(
        self, client, aluno, headers_professor
    ):
        res = client.delete(f"{API}/{aluno.id}", headers=headers_professor)
        assert res.status_code in (200, 204)

    def test_professor_nao_pode_se_deletar_cannot_delete_self(
        self, client, professor, headers_professor
    ):
        res = client.delete(f"{API}/{professor.id}", headers=headers_professor)
        # Pode ser 403 ou 409
        assert res.status_code in (400, 403, 409, 422)

    def test_aluno_nao_pode_deletar_retorna_403(
        self, client, outro_aluno, headers_aluno
    ):
        res = client.delete(f"{API}/{outro_aluno.id}", headers=headers_aluno)
        assert res.status_code == 403

    def test_sem_auth_retorna_401(self, client, aluno):
        res = client.delete(f"{API}/{aluno.id}")
        assert res.status_code == 401

    def test_inexistente_retorna_404(self, client, headers_professor):
        res = client.delete(f"{API}/99999", headers=headers_professor)
        assert res.status_code == 404
