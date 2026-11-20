# CLAUDE.md — Projeto Vela Para Todos

> Guia operacional **para Claude** (ou outra IA) que vai trabalhar neste
> repositório. Leia este arquivo inteiro antes de qualquer alteração.
> Documento vivo: atualize sempre que decidirmos algo novo.

---

## 1. Contexto

Sistema web acadêmico da disciplina **Desenvolvimento Web do CEUB** (2026/2),
desenvolvido para a **Federação Brasileira de Vela Adaptada (FBVA)** —
projeto *Vela Para Todos*. Monorepo com **API REST em Flask** e **SPA em React**.

**Autor:** Guilherme Cervi (GitHub `Guictss`).
**Repo:** https://github.com/Guictss/ceub_projeto_seminario_final_2026
**Caminho local:** `C:\dev\a3-vela\`

**Status (2026-11-20):** desenvolvimento das 7 páginas concluído.
Em andamento: adaptação da identidade visual do projeto PHP original (Landing já pronta).

---

## 2. Stack

### Backend (`backend/`)
- Python 3.12 · Flask 3.0.3 · SQLAlchemy 2.1.8 · Flask-Migrate (Alembic)
- Flask-JWT-Extended (access 15 min, refresh 7 dias; blocklist em memória)
- Marshmallow 3.21.3 (validação)
- Flask-CORS · Flask-Limiter · Flask-Bcrypt (Werkzeug PBKDF2-SHA256)
- ReportLab 4.2.5 (PDF)
- flasgger (Swagger UI)
- SQLite (dev — `instance/vela.db`) · PostgreSQL (prod planejado)

### Frontend (`frontend/`)
- React 19 · Vite 7 · React Router 7
- Axios com interceptor JWT (silent refresh em 401)
- **Material UI v6+** (Emotion, Roboto, `@mui/icons-material`)
- **Tailwind CSS 4** via `@tailwindcss/vite` (zero-config, `@import "tailwindcss";`)
- **Mobile-first obrigatório** (requisito do projeto)

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

Configurado em `frontend/src/main.jsx`. Também expostas em `theme.palette.vela.*`.

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

---

## 4. Estrutura do monorepo

```text
C:\dev\a3-vela\
├── backend/
│   ├── app.py              # factory, registra 7 blueprints
│   ├── config.py           # Base/Dev/Test/Prod configs
│   ├── extensions.py       # db, migrate, jwt, cors, limiter
│   ├── models/             # Usuario, Aula, Inscricao, Noticia, Doacao, Voluntario
│   ├── routes/             # auth, aulas, inscricoes (2 bps), noticias, doacoes, voluntarios, relatorios
│   ├── schemas/            # Marshmallow para request/response
│   ├── services/pdf_relatorio.py
│   ├── utils/              # decorators, pagination
│   ├── migrations/
│   ├── instance/vela.db
│   ├── .env
│   ├── openapi.yaml
│   └── vela-init.ps1
├── frontend/
│   ├── public/assets/img/  # imagens copiadas do PHP (mascote, logos, patterns, fotos)
│   ├── src/
│   │   ├── main.jsx        # Tema MUI com paleta FBVA completa + customizacoes
│   │   ├── App.jsx         # Routes
│   │   ├── pages/          # Landing, Login, Dashboard, Aulas, Noticias, Doacoes, Voluntarios, Relatorio
│   │   ├── components/     # Layout, Navbar, PrivateRoute, ProfessorRoute, HeaderLanding
│   │   ├── contexts/       # AuthContext
│   │   ├── services/api.js
│   │   ├── index.css
│   │   └── utils/
│   ├── vite.config.js
│   ├── .env.local
│   └── package.json
├── docs/
├── .github/workflows/
├── .gitignore
├── README.md
├── CLAUDE.md               # ESTE arquivo
└── start-dev.ps1
```

### Estrutura de rotas

```
/                    → Landing publica (visual PHP 100%)
/login               → Login (ainda React/MUI padrao — Etapa 3)
/dashboard           → Dashboard (ainda React/MUI padrao)
/aulas, /noticias    → privadas, qualquer logado
/doacoes, /voluntarios, /relatorio → privadas, so professor
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

### Helper para testes manuais da API
```powershell
cd C:\dev\a3-vela\backend
.\vela-init.ps1
# popula $headersProf (Carlos) e $headersAluno (Maria) + define Invoke-ApiJson
```

---

## 6. Usuários de teste (senha: `Senha123!`)

| ID | Papel     | E-mail              | Nome            |
|----|-----------|---------------------|-----------------|
| 1  | professor | `teste@vela.com`    | —               |
| 2  | aluno     | `maria@teste.com`   | Maria Silva     |
| 3  | professor | `carlos@teste.com`  | Carlos Andrade  |

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
**Atenção:** usa `publicado_em` (não `criado_em`).
Property: `resumo`.

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

**Paginação:** sempre `{ "data": [...], "meta": { page, per_page, total, total_pages } }`
**Erro:** sempre `{ "error": "msg", "code": "SLUG", "details": { campo: ["erro"] }? }`
**Autenticação:** `Authorization: Bearer <access_token>`

### Base URL
- Local: `http://localhost:5000/api/v1`
- Config no frontend: `VITE_API_URL` em `frontend/.env.local`

### Endpoints principais

| Método | Rota | Papel | Observações |
|---|---|---|---|
| POST | `/auth/register` | público | body `{nome, email, senha, data_nascimento, papel}` |
| POST | `/auth/login` | público | body `{email, senha}` -> `{access_token, refresh_token, usuario}` |
| POST | `/auth/refresh` | refresh JWT | retorna `{access_token}` |
| POST | `/auth/logout` | JWT | blocklist em memória |
| GET | `/auth/me` | JWT | dados do usuário logado |
| GET | `/aulas` | público | query: `page, per_page, data_inicio, data_fim, professor_id, com_vagas` |
| POST | `/aulas` | professor | body `{descricao, data, horario "HH:MM", duracao_min, vagas}` |
| GET | `/aulas/<id>` | público | — |
| PUT/DELETE | `/aulas/<id>` | professor dono | — |
| POST | `/inscricoes` | aluno | body `{aula_id}` |
| DELETE | `/inscricoes/<id>` | aluno | cancelar |
| GET | `/aulas/<id>/inscricoes` | professor | lista inscritos |
| GET | `/noticias` | público | query: `page, per_page, q` (busca ilike no título) |
| GET | `/noticias/<id>` | público | retorna `conteudo` completo |
| POST/PUT/DELETE | `/noticias[/<id>]` | professor | body `{titulo, conteudo, imagem?}` |
| GET | `/doacoes` | professor | filtro: `forma_pagamento` + resumo |
| POST | `/doacoes` | público | body `{nome_doador, valor, forma_pagamento}`. Rate limit 10/min |
| GET | `/voluntarios` | professor | filtro: `status` |
| POST | `/voluntarios` | público | body `{nome, email, mensagem}`. Rate limit 3/min |
| PATCH | `/voluntarios/<id>/status` | professor | body `{status}` |
| GET | `/relatorios/inscricoes.pdf` | professor | retorna PDF binário; filtros: `data_inicio, data_fim, professor_id` |

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

### Validações (Marshmallow)
- **Notícias:** titulo 5-200, conteudo min 20, imagem opcional max 255
- **Voluntários:** nome min 3, email válido, mensagem min 20
- **Doações:** valor > 0, forma_pagamento in ['pix','transferencia','paypal']
- **Aulas:** descricao min 3, data futura ao criar

---

## 9. Padrões de código estabelecidos

### Backend
- Factory pattern em `app.py`, extensões em `extensions.py`
- Blueprints com `url_prefix=f"{api}/XXX"` onde `api = "/api/v1"`
- Decorators: `@aluno_required`, `@professor_required` em `utils/decorators.py`
- Helper de paginação em `utils/pagination.py`
- Validação sempre com Marshmallow, erro 400 com `details`
- Rate limits em rotas públicas sensíveis (doações 10/min, voluntários 3/min)
- Busca textual em listagens: `query.filter(Model.campo.ilike(f"%{q}%"))` com param `q`
- Recursos com conteúdo longo: dois schemas separados (`ListSchema` + `DetailSchema`)

### Frontend
- Páginas em `src/pages/<Nome>.jsx` (arquivo único; componentes auxiliares inline)
- Componentes compartilhados em `src/components/`
- API via `src/services/api.js` (axios singleton, nunca `fetch` cru)
- Estado local com `useState` + `useEffect`; nada de Redux/Zustand
- Autenticação via `useAuth()` do `AuthContext`
- Loading/erro/vazio sempre tratados em páginas de lista
- Feedback via `<Snackbar>` do MUI
- Confirmação de ação destrutiva via `<Dialog>`
- Erros amigáveis com helper `extrairMensagemErro(data)`
- Validação visual: campos com `error={}` e `helperText` com contagem
- Botão desabilitado enquanto form inválido (`disabled={!tituloValido}`)
- Recursos com conteúdo longo: modal de leitura faz `GET /recurso/<id>` quando abre
- PDF: `responseType: "blob"` + `window.open(URL.createObjectURL)`

### Identidade visual (seção nova — convenções do PHP)
- **Padronagem amarela** (pattern-amarelo.jpg) sempre **acima** do header e invertida no rodapé
- **Logos pretas → brancas:** usar `filter: "brightness(0) invert(1)"` em fundos escuros
- **Mascote Zoé:** balão de fala só ao hover (não permanente), animação `float 4s ease-in-out infinite`
- **Seções com fundo azul:** gradient `linear-gradient(135deg, #19629E 0%, #1F7AC4 100%)` + overlay de pattern com opacity 0.08-0.1
- **Cards tipo PHP:** borderRadius 12, hover `translateY(-4px)` + shadow azul `rgba(29,113,184,0.15-0.2)`
- **Botões primários:** bordaTop colorida (amarelo em cards azuis, azul em cards brancos) pra destacar
- **Ícones em círculos coloridos:** quando quiser destacar um ícone grande, colocar dentro de `Box` 90x90 circular (border-radius 50%) com bgcolor contrastante

### Mobile-first
- Páginas listagem: `<Grid size={{ xs: 12, sm: 6, md: 4 }}>`
- Navbar interna (autenticada): `useMediaQuery(theme.breakpoints.down("md"))` pra Drawer hamburger
- **Landing publica**: também tem Drawer hamburger no mobile (em `components/HeaderLanding.jsx`)
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
Quando usam objeto responsivo `{xs:..., md:...}`, NUNCA como prop direta.
- ❌ `<Stack alignItems={{ xs: "flex-start", md: "center" }}>` (gera warning no console)
- ✅ `<Stack sx={{ alignItems: { xs: "flex-start", md: "center" } }}>`
- ❌ `<Box textAlign="center">` com sx responsivo quebra também
- ✅ `<Box sx={{ textAlign: "center" }}>`

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

### Flask lê `.env` só no boot
Qualquer mudança exige `Ctrl+C` + `python app.py`.

### Zone Identifier bloqueia scripts baixados
Use `Unblock-File -Path .\script.ps1` antes de rodar `.ps1` baixado de chat/web.

### PowerShell 5.1 quebra UTF-8 em body JSON
Por isso existe `Invoke-ApiJson` no `vela-init.ps1` que converte pra `UTF8.GetBytes()`.

### phpMyAdmin do XAMPP após mudar senha root
Editar `C:\xampp\phpMyAdmin\config.inc.php`: `auth_type = 'cookie'` ou `password = 'nova_senha'` + `AllowNoPassword = false`.

### URL de imagem em `<img>` deve ser URL DIRETA
Não aceita URL de página web. Precisa terminar em `.jpg`, `.png`, `.webp`, `.gif`.
Pra testar: `https://picsum.photos/800/400`.

### Backend pode não ter filtros documentados
Exemplo: `routes/noticias.py` originalmente não tinha filtro `q`. Tivemos que adicionar.
**Sempre checar o blueprint antes de assumir que filtro existe.**

### Rota `/` deve ser Landing pública
Padrão da web — Dashboard privado vai em `/dashboard`.
Após logout, redireciona para `/`.

### Endpoint de inscrição em aula
É `POST /inscricoes` com body `{aula_id}`, NÃO `POST /aulas/<id>/inscricoes` (esse retorna 405).

### Backend NÃO tem CRUD de usuários ainda
Tem só `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`.
Pra CRUD administrativo de usuários, precisa criar `routes/usuarios.py` com
`GET /usuarios` (professor), `PUT /usuarios/<id>`, `DELETE /usuarios/<id>`.

---

## 11. Estado atual do projeto (snapshot 2026-11-20)

### Backend
- ✅ 8 blueprints implementados e manualmente testados
- ✅ Health check em `/api/v1/health`
- ✅ OpenAPI em `/apidocs` (via flasgger)
- ✅ Filtro `q` (busca por título) em `/noticias`
- ⬜ Blueprint `/usuarios` (CRUD administrativo — próxima etapa)
- ⬜ Deploy no Render.com
- ⬜ Migração para PostgreSQL em produção

### Frontend — Funcionalidade
- ✅ Setup completo (Vite + React + Tailwind + MUI)
- ✅ Autenticação completa com rotas protegidas
- ✅ Navbar interna mobile-first com Drawer
- ✅ **Página Aulas completa**
- ✅ **Página Notícias completa**
- ✅ **Página Doações completa**
- ✅ **Página Voluntários completa**
- ✅ **Página Relatório PDF** (abre em nova aba)
- ✅ **Landing pública completa**
- ⬜ Deploy no Vercel

### Frontend — Identidade visual do PHP
- ✅ Paleta FBVA completa no tema MUI
- ✅ Fonte system-ui (Segoe UI)
- ✅ Assets copiados (mascote, logos, patterns, fotos)
- ✅ Customizações MuiButton/MuiCard/MuiOutlinedInput
- ✅ **Landing refeita** com visual PHP (hero + Zoé + notícias fixas + acessibilidade + doação/voluntário com personalidade + onde estamos)
- ✅ Header com 7 links + Drawer hamburger no mobile
- ⬜ **Login** split-screen com mascote (próximo)
- ⬜ **Navbar admin** (branca + linha amarela + avatar + Sair amarelo)
- ⬜ Páginas internas com visual PHP
- ⬜ Leaflet (mapa real em "Onde estamos")
- ⬜ VLibras + widget de acessibilidade (A+/A-/contraste)

### Infraestrutura
- ✅ Repo no GitHub (`Guictss/ceub_projeto_seminario_final_2026`)
- ✅ Script `start-dev.ps1`
- ⬜ GitHub Actions configurado

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
`Noticias.jsx` (lista + conteúdo longo) ou `Doacoes.jsx` (listagem simples com resumo).

### Checklist mínimo
1. `useState` para `data`, `loading`, `erro`, `meta`, `filtros`, `filtrosAplicados`
2. `useCallback` com `carregar()` que chama `api.get("/recurso", { params })`
3. `useEffect` que dispara `carregar()` quando `filtrosAplicados` muda
4. Loading: `<CircularProgress>` centralizado
5. Erro: `<Alert severity="error">` com `extrairMensagemErro()` helper
6. Vazio: `<Alert severity="info">` com mensagem contextual
7. Lista: `<Grid container>` com `<Grid size={{ xs: 12, sm: 6, md: 4 }}>` + card
8. Modal CRUD inline (componente no mesmo arquivo)
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

## 14. Próximos passos planejados (ordem Y — prioridade visual)

1. 🔑 **Login split-screen** (esquerda azul com mascote + logo branca, direita form)
2. 🎛️ **Navbar admin estilo PHP** (branca + border-bottom amarelo 4px + avatar colorido + Sair amarelo)
3. 👥 **Backend `routes/usuarios.py`** (GET/PUT/DELETE — admin)
4. ➕ **Página /cadastro pública** (Nome, Email, Nasc, Perfil [Aluno/Professor], Senha, Confirmar)
5. 📋 **Página /usuarios admin** (lista com filtro por perfil)
6. 🗺️ **Leaflet** (mapa real em "Onde estamos" da landing)
7. ♿ **VLibras + widget acessibilidade** (A+/A-/contraste lateral direita)
8. 🚀 Deploy backend Render + frontend Vercel
9. GitHub Actions para lint + testes

---

_Última atualização: 2026-11-20 — Landing com visual PHP concluída; próxima etapa é Login split-screen._
