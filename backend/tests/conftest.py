"""
Fixtures compartilhadas pros testes do backend.
Banco SQLite in-memory + Flask test client — isolamento total por teste.
"""
import os
# IMPORTANTE: setar ambiente ANTES de importar create_app
os.environ["FLASK_ENV"] = "testing"

from datetime import date, time, timedelta
from decimal import Decimal

import pytest

from app import create_app
from extensions import db as _db
from models import Usuario, Aula, Inscricao, Noticia, Doacao, Voluntario


# ═══════════════════════════════════════════════════════════════
# Fixtures base — app, db, client
# ═══════════════════════════════════════════════════════════════

@pytest.fixture
def app():
    """
    App Flask fresca por teste (isolamento total).
    SQLite in-memory é criado/destruído junto com o app.
    """
    app = create_app("testing")
    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    """Test client HTTP do Flask."""
    return app.test_client()


# ═══════════════════════════════════════════════════════════════
# Fixtures de usuários — prontos no banco
# ═══════════════════════════════════════════════════════════════

@pytest.fixture
def professor(app):
    """Usuário professor pronto no banco. Senha: Senha123!"""
    u = Usuario(
        nome="Carlos Teste",
        email="prof@teste.com",
        data_nascimento=date(1985, 3, 20),
        papel="professor",
    )
    u.set_senha("Senha123!")
    _db.session.add(u)
    _db.session.commit()
    return u


@pytest.fixture
def outro_professor(app):
    """Segundo professor, pra testar permissões entre professores."""
    u = Usuario(
        nome="Ana Prof",
        email="ana@teste.com",
        data_nascimento=date(1990, 1, 1),
        papel="professor",
    )
    u.set_senha("Senha123!")
    _db.session.add(u)
    _db.session.commit()
    return u


@pytest.fixture
def aluno(app):
    """Usuário aluno pronto no banco. Senha: Senha123!"""
    u = Usuario(
        nome="Maria Aluno",
        email="aluno@teste.com",
        data_nascimento=date(2000, 1, 1),
        papel="aluno",
    )
    u.set_senha("Senha123!")
    _db.session.add(u)
    _db.session.commit()
    return u


@pytest.fixture
def outro_aluno(app):
    """Segundo aluno, pra testar inscrições concorrentes."""
    u = Usuario(
        nome="João Aluno",
        email="joao@teste.com",
        data_nascimento=date(2001, 5, 15),
        papel="aluno",
    )
    u.set_senha("Senha123!")
    _db.session.add(u)
    _db.session.commit()
    return u


# ═══════════════════════════════════════════════════════════════
# Fixtures de autenticação — headers JWT prontos
# ═══════════════════════════════════════════════════════════════

def _fazer_login(client, email, senha="Senha123!"):
    """Helper interno — faz login e retorna dict com tokens."""
    res = client.post("/api/v1/auth/login", json={"email": email, "senha": senha})
    assert res.status_code == 200, f"Login falhou: {res.get_json()}"
    return res.get_json()


@pytest.fixture
def headers_professor(client, professor):
    """Header Authorization: Bearer <access_token> do professor."""
    data = _fazer_login(client, professor.email)
    return {"Authorization": f"Bearer {data['access_token']}"}


@pytest.fixture
def headers_aluno(client, aluno):
    """Header Authorization: Bearer <access_token> do aluno."""
    data = _fazer_login(client, aluno.email)
    return {"Authorization": f"Bearer {data['access_token']}"}


@pytest.fixture
def tokens_professor(client, professor):
    """Dict completo com access_token, refresh_token, usuario."""
    return _fazer_login(client, professor.email)


# ═══════════════════════════════════════════════════════════════
# Fixtures de dados — aulas, notícias, doações, voluntários
# ═══════════════════════════════════════════════════════════════

@pytest.fixture
def aula(app, professor):
    """Aula futura (7 dias à frente) com 10 vagas."""
    a = Aula(
        professor_id=professor.id,
        data=date.today() + timedelta(days=7),
        horario=time(9, 0),
        duracao_min=90,
        vagas=10,
        descricao="Aula teste de vela",
    )
    _db.session.add(a)
    _db.session.commit()
    return a


@pytest.fixture
def aula_lotada(app, professor):
    """Aula com apenas 1 vaga total — útil pra testar inscrição cheia."""
    a = Aula(
        professor_id=professor.id,
        data=date.today() + timedelta(days=5),
        horario=time(14, 0),
        duracao_min=60,
        vagas=1,
        descricao="Aula com 1 vaga só",
    )
    _db.session.add(a)
    _db.session.commit()
    return a


@pytest.fixture
def noticia(app):
    """Notícia pronta no banco."""
    n = Noticia(
        titulo="Notícia de teste válida",
        conteudo="Conteúdo longo o suficiente pra passar nas validações da Marshmallow",
        imagem="/assets/img/noticia-1.jpg",
    )
    _db.session.add(n)
    _db.session.commit()
    return n


@pytest.fixture
def doacao(app):
    """Doação pronta no banco."""
    d = Doacao(
        nome_doador="Doador Teste",
        valor=Decimal("100.00"),
        forma_pagamento="pix",
    )
    _db.session.add(d)
    _db.session.commit()
    return d


@pytest.fixture
def voluntario(app):
    """Voluntário pendente pronto no banco."""
    v = Voluntario(
        nome="Voluntário Teste",
        email="volunt@teste.com",
        mensagem="Mensagem de inscrição longa o suficiente pra validação",
        status="pendente",
    )
    _db.session.add(v)
    _db.session.commit()
    return v