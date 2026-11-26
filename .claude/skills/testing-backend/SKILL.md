---
name: testing-backend
description: Suite de testes pytest do backend Flask do Projeto Vela Para Todos — 140 testes com 93,8% de cobertura. Use ao escrever ou debugar teste de backend, adicionar fixture, ajustar conftest.py, configurar pytest.ini ou .coveragerc, rodar pytest localmente ou interpretar relatório HTML. Cobre estrutura dos arquivos de teste, fixtures disponíveis (app, client, professor, aluno, headers, aulas, etc.), TestingConfig, coverage por módulo, e comandos pra rodar subconjuntos.
---

# Testes do Backend (pytest)

> **Status:** 140 testes, 93,8% cobertura 🏆
> Setup com pytest + pytest-cov + pytest-flask. Banco SQLite in-memory, app Flask fresca por teste.

---

## Como rodar

```powershell
cd C:\dev\a3-vela\backend
.\venv\Scripts\Activate.ps1

pytest                                          # todos com cobertura
pytest tests/test_auth.py -v                    # um arquivo
pytest tests/test_auth.py::TestLogin -v         # uma classe
pytest tests/test_auth.py::TestLogin::test_X    # um teste
pytest -k "login" -v                            # por keyword
pytest --lf                                     # só os que falharam da última vez
start htmlcov/index.html                        # abrir relatório HTML
```

---

## Estrutura

```
backend/tests/
├── __init__.py
├── conftest.py            # fixtures compartilhadas
├── test_auth.py           # 21 testes
├── test_aulas.py          # 26 testes
├── test_inscricoes.py     # 14 testes
├── test_noticias.py       # 18 testes
├── test_doacoes.py        # 12 testes
├── test_voluntarios.py    # 13 testes
├── test_usuarios.py       # 21 testes
├── test_dashboard.py      # 5 testes
└── test_relatorios.py     # 10 testes
```

---

## Fixtures em `conftest.py`

| Fixture | Uso |
|---|---|
| `app` | App Flask em modo testing, banco in-memory, fresca por teste |
| `client` | Test client HTTP |
| `professor`, `outro_professor` | Usuários professor |
| `aluno`, `outro_aluno` | Usuários aluno |
| `headers_professor`, `headers_aluno` | Dict `Authorization: Bearer <token>` pronto |
| `tokens_professor` | Dict completo com access/refresh/usuario |
| `aula` | Aula futura com 10 vagas |
| `aula_lotada` | Aula com só 1 vaga |
| `noticia`, `doacao`, `voluntario` | Objetos prontos no banco |

### Exemplo de uso típico

```python
def test_criar_aula_como_professor(client, headers_professor):
    res = client.post("/api/v1/aulas", headers=headers_professor, json={
        "data": "2030-01-01",
        "horario": "14:00",
        "duracao_min": 90,
        "vagas": 8,
        "descricao": "Aula de teste"
    })
    assert res.status_code == 201
    assert res.json["descricao"] == "Aula de teste"
```

---

## TestingConfig

```python
class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-key-com-pelo-menos-32-bytes-pra-silenciar-warning"
    WTF_CSRF_ENABLED = False
    RATELIMIT_ENABLED = False      # CRÍTICO — sem isso, testes batem em 429
```

⚠️ **Nunca remover** `RATELIMIT_ENABLED = False` — pytest faz múltiplos logins em sequência.

---

## pytest.ini

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    --strict-markers
    --tb=short
    --cov=.
    --cov-report=term-missing
    --cov-report=html
    --cov-fail-under=80
```

---

## .coveragerc

```ini
[run]
omit =
    tests/*
    venv/*
    .venv/*
    migrations/*
    seed.py
    */conftest.py

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise NotImplementedError
    if __name__ == .__main__.:
```

---

## Coverage por módulo (snapshot atual)

```
Name                           Stmts   Miss  Cover
--------------------------------------------------
app.py                            53     10  81.1%
config.py                         41      3  92.7%
models/*                          98      5  94.9%
routes/aulas.py                   88      6  93.2%
routes/auth.py                   101      5  95.0%
routes/dashboard.py               41      1  97.6%
routes/doacoes.py                 42      2  95.2%
routes/inscricoes.py              77      6  92.2%
routes/noticias.py                62      3  95.2%
routes/relatorios.py              43      3  93.0%
routes/usuarios.py                91     12  86.8%
routes/voluntarios.py             46      0 100.0%
schemas/*                        159     14  91.2%
services/pdf_relatorio.py         84      2  97.6%
utils/*                           24      0 100.0%
--------------------------------------------------
TOTAL                           1071     66  93.8%
```

---

## Padrões de teste adotados

### Organização por classe de comportamento

```python
class TestCriarAula:
    def test_professor_pode_criar(self, ...): ...
    def test_aluno_nao_pode_criar(self, ...): ...
    def test_sem_autenticacao_retorna_401(self, ...): ...
    def test_data_passada_retorna_400(self, ...): ...
```

### Asserts flexíveis pra códigos de validação

```python
# Validações de negócio podem retornar 400, 404, 409 ou 422
assert res.status_code in (400, 409, 422)
```

### Verificar shape de resposta

```python
assert "data" in res.json
assert "meta" in res.json
assert res.json["meta"]["page"] == 1
```

### Isolamento com fixtures fresca por teste

O fixture `app` recria o banco in-memory a cada teste — não há vazamento de estado entre testes.

---

## CI (GitHub Actions)

```yaml
- name: Backend Tests
  run: |
    cd backend
    pip install -r requirements.txt
    pytest --cov-fail-under=80
  env:
    FLASK_ENV: testing
    SECRET_KEY: ci-secret-key-only-for-tests-not-production
    JWT_SECRET_KEY: ci-jwt-secret-key-at-least-32-bytes-long-for-ci
```

CI barra merge se cobertura cair abaixo de 80%.

---

## Como adicionar um teste novo

1. Identificar o arquivo certo (ex: `test_aulas.py` pra endpoint de aulas)
2. Verificar se já existe uma classe pra esse comportamento; senão criar
3. Usar fixtures existentes (`client`, `headers_professor`, `aula` etc.)
4. Nomear o teste descritivamente: `test_professor_pode_deletar_propria_aula`
5. Rodar `pytest tests/test_aulas.py -v` pra confirmar
6. Rodar `pytest` completo pra ver se a cobertura não caiu
7. Se adicionou nova linha sem cobertura, considerar outro teste

---

## 📚 Skills relacionados

- `/pegadinhas-backend` — RATELIMIT_ENABLED, os.environ em classes
- `/api-reference` — shapes e validações pra assertar
- `/deploy` — CI/CD GitHub Actions
