# CLAUDE.md — Projeto Vela Para Todos

> Guia operacional **para Claude** (ou outra IA) trabalhando neste repositório.
> **Documento vivo** — atualize sempre que decidirmos algo novo.
>
> 📌 **Este CLAUDE.md é enxuto por design.** Para detalhes de cada área, use os skills
> listados no final deste arquivo — eles carregam sob demanda e evitam poluir o
> contexto em tarefas pequenas.

---

## 1. Contexto

Sistema web acadêmico da disciplina **Desenvolvimento Web** do curso de
**Ciência da Computação** do CEUB (2026/2), desenvolvido para a
**Federação Brasileira de Vela Adaptada (FBVA)** — projeto *Vela Para Todos*.
Monorepo com **API REST em Flask** e **SPA em React**.

**Autor:** Guilherme Cervi (GitHub `Guictss`)
**Repo:** https://github.com/Guictss/ceub_projeto_seminario_final_2026
**Caminho local:** `C:\dev\a3-vela\`

**Status (2026-11-26):** **projeto completo, em produção, com CI/CD e suíte de testes ampla.**

- ✅ Backend Flask em produção (Render) + PostgreSQL free tier
- ✅ 2 frontends React em produção (Vercel) — FBVA (`main`) e CEUB (preview branch `apresentacao-ceub`)
- ✅ **140 testes pytest** no backend (93.8% de cobertura)
- ✅ **23 testes Cypress E2E** no frontend (7 specs)
- ✅ **GitHub Actions CI/CD** com 4 jobs em paralelo
- ✅ Lint backend (ruff) + frontend (eslint) com config custom pros testes
- ✅ Acessibilidade: VLibras oficial + widget customizado (A+/A-/contraste)

**Itens em aberto (nice-to-have):**
- PDF multi-tema (`?tema=ceub` no backend) — relatório CEUB sai com cores FBVA em prod
- Vitest + React Testing Library (testes de unidade frontend)
- Visual mais enfático nas páginas internas (dashboard, listas)

---

## 2. Stack resumida

### Backend (`backend/`)
- Python 3.12 · Flask 3.0.3 · SQLAlchemy 2.1.8 · Flask-Migrate (Alembic)
- Flask-JWT-Extended · Marshmallow 3.21.3 · Flask-CORS · Flask-Limiter
- Werkzeug PBKDF2-SHA256 · ReportLab 4.2.5 · Gunicorn
- SQLite (dev) · PostgreSQL (prod Render)
- pytest + pytest-cov + pytest-flask · ruff

### Frontend (`frontend/`)
- React 19 · Vite 7 (local) / Vite 8 (Vercel) · React Router 7
- Axios com interceptor JWT (silent refresh em 401)
- Material UI v6+ · Tailwind CSS 4 · Leaflet · Recharts
- Cypress 16 + start-server-and-test · ESLint 10
- **Mobile-first obrigatório** (requisito do projeto)

### Infraestrutura
- Backend: Render.com (Web Service Free + PostgreSQL Free)
- Frontend: Vercel (`main` = production FBVA, `apresentacao-ceub` = preview)
- CI/CD: GitHub Actions (4 jobs paralelos, ~1 min)

> 🔎 Detalhes de rodar/testar/deploy → ver skills na seção final.

---

## 3. Identidade visual do projeto

### Paleta FBVA (OFICIAL — do style.css do PHP)

```
--azul:       #1D71B8   (primary.main)
--azul-med:   #1F7AC4   (primary.light)
--azul-dark:  #19629E   (primary.dark)
--amarelo:    #F9B233   (secondary.main)
--amarelo-d:  #E09F2D   (secondary.dark)
--dark:       #323232   (text.primary)
--gray:       #4A4A4A   (text.secondary)
--light-blue: #E8F3FB   (bgcolor de várias seções, user-info, cards light)
```

### Paleta CEUB (branch `apresentacao-ceub`)

```
roxo:        #662c92   (primary.main)
lilás:       #bf0087   (primary.light)
roxo-dark:   #43054e   (primary.dark)
amarelo:     #fde100   (secondary.main)
magenta:     #ec0089   (secondary.dark)
roxo-light:  #F3E6F7   (fundo claro)
```

Configurado em `frontend/src/main.jsx`. Também expostas em `theme.palette.vela.*`.
Na branch CEUB, as variáveis `AZUL`, `AZUL_DARK` etc. apontam pros valores roxos
(nomes mantidos pra não quebrar refs — vale limpar algum dia).

### Fonte

```
system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
```
(Segoe UI no Windows — mesmo visual do PHP original)

### Assets em `frontend/public/assets/img/`

Referência pelo React: `const IMG = "/assets/img"` e `${IMG}/arquivo.png`

| Arquivo | Uso |
|---|---|
| `logo-horizontal.png` | Navbar da landing, footer, auth esquerdo |
| `logo-vertical.png` | (opcional) alternativa à horizontal |
| `mascote.png` | **Zoé** — mascote na landing + auth esquerdo |
| `pattern-amarelo.jpg` | Faixa decorativa horizontal (topo e rodapé da landing) |
| `pattern-triangulos.jpg` | Overlay no hero da landing (opacity 0.08) + doações |
| `pattern-hexagonal.jpg` | Overlay nas notícias + auth esquerdo (opacity 0.08-0.1) |
| `infraestrutura.jpg` | Card "Infraestrutura" na landing |
| `modalidade.jpg` | Card "Sobre a modalidade" na landing |
| `noticia-1/2/3.jpg` | 3 notícias fixas da landing pública |

Branch `apresentacao-ceub` tem versões recoloridas: `mascote-ceub.png`,
`logo-horizontal-ceub.png`, `pattern-amarelo-ceub.jpg`, etc.

> 🎨 Componentes customizados do tema MUI, convenções visuais de páginas e detalhes
> da paleta → skill `theming`.

---

## 4. Estrutura do monorepo

```text
C:\dev\a3-vela\
├── CLAUDE.md               # este arquivo (visão geral)
├── README.md
├── start-dev.ps1           # sobe backend + frontend em paralelo (Windows)
├── .gitignore
├── backend/
│   ├── CLAUDE.md           # quick-ref Flask específico
│   └── ...                 # ver backend/CLAUDE.md
├── frontend/
│   ├── CLAUDE.md           # quick-ref React específico
│   └── ...                 # ver frontend/CLAUDE.md
├── docs/                   # documentação técnica
├── .claude/skills/         # skills carregadas sob demanda (ver seção final)
└── .github/workflows/ci.yml  # 4 jobs paralelos
```

### Rotas do frontend (overview)

```
/                           → Landing publica (visual PHP + Leaflet)
/login, /cadastro           → Split-screen (esquerda azul com Zoé)
/esqueci-senha              → Solicita link de reset por email
/redefinir-senha?token=XXX  → Define nova senha com token temporário
/dashboard                  → Recharts (métricas diferentes por papel)
/aulas, /noticias           → privadas, qualquer logado
/doacoes, /voluntarios,
/relatorio, /usuarios       → privadas, só professor
```

Logout redireciona para `/`. Fallback de URL desconhecida também vai pra `/`.

---

## 5. Comandos rápidos

```powershell
# Tudo em paralelo (recomendado)
cd C:\dev\a3-vela
.\start-dev.ps1
# Backend em :5000, frontend em :5173, browser abre em 5s

# Testes backend (pytest + cobertura)
cd backend ; .\venv\Scripts\Activate.ps1 ; pytest

# Testes frontend E2E (Cypress)
cd frontend ; npm run cypress:open   # interativo
npm run test:e2e                      # headless, sobe tudo

# Lint
ruff check .                          # backend
npm run lint                          # frontend
```

**Helper de API no PowerShell:**
```powershell
cd backend ; .\vela-init.ps1
# popula $headersProf (Carlos) e $headersAluno (Maria) + define Invoke-ApiJson
```

---

## 6. Usuários de teste (senha: `Senha123!`)

Após `python seed.py` ou primeiro deploy:

| Papel     | E-mail              | Nome              |
|-----------|---------------------|-------------------|
| professor | `carlos@teste.com`  | Carlos Andrade    |
| professor | `ana@teste.com`     | Ana Pereira       |
| aluno     | `maria@teste.com`   | Maria Silva       |
| aluno     | `joao@teste.com`    | João Santos       |
| aluno     | `beatriz@teste.com` | Beatriz Lima      |

> ⚠️ **Os IDs podem variar entre ambientes.** Sempre fazer `GET /usuarios` pra ver
> o ID real antes de testar PUT/DELETE em um ID específico.

**Reset de senha (se login falhar):**
```powershell
python -c "from app import create_app; from extensions import db; from models import Usuario; a=create_app(); a.app_context().push(); u=Usuario.query.filter_by(email='carlos@teste.com').first(); u.set_senha('Senha123!'); db.session.commit()"
```

---

## 7. URLs de produção

- **Frontend FBVA:** https://vela-para-todos.vercel.app
- **Frontend CEUB (preview):** https://vela-para-todos-git-apresentacao-ceub-guicts.vercel.app
- **Backend API:** https://vela-para-todos-api.onrender.com
- **Health check:** https://vela-para-todos-api.onrender.com/health

> ⏱️ Render Free dorme após 15 min. Primeira requisição demora 30-60s.
> **Pra apresentação:** acordar com `/health` 2-3 min antes.

---

## 8. Regras invioláveis

- **Nunca commitar `.env`** — está no `.gitignore` por motivo
- **Nunca usar psycopg v3** — usar `psycopg2-binary` (ver skill `deploy`)
- **Nunca fazer `useState(null) + useEffect` pra hidratar localStorage** — causa flash (usar lazy initial state)
- **Nunca remover `RATELIMIT_ENABLED = False`** de `TestingConfig` e `DevelopmentConfig` (quebra Cypress/pytest)
- **Nunca pausar sessão sem fazer `git status` + commit** — refatorações grandes se perdem
- **Nunca assumir IDs do seed** — sempre `GET /recurso` antes de `PUT`/`DELETE`
- **Nunca usar `<Chip>`/`<Box>` dentro de `<Typography>`** — quebra HTML
- **VLibras tem warnings normais no console** — não silenciar

---

## 9. Projeto antigo (PHP/MySQL) — referência visual

- Repo: `Guictss/Desenvolvimento_de_Sistemas` (pasta `a3_vela/`)
- Rodando em `C:\xampp\htdocs\Desenvolvimento_de_Sistemas\a3_vela\`
- URL local: http://localhost/Desenvolvimento_de_Sistemas/a3_vela/
- CSS fonte: `assets/css/style.css`, `landing.css`, `auth.css`
- Banco MySQL: `vela_para_todos` (reconstruído do zero)
- Credenciais MySQL: `root` / `ReapperOW31.`

---

## 📚 Skills disponíveis (carregam sob demanda)

Use estes skills para contexto profundo quando a tarefa pedir. O Claude carrega
automaticamente baseado no `description` de cada skill, ou você pode invocar
explicitamente por slash command.

### Por domínio

- **`/api-reference`** — contratos completos dos 30+ endpoints REST (todos os shapes, códigos de erro, exemplos). Use ao criar/alterar endpoints ou consumir a API no frontend.
- **`/pegadinhas-backend`** — armadilhas conhecidas do backend (psycopg driver, SQLAlchemy 2.x, `os.environ` quebrando CI, rate limit em dev, python-dateutil, etc.)
- **`/pegadinhas-frontend`** — armadilhas conhecidas do frontend (encoding BOM, MUI v6 `slotProps`, Grid v2, `<Chip>` em `<Typography>`, lazy initial state, Vite 8 estrito, SPA routing)
- **`/testing-backend`** — pytest + pytest-cov + pytest-flask (fixtures, conftest, coverage por módulo, comandos, TestingConfig)
- **`/testing-frontend`** — Cypress 16 E2E (specs, commands, cypress.config.js, Cypress 16 breaking changes)
- **`/deploy`** — Render + Vercel + env vars + CI/CD GitHub Actions + smoke tests + checklist pré-apresentação
- **`/theming`** — alternância FBVA ↔ CEUB (main.jsx, componentes customizados do tema MUI, convenções visuais do PHP)
- **`/troubleshooting`** — erros recorrentes com fix (cold start Render, PowerShell encoding, Zone Identifier, VLibras warnings, hidratação React, Leaflet)

### Quando usar cada um

| Tarefa típica | Skill |
|---|---|
| "Preciso adicionar/alterar endpoint X" | `/api-reference` + `/pegadinhas-backend` |
| "Página do frontend com bug visual" | `/pegadinhas-frontend` + `/theming` |
| "Teste pytest/Cypress quebrou" | `/testing-backend` ou `/testing-frontend` |
| "Deploy falhou" | `/deploy` + `/troubleshooting` |
| "Erro estranho na apresentação" | `/troubleshooting` |
| "Mudar paleta/tema" | `/theming` |

### Subdiretórios

- Trabalhando em `backend/`? O Claude carrega automaticamente `backend/CLAUDE.md`
- Trabalhando em `frontend/`? Idem com `frontend/CLAUDE.md`

---

_Última reestruturação: 2026-11-26 — fragmentação em skills pra reduzir carga de contexto._
_Status: 163 testes automatizados (140 pytest + 23 Cypress), CI/CD verde, 93.8% cobertura backend, 2 frontends em produção._
