# CLAUDE.md — Projeto Vela Para Todos

> Guia operacional **para Claude** (ou outra IA) que vai trabalhar neste
> repositório. Leia este arquivo inteiro antes de qualquer alteração.
> Documento vivo: atualize sempre que decidirmos algo novo.

---

## 1. Contexto

Sistema web acadêmico da disciplina **Desenvolvimento Web** do curso de
**Ciência da Computação** do CEUB (2026/2), desenvolvido para a
**Federação Brasileira de Vela Adaptada (FBVA)** — projeto *Vela Para Todos*.
Monorepo com **API REST em Flask** e **SPA em React**.

**Autor:** Guilherme Cervi (GitHub `Guictss`).
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

## 2. Stack

### Backend (`backend/`)
- Python 3.12 · Flask 3.0.3 · SQLAlchemy 2.1.8 · Flask-Migrate (Alembic)
- Flask-JWT-Extended (access 15 min, refresh 7 dias; blocklist em memória)
- Marshmallow 3.21.3 (validação)
- Flask-CORS · Flask-Limiter · Flask-Bcrypt (Werkzeug PBKDF2-SHA256)
- ReportLab 4.2.5 (PDF)
- flasgger (Swagger UI — habilitado em dev, desativado em prod)
- **pytest + pytest-cov + pytest-flask** (140 testes, 93.8% cobertura)
- **ruff** (lint — regras E/F/W/I)
- SQLite (dev — `instance/vela.db`) · PostgreSQL (prod no Render)
- Gunicorn (servidor WSGI em produção)

### Frontend (`frontend/`)
- React 19 · Vite 7 (local) / Vite 8 (Vercel build) · React Router 7
- Axios com interceptor JWT (silent refresh em 401)
- **Material UI v6+** (Emotion, Roboto, `@mui/icons-material`)
- **Tailwind CSS 4** via `@tailwindcss/vite` (zero-config, `@import "tailwindcss";`)
- **Leaflet + react-leaflet** (mapa interativo em "Onde estamos")
- **Recharts** (gráficos do dashboard — bar + pie)
- **Cypress 16** + **start-server-and-test** (23 testes E2E)
- **ESLint 10** (config custom pra Cypress globals)
- **Mobile-first obrigatório** (requisito do projeto)

### Infraestrutura (em produção)
- **Backend**: Render.com (Web Service Free + PostgreSQL Free)
- **Frontend**: Vercel (projeto único com branch main = production, `apresentacao-ceub` = preview)
- **CI/CD**: GitHub Actions (4 jobs: pytest, vite build, ruff, eslint)

### Tema visual FBVA (paleta OFICIAL — do style.css do PHP)

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
Na branch CEUB, as mesmas variáveis `AZUL`, `AZUL_DARK` etc. apontam pros valores roxos (nomes mantidos pra não quebrar refs — vale limpar algum dia).

### Fonte
`system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
(Segoe UI no Windows — mesmo visual do PHP original).

### Componentes customizados no tema
- `MuiButton`: borderRadius 8, textTransform none, fontWeight 600, hover com
  `translateY(-1px)` + sombra azul (igual `.btn-vela-azul` do PHP)
- `MuiCard`: borderRadius 12, transition suave pra hover
- `MuiOutlinedInput`: borderRadius 8

---

## 3. Assets visuais do projeto PHP (copiados em `frontend/public/assets/img/`)

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
| `noticia-1.jpg` / `noticia-2.jpg` / `noticia-3.jpg` | 3 notícias fixas da landing pública |

Branch `apresentacao-ceub` tem versões recoloridas: `mascote-ceub.png`, `logo-horizontal-ceub.png`, `pattern-amarelo-ceub.jpg`, etc.

---

## 4. Estrutura do monorepo

```text
C:\dev\a3-vela\
├── backend/
│   ├── app.py              # factory, registra 9 blueprints
│   ├── config.py           # Base/Dev/Test/Prod configs
│   ├── extensions.py       # db, migrate, jwt, cors, limiter
│   ├── models/             # Usuario, Aula, Inscricao, Noticia, Doacao, Voluntario
│   ├── routes/             # auth, aulas, inscricoes (2 bps), noticias, doacoes,
│   │                       #   voluntarios, usuarios, dashboard, relatorios
│   ├── schemas/            # Marshmallow
│   ├── services/pdf_relatorio.py
│   ├── utils/              # decorators (@professor_required, @aluno_required), pagination
│   ├── migrations/         # Alembic
│   ├── tests/              # pytest — 140 testes, 93.8% cobertura
│   │   ├── __init__.py
│   │   ├── conftest.py     # fixtures compartilhadas
│   │   └── test_*.py       # 9 arquivos de teste
│   ├── instance/vela.db
│   ├── .env
│   ├── .env.example
│   ├── pytest.ini          # config pytest + coverage
│   ├── .coveragerc         # exclusões de coverage
│   ├── ruff.toml           # config do linter
│   ├── openapi.yaml
│   ├── seed.py             # popula banco (idempotente, usado no deploy)
│   ├── requirements.txt
│   └── vela-init.ps1
├── frontend/
│   ├── public/assets/img/  # imagens copiadas do PHP
│   ├── src/
│   │   ├── main.jsx        # Tema MUI + paleta FBVA (ou CEUB na outra branch)
│   │   ├── App.jsx         # Routes (incluindo /esqueci-senha, /redefinir-senha)
│   │   ├── pages/          # Landing, Login, Cadastro, EsqueciSenha, RedefinirSenha,
│   │   │                   #   Dashboard, Aulas, Noticias, Doacoes, Voluntarios,
│   │   │                   #   Usuarios, Relatorio
│   │   ├── components/     # Layout, Navbar, PrivateRoute, ProfessorRoute,
│   │   │                   #   HeaderLanding, MapaLocalizacao, WidgetAcessibilidade
│   │   ├── contexts/       # AuthContext (lazy initial state — sem flash)
│   │   ├── services/api.js
│   │   ├── index.css
│   │   └── utils/
│   ├── cypress/            # Testes E2E — 7 specs, 23 testes
│   │   ├── e2e/            # 01-landing-login, 02-cadastro, 03-aulas-crud, 04-acessibilidade,
│   │   │                   #   05-aluno-inscricao, 06-esqueci-senha, 07-cannot-delete-self
│   │   └── support/        # commands.js (loginViaApi, loginUI, limparAuth) + e2e.js
│   ├── vite.config.js
│   ├── vercel.json         # rewrite pra SPA routing
│   ├── cypress.config.js
│   ├── eslint.config.js    # config com globals Cypress pra cypress/
│   ├── .env.local
│   └── package.json
├── docs/                   # documentação técnica
├── .github/
│   └── workflows/
│       └── ci.yml          # 4 jobs: backend-tests, frontend-build, lint-backend, lint-frontend
├── .gitignore
├── README.md
├── CLAUDE.md               # ESTE arquivo
└── start-dev.ps1           # sobe backend + frontend em paralelo (Windows)
```

### Estrutura de rotas (frontend)

```
/                    → Landing publica (visual PHP 100% + Leaflet)
/login               → Login split-screen (esquerda azul com Zoé + direita form)
/cadastro            → Cadastro publico split-screen (mesmo padrao)
/esqueci-senha       → Solicita link de reset por email
/redefinir-senha?token=XXX  → Define nova senha com token temporário
/dashboard           → Dashboard com Recharts (métricas diferentes por papel)
/aulas, /noticias    → privadas, qualquer logado
/doacoes, /voluntarios, /relatorio, /usuarios → privadas, só professor
```

Logout redireciona para `/` (landing). Fallback de qualquer URL desconhecida também vai pra `/`.

---

## 5. Como rodar localmente

### Comando único (recomendado)
```powershell
cd C:\dev\a3-vela
.\start-dev.ps1
```
Abre backend em http://localhost:5000, frontend em http://localhost:5173 e browser em 5173 após 5s.

### Separado
```powershell
# Backend
cd C:\dev\a3-vela\backend
.\venv\Scripts\Activate.ps1
python app.py

# Frontend (outro terminal)
cd C:\dev\a3-vela\frontend
npm run dev
```

### Rodar testes
```powershell
# Backend (pytest com coverage)
cd C:\dev\a3-vela\backend
.\venv\Scripts\Activate.ps1
pytest

# Lint backend (ruff)
ruff check .

# Frontend — E2E Cypress (interativo)
cd C:\dev\a3-vela\frontend
npm run cypress:open

# Frontend — E2E Cypress (headless, CI-like)
npm run cypress:run

# Lint frontend (eslint)
npm run lint
```

### Helper para testes manuais da API
```powershell
cd C:\dev\a3-vela\backend
.\vela-init.ps1
# popula $headersProf (Carlos) e $headersAluno (Maria) + define Invoke-ApiJson
```

---

## 6. Usuários de teste (senha: `Senha123!`)

Após `python seed.py` ou primeiro deploy, estes usuários ficam disponíveis:

| Papel     | E-mail              | Nome típico       |
|-----------|---------------------|-------------------|
| professor | `carlos@teste.com`  | Carlos Andrade    |
| professor | `ana@teste.com`     | Ana Pereira       |
| aluno     | `maria@teste.com`   | Maria Silva       |
| aluno     | `joao@teste.com`    | João Santos       |
| aluno     | `beatriz@teste.com` | Beatriz Lima      |

> ⚠️ **Os IDs podem variar entre ambientes!** Sempre fazer `GET /usuarios` pra ver o ID real
> antes de testar PUT/DELETE em um ID específico.

**Reset de senha (se login falhar):**
```powershell
python -c "from app import create_app; from extensions import db; from models import Usuario; a=create_app(); a.app_context().push(); u=Usuario.query.filter_by(email='carlos@teste.com').first(); u.set_senha('Senha123!'); db.session.commit()"
```

---

## 7. Schema do banco (nomes REAIS — descobertos na prática)

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

## 8. API — formato de resposta

**Paginação (regra geral):** `{ "data": [...], "meta": { page, per_page, total, total_pages } }`
**Erro:** sempre `{ "error": "msg", "code": "SLUG", "details": { campo: ["erro"] }? }`
**Autenticação:** `Authorization: Bearer <access_token>`

⚠️ **Exceção à regra de paginação:** `/usuarios` usa `{ items: [...], page, pages, per_page }` (inconsistência documentada — ver seção 10).

### Base URL
- Local: `http://localhost:5000/api/v1`
- Produção: `https://vela-para-todos-api.onrender.com/api/v1`
- Config no frontend: `VITE_API_URL` em `frontend/.env.local`

### Endpoints principais

| Método | Rota | Papel | Observações |
|---|---|---|---|
| POST | `/auth/register` | público | body `{nome, email, senha, data_nascimento, papel}`. Rate 3/min |
| POST | `/auth/login` | público | body `{email, senha}` → `{access_token, refresh_token, usuario}`. Rate 5/min |
| POST | `/auth/refresh` | refresh JWT | retorna `{access_token}` |
| POST | `/auth/logout` | JWT | blocklist em memória |
| GET | `/auth/me` | JWT | dados do usuário logado |
| POST | `/auth/esqueci-senha` | público | body `{email}`. Resposta genérica 200 (evita enumeração). Rate 3/min |
| POST | `/auth/redefinir-senha` | público (token JWT no body) | body `{token, nova_senha}`. Rate 5/min |
| GET | `/dashboard/stats` | JWT | métricas diferentes por papel (professor vs aluno) |
| GET | `/usuarios` | professor | query: `page, per_page, papel, q`. **Shape `items`** |
| GET | `/usuarios/<id>` | próprio ou professor | — |
| PUT | `/usuarios/<id>` | próprio ou professor | body `{nome?, email?, data_nascimento?, papel?}` — só professor muda papel |
| DELETE | `/usuarios/<id>` | professor (não próprio) | protege CANNOT_DELETE_SELF |
| GET | `/aulas` | **JWT (qualquer logado)** | query: `page, per_page, data_inicio, data_fim, professor_id, com_vagas` |
| POST | `/aulas` | professor | body `{descricao, data, horario "HH:MM", duracao_min, vagas}` |
| GET | `/aulas/<id>` | **JWT** | — |
| PUT/DELETE | `/aulas/<id>` | professor dono | PUT exige body COMPLETO (não aceita update parcial) |
| GET | `/aulas/<id>/inscricoes` | professor dono | lista inscritos |
| POST | `/inscricoes` | aluno | body `{aula_id}` |
| GET | `/inscricoes` | aluno (JWT) | lista as PRÓPRIAS inscrições (detecta via token) |
| DELETE | `/inscricoes/<id>` | aluno dono | cancelar |
| GET | `/noticias` | público | query: `page, per_page, q` (busca ilike no título) |
| GET | `/noticias/<id>` | público | retorna `conteudo` completo |
| POST/PUT/DELETE | `/noticias[/<id>]` | professor | body `{titulo, conteudo, imagem?}` |
| GET | `/doacoes` | professor | filtro: `forma_pagamento` + resumo agregado |
| POST | `/doacoes` | público | body `{nome_doador, valor, forma_pagamento}`. Rate 10/min |
| GET | `/voluntarios` | professor | filtro: `status` |
| POST | `/voluntarios` | público | body `{nome, email, mensagem}`. Rate 3/min |
| PATCH | `/voluntarios/<id>/status` | professor | body `{status}` |
| GET | `/relatorios/inscricoes.pdf` | professor | retorna PDF binário; filtros: `data_inicio, data_fim, professor_id` |
| GET | `/health` | público | `{status, db, version}` — usado em smoke tests e CI |

### Formato do response de Aula
```json
{
  "id": 3, "descricao": "...", "data": "2026-11-20", "horario": "09:00",
  "duracao_min": 90, "vagas_total": 10, "vagas_disponiveis": 7,
  "professor": { "id": 3, "nome": "Carlos Andrade" }, "criado_em": "..."
}
```
No body do POST/PUT envia `vagas` (singular). No response expõe `vagas_total` e `vagas_disponiveis`.

### Notícias — DOIS schemas de response
```
GET /noticias           → NoticiaListSchema  (id, titulo, resumo, imagem, publicado_em)
GET /noticias/<id>      → NoticiaDetailSchema (id, titulo, conteudo, imagem, publicado_em)
```
Frontend chama `GET /noticias/<id>` ao abrir modal de leitura ou edição.

### Doações — resumo no mesmo response
```json
{
  "data": [...], "meta": {...},
  "resumo": { "total_arrecadado": 1225.5, "total_doacoes": 4 }
}
```

### Usuários — schemas
- **UsuarioResponseSchema**: id, nome, email, data_nascimento, papel, criado_em
- **RegisterSchema**: nome(3-100), email, senha(min 8, 1 letra + 1 número), data_nascimento (idade ≥ 14), papel
- **UsuarioUpdateSchema**: todos opcionais, mesmas validações. **Senha fora do escopo** (precisa endpoint próprio)
- **EsqueciSenhaSchema**: email
- **RedefinirSenhaSchema**: token (JWT), nova_senha

### Validações (Marshmallow)
- **Notícias:** titulo 5-200, conteudo min 20, imagem opcional max 255
- **Voluntários:** nome min 3, email válido, mensagem min 20
- **Doações:** valor > 0, forma_pagamento in ['pix','transferencia','paypal']
- **Aulas:** descricao min 3, data futura ao criar
- **Usuários:** idade mínima 14 anos, senha com letra + número

---

## 9. Padrões de código estabelecidos

### Backend
- Factory pattern em `app.py`, extensões em `extensions.py`
- Blueprints com `url_prefix=f"{api}/XXX"` onde `api = "/api/v1"`
- Decorators: `@aluno_required`, `@professor_required` em `utils/decorators.py`
- Helper de paginação em `utils/pagination.py`
- Validação sempre com Marshmallow, erro 400 com `details` (às vezes 422)
- Rate limits em rotas públicas sensíveis (doações 10/min, voluntários 3/min, register 3/min)
- Busca textual em listagens: `query.filter(Model.campo.ilike(f"%{q}%"))` com param `q`
- Recursos com conteúdo longo: dois schemas separados (`ListSchema` + `DetailSchema`)
- Proteções de integridade: CANNOT_DELETE_SELF em `/usuarios`, verificação de email único em PUT

### Frontend
- Páginas em `src/pages/<Nome>.jsx` (arquivo único; componentes auxiliares inline)
- Componentes compartilhados em `src/components/`
- API via `src/services/api.js` (axios singleton, nunca `fetch` cru)
- Estado local com `useState` + `useEffect`; nada de Redux/Zustand
- Autenticação via `useAuth()` do `AuthContext` (lazy initial state)
- Loading/erro/vazio sempre tratados em páginas de lista
- Feedback via `<Snackbar>` do MUI ou `<Alert>` inline
- Confirmação de ação destrutiva via `<Dialog>`
- Erros amigáveis com helper `extrairMensagemErro(data)`
- Validação visual: campos com `error={}` e `helperText` com contagem
- Botão desabilitado enquanto form inválido (`disabled={!tituloValido}`)
- Recursos com conteúdo longo: modal de leitura faz `GET /recurso/<id>` quando abre
- PDF: `responseType: "blob"` + `window.open(URL.createObjectURL)`

### Padrão de wrapper de página admin (bate com Voluntarios, Usuarios)
```jsx
<Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
  <Box className="flex items-center gap-2 mb-4">
    <IconeDaPagina color="primary" sx={{ fontSize: 36 }} />
    <Typography variant="h4" color="primary" fontWeight="bold">
      Título da página
    </Typography>
  </Box>
  {/* conteúdo */}
</Container>
```

### Validação client-side em TODOS os formulários
Para evitar o tooltip HTML5 feio ("Preencha este campo"), todo form público/privado deve ter:
1. `noValidate` no `<Box component="form">`
2. Função `validarLocal()` que retorna `true/false` e preenche `erroCampos`
3. `handleSubmit` chama `validarLocal()` antes do POST
4. TextFields com `error={!!erroCampos.campo}` e `helperText={erroCampos.campo}`
5. Bônus UX: `onChange` limpa o erro do próprio campo (sensação de "estou corrigindo")

Ver `Login.jsx` e `Cadastro.jsx` como referência.

### O projeto mistura MUI + Tailwind
Alguns componentes usam `className="flex items-center gap-2"` (Tailwind) ao invés de `sx={{ display: "flex", alignItems: "center", gap: 1 }}` (MUI). Ambos funcionam. Ao copiar padrões de uma página pra outra, respeite a convenção já adotada naquele componente.

### Identidade visual (convenções do PHP)
- **Padronagem amarela** (pattern-amarelo.jpg) sempre **acima** do header e invertida no rodapé
- **Logos pretas → brancas:** usar `filter: "brightness(0) invert(1)"` em fundos escuros
- **Mascote Zoé:** balão de fala só ao hover (não permanente), animação `float 4s ease-in-out infinite`
- **Seções com fundo azul:** gradient `linear-gradient(135deg, #19629E 0%, #1F7AC4 100%)` + overlay de pattern com opacity 0.08-0.1
- **Cards tipo PHP:** borderRadius 12, hover `translateY(-4px)` + shadow azul `rgba(29,113,184,0.15-0.2)`
- **Botões primários:** bordaTop colorida (amarelo em cards azuis, azul em cards brancos) pra destacar
- **Ícones em círculos coloridos:** `Box` 90x90 (ou menor) circular (border-radius 50%) com bgcolor contrastante
- **Navbar admin:** branca + `borderBottom: "4px solid #F9B233"` + logo horizontal + pill azul-claro com avatar + chip de papel + botão Sair amarelo
- **Login/Cadastro split-screen:** coluna esquerda com gradient azul + pattern-hexagonal + mascote animado + título branco; direita form branco

### Mobile-first
- Páginas listagem: `<Grid size={{ xs: 12, sm: 6, md: 4 }}>`
- Navbar interna (autenticada): `useMediaQuery(theme.breakpoints.down("md"))` pra Drawer hamburger
- Landing publica: também tem Drawer hamburger no mobile (em `components/HeaderLanding.jsx`)
- `<Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>` padrão
- `<Stack direction={{ xs: "column", sm: "row" }}>` para formulários

---

## 10. "Pegadinhas" aprendidas (NÃO REPETIR)

### `.env.local` com BOM quebra o Vite
`Out-File -Encoding UTF8` do PowerShell 5.1 adiciona BOM (3 bytes), e o Vite
não lê a variável. Use `Out-File -Encoding ASCII` para arquivos `.env*`.

### CORS precisa incluir a porta do Vite
`.env` do backend: `CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000`
Mudanças exigem **reiniciar o Flask**.

### MUI v6+/v7 trocou props para `slotProps`
- ❌ `InputLabelProps={{ shrink: true }}` → ✅ `slotProps={{ inputLabel: { shrink: true } }}`
- ❌ `inputProps={{ min: 1 }}` → ✅ `slotProps={{ htmlInput: { min: 1 } }}`

### Grid MUI v2 mudou a sintaxe
- ❌ `<Grid item xs={12} sm={6}>` → ✅ `<Grid size={{ xs: 12, sm: 6 }}>`

### Props responsivas (alignItems, textAlign, justifyContent) vão em `sx`
- ❌ `<Stack alignItems={{ xs: "flex-start", md: "center" }}>` (gera warning no console)
- ✅ `<Stack sx={{ alignItems: { xs: "flex-start", md: "center" } }}>`

### `alignItems` como prop direta em Stack/Grid vaza pro DOM (MESMO não-responsivo!)
Em versões recentes do MUI v6+, `alignItems="center"` como prop direta em `<Stack>` ou `<Grid container>` vaza como atributo HTML e gera warning React. **Sempre dentro de `sx`**, mesmo quando é valor fixo.

### `<Chip>` / `<Box>` dentro de `<Typography>` quebra HTML
`<Typography>` renderiza como `<p>` por padrão. HTML não permite `<div>` (que Chip, Box, Card viram) dentro de `<p>`. Dispara "hydration error" e warnings `<div> cannot be a descendant of <p>`.

Soluções:
- Tirar o `<Chip>` pra fora do Typography e colocar no Stack junto
- OU: `<Typography component="span" ...>` pra virar inline (mas perde margens de parágrafo)

Nota: `<svg>` (ícones MUI) são inline e PODEM ficar dentro de Typography sem problema.

### Títulos em branco sobre fundo azul precisam de `!important`
Usar `sx={{ color: "#ffffff !important" }}` porque o tema MUI sobrescreve `color="white"` em variants como `h1`, `h2`.

### aria-hidden warning ao abrir Dialog/Drawer
Botão que abre o Dialog/Drawer retém foco, aí o aria-hidden entra em conflito.
Fix: fazer o botão perder foco no onClick:
```jsx
onClick={(e) => { e.currentTarget.blur(); setOpen(true); }}
```

### SQLAlchemy 2.x não aceita strings em `joinedload`
- ❌ `joinedload("aluno")` → ✅ `joinedload(Inscricao.aluno)`
`Query.unique()` não existe no legacy Query — joinedload de coleção já deduplica.

### SQLAlchemy `Usuario.query.get()` gera LegacyAPIWarning
Deprecated no SQLAlchemy 2.x. Fix: `db.session.get(Usuario, id)`.
Não afeta funcionamento, só gera warning.

### Flask lê `.env` só no boot
Qualquer mudança exige `Ctrl+C` + `python app.py`.

### Zone Identifier bloqueia scripts baixados
Use `Unblock-File -Path .\script.ps1` antes de rodar `.ps1` baixado de chat/web.

### PowerShell 5.1 quebra UTF-8 em body JSON
Por isso existe `Invoke-ApiJson` no `vela-init.ps1` que converte pra `UTF8.GetBytes()`.

### URL de imagem em `<img>` deve ser URL DIRETA
Não aceita URL de página web. Precisa terminar em `.jpg`, `.png`, `.webp`, `.gif`.

### Backend pode não ter filtros documentados
**Sempre checar o blueprint antes de assumir que filtro existe.**

### Rota `/` deve ser Landing pública
Padrão da web — Dashboard privado vai em `/dashboard`. Após logout, redireciona para `/`.

### Endpoint de inscrição em aula
É `POST /inscricoes` com body `{aula_id}`, NÃO `POST /aulas/<id>/inscricoes` (esse retorna 405).

### Leaflet com Vite — ícones padrão quebrados
Se usar `<Marker>` sem `icon` custom, aparece quadrado quebrado. Fix com `L.Icon.Default.mergeOptions({...})`.
Se usar `L.divIcon` custom, **não precisa** desse fix (é o caso do `MapaLocalizacao.jsx`).

### Limitar zoom/pan do Leaflet
`<MapContainer minZoom={11} maxZoom={19} maxBounds={LIMITES} maxBoundsViscosity={1.0} worldCopyJump={false}>` + `<TileLayer noWrap={true}>`.

### Commitar antes de pausar sessão
**Sempre fazer `git status` + commit antes de pausar.** Refatorações grandes não-commitadas se misturam com o trabalho do dia seguinte.

### Testes manuais da API: nunca assumir IDs do seed
Sempre fazer `GET /recurso` e usar o ID retornado antes de `PUT` ou `DELETE`.

### Hidratar estado do localStorage: use LAZY INITIAL STATE (não useEffect)
No React 18+ com StrictMode, `useState(null) + useEffect` causa flash de conteúdo errado. Padrão correto:

```jsx
// ❌ ERRADO: causa flash de conteúdo não autorizado
const [valor, setValor] = useState(null);
useEffect(() => { setValor(hidratarDoStorage()); }, []);

// ✅ CERTO: estado nasce já hidratado
const [valor, setValor] = useState(() => hidratarDoStorage());
```

Casos reais: `WidgetAcessibilidade.jsx` (fonte voltava ao padrão no F5) e `AuthContext.jsx` (flash de "Acesso restrito" antes do dashboard carregar).

### VLibras tem warnings normais no console
A integração oficial do VLibras (`https://vlibras.gov.br/app/vlibras-plugin.js`) gera warnings sobre iframe/accelerometer/devicemotion que são INTERNOS e NÃO são bugs nossos. **Não silenciar.**

### `<html lang="en">` padrão do Vite deve virar `"pt-BR"`
Screen readers e VLibras dependem disso. Trocar manualmente no `index.html`.

### `/aulas` exige autenticação (contrário do que a tabela da seção 8 originalmente dizia)
Todos os endpoints de `/aulas` **retornam 401 sem JWT**, incluindo os GET. Qualquer usuário autenticado (aluno ou professor) pode listar e ver detalhes; só professor pode criar/editar/deletar.

### PUT /aulas/<id> exige body COMPLETO (não aceita update parcial)
Precisa enviar todos os campos obrigatórios (descricao, data, horario, duracao_min, vagas). Se mandar só `{descricao: "x"}`, retorna 400.

### `/usuarios` usa paginação DIFERENTE do resto do projeto
- `/usuarios` → `{items: [...], page, pages, per_page}`
- Resto → `{data: [...], meta: {page, per_page, total, total_pages}}`

Padronizar algum dia. Enquanto não é feito, código consumindo `/usuarios` precisa usar `items`.

### `TestingConfig` e `DevelopmentConfig` precisam desativar rate limiter
Sem `RATELIMIT_ENABLED = False`, pytest e Cypress (que fazem múltiplos logins em sequência) batem em 429. Em `ProductionConfig` fica ativo, protege real.

### Validações da API às vezes retornam 422 em vez de 400
Regras de negócio podem devolver 400, 404, 409 OU 422. Nos testes: `assert res.status_code in (400, 404, 409, 422)`.

### `os.environ["X"]` em atributo de classe quebra import no CI
Python avalia atributos de classe no momento da **definição** (import), não da instância. Se `ProductionConfig` tem `SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]`, o import de `config.py` quebra em ambientes sem essa var (CI, dev sem `.env`), mesmo rodando em `FLASK_ENV=testing`. Fix: usar `os.environ.get("X", "")`.

### Deploy no Render exige driver psycopg2 explícito
SQLAlchemy 2+ tenta usar `psycopg` v3 por default, mas `requirements.txt` instala `psycopg2-binary`. Fix em `config.py`:
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

### `python-dateutil` precisa estar explícito no requirements.txt
Funciona local porque chega "de carona" com outra lib, mas no Render não. Toda `import` direta TEM que estar declarada.

### `.env.example` vs `env.example` (sem ponto)
Windows/VS Code pode salvar o arquivo sem o ponto inicial. O arquivo tem que ter o ponto, senão o git não trata como dotfile padrão.

### Render Free dorme após 15 min sem tráfego
Primeira requisição depois demora 30-60 seg. Pra apresentação: acordar o backend 2 min antes com `/health`.

### PowerShell `curl` ≠ curl real
É alias pro `Invoke-WebRequest`. Pra APIs JSON, usar `Invoke-RestMethod` ou `curl.exe` (nativo no Win10+).

### Vite 8 (Vercel) é estrito com UTF-8
Arquivos `.jsx` com encoding Latin1/CP1252 passam no Vite 7 local mas quebram com `[UNLOADABLE_DEPENDENCY] - stream did not contain valid UTF-8`. Detecção + fix com `[System.IO.File]::WriteAllText(path, texto, [System.Text.UTF8Encoding]::new($false))`.

### SPA routing na Vercel precisa de `vercel.json`
Sem ele, URLs tipo `/login` acessadas diretamente dão 404. Fix: criar `frontend/vercel.json` com rewrite `/(.*) → /index.html`.

### Deployment URL (com hash) ≠ Production/Preview URL na Vercel
Pro CORS, SEMPRE usar o URL estável. URL com hash muda a cada deploy.

### Vercel reusa projeto se importar o mesmo repo
Importar um repo já vinculado a outro projeto da mesma conta NÃO cria projeto novo — apenas cria deploy preview. Pra forçar separação, dar nome explicitamente diferente.

### Backend único serve todos os frontends
Render deploya UMA branch (main). PDFs, templates server-side vêm sempre da `main`, mesmo quando o frontend CEUB chama. Fix pendente: query param `?tema=ceub` + lógica no `pdf_relatorio.py`.

### npm 10+ bloqueia scripts de pacotes por padrão
Pacotes como Cypress, Playwright, puppeteer têm `postinstall` que baixa binários. Nas versões recentes do npm, isso fica bloqueado com warning:
```
npm warn install-scripts 1 package has install scripts not yet covered by allowScripts
```
Fix:
```powershell
npm install-scripts approve <pacote>
npx <pacote> install
```
Aconteceu com Cypress (tentou postinstall de ~500MB e não baixou).

### Cypress 16 removeu `Cypress.env()` (breaking change)
Agora é `Cypress.expose()` ou `cy.env()`. Pra URLs locais fixas, melhor hardcodar no `commands.js`:
```js
const API_URL = "http://localhost:5000/api/v1";
Cypress.Commands.add("loginViaApi", (email, senha) => {
  cy.request("POST", `${API_URL}/auth/login`, { email, senha })...
});
```

### Cypress 16 deprecou Electron como browser
Warning: "The Electron browser is deprecated as a test browser". Fix: trocar pra Chrome em `cypress:run`:
```json
"cypress:run": "cypress run --browser chrome"
```

### ESLint precisa de globals do Cypress em `cypress/`
Sem config, `cy`, `Cypress`, `describe`, `it` etc. acusam `no-undef` no lint.
Fix no `eslint.config.js`:
```js
{
  files: ['cypress/**/*.{js,cy.js}'],
  languageOptions: {
    globals: {
      ...globals.mocha,
      cy: 'readonly',
      Cypress: 'readonly',
      expect: 'readonly',
      assert: 'readonly',
    },
  },
},
```

### Cypress reclama de rate limit em DevelopmentConfig
Testes Cypress fazem muitos logins via `cy.loginViaApi()` em `beforeEach`. Sem `RATELIMIT_ENABLED = False` no `DevelopmentConfig`, batem em 429. Agora está desativado em dev (mantém ativo em prod).

### Estrutura do Cypress é `cypress/e2e/` E `cypress/support/` (irmãos)
Se criar `cypress/support/e2e/` (dentro de support), os testes NÃO são encontrados. O Cypress procura em `cypress/e2e/*.cy.js` por padrão.

---

## 11. Estado atual do projeto (snapshot 2026-11-26)

### Backend
- ✅ 9 blueprints implementados e **testados** (pytest 93.8% cobertura)
- ✅ `/usuarios` CRUD administrativo com CANNOT_DELETE_SELF
- ✅ Health check em `/health`
- ✅ `/dashboard/stats` com métricas por papel
- ✅ `/auth/esqueci-senha` + `/auth/redefinir-senha` (fluxo híbrido com JWT de reset)
- ✅ OpenAPI em `/apidocs` (em dev)
- ✅ **Deploy em produção no Render** com PostgreSQL

### Frontend — Funcionalidade
- ✅ Setup completo (Vite + React + Tailwind + MUI + Leaflet + Recharts)
- ✅ Autenticação completa com rotas protegidas
- ✅ Navbar interna mobile-first com Drawer
- ✅ Todas as páginas (Aulas, Notícias, Doações, Voluntários, Relatório, Cadastro, Usuários, Esqueci/Redefinir Senha, Dashboard elaborado)
- ✅ Landing pública completa com Leaflet
- ✅ **Deploy em produção na Vercel** (main FBVA + preview CEUB)

### Frontend — Identidade visual
- ✅ Paleta FBVA completa (main) + Paleta CEUB (apresentacao-ceub)
- ✅ Visual PHP replicado (landing, login/cadastro split-screen, navbar admin)
- ✅ Validação client-side uniforme (adeus tooltip HTML5)
- ✅ Leaflet (mapa real em "Onde estamos")
- ✅ VLibras oficial + widget customizado (A+/A-/contraste com localStorage)

### Qualidade
- ✅ **140 testes pytest no backend** (93.8% cobertura)
- ✅ **23 testes Cypress E2E no frontend** (7 specs, ~46s)
- ✅ Lint backend com ruff (regras E/F/W/I)
- ✅ Lint frontend com eslint (config custom pra Cypress globals)

### Infraestrutura
- ✅ Repo no GitHub (`Guictss/ceub_projeto_seminario_final_2026`)
- ✅ Script `start-dev.ps1`
- ✅ **GitHub Actions CI/CD** com 4 jobs em paralelo (~1 min pipeline total)

---

## 12. Projeto antigo (PHP/MySQL) — referência visual

- Repo: `Guictss/Desenvolvimento_de_Sistemas` (pasta `a3_vela/`)
- Rodando em `C:\xampp\htdocs\Desenvolvimento_de_Sistemas\a3_vela\`
- URL local: http://localhost/Desenvolvimento_de_Sistemas/a3_vela/
- CSS fonte: `assets/css/style.css`, `landing.css`, `auth.css`
- Banco MySQL: `vela_para_todos` (reconstruído do zero)
- Credenciais MySQL: `root` / `ReapperOW31.`

---

## 13. Template de página (copie para criar novas)

Para novas páginas de listagem, siga o padrão de `Aulas.jsx` (CRUD completo),
`Noticias.jsx` (lista + conteúdo longo), `Doacoes.jsx` (listagem simples com resumo),
ou `Usuarios.jsx` (lista com filtros + modal edição + dialog exclusão).

### Checklist mínimo
1. `useState` para `data`, `loading`, `erro`, `meta`, `filtros`, `filtrosAplicados`
2. `useCallback` com `carregar()` que chama `api.get("/recurso", { params })`
3. `useEffect` que dispara `carregar()` quando `filtrosAplicados` muda
4. Loading: `<CircularProgress>` centralizado
5. Erro: `<Alert severity="error">` com `extrairMensagemErro()` helper
6. Vazio: `<Alert severity="info">` com mensagem contextual
7. Lista: `<Grid container>` com `<Grid size={{ xs: 12, sm: 6, md: 4 }}>` + card
8. Modal CRUD inline
9. Dialog de confirmação de delete
10. Snackbar para feedback
11. Botões de criar só para professor (verificar `usuario.papel`)
12. Edit/delete só para o dono do recurso
13. Para conteúdo longo: `GET /recurso/<id>` ao abrir modal

### Helper padrão para erros amigáveis
```js
function extrairMensagemErro(data) {
  if (!data) return "Erro desconhecido";
  if (data.details) {
    const primeiraChave = Object.keys(data.details)[0];
    if (primeiraChave) {
      const msgs = data.details[primeiraChave];
      return Array.isArray(msgs) ? msgs[0] : String(msgs);
    }
  }
  return data.error || "Erro ao processar requisição";
}
```

---

## 14. Próximos passos planejados

- ✅ ~~Login split-screen~~
- ✅ ~~Navbar admin estilo PHP~~
- ✅ ~~Backend `routes/usuarios.py`~~
- ✅ ~~Página /cadastro pública~~
- ✅ ~~Página /usuarios admin~~
- ✅ ~~Leaflet (mapa real em "Onde estamos")~~
- ✅ ~~VLibras + widget acessibilidade~~
- ✅ ~~Deploy backend Render + frontend Vercel~~ (2026-11-24)
- ✅ ~~Testes de backend com pytest~~ (2026-11-25 — 140 testes, 93.8% cobertura)
- ✅ ~~GitHub Actions CI/CD~~ (2026-11-26 — 4 jobs)
- ✅ ~~Cypress E2E~~ (2026-11-26 — 23 testes em 7 specs)
- 📅 **Vitest + React Testing Library** (testes de unidade frontend) — opcional, meta 70%+
- 📅 **PDF multi-tema** (query param `?tema=ceub` no backend) — relatório CEUB ainda sai com cores FBVA
- 📅 Páginas internas (dashboard, listas) com visual PHP mais enfático

---

## 15. Testes (backend — pytest)

### Status: **140 testes, 93.8% cobertura** 🏆

Setup com pytest + pytest-cov + pytest-flask. Banco SQLite in-memory, app Flask fresca por teste.

### Como rodar

```powershell
cd C:\dev\a3-vela\backend
.\venv\Scripts\Activate.ps1

pytest                                          # todos com cobertura
pytest tests/test_auth.py -v                    # um arquivo
pytest tests/test_auth.py::TestLogin -v         # uma classe
start htmlcov/index.html                        # relatório HTML
```

### Estrutura

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

### Fixtures em `conftest.py`

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

### TestingConfig
```python
class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-key-com-pelo-menos-32-bytes-pra-silenciar-warning"
    WTF_CSRF_ENABLED = False
    RATELIMIT_ENABLED = False
```

### Coverage por módulo

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

## 16. Testes (frontend — Cypress E2E)

### Status: **23 testes em 7 specs** 🎯 — suíte roda em ~46s

### Como rodar

```powershell
cd C:\dev\a3-vela\frontend

# Interativo (UI do Cypress)
npm run cypress:open

# Headless (como no CI)
npm run cypress:run

# Com start-server-and-test (sobe frontend automaticamente)
npm run test:e2e
```

**Pré-requisito**: backend precisa estar rodando em `http://localhost:5000` (interativo) ou `test:e2e` sobe o frontend (mas backend ainda precisa ser manual).

### Estrutura

```
frontend/
├── cypress.config.js
└── cypress/
    ├── e2e/
    │   ├── 01-landing-login.cy.js         # 4 testes
    │   ├── 02-cadastro.cy.js              # 3 testes
    │   ├── 03-aulas-crud.cy.js            # 3 testes
    │   ├── 04-acessibilidade.cy.js        # 2 testes
    │   ├── 05-aluno-inscricao.cy.js       # 4 testes
    │   ├── 06-esqueci-senha.cy.js         # 4 testes
    │   └── 07-cannot-delete-self.cy.js    # 3 testes
    └── support/
        ├── e2e.js                         # import "./commands"
        └── commands.js                    # loginViaApi, loginUI, limparAuth
```

### Custom commands
- `cy.loginViaApi(email, senha)` — login programático via POST /auth/login + localStorage
- `cy.loginUI(email, senha)` — login preenchendo o form (testa o fluxo real)
- `cy.limparAuth()` — `clearLocalStorage()` + `clearCookies()`

### Config
```js
// cypress.config.js
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    env: {
      API_URL: "http://localhost:5000/api/v1",   // ⚠️ NÃO usar via Cypress.env() no Cypress 16+
    },
  },
});
```

### Scripts no package.json
```json
"cypress:open": "cypress open",
"cypress:run": "cypress run --browser chrome",
"test:e2e": "start-server-and-test dev http://localhost:5173 cypress:run"
```

---

## 17. Deploy (produção)

### Backend — Render.com (concluído 2026-11-23)
- **Serviço**: `vela-para-todos-api` (Web Service, free tier)
- **URL**: https://vela-para-todos-api.onrender.com
- **Banco**: PostgreSQL free tier (mesma região, linkado via Internal Database URL)
- **Build Command**: `pip install -r requirements.txt && flask db upgrade && python seed.py`
- **Start Command**: `gunicorn "app:create_app()" --bind 0.0.0.0:$PORT`
- **Env vars obrigatórias**: `FLASK_ENV=production`, `SECRET_KEY`, `JWT_SECRET_KEY`,
  `DATABASE_URL` (auto do PostgreSQL linkado), `CORS_ORIGINS`, `PYTHON_VERSION=3.12.4`

### Frontend — Vercel (concluído 2026-11-24)

**Projeto único `vela-para-todos`** (branch `main` = production, `apresentacao-ceub` = preview)

- URL FBVA (production): https://vela-para-todos.vercel.app
- URL CEUB (preview estável): https://vela-para-todos-git-apresentacao-ceub-guicts.vercel.app
- Build: Vite 8, bundle ~1.37 MB (gzip 407 KB)
- Env var: `VITE_API_URL=https://vela-para-todos-api.onrender.com/api/v1`
- Root Directory: `frontend`

⚠️ **Preview CEUB NÃO é projeto separado** — vive dentro do projeto único. Pra separar, criar com nome explicitamente diferente.

### `CORS_ORIGINS` em produção
```
http://localhost:5173,http://127.0.0.1:5173,https://vela-para-todos.vercel.app,https://vela-para-todos-git-apresentacao-ceub-guicts.vercel.app
```

### 🧪 Smoke test pós-deploy

```powershell
# 1. Health check
Invoke-RestMethod https://vela-para-todos-api.onrender.com/health

# 2. Login + aulas autenticadas
$body = @{email="carlos@teste.com"; senha="Senha123!"} | ConvertTo-Json
$login = Invoke-RestMethod -Uri https://vela-para-todos-api.onrender.com/api/v1/auth/login `
  -Method POST -Body $body -ContentType "application/json"
$headers = @{ Authorization = "Bearer $($login.access_token)" }
Invoke-RestMethod -Uri https://vela-para-todos-api.onrender.com/api/v1/aulas -Headers $headers
```

### 📋 Checklist pré-apresentação

1. **Acorda o backend** 2-3 min antes:
   `https://vela-para-todos-api.onrender.com/health` (Render Free dorme após 15 min).
2. **Abre as 2 abas** prontas:
   - FBVA: https://vela-para-todos.vercel.app
   - CEUB: https://vela-para-todos-git-apresentacao-ceub-guicts.vercel.app
3. **Credenciais à mão**:
   - Professor: `carlos@teste.com` / `Senha123!`
   - Aluno: `maria@teste.com` / `Senha123!`
4. **Backup local**: `.\start-dev.ps1` pronto pra rodar caso wifi/Render falhe.
5. **Hotspot do celular** como fallback de internet.

---

## 18. CI/CD (GitHub Actions)

### Status: ✅ 4 jobs verdes, pipeline total ~1 min

Arquivo: `.github/workflows/ci.yml`

### Jobs (rodam em paralelo)

| Job | O que faz | Tempo |
|---|---|---|
| **Backend Tests (pytest)** | Instala deps + roda `pytest --cov-fail-under=80` + upload de htmlcov como artifact | ~37s |
| **Frontend Build (Vite)** | `npm ci` + `npm run build` + upload do `dist/` como artifact | ~31s |
| **Lint Backend (ruff)** | Instala ruff + `ruff check .` | ~11s |
| **Lint Frontend (eslint)** | `npm ci` + `npm run lint` | ~34s |

### Dispara em
- Push nas branches `main` e `apresentacao-ceub`
- Pull requests pra `main`

### Env vars pros testes
```yaml
env:
  FLASK_ENV: testing
  SECRET_KEY: ci-secret-key-only-for-tests-not-production
  JWT_SECRET_KEY: ci-jwt-secret-key-at-least-32-bytes-long-for-ci
```

### Badge no README
```markdown
![CI](https://github.com/Guictss/ceub_projeto_seminario_final_2026/actions/workflows/ci.yml/badge.svg)
```

---

_Última atualização: 2026-11-26 — Projeto COMPLETO pra apresentação final._
_Entregas da sessão: Cypress E2E (23 testes em 7 specs), fix AuthContext (lazy initial state eliminou flash de "acesso restrito"), lint eslint estendido pra cypress globals, RATELIMIT_ENABLED=False em DevelopmentConfig._
_Resumo geral do projeto: backend + 2 frontends em produção, 163 testes automatizados (140 pytest + 23 Cypress), CI/CD com 4 jobs verdes, cobertura backend 93.8%, documentação completa._