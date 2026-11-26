# Projeto Vela Para Todos

![CI](https://github.com/Guictss/ceub_projeto_seminario_final_2026/actions/workflows/ci.yml/badge.svg)
![Backend coverage](https://img.shields.io/badge/backend%20coverage-93.8%25-brightgreen)
![Python](https://img.shields.io/badge/python-3.12-blue)
![Node](https://img.shields.io/badge/node-20%20LTS-green)
![License](https://img.shields.io/badge/license-academic-lightgrey)

Sistema web para a **Federação Brasileira de Vela Adaptada (FBVA)** — plataforma de gestão de aulas, inscrições, notícias, doações e voluntários da iniciativa *Vela Para Todos*, que promove a prática esportiva da vela por pessoas com deficiência.

Desenvolvido como **projeto final** da disciplina de **Desenvolvimento Web** do curso de **Ciência da Computação** do **Centro Universitário de Brasília (CEUB)** — 2º semestre de 2026.

---

## 🌐 Produção

| Ambiente | URL |
|---|---|
| **Backend (API)** | https://vela-para-todos-api.onrender.com |
| **Frontend FBVA** | https://vela-para-todos.vercel.app |
| **Frontend CEUB** (preview branch `apresentacao-ceub`) | https://vela-para-todos-git-apresentacao-ceub-guicts.vercel.app |

> ℹ️ O backend hospedado no Render Free dorme após 15 min sem tráfego. A primeira requisição pode demorar 30–60 s (cold start).

---

## Sumário

- [Stack tecnológico](#stack-tecnológico)
- [Estrutura do monorepo](#estrutura-do-monorepo)
- [Como rodar localmente](#como-rodar-localmente)
- [Testes](#testes)
- [CI/CD](#cicd)
- [Endpoints da API](#endpoints-da-api)
- [Arquitetura](#arquitetura)
- [Deploy](#deploy)
- [Projeto acadêmico](#projeto-acadêmico)
- [Equipe](#equipe)

---

## Stack tecnológico

### Backend — API REST
- **Python 3.12** + **Flask 3**
- **SQLAlchemy 2** (ORM) + **Flask-Migrate** (Alembic para migrations)
- **Flask-JWT-Extended** (autenticação com access + refresh tokens)
- **Marshmallow** (validação e serialização)
- **Flask-CORS** (liberação de origens para o SPA)
- **Flask-Limiter** (rate limit em rotas públicas sensíveis)
- **ReportLab** (geração de relatórios em PDF)
- **flasgger** (Swagger UI a partir do OpenAPI spec)
- **SQLite** (desenvolvimento) / **PostgreSQL** (produção)
- **Gunicorn** (servidor WSGI em produção)

### Frontend — Single Page Application
- **React 19** + **Vite 7**
- **React Router 7** (roteamento declarativo)
- **Axios** com interceptor JWT (renovação automática em 401 — *silent refresh*)
- **Material UI v6** + **Tailwind CSS 4**
- **Leaflet + react-leaflet** (mapa interativo na landing — Clube Nipo Brasileiro, Brasília-DF)
- **Recharts** (gráficos do dashboard — bar + pie)
- **VLibras** oficial do governo + widget customizado de acessibilidade (A+/A-/alto contraste)
- **Context API** para gerenciamento global de autenticação
- Mobile-first (requisito obrigatório do projeto)

### Testes & Qualidade
- **pytest** + **pytest-cov** + **pytest-flask** (140 testes, 93.8% de cobertura no backend)
- **GitHub Actions** (CI/CD — backend-tests + frontend-build a cada push)

### Infraestrutura em produção
- **Backend:** Render.com (Web Service + PostgreSQL)
- **Frontend:** Vercel (2 projetos: FBVA e CEUB)
- **CI/CD:** GitHub Actions

---

## Estrutura do monorepo

```text
a3-vela/
├── backend/                  # API Flask
│   ├── app.py                # Factory, registra blueprints
│   ├── config.py             # Configurações por ambiente (Dev/Test/Prod)
│   ├── extensions.py         # SQLAlchemy, JWT, CORS, Limiter
│   ├── models/               # Usuario, Aula, Inscricao, Noticia, Doacao, Voluntario
│   ├── routes/               # 9 blueprints (auth, aulas, inscricoes, noticias,
│   │                         #   doacoes, voluntarios, usuarios, dashboard, relatorios)
│   ├── schemas/              # Marshmallow para request/response
│   ├── services/             # Lógica de domínio (ex.: pdf_relatorio)
│   ├── utils/                # Decorators de autorização, paginação
│   ├── migrations/           # Alembic (revisions)
│   ├── tests/                # pytest (140 testes, 93.8% cobertura)
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── .coveragerc
│   ├── openapi.yaml          # OpenAPI 3.0 spec
│   ├── seed.py               # Popula dados de demo (idempotente)
│   └── .env.example
│
├── frontend/                 # SPA React
│   ├── public/assets/img/    # Imagens (mascote Zoé, logos, patterns)
│   ├── src/
│   │   ├── pages/            # Landing, Login, Cadastro, Dashboard, Aulas, Noticias,
│   │   │                     #   Doacoes, Voluntarios, Usuarios, Relatorio,
│   │   │                     #   EsqueciSenha, RedefinirSenha
│   │   ├── components/       # Layout, Navbar, PrivateRoute, ProfessorRoute,
│   │   │                     #   HeaderLanding, MapaLocalizacao, WidgetAcessibilidade
│   │   ├── contexts/         # AuthContext
│   │   ├── services/         # api.js (axios + interceptor JWT)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json           # Rewrite rule para SPA routing
│
├── docs/                     # Documentação técnica
│   ├── api.md                # Contrato da API
│   ├── arquitetura.docx      # Documento de arquitetura (v2.0 — API REST + SPA)
│   └── contratos-api.docx
│
├── .github/workflows/
│   └── ci.yml                # GitHub Actions — backend-tests + frontend-build
├── .gitignore
├── CLAUDE.md                 # Guia operacional detalhado do projeto
├── start-dev.ps1             # Sobe backend e frontend juntos (Windows)
└── README.md
```

---

## Como rodar localmente

### Pré-requisitos

| Ferramenta | Versão mínima |
|------------|---------------|
| Python     | 3.12          |
| Node.js    | 20 LTS        |
| Git        | 2.40+         |

### Opção rápida (Windows PowerShell)

```powershell
cd a3-vela
.\start-dev.ps1
```

Sobe backend em `http://localhost:5000` e frontend em `http://localhost:5173` em uma única janela.

### Opção manual

**Backend**

```bash
cd backend

# Ambiente virtual
python -m venv venv
.\venv\Scripts\Activate.ps1          # Windows (PowerShell)
# source venv/bin/activate           # Linux / macOS

# Dependências
pip install -r requirements.txt

# Variáveis de ambiente
cp .env.example .env                 # edite SECRET_KEY, JWT_SECRET_KEY etc.

# Banco (cria tabelas via Alembic)
flask db upgrade

# (Opcional) popula dados de demonstração
python seed.py

# Sobe o servidor
python app.py                        # http://localhost:5000
```

Checar saúde da API: `GET http://localhost:5000/api/v1/health`

**Frontend** (em outro terminal)

```bash
cd frontend

npm install

# Variáveis — cria .env.local com:
#   VITE_API_URL=http://localhost:5000/api/v1

npm run dev                          # http://localhost:5173
```

### Usuários de teste (senha: `Senha123!`)

Após rodar `python seed.py`, estas contas ficam disponíveis:

| Papel      | E-mail              |
|------------|---------------------|
| Professor  | `carlos@teste.com`  |
| Professor  | `ana@teste.com`     |
| Aluno      | `maria@teste.com`   |
| Aluno      | `joao@teste.com`    |
| Aluno      | `beatriz@teste.com` |

---

## Testes

### Backend: pytest + 93.8% de cobertura 🏆

```bash
cd backend
.\venv\Scripts\Activate.ps1
pytest                           # 140 testes + cobertura
pytest tests/test_auth.py -v     # arquivo específico
start htmlcov/index.html         # relatório HTML visual (Windows)
```

| Suite | Testes | Cobertura |
|---|---|---|
| `test_auth.py` | 21 | 95.0% |
| `test_aulas.py` | 26 | 93.2% |
| `test_inscricoes.py` | 14 | 92.2% |
| `test_noticias.py` | 18 | 95.2% |
| `test_doacoes.py` | 12 | 95.2% |
| `test_voluntarios.py` | 13 | 100% |
| `test_usuarios.py` | 21 | 86.8% |
| `test_dashboard.py` | 5 | 97.6% |
| `test_relatorios.py` | 10 | 93.0% |
| **Total** | **140** | **93.8%** |

Configuração em `backend/pytest.ini` e `backend/.coveragerc`. O CI falha automaticamente se a cobertura cair abaixo de 80%.

### Frontend

Planejado: **Vitest** + **React Testing Library** + **Cypress** (E2E).

---

## CI/CD

GitHub Actions configurado em `.github/workflows/ci.yml` com 2 jobs rodando em paralelo a cada push e PR:

| Job | O que faz | Duração |
|---|---|---|
| **Backend Tests (pytest)** | Instala deps, roda `pytest --cov-fail-under=80`, upload do relatório HTML como artifact | ~55 s |
| **Frontend Build (Vite)** | Instala deps, roda `npm run build`, upload do `dist/` como artifact | ~25 s |

**Total do pipeline:** ~1 minuto do push até verde.

Dispara em:
- Push nas branches `main` e `apresentacao-ceub`
- Pull requests pra `main`

---

## Endpoints da API

Todas as rotas estão prefixadas por `/api/v1`.

| Blueprint     | Endpoints principais                                    | Acesso                                   |
|---------------|---------------------------------------------------------|------------------------------------------|
| **Auth**      | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`, `/auth/esqueci-senha`, `/auth/redefinir-senha` | Público / JWT                            |
| **Usuários**  | `/usuarios` (CRUD completo com filtros e busca)         | Professor (ou próprio usuário)           |
| **Aulas**     | `/aulas` (CRUD + filtros data/professor/vagas)          | JWT lê · Professor dono escreve          |
| **Inscrições**| `/inscricoes`, `/aulas/<id>/inscricoes`                 | Aluno / Professor dono                   |
| **Notícias**  | `/noticias` (CRUD + busca por título)                   | Público lê · Professor escreve           |
| **Doações**   | `/doacoes` (listar c/ resumo, registrar)                | Público registra · Professor lista       |
| **Voluntários** | `/voluntarios` (cadastrar, listar, aprovar/recusar)   | Público cadastra · Professor gerencia    |
| **Dashboard** | `/dashboard/stats`                                      | JWT (métricas diferentes por papel)      |
| **Relatórios** | `/relatorios/inscricoes.pdf`                           | Professor                                |

Especificação OpenAPI completa: [`backend/openapi.yaml`](backend/openapi.yaml).
Swagger UI local: `http://localhost:5000/apidocs`.

---

## Arquitetura

- **Padrão:** API REST + SPA (Single Page Application) desacoplados
- **Autenticação:** JWT com `access_token` (15 min) + `refresh_token` (7 dias) — renovação transparente via interceptor axios no frontend
- **Autorização:** dois papéis (`aluno`, `professor`) aplicados por decorators no backend e `PrivateRoute` / `ProfessorRoute` no frontend
- **Persistência:** ORM SQLAlchemy 2.x com migrations versionadas via Alembic (SQLite em dev, PostgreSQL em prod)
- **Formato:** JSON sobre HTTP, CORS restrito a origens conhecidas
- **Rate limiting:** proteção em rotas públicas sensíveis (login, cadastro, doações, voluntários)
- **Acessibilidade:** VLibras oficial + widget customizado (A+/A-/alto contraste com persistência em `localStorage`)

Decisões arquiteturais (ADRs) documentadas em [`docs/arquitetura.docx`](docs/).

---

## Deploy

### Backend (Render)
- Web Service (free tier) ligado a PostgreSQL free
- Build: `pip install -r requirements.txt && flask db upgrade && python seed.py`
- Start: `gunicorn "app:create_app()" --bind 0.0.0.0:$PORT`
- Auto-deploy a cada push em `main`

### Frontend (Vercel)
- Framework detectado automaticamente (Vite)
- Root directory: `frontend/`
- Env var `VITE_API_URL` aponta para a API do Render
- `vercel.json` com rewrite para SPA routing (`/(.*) → /index.html`)
- Deploy automático a cada push

Detalhes completos em [`CLAUDE.md`](CLAUDE.md) — inclui pegadinhas aprendidas durante o deploy (SQLAlchemy + psycopg2, encoding UTF-8 no Vite 8, Vercel reusando projetos, etc.).

---

## Projeto acadêmico

| | |
|---|---|
| **Instituição**     | Centro Universitário de Brasília (CEUB) |
| **Curso**           | Ciência da Computação |
| **Disciplina**      | Desenvolvimento Web |
| **Período**         | 2º semestre de 2026 |
| **Cliente / tema**  | Federação Brasileira de Vela Adaptada (FBVA) — Projeto *Vela Para Todos* |

---

## Equipe

- **Guilherme Cervi** — Desenvolvimento full-stack, identidade visual, arquitetura

---

## Licença

Projeto acadêmico sem fins lucrativos. Código disponibilizado para estudo, referência e contribuição educacional.