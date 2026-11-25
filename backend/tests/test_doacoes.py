"""
Testes de /api/v1/doacoes/*
Cobre: criar (público), listar (professor) com filtro + resumo agregado.
"""
from decimal import Decimal

import pytest

from extensions import db
from models import Doacao


API = "/api/v1/doacoes"


# ═══════════════════════════════════════════════════════════════
# POST /doacoes (público)
# ═══════════════════════════════════════════════════════════════

class TestCriarDoacao:
    """Doação é pública — qualquer um pode doar."""

    def _body_valido(self):
        return {
            "nome_doador": "Doador Novo",
            "valor": 100.50,
            "forma_pagamento": "pix",
        }

    def test_doacao_publica_retorna_201(self, client):
        res = client.post(API, json=self._body_valido())
        assert res.status_code == 201

    def test_valor_negativo_retorna_400(self, client):
        body = self._body_valido()
        body["valor"] = -10
        res = client.post(API, json=body)
        assert res.status_code == 400

    def test_valor_zero_retorna_400(self, client):
        body = self._body_valido()
        body["valor"] = 0
        res = client.post(API, json=body)
        assert res.status_code == 400

    def test_forma_pagamento_invalida_retorna_400(self, client):
        body = self._body_valido()
        body["forma_pagamento"] = "bitcoin"
        res = client.post(API, json=body)
        assert res.status_code == 400

    def test_aceita_pix(self, client):
        res = client.post(API, json={
            "nome_doador": "Doador PIX",
            "valor": 50,
            "forma_pagamento": "pix",
        })
        assert res.status_code == 201

    def test_aceita_transferencia(self, client):
        res = client.post(API, json={
            "nome_doador": "Doador Transf",
            "valor": 50,
            "forma_pagamento": "transferencia",
        })
        assert res.status_code == 201

    def test_aceita_paypal(self, client):
        res = client.post(API, json={
            "nome_doador": "Doador PayPal",
            "valor": 50,
            "forma_pagamento": "paypal",
        })
        assert res.status_code == 201


# ═══════════════════════════════════════════════════════════════
# GET /doacoes (professor)
# ═══════════════════════════════════════════════════════════════

class TestListarDoacoes:
    """Lista admin — só professor vê, com resumo agregado."""

    def test_professor_ve_lista_com_resumo(self, client, doacao, headers_professor):
        res = client.get(API, headers=headers_professor)
        assert res.status_code == 200
        data = res.get_json()
        assert "data" in data
        assert "meta" in data
        assert "resumo" in data
        assert "total_arrecadado" in data["resumo"]
        assert "total_doacoes" in data["resumo"]

    def test_aluno_nao_ve_doacoes_retorna_403(self, client, doacao, headers_aluno):
        res = client.get(API, headers=headers_aluno)
        assert res.status_code == 403

    def test_sem_auth_retorna_401(self, client, doacao):
        res = client.get(API)
        assert res.status_code == 401

    def test_filtro_forma_pagamento(self, client, app, headers_professor):
        db.session.add_all([
            Doacao(nome_doador="A", valor=Decimal("10"), forma_pagamento="pix"),
            Doacao(nome_doador="B", valor=Decimal("20"), forma_pagamento="pix"),
            Doacao(nome_doador="C", valor=Decimal("30"), forma_pagamento="paypal"),
        ])
        db.session.commit()

        res = client.get(f"{API}?forma_pagamento=pix", headers=headers_professor)
        data = res.get_json()
        assert all(d["forma_pagamento"] == "pix" for d in data["data"])

    def test_resumo_calcula_total_corretamente(self, client, app, headers_professor):
        db.session.add_all([
            Doacao(nome_doador="A", valor=Decimal("100"), forma_pagamento="pix"),
            Doacao(nome_doador="B", valor=Decimal("200"), forma_pagamento="pix"),
        ])
        db.session.commit()

        res = client.get(API, headers=headers_professor)
        data = res.get_json()
        assert float(data["resumo"]["total_arrecadado"]) == 300.0
        assert data["resumo"]["total_doacoes"] == 2