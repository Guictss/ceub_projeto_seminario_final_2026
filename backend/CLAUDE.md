# CLAUDE.md — backend/

> Quick-reference para trabalhar no **backend Flask** do Projeto Vela Para Todos.
> Carregado automaticamente quando o Claude trabalha nesta pasta.
>
> 📖 Para visão geral do projeto, ver `../CLAUDE.md`.
> 📖 Para contratos completos da API, usar skill `/api-reference`.
> ⚠️ Para armadilhas conhecidas, usar skill `/pegadinhas-backend`.

---

## 1. Estrutura

```text
backend/
├── app.py                  # factory, registra 9 blueprints
├── config.py               # Base/Dev/Test/Prod configs
├── extensions.py           # db, migrate, jwt, cors, limiter
├── models/                 # Usuario, Aula, Inscricao, Noticia, Doacao, Voluntario
├── routes/                 # 9 blueprints — auth, aulas, inscricoes (2bps),
│                           #   noticias, doacoes, voluntarios, usuarios,
│                           #   dashboard, relatorios
├── schemas/                # Marshmallow
├── services/pdf_relatorio.py
├── utils/                  # decorators (@professor_required, @aluno_required), pagination
├── migrations/             # Alembic
├── tests/                  # pytest — 140 testes, 93.8% cobertura (ver skill /testing-backend)
├── instance/vela.db        # SQLite local
├── .env                    # dev local (no .gitignore)
├── .env.example
├── pytest.ini
├── .coveragerc
├── ruff.toml
├── openapi.yaml
├── seed.py                 # popula banco (idempotente, usado no deploy)
├── requirements.txt
└── vela-init.ps1           # helper PowerShell pra testes manuais
```

---

## 2. Como rodar

```powershell
cd C:\dev\a3-vela\backend
.\venv\Scripts\Activate.ps1
python app.py                # http://localhost:5000
```

Ou tudo em paralelo com `..\start-dev.ps1` (recomendado).

### Helper pra testes manuais

```powershell
.\vela-init.ps1
# popula $headersProf (Carlos) e $headersAluno (Maria)
# + define Invoke-ApiJson (contorna o bug UTF-8 do PowerShell 5.1)
```

---

## 3. Padrões de código

- **Factory pattern** em `app.py`, extensões em `extensions.py`
- **Blueprints** com `url_prefix=f"{api}/XXX"` onde `api = "/api/v1"`
- **Decorators**: `@aluno_required`, `@professor_required` em `utils/decorators.py`
- **Helper de paginação** em `utils/pagination.py`
- **Validação** sempre com Marshmallow, erro 400 com `details` (às vezes 422)
- **Rate limits** em rotas públicas sensíveis (doações 10/min, voluntários 3/min, register 3/min)
- **Busca textual** em listagens: `query.filter(Model.campo.ilike(f"%{q}%"))` com param `q`
- **Recursos com conteúdo longo**: dois schemas separados (`ListSchema` + `DetailSchema`)
- **Proteções de integridade**: CANNOT_DELETE_SELF em `/usuarios`, verificação de email único em PUT

---

## 4. Schema do banco (nomes REAIS)

### usuarios
```
id INT PK, nome, email UNIQUE, senha_hash, data_nascimento DATE,
papel ENUM('aluno','professor'), criado_em TIMESTAMP
```

### aulas
```
id INT PK, professor_id FK -> usuarios.id,
data DATE, horario TIME, duracao_min INT, vagas INT, descricao VARCHAR(255),
criado_em TIMESTAMP
```
Relationships: `professor -> Usuario`, `inscricoes -> [Inscricao]`
Properties (não colunas): `vagas_disponiveis`, `tem_vagas`, `inscritos_count`

### inscricoes
```
id INT PK, aluno_id FK, aula_id FK,
inscrito_em TIMESTAMP, UNIQUE(aluno_id, aula_id)
```

### noticias
```
id, titulo VARCHAR(200), conteudo TEXT, imagem VARCHAR(255) NULLABLE,
publicado_em TIMESTAMP
```
**Atenção:** usa `publicado_em` (não `criado_em`). Property: `resumo`.

### doacoes
```
id, nome_doador, valor NUMERIC(10,2),
forma_pagamento ENUM('pix','transferencia','paypal'), doado_em
```
(Não tem `email_doador` apesar do nome sugerir.)

### voluntarios
```
id, nome, email, mensagem, status ENUM('pendente','aprovado','recusado'),
inscrito_em
```

---

## 5. Validações principais (Marshmallow)

- **Notícias:** titulo 5-200, conteudo min 20, imagem opcional max 255
- **Voluntários:** nome min 3, email válido, mensagem min 20
- **Doações:** valor > 0, forma_pagamento in ['pix','transferencia','paypal']
- **Aulas:** descricao min 3, data futura ao criar
- **Usuários:** idade mínima 14 anos, senha com letra + número

---

## 6. Configs (`config.py`)

| Config | Uso | DB | Rate limit |
|---|---|---|---|
| `DevelopmentConfig` | dev local | SQLite `instance/vela.db` | **desativado** |
| `TestingConfig` | pytest | SQLite in-memory | **desativado** |
| `ProductionConfig` | Render | PostgreSQL (`DATABASE_URL`) | ativo |

⚠️ **Nunca remover** `RATELIMIT_ENABLED = False` de Dev/Test — Cypress e pytest batem em 429.
⚠️ **Nunca usar** `os.environ["X"]` em atributo de classe em `ProductionConfig` (quebra import no CI).
Use `os.environ.get("X", "")`.

---

## 7. Lint (ruff)

Config em `backend/ruff.toml` — regras E/F/W/I (errors, pyflakes, warnings, isort).

```powershell
ruff check .                # verifica
ruff check . --fix          # auto-fix
```

CI roda `ruff check .` — PR vermelho barra merge.

---

## 8. Endpoints (resumo)

> 📖 Lista completa com shapes, validações e erros → skill `/api-reference`

| Área | Rotas |
|---|---|
| **auth** | `/register`, `/login`, `/refresh`, `/logout`, `/me`, `/esqueci-senha`, `/redefinir-senha` |
| **aulas** | `GET/POST/PUT/DELETE /aulas[/<id>]`, `GET /aulas/<id>/inscricoes` |
| **inscricoes** | `GET/POST /inscricoes`, `DELETE /inscricoes/<id>` |
| **usuarios** | `GET/PUT/DELETE /usuarios[/<id>]` (shape `items` — diferente do resto!) |
| **noticias** | `GET /noticias` (público), CRUD professor |
| **doacoes** | `POST /doacoes` (público, 10/min), `GET` professor |
| **voluntarios** | `POST` (público, 3/min), `GET`, `PATCH /status` |
| **dashboard** | `GET /dashboard/stats` (métricas por papel) |
| **relatorios** | `GET /relatorios/inscricoes.pdf` (professor) |
| **health** | `GET /health` (CI + Render) |

### Formato padrão de resposta

- **Paginação (geral):** `{ "data": [...], "meta": { page, per_page, total, total_pages } }`
- **Paginação (/usuarios):** `{ "items": [...], page, pages, per_page }` ⚠️ inconsistência conhecida
- **Erro:** `{ "error": "msg", "code": "SLUG", "details": { campo: ["erro"] }? }`
- **Auth:** `Authorization: Bearer <access_token>`

---

## 9. JWT

- **Access token**: 15 min
- **Refresh token**: 7 dias
- **Blocklist em memória** (invalida tokens no logout — não persiste entre restarts)
- **Hash de senhas**: PBKDF2-SHA256 com 600.000 iterações + salt (padrão Werkzeug moderno)

---

## 10. Base URLs

- Local: `http://localhost:5000/api/v1`
- Produção: `https://vela-para-todos-api.onrender.com/api/v1`
- Config no frontend: `VITE_API_URL` em `frontend/.env.local`

---

## 11. Checklist antes de commitar

1. `pytest` — verde (meta ≥80%, hoje 93.8%)
2. `ruff check .` — sem warnings
3. `git status` + `git diff` revisados
4. Atualizar seed.py se adicionou dados demo novos
5. Atualizar `.env.example` se adicionou env var nova
6. Atualizar `openapi.yaml` se criou endpoint novo
7. Se mudou migration: `flask db upgrade` local antes de pushar

---

## 📚 Skills relacionados

- `/api-reference` — contratos completos
- `/pegadinhas-backend` — armadilhas (psycopg, SQLAlchemy 2.x, config, CI)
- `/testing-backend` — pytest, fixtures, coverage
- `/deploy` — Render + env vars + gunicorn
- `/troubleshooting` — erros comuns
