# Projeto Vela Para Todos

Sistema web acadêmico para a **Federação Brasileira de Vela Adaptada (FBVA)** — plataforma de gestão de aulas, inscrições, notícias, doações e voluntários da iniciativa *Vela Para Todos*, que promove a prática esportiva da vela por pessoas com deficiência.

Desenvolvido como **projeto final** da disciplina de **Desenvolvimento Web** do curso de Tecnologia em Desenvolvimento de Sistemas do **Centro Universitário de Brasília (CEUB)** — 2º semestre de 2026.

---

## Sumário

- [Stack tecnológico](#️-stack-tecnológico)
- [Estrutura do monorepo](#-estrutura-do-monorepo)
- [Como rodar localmente](#-como-rodar-localmente)
- [Endpoints da API](#-endpoints-da-api)
- [Arquitetura](#-arquitetura)
- [Projeto acadêmico](#-projeto-acadêmico)
- [Equipe](#-equipe)

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
- **SQLite** (desenvolvimento) / **PostgreSQL** (produção)
- **flasgger** (Swagger UI a partir do OpenAPI spec)

### Frontend — Single Page Application
- **React 19** + **Vite 7**
- **React Router 7** (roteamento declarativo)
- **Axios** com interceptor JWT (renovação automática em 401 — *silent refresh*)
- **Tailwind CSS** + **Materialize** *(em migração — anteriormente Bootstrap 5)*
- **Context API** para gerenciamento global de autenticação

### Infraestrutura (planejado)
- **Backend:** Render.com
- **Frontend:** Vercel
- **CI/CD:** GitHub Actions

---

## Estrutura do monorepo

```text
a3-vela/
├── backend/                  # API Flask
│   ├── app.py                # Factory
│   ├── config.py             # Configurações por ambiente
│   ├── extensions.py         # SQLAlchemy, JWT, CORS, Limiter
│   ├── models/               # Usuario, Aula, Inscricao, Noticia, Doacao, Voluntario
│   ├── routes/               # 8 blueprints (auth, aulas, inscricoes, noticias, doacoes, voluntarios, relatorios)
│   ├── schemas/              # Marshmallow para request/response
│   ├── services/             # Lógica de domínio (ex.: pdf_relatorio)
│   ├── utils/                # Decorators de autorização, paginação
│   ├── migrations/           # Alembic (revisions)
│   ├── requirements.txt
│   ├── openapi.yaml          # OpenAPI 3.0 spec
│   └── .env.example
│
├── frontend/                 # SPA React
│   ├── src/
│   │   ├── pages/            # Login, Dashboard, Aulas, Noticias, Doacoes, Voluntarios, Relatorio
│   │   ├── components/       # Layout, Navbar, PrivateRoute, ProfessorRoute
│   │   ├── contexts/         # AuthContext
│   │   ├── services/         # api.js (axios + interceptor JWT)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── docs/                     # Documentação técnica
│   ├── api.md                # Contrato da API
│   ├── arquitetura.docx      # Documento de arquitetura (v2.0 — API REST + SPA)
│   └── contratos-api.docx
│
├── .github/workflows/        # CI/CD
├── .gitignore
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

### Backend

```bash
cd backend

# Cria e ativa o ambiente virtual
python -m venv venv
.\venv\Scripts\Activate.ps1          # Windows (PowerShell)
# source venv/bin/activate            # Linux / macOS

# Instala as dependências
pip install -r requirements.txt

# Configura variáveis de ambiente
cp .env.example .env                  # edite SECRET_KEY, JWT_SECRET_KEY etc.

# Prepara o banco (cria tabelas via Alembic)
flask db upgrade

# Sobe o servidor
python app.py                         # http://localhost:5000
```

Checar saúde da API: `GET http://localhost:5000/api/v1/health`

### Frontend

Em outro terminal:

```bash
cd frontend

# Instala as dependências
npm install

# Variáveis de ambiente — cria .env.local com:
#   VITE_API_URL=http://localhost:5000/api/v1

# Sobe o servidor de desenvolvimento
npm run dev                           # http://localhost:5173
```

### Usuários de teste

Após rodar os seeds / popular manualmente, estas contas ficam disponíveis:

| Papel      | E-mail               | Senha         |
|------------|----------------------|---------------|
| Professor  | `carlos@teste.com`   | `Senha123!`   |
| Aluno      | `maria@teste.com`    | `Senha123!`   |

---

## Endpoints da API

Todas as rotas estão prefixadas por `/api/v1`.

| Blueprint     | Endpoint base                                     | Acesso         |
|---------------|---------------------------------------------------|----------------|
| **Auth**      | `/auth/login`, `/auth/refresh`, `/auth/me`        | Público / JWT  |
| **Aulas**     | `/aulas` (CRUD completo)                          | Público lê · Professor escreve |
| **Inscrições**| `/inscricoes`, `/aulas/<id>/inscricoes`           | Aluno          |
| **Notícias**  | `/noticias` (CRUD completo)                       | Público lê · Professor escreve |
| **Doações**   | `/doacoes` (listar / registrar)                   | Público registra · Professor lista |
| **Voluntários** | `/voluntarios` (cadastrar / listar / aprovar)   | Público cadastra · Professor gerencia |
| **Relatórios** | `/relatorios/inscricoes.pdf`                     | Professor      |

Especificação OpenAPI completa: [`backend/openapi.yaml`](backend/openapi.yaml).
Swagger UI local: `http://localhost:5000/apidocs`.

---

## Arquitetura

- **Padrão:** API REST + SPA (Single Page Application) desacoplados
- **Autenticação:** JWT com `access_token` (15 min) + `refresh_token` (7 dias) — renovação transparente via interceptor axios no frontend
- **Autorização:** dois papéis (`aluno`, `professor`) aplicados por decorators no backend e `PrivateRoute` / `ProfessorRoute` no frontend
- **Persistência:** ORM SQLAlchemy 2.x com migrations versionadas via Alembic
- **Formato:** JSON sobre HTTP, CORS restrito a origens conhecidas

Decisões arquiteturais (ADRs) documentadas em [`docs/arquitetura.docx`](docs/).

---

## Projeto acadêmico

| | |
|---|---|
| **Instituição**     | Centro Universitário de Brasília (CEUB) |
| **Curso**           | Tecnologia em Desenvolvimento de Sistemas |
| **Disciplina**      | Desenvolvimento Web |
| **Período**         | 2º semestre de 2026 |
| **Cliente / tema**  | Federação Brasileira de Vela Adaptada (FBVA) — Projeto *Vela Para Todos* |

---

## Equipe

- **Guilherme Cervi** — Desenvolvimento full-stack

---

## Licença

Projeto acadêmico sem fins lucrativos. Código disponibilizado para estudo, referência e contribuição educacional.
