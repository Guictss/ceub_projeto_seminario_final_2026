---
name: pegadinhas-backend
description: Armadilhas conhecidas do backend Flask do Projeto Vela Para Todos. Use quando encontrar erro no backend, deploy no Render falhando, ao alterar config.py, ao escrever queries SQLAlchemy, mexer em rate limiter, trabalhar com imports em CI, atualizar requirements.txt, ou lidar com o shape diferente do /usuarios. Inclui CORS, psycopg driver explícito, os.environ em classes, SQLAlchemy 2.x breaking changes, PUT /aulas exige body completo, RATELIMIT_ENABLED em dev/test.
---

# Pegadinhas do Backend — NÃO REPETIR

> Erros que já pegamos no backend, com o fix pronto. Antes de mexer em `config.py`,
> `extensions.py`, `routes/` ou `requirements.txt`, dá uma lida aqui.

---

## Config e ambiente

### `os.environ["X"]` em atributo de classe quebra import no CI

Python avalia atributos de classe no momento da **definição** (import), não da instância. Se `ProductionConfig` tem `SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]`, o import de `config.py` quebra em ambientes sem essa var (CI, dev sem `.env`), **mesmo rodando em `FLASK_ENV=testing`**.

**Fix:** usar `os.environ.get("X", "")`.

```python
# ❌ ERRADO — quebra o CI
class ProductionConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]

# ✅ CERTO
class ProductionConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = _normalizar_database_url(os.environ.get("DATABASE_URL", ""))
```

### `TestingConfig` e `DevelopmentConfig` precisam desativar rate limiter

Sem `RATELIMIT_ENABLED = False`, pytest e Cypress (que fazem múltiplos logins em sequência) batem em 429. Em `ProductionConfig` fica ativo, protege real.

```python
class DevelopmentConfig(BaseConfig):
    # ...
    RATELIMIT_ENABLED = False

class TestingConfig(BaseConfig):
    # ...
    RATELIMIT_ENABLED = False
```

### Flask lê `.env` só no boot

Qualquer mudança exige `Ctrl+C` + `python app.py`. Não existe hot-reload de env vars.

### CORS precisa incluir a porta do Vite

`.env` do backend:
```
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```
Mudanças exigem **reiniciar o Flask**.

---

## Deploy / dependências

### Deploy no Render exige driver psycopg2 explícito

SQLAlchemy 2+ tenta usar `psycopg` v3 por default, mas `requirements.txt` instala `psycopg2-binary`. Sem fix, o backend sobe com erro "No module named 'psycopg'".

**Fix em `config.py`:**

```python
def _normalizar_database_url(url: str) -> str:
    if not url:
        return url
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    if url.startswith("postgresql://") and "+psycopg" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url
```

Usar em `ProductionConfig`:
```python
SQLALCHEMY_DATABASE_URI = _normalizar_database_url(os.environ.get("DATABASE_URL", ""))
```

### `python-dateutil` precisa estar explícito no requirements.txt

Funciona local porque chega "de carona" com outra lib, mas no Render não. **Toda `import` direta TEM que estar declarada.** Mesma lógica vale pra qualquer dependência implícita que vire explícita em algum import novo.

### `.env.example` vs `env.example` (sem ponto)

Windows/VS Code pode salvar o arquivo sem o ponto inicial. O arquivo tem que ter o ponto, senão o git não trata como dotfile padrão.

---

## SQLAlchemy 2.x breaking changes

### Não aceita strings em `joinedload`

```python
# ❌ ERRADO
Inscricao.query.options(joinedload("aluno")).all()

# ✅ CERTO
Inscricao.query.options(joinedload(Inscricao.aluno)).all()
```

`Query.unique()` não existe no legacy Query — joinedload de coleção já deduplica.

### `Usuario.query.get()` gera LegacyAPIWarning

Deprecated no SQLAlchemy 2.x.

```python
# ⚠️ Deprecated (ainda funciona, mas gera warning)
Usuario.query.get(42)

# ✅ Recomendado
db.session.get(Usuario, 42)
```

Não afeta funcionamento, só gera warning no log.

---

## Endpoints — surpresas

### `/aulas` exige autenticação (todos os métodos)

Mesmo os GET retornam 401 sem JWT. Qualquer usuário autenticado (aluno ou professor) pode listar e ver detalhes; só professor pode criar/editar/deletar.

### `PUT /aulas/<id>` exige body COMPLETO (não aceita update parcial)

Precisa enviar todos os campos obrigatórios (`descricao`, `data`, `horario`, `duracao_min`, `vagas`). Se mandar só `{descricao: "x"}`, retorna 400.

### `/usuarios` usa paginação DIFERENTE do resto do projeto

- `/usuarios` → `{items: [...], page, pages, per_page}`
- Resto → `{data: [...], meta: {page, per_page, total, total_pages}}`

Padronizar algum dia. Enquanto isso não é feito, código consumindo `/usuarios` precisa usar `items`.

### Endpoint de inscrição em aula

É `POST /inscricoes` com body `{aula_id}`, **NÃO** `POST /aulas/<id>/inscricoes` (esse retorna 405).

### Validações da API às vezes retornam 422 em vez de 400

Regras de negócio podem devolver 400, 404, 409 OU 422. Nos testes:
```python
assert res.status_code in (400, 404, 409, 422)
```

### Backend pode não ter filtros documentados

**Sempre checar o blueprint antes de assumir que filtro existe.** O `openapi.yaml` pode estar desatualizado.

---

## Testes manuais

### Nunca assumir IDs do seed

IDs variam entre ambientes. Sempre fazer `GET /recurso` e usar o ID retornado antes de `PUT` ou `DELETE`.

---

## 📚 Skills relacionados

- `/api-reference` — contratos completos da API
- `/testing-backend` — pytest e TestingConfig
- `/deploy` — Render, env vars, psycopg
- `/troubleshooting` — erros gerais (incluindo PowerShell encoding, cold start)
