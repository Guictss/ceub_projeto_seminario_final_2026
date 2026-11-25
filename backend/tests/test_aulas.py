"""
Testes de /api/v1/aulas/*
Cobre: listagem (c/ filtros), detalhe, criação, edição, exclusão, permissões.

NOTA: /aulas exige JWT (qualquer usuário logado pode listar/ver).
Só professor pode criar/editar/deletar, e só o DONO da aula.
"""
from datetime import date, time, timedelta

import pytest

from extensions import db
from models import Aula


API = "/api/v1/aulas"


# ═══════════════════════════════════════════════════════════════
# GET /aulas (qualquer logado)
# ═══════════════════════════════════════════════════════════════

class TestListarAulas:
    """Listagem de aulas com filtros — requer autenticação."""

    def test_sem_filtros_retorna_200_com_paginacao(self, client, aula, headers_aluno):
        res = client.get(API, headers=headers_aluno)
        assert res.status_code == 200
        data = res.get_json()
        assert "data" in data
        assert "meta" in data
        assert isinstance(data["data"], list)
        assert len(data["data"]) >= 1
        assert data["meta"]["total"] >= 1
        assert "page" in data["meta"]
        assert "per_page" in data["meta"]

    def test_sem_autenticacao_retorna_401(self, client, aula):
        res = client.get(API)
        assert res.status_code == 401

    def test_paginacao_respeita_per_page(self, client, app, professor, headers_aluno):
        for i in range(5):
            db.session.add(Aula(
                professor_id=professor.id,
                data=date.today() + timedelta(days=i + 1),
                horario=time(9, 0),
                duracao_min=60,
                vagas=5,
                descricao=f"Aula numero {i}",
            ))
        db.session.commit()

        res = client.get(f"{API}?per_page=2", headers=headers_aluno)
        assert res.status_code == 200
        data = res.get_json()
        assert len(data["data"]) == 2
        assert data["meta"]["total"] == 5

    def test_filtro_professor_id_retorna_so_do_professor(
        self, client, app, professor, outro_professor, headers_aluno
    ):
        db.session.add_all([
            Aula(professor_id=professor.id, data=date.today() + timedelta(days=1),
                 horario=time(9, 0), duracao_min=60, vagas=5, descricao="Aula do Carlos"),
            Aula(professor_id=outro_professor.id, data=date.today() + timedelta(days=2),
                 horario=time(10, 0), duracao_min=60, vagas=5, descricao="Aula da Ana"),
        ])
        db.session.commit()

        res = client.get(f"{API}?professor_id={professor.id}", headers=headers_aluno)
        assert res.status_code == 200
        data = res.get_json()
        assert all(a["professor"]["id"] == professor.id for a in data["data"])

    def test_filtro_com_vagas_ignora_lotadas(
        self, client, app, professor, aluno, headers_aluno
    ):
        from models import Inscricao
        lotada = Aula(professor_id=professor.id, data=date.today() + timedelta(days=1),
                      horario=time(9, 0), duracao_min=60, vagas=1, descricao="Aula lotada completa")
        livre = Aula(professor_id=professor.id, data=date.today() + timedelta(days=2),
                     horario=time(10, 0), duracao_min=60, vagas=5, descricao="Aula com vagas")
        db.session.add_all([lotada, livre])
        db.session.commit()
        db.session.add(Inscricao(aluno_id=aluno.id, aula_id=lotada.id))
        db.session.commit()

        res = client.get(f"{API}?com_vagas=true", headers=headers_aluno)
        assert res.status_code == 200
        data = res.get_json()
        descricoes = [a["descricao"] for a in data["data"]]
        assert "Aula com vagas" in descricoes
        assert "Aula lotada completa" not in descricoes


# ═══════════════════════════════════════════════════════════════
# GET /aulas/<id> (qualquer logado)
# ═══════════════════════════════════════════════════════════════

class TestDetalharAula:
    """Detalhe de uma aula — requer autenticação."""

    def test_aula_existente_retorna_200(self, client, aula, headers_aluno):
        res = client.get(f"{API}/{aula.id}", headers=headers_aluno)
        assert res.status_code == 200
        data = res.get_json()
        assert data["id"] == aula.id
        assert data["descricao"] == aula.descricao
        assert "vagas_total" in data
        assert "vagas_disponiveis" in data
        assert "professor" in data
        assert data["professor"]["nome"] == "Carlos Teste"

    def test_aula_inexistente_retorna_404(self, client, headers_aluno):
        res = client.get(f"{API}/99999", headers=headers_aluno)
        assert res.status_code == 404

    def test_sem_autenticacao_retorna_401(self, client, aula):
        res = client.get(f"{API}/{aula.id}")
        assert res.status_code == 401


# ═══════════════════════════════════════════════════════════════
# POST /aulas (só professor)
# ═══════════════════════════════════════════════════════════════

class TestCriarAula:
    """Criação de aula — só professor."""

    def _body_valido(self):
        return {
            "descricao": "Aula introdutoria de vela adaptada",
            "data": (date.today() + timedelta(days=10)).isoformat(),
            "horario": "09:00",
            "duracao_min": 90,
            "vagas": 10,
        }

    def test_professor_cria_aula_retorna_201(self, client, headers_professor):
        res = client.post(API, json=self._body_valido(), headers=headers_professor)
        assert res.status_code == 201
        data = res.get_json()
        assert data["descricao"] == "Aula introdutoria de vela adaptada"
        assert data["vagas_total"] == 10
        assert data["vagas_disponiveis"] == 10

    def test_aluno_nao_pode_criar_retorna_403(self, client, headers_aluno):
        res = client.post(API, json=self._body_valido(), headers=headers_aluno)
        assert res.status_code == 403

    def test_sem_autenticacao_retorna_401(self, client):
        res = client.post(API, json=self._body_valido())
        assert res.status_code == 401

    def test_data_no_passado_retorna_400(self, client, headers_professor):
        body = self._body_valido()
        body["data"] = (date.today() - timedelta(days=1)).isoformat()
        res = client.post(API, json=body, headers=headers_professor)
        assert res.status_code == 400

    def test_sem_data_retorna_400(self, client, headers_professor):
        body = self._body_valido()
        del body["data"]
        res = client.post(API, json=body, headers=headers_professor)
        assert res.status_code == 400

    def test_horario_invalido_retorna_400(self, client, headers_professor):
        body = self._body_valido()
        body["horario"] = "25:99"  # hora inválida
        res = client.post(API, json=body, headers=headers_professor)
        assert res.status_code == 400

    def test_vagas_zero_retorna_400(self, client, headers_professor):
        body = self._body_valido()
        body["vagas"] = 0
        res = client.post(API, json=body, headers=headers_professor)
        assert res.status_code == 400


# ═══════════════════════════════════════════════════════════════
# PUT /aulas/<id> (só professor dono)
# ═══════════════════════════════════════════════════════════════

class TestEditarAula:
    """Edição — só o professor dono pode. PUT exige body completo."""

    def _body_completo_editado(self, aula):
        """Replica os campos obrigatórios + muda os que queremos editar."""
        return {
            "descricao": "Aula editada com sucesso",
            "data": aula.data.isoformat(),
            "horario": aula.horario.strftime("%H:%M"),
            "duracao_min": aula.duracao_min,
            "vagas": 15,  # mudado
        }

    def test_dono_edita_com_sucesso(self, client, aula, headers_professor):
        res = client.put(
            f"{API}/{aula.id}",
            json=self._body_completo_editado(aula),
            headers=headers_professor,
        )
        assert res.status_code == 200
        data = res.get_json()
        assert data["descricao"] == "Aula editada com sucesso"
        assert data["vagas_total"] == 15

    def test_outro_professor_nao_pode_editar_retorna_403(
        self, client, aula, outro_professor
    ):
        res_login = client.post("/api/v1/auth/login", json={
            "email": outro_professor.email,
            "senha": "Senha123!",
        })
        token = res_login.get_json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = client.put(
            f"{API}/{aula.id}",
            json=self._body_completo_editado(aula),
            headers=headers,
        )
        assert res.status_code == 403

    def test_aluno_nao_pode_editar_retorna_403(self, client, aula, headers_aluno):
        res = client.put(
            f"{API}/{aula.id}",
            json=self._body_completo_editado(aula),
            headers=headers_aluno,
        )
        assert res.status_code == 403

    def test_sem_auth_retorna_401(self, client, aula):
        res = client.put(f"{API}/{aula.id}", json=self._body_completo_editado(aula))
        assert res.status_code == 401

    def test_aula_inexistente_retorna_404(self, client, aula, headers_professor):
        # usa o body da fixture `aula` só pra ter campos válidos
        res = client.put(
            f"{API}/99999",
            json=self._body_completo_editado(aula),
            headers=headers_professor,
        )
        assert res.status_code == 404


# ═══════════════════════════════════════════════════════════════
# DELETE /aulas/<id> (só professor dono)
# ═══════════════════════════════════════════════════════════════

class TestDeletarAula:
    """Exclusão — só o professor dono pode."""

    def test_dono_deleta_com_sucesso(self, client, aula, headers_professor):
        res = client.delete(f"{API}/{aula.id}", headers=headers_professor)
        assert res.status_code in (200, 204)

        # Confirma que sumiu (precisa de auth pra GET também)
        res2 = client.get(f"{API}/{aula.id}", headers=headers_professor)
        assert res2.status_code == 404

    def test_outro_professor_nao_pode_deletar(self, client, aula, outro_professor):
        res_login = client.post("/api/v1/auth/login", json={
            "email": outro_professor.email,
            "senha": "Senha123!",
        })
        token = res_login.get_json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = client.delete(f"{API}/{aula.id}", headers=headers)
        assert res.status_code == 403

    def test_aluno_nao_pode_deletar(self, client, aula, headers_aluno):
        res = client.delete(f"{API}/{aula.id}", headers=headers_aluno)
        assert res.status_code == 403

    def test_sem_auth_retorna_401(self, client, aula):
        res = client.delete(f"{API}/{aula.id}")
        assert res.status_code == 401


# ═══════════════════════════════════════════════════════════════
# GET /aulas/<id>/inscricoes (só professor)
# ═══════════════════════════════════════════════════════════════

class TestListarInscricoesDaAula:
    """Professor vê lista de alunos inscritos na aula."""

    def test_professor_ve_lista_de_inscritos(
        self, client, app, aula, aluno, outro_aluno, headers_professor
    ):
        from models import Inscricao
        db.session.add_all([
            Inscricao(aluno_id=aluno.id, aula_id=aula.id),
            Inscricao(aluno_id=outro_aluno.id, aula_id=aula.id),
        ])
        db.session.commit()

        res = client.get(f"{API}/{aula.id}/inscricoes", headers=headers_professor)
        assert res.status_code == 200
        data = res.get_json()
        assert "data" in data
        assert len(data["data"]) == 2

    def test_aluno_nao_ve_lista_retorna_403(self, client, aula, headers_aluno):
        res = client.get(f"{API}/{aula.id}/inscricoes", headers=headers_aluno)
        assert res.status_code == 403