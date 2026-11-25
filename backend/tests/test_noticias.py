"""
Testes de /api/v1/noticias/*
Cobre: listar (público), detalhe (público), criar/editar/excluir (professor).
"""
import pytest

from extensions import db
from models import Noticia


API = "/api/v1/noticias"


# ═══════════════════════════════════════════════════════════════
# GET /noticias (público — não precisa JWT)
# ═══════════════════════════════════════════════════════════════

class TestListarNoticias:
    """Lista pública de notícias (usada na landing)."""

    def test_lista_publica_retorna_200(self, client, noticia):
        res = client.get(API)
        assert res.status_code == 200
        data = res.get_json()
        assert "data" in data
        assert "meta" in data
        assert len(data["data"]) >= 1

    def test_paginacao_respeita_per_page(self, client, app):
        for i in range(5):
            db.session.add(Noticia(
                titulo=f"Noticia numero {i} com titulo",
                conteudo=f"Conteudo da noticia {i} com mais de vinte caracteres garantidos",
                imagem=None,
            ))
        db.session.commit()
        res = client.get(f"{API}?per_page=2")
        data = res.get_json()
        assert len(data["data"]) == 2
        assert data["meta"]["total"] == 5

    def test_filtro_q_busca_no_titulo(self, client, app):
        db.session.add_all([
            Noticia(titulo="Regata Copa BRB 2026", conteudo="Primeira " + "x" * 30),
            Noticia(titulo="Outra noticia sobre vela", conteudo="Segunda " + "y" * 30),
        ])
        db.session.commit()
        res = client.get(f"{API}?q=regata")
        data = res.get_json()
        assert len(data["data"]) == 1
        assert "Regata" in data["data"][0]["titulo"]

    def test_listagem_usa_schema_resumido(self, client, noticia):
        res = client.get(API)
        n = res.get_json()["data"][0]
        assert "resumo" in n
        assert "titulo" in n


# ═══════════════════════════════════════════════════════════════
# GET /noticias/<id> (público — conteúdo completo)
# ═══════════════════════════════════════════════════════════════

class TestDetalharNoticia:
    """Detalhe retorna conteúdo completo (NoticiaDetailSchema)."""

    def test_existente_retorna_200_com_conteudo(self, client, noticia):
        res = client.get(f"{API}/{noticia.id}")
        assert res.status_code == 200
        data = res.get_json()
        assert data["id"] == noticia.id
        assert data["titulo"] == noticia.titulo
        assert "conteudo" in data

    def test_inexistente_retorna_404(self, client):
        res = client.get(f"{API}/99999")
        assert res.status_code == 404


# ═══════════════════════════════════════════════════════════════
# POST /noticias (professor)
# ═══════════════════════════════════════════════════════════════

class TestCriarNoticia:
    """Só professor pode criar notícia."""

    def _body_valido(self):
        return {
            "titulo": "Novo evento de vela adaptada em Brasilia",
            "conteudo": "Conteudo da noticia com pelo menos vinte caracteres aqui",
            "imagem": "/assets/img/noticia-1.jpg",
        }

    def test_professor_cria_retorna_201(self, client, headers_professor):
        res = client.post(API, json=self._body_valido(), headers=headers_professor)
        assert res.status_code == 201
        data = res.get_json()
        assert "Novo evento" in data["titulo"]

    def test_aluno_nao_pode_criar_retorna_403(self, client, headers_aluno):
        res = client.post(API, json=self._body_valido(), headers=headers_aluno)
        assert res.status_code == 403

    def test_sem_auth_retorna_401(self, client):
        res = client.post(API, json=self._body_valido())
        assert res.status_code == 401

    def test_titulo_curto_retorna_400(self, client, headers_professor):
        body = self._body_valido()
        body["titulo"] = "abc"  # min 5
        res = client.post(API, json=body, headers=headers_professor)
        assert res.status_code == 400

    def test_conteudo_curto_retorna_400(self, client, headers_professor):
        body = self._body_valido()
        body["conteudo"] = "curto"  # min 20
        res = client.post(API, json=body, headers=headers_professor)
        assert res.status_code == 400


# ═══════════════════════════════════════════════════════════════
# PUT /noticias/<id> (professor)
# ═══════════════════════════════════════════════════════════════

class TestEditarNoticia:
    """Só professor pode editar notícia."""

    def test_professor_edita_retorna_200(self, client, noticia, headers_professor):
        res = client.put(f"{API}/{noticia.id}", json={
            "titulo": "Titulo editado agora",
            "conteudo": "Novo conteudo com pelo menos vinte caracteres garantidos",
            "imagem": noticia.imagem,
        }, headers=headers_professor)
        assert res.status_code == 200

    def test_aluno_nao_pode_editar_retorna_403(self, client, noticia, headers_aluno):
        res = client.put(f"{API}/{noticia.id}", json={
            "titulo": "Tentativa de hack",
            "conteudo": "conteudo com mais de vinte caracteres aqui ok",
        }, headers=headers_aluno)
        assert res.status_code == 403

    def test_sem_auth_retorna_401(self, client, noticia):
        res = client.put(f"{API}/{noticia.id}", json={"titulo": "x" * 10})
        assert res.status_code == 401

    def test_inexistente_retorna_404(self, client, headers_professor):
        res = client.put(f"{API}/99999", json={
            "titulo": "Titulo qualquer",
            "conteudo": "Conteudo com mais de vinte caracteres aqui",
        }, headers=headers_professor)
        assert res.status_code == 404


# ═══════════════════════════════════════════════════════════════
# DELETE /noticias/<id> (professor)
# ═══════════════════════════════════════════════════════════════

class TestDeletarNoticia:
    """Só professor pode deletar notícia."""

    def test_professor_deleta_retorna_200_ou_204(self, client, noticia, headers_professor):
        res = client.delete(f"{API}/{noticia.id}", headers=headers_professor)
        assert res.status_code in (200, 204)

        # Confirma que sumiu
        res2 = client.get(f"{API}/{noticia.id}")
        assert res2.status_code == 404

    def test_aluno_nao_pode_deletar_retorna_403(self, client, noticia, headers_aluno):
        res = client.delete(f"{API}/{noticia.id}", headers=headers_aluno)
        assert res.status_code == 403

    def test_sem_auth_retorna_401(self, client, noticia):
        res = client.delete(f"{API}/{noticia.id}")
        assert res.status_code == 401