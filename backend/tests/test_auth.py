"""
Testes de /api/v1/auth/*
Cobre: register, login, refresh, logout, me, esqueci-senha, redefinir-senha.
"""
import pytest

API = "/api/v1/auth"


# ═══════════════════════════════════════════════════════════════
# POST /auth/register
# ═══════════════════════════════════════════════════════════════

class TestRegister:
    """Cadastro público de novo usuário."""

    def test_cadastro_com_dados_validos_retorna_201(self, client):
        res = client.post(f"{API}/register", json={
            "nome": "Novo Usuario",
            "email": "novo@teste.com",
            "senha": "Senha123!",
            "data_nascimento": "2000-01-15",
            "papel": "aluno",
        })
        assert res.status_code == 201
        data = res.get_json()
        assert "usuario" in data
        assert data["usuario"]["email"] == "novo@teste.com"
        assert data["usuario"]["papel"] == "aluno"
        assert "senha" not in data["usuario"]
        assert "senha_hash" not in data["usuario"]

    def test_cadastro_com_email_duplicado_retorna_409(self, client, professor):
        res = client.post(f"{API}/register", json={
            "nome": "Outro Carlos",
            "email": professor.email,  # já existe
            "senha": "Senha123!",
            "data_nascimento": "1990-01-01",
            "papel": "aluno",
        })
        assert res.status_code == 409
        assert "mail" in res.get_json()["error"].lower()

    def test_cadastro_com_senha_curta_retorna_400(self, client):
        res = client.post(f"{API}/register", json={
            "nome": "Teste",
            "email": "teste@email.com",
            "senha": "abc1",  # muito curta
            "data_nascimento": "2000-01-01",
            "papel": "aluno",
        })
        assert res.status_code == 400
        assert "details" in res.get_json()

    def test_cadastro_de_menor_de_14_retorna_400(self, client):
        from datetime import date, timedelta
        data_recente = (date.today() - timedelta(days=365 * 10)).isoformat()
        res = client.post(f"{API}/register", json={
            "nome": "Menor",
            "email": "menor@teste.com",
            "senha": "Senha123!",
            "data_nascimento": data_recente,
            "papel": "aluno",
        })
        assert res.status_code == 400

    def test_cadastro_com_papel_invalido_retorna_400(self, client):
        res = client.post(f"{API}/register", json={
            "nome": "Teste",
            "email": "teste2@email.com",
            "senha": "Senha123!",
            "data_nascimento": "2000-01-01",
            "papel": "admin",  # não existe
        })
        assert res.status_code == 400


# ═══════════════════════════════════════════════════════════════
# POST /auth/login
# ═══════════════════════════════════════════════════════════════

class TestLogin:
    """Login com e-mail/senha."""

    def test_login_com_credenciais_corretas_retorna_tokens(self, client, professor):
        res = client.post(f"{API}/login", json={
            "email": professor.email,
            "senha": "Senha123!",
        })
        assert res.status_code == 200
        data = res.get_json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "usuario" in data
        assert data["usuario"]["email"] == professor.email
        assert data["usuario"]["papel"] == "professor"

    def test_login_com_email_inexistente_retorna_401(self, client):
        res = client.post(f"{API}/login", json={
            "email": "naoexiste@teste.com",
            "senha": "Senha123!",
        })
        assert res.status_code == 401

    def test_login_com_senha_errada_retorna_401(self, client, professor):
        res = client.post(f"{API}/login", json={
            "email": professor.email,
            "senha": "SenhaErrada!",
        })
        assert res.status_code == 401

    def test_login_sem_body_retorna_400(self, client):
        res = client.post(f"{API}/login", json={})
        assert res.status_code == 400


# ═══════════════════════════════════════════════════════════════
# POST /auth/refresh
# ═══════════════════════════════════════════════════════════════

class TestRefresh:
    """Renovar access_token com refresh_token."""

    def test_refresh_com_token_valido_retorna_novo_access(self, client, tokens_professor):
        headers = {"Authorization": f"Bearer {tokens_professor['refresh_token']}"}
        res = client.post(f"{API}/refresh", headers=headers)
        assert res.status_code == 200
        assert "access_token" in res.get_json()

    def test_refresh_com_access_token_falha(self, client, tokens_professor):
        # Usar access_token no lugar de refresh deve falhar
        headers = {"Authorization": f"Bearer {tokens_professor['access_token']}"}
        res = client.post(f"{API}/refresh", headers=headers)
        assert res.status_code == 422  # wrong token type


# ═══════════════════════════════════════════════════════════════
# GET /auth/me
# ═══════════════════════════════════════════════════════════════

class TestMe:
    """Retorna dados do usuário logado."""

    def test_me_com_token_valido_retorna_usuario(self, client, headers_professor, professor):
        res = client.get(f"{API}/me", headers=headers_professor)
        assert res.status_code == 200
        data = res.get_json()
        assert data["email"] == professor.email
        assert data["papel"] == "professor"

    def test_me_sem_token_retorna_401(self, client):
        res = client.get(f"{API}/me")
        assert res.status_code == 401


# ═══════════════════════════════════════════════════════════════
# POST /auth/logout
# ═══════════════════════════════════════════════════════════════

class TestLogout:
    """Logout adiciona token ao blocklist."""

    def test_logout_invalida_access_token(self, client, headers_professor):
        res = client.post(f"{API}/logout", headers=headers_professor)
        assert res.status_code == 200

        # Tentar usar o mesmo token depois do logout deve falhar
        res2 = client.get(f"{API}/me", headers=headers_professor)
        assert res2.status_code == 401

    def test_logout_sem_token_retorna_401(self, client):
        res = client.post(f"{API}/logout")
        assert res.status_code == 401


# ═══════════════════════════════════════════════════════════════
# POST /auth/esqueci-senha (resposta genérica por segurança)
# ═══════════════════════════════════════════════════════════════

class TestEsqueciSenha:
    """Fluxo esqueci-senha — resposta sempre 200 pra evitar enumeração."""

    def test_email_existente_retorna_200(self, client, professor):
        res = client.post(f"{API}/esqueci-senha", json={"email": professor.email})
        assert res.status_code == 200

    def test_email_inexistente_tambem_retorna_200(self, client):
        """Comportamento proposital — não revela se e-mail existe."""
        res = client.post(f"{API}/esqueci-senha", json={"email": "ninguem@teste.com"})
        assert res.status_code == 200

    def test_email_invalido_retorna_400(self, client):
        res = client.post(f"{API}/esqueci-senha", json={"email": "nao-e-email"})
        assert res.status_code == 400


# ═══════════════════════════════════════════════════════════════
# POST /auth/redefinir-senha
# ═══════════════════════════════════════════════════════════════

class TestRedefinirSenha:
    """Redefinir senha com token temporário de reset."""

    def _gerar_token_reset(self, app, usuario_id):
        """Helper: gera um token JWT com claim type=password_reset."""
        from datetime import timedelta

        from flask_jwt_extended import create_access_token
        with app.app_context():
            return create_access_token(
                identity=str(usuario_id),
                additional_claims={"type": "password_reset"},
                expires_delta=timedelta(hours=1),
            )

    def test_redefinir_com_token_valido_atualiza_senha(self, client, app, professor):
        token = self._gerar_token_reset(app, professor.id)
        res = client.post(f"{API}/redefinir-senha", json={
            "token": token,
            "nova_senha": "NovaSenha456!",
        })
        assert res.status_code == 200

        # Verifica que a nova senha funciona
        res2 = client.post(f"{API}/login", json={
            "email": professor.email,
            "senha": "NovaSenha456!",
        })
        assert res2.status_code == 200

    def test_redefinir_com_token_invalido_retorna_401(self, client):
        res = client.post(f"{API}/redefinir-senha", json={
            "token": "token.falso.aqui",
            "nova_senha": "Senha123!",
        })
        assert res.status_code in (400, 401, 422)

    def test_redefinir_com_senha_curta_retorna_400(self, client, app, professor):
        token = self._gerar_token_reset(app, professor.id)
        res = client.post(f"{API}/redefinir-senha", json={
            "token": token,
            "nova_senha": "abc",
        })
        assert res.status_code == 400
