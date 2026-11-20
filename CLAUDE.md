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

### Tema visual (cores FBVA)
- Primary: `#1D71B8` (azul)
- Secondary: `#F9B233` (amarelo)
- Background: `#F5F7FA`
- Configurado em `frontend/src/main.jsx` via `createTheme`.

---

## 3. Estrutura do monorepo

```text
C:\dev\a3-vela\
├── backend/
│   ├── app.py              # factory, registra 7 blueprints
│   ├── config.py           # Base/Dev/Test/Prod configs
│   ├── extensions.py       # db, migrate, jwt, cors, limiter (central para evitar circular import)
│   ├── models/             # Usuario, Aula, Inscricao, Noticia, Doacao, Voluntario
│   ├── routes/             # auth, aulas, inscricoes (2 bps), noticias, doacoes, voluntarios, relatorios
│   ├── schemas/            # Marshmallow para request/response
│   ├── services/pdf_relatorio.py
│   ├── utils/
│   │   ├── decorators.py   # aluno_required, professor_required (usa _PLURAIS para msg)
│   │   └── pagination.py   # paginate(query, schema, endpoint) -> {data, meta}
│   ├── migrations/         # Alembic
│   ├── instance/vela.db    # SQLite (gitignore)
│   ├── .env                # SECRET_KEY, JWT_SECRET_KEY, CORS_ORIGINS
│   ├── .env.example
│   ├── openapi.yaml
│   ├── requirements.txt
│   └── vela-init.ps1       # script local para popular $headersProf/$headersAluno
├── frontend/
│   ├── src/
│   │   ├── main.jsx        # BrowserRouter + AuthProvider + ThemeProvider + CssBaseline
│   │   ├── App.jsx         # <Routes> aninhadas em <Layout>
│   │   ├── pages/          # Login, Dashboard, Aulas (completa), Noticias (completa), Doacoes, Voluntarios, Relatorio (placeholders)
│   │   ├── components/     # Layout, Navbar (mobile-first com Drawer), PrivateRoute, ProfessorRoute
│   │   ├── contexts/       # AuthContext (hidrata localStorage, login/logout)
│   │   ├── services/api.js # axios + interceptor JWT + silent refresh
│   │   ├── index.css       # @import "tailwindcss";
│   │   └── utils/
│   ├── vite.config.js      # react() + tailwindcss()
│   ├── .env.local          # VITE_API_URL=http://localhost:5000/api/v1
│   └── package.json
├── docs/
│   ├── api.md
│   ├── arquitetura.docx
│   └── contratos-api.docx
├── .github/workflows/
├── .gitignore
├── README.md
├── CLAUDE.md               # ESTE arquivo
└── start-dev.ps1           # abre backend + frontend em 2 janelas + browser
```

---

## 4. Como rodar localmente

### Comando único (recomendado)
```powershell
cd C:\dev\a3-vela
.\start-dev.ps1
```
Abre backend em http://localhost:5000, frontend em http://localhost:5173 e
browser em 5173 após 5s.

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

## 5. Usuários de teste (senha: `Senha123!`)

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

## 6. Schema do banco (nomes REAIS — descobertos na prática)

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
Relationships: `aluno -> Usuario`, `aula -> Aula`

### noticias
```
id, titulo VARCHAR(200), conteudo TEXT, imagem VARCHAR(255) NULLABLE,
publicado_em TIMESTAMP
```
**Atenção:** usa `publicado_em` (não `criado_em`).
Property: `resumo` (primeiros N caracteres do conteúdo).

### doacoes
```
id, nome_doador, email_doador, valor NUMERIC(10,2),
forma_pagamento ENUM('pix','transferencia','paypal'), doado_em
```

### voluntarios
```
id, nome, email, mensagem, status ENUM('pendente','aprovado','recusado'),
inscrito_em
```

---

## 7. API — formato de resposta

**Paginação:** sempre `{ "data": [...], "meta": { page, per_page, total, total_pages } }`
**Erro:** sempre `{ "error": "msg", "code": "SLUG", "details": { campo: ["erro"] }? }`
**Autenticação:** `Authorization: Bearer <access_token>`

### Base URL
- Local: `http://localhost:5000/api/v1`
- Config no frontend: `VITE_API_URL` em `frontend/.env.local`

### Endpoints principais

| Método | Rota | Papel | Observações |
|---|---|---|---|
| POST | `/auth/login` | público | body `{email, senha}` -> `{access_token, refresh_token, usuario}` |
| POST | `/auth/refresh` | refresh JWT | retorna `{access_token}` |
| POST | `/auth/logout` | JWT | blocklist em memória |
| GET | `/auth/me` | JWT | dados do usuário logado |
| GET | `/aulas` | público | query: `page, per_page, data_inicio, data_fim, professor_id, com_vagas` |
| POST | `/aulas` | professor | body `{descricao, data, horario "HH:MM", duracao_min, vagas}` |
| GET | `/aulas/<id>` | público | — |
| PUT | `/aulas/<id>` | professor | só o dono |
| DELETE | `/aulas/<id>` | professor | só o dono; não pode reduzir vagas abaixo dos inscritos |
| POST | `/inscricoes` | aluno | body `{aula_id}`. Regras: não duplicar, aula futura, com vagas, sem conflito de horário |
| DELETE | `/inscricoes/<id>` | aluno | cancelar |
| GET | `/aulas/<id>/inscricoes` | professor | lista inscritos |
| GET | `/noticias` | público | query: `page, per_page, q` (busca ilike no título) |
| GET | `/noticias/<id>` | público | retorna `conteudo` completo |
| POST | `/noticias` | professor | body `{titulo, conteudo, imagem?}` |
| PUT | `/noticias/<id>` | professor | — |
| DELETE | `/noticias/<id>` | professor | — |
| GET | `/doacoes` | professor | filtro: `forma_pagamento` + resumo |
| POST | `/doacoes` | público | rate limit 10/min |
| GET | `/voluntarios` | professor | filtro: `status` |
| POST | `/voluntarios` | público | rate limit 3/min |
| PATCH | `/voluntarios/<id>/status` | professor | body `{status}` |
| GET | `/relatorios/inscricoes.pdf` | professor | retorna PDF binário; filtros: `data_inicio, data_fim, professor_id` |

### Formato dos campos de aula no response
```json
{
  "id": 3,
  "descricao": "Introdução à Vela Adaptada",
  "data": "2026-11-20",
  "horario": "09:00",
  "duracao_min": 90,
  "vagas_total": 10,
  "vagas_disponiveis": 7,
  "professor": { "id": 3, "nome": "Carlos Andrade" },
  "criado_em": "2026-11-15T03:58:11"
}
```
**Atenção aos nomes:** backend expõe `vagas_total` e `vagas_disponiveis` no response
(no body do POST/PUT envia `vagas`). `inscritos` calcula como `vagas_total - vagas_disponiveis`.
Não existe `inscritos_count` nem `tem_vagas` no response.

### Notícias — DOIS schemas de response (padrão lista-vs-detalhe)
```json
// GET /noticias  → NoticiaListSchema (SEM conteudo)
{ "id": 3, "titulo": "...", "resumo": "...", "imagem": null, "publicado_em": "..." }

// GET /noticias/<id>  → NoticiaDetailSchema (COM conteudo)
{ "id": 3, "titulo": "...", "conteudo": "...", "imagem": null, "publicado_em": "..." }
```
**Padrão importante:** em recursos com conteúdo longo (texto, HTML), a API retorna preview
na listagem e conteúdo completo só no detalhe. Frontend deve chamar `GET /noticias/<id>`
ao abrir modal de leitura ou edição.

### Validações (Marshmallow) — Notícias
- `titulo`: 5 a 200 caracteres
- `conteudo`: mínimo 20 caracteres
- `imagem`: opcional, máximo 255 caracteres (URL completa)

---

## 8. Padrões de código estabelecidos

### Backend
- **Factory pattern** em `app.py`, extensões em `extensions.py` (evita circular import)
- Blueprints com `url_prefix=f"{api}/XXX"` onde `api = "/api/v1"`
- Decorators: `@aluno_required`, `@professor_required` em `utils/decorators.py`
- Helper de paginação em `utils/pagination.py`
- Validação sempre com Marshmallow, erro 400 com `details`
- Rate limits em rotas públicas sensíveis (doações 10/min, voluntários 3/min)
- Para busca textual em listagens: `query.filter(Model.campo.ilike(f"%{q}%"))` com param `q`
- Para recursos com conteúdo longo: dois schemas separados (`ListSchema` sem conteúdo, `DetailSchema` completo)

### Frontend
- Páginas em `src/pages/<Nome>.jsx` (arquivo único; componentes auxiliares inline se específicos da página)
- Componentes compartilhados em `src/components/`
- API via `src/services/api.js` (axios singleton, nunca `fetch` cru)
- Estado local com `useState` + `useEffect`; nada de Redux/Zustand neste projeto
- Autenticação via `useAuth()` do `AuthContext`
- Loading/erro/vazio sempre tratados em páginas de lista
- Feedback via `<Snackbar>` do MUI
- Confirmação de ação destrutiva via `<Dialog>`
- **Erros amigáveis:** helper `extrairMensagemErro(data)` que lê `data.details.campo[0]` do Marshmallow (ver `Noticias.jsx`)
- **Validação visual:** campos com `error={}` e `helperText` mostrando "X/max (mínimo N)"
- **Botão desabilitado** enquanto form inválido (`disabled={!tituloValido || !conteudoValido}`)
- Para recursos com conteúdo longo: modal de leitura faz `GET /recurso/<id>` quando abre (não confia no preview da lista)

### Mobile-first
- Toda nova página começa em 1 coluna no mobile e expande com `<Grid size={{ xs: 12, sm: 6, md: 4 }}>`
- Navbar usa `useMediaQuery(theme.breakpoints.down("md"))` para alternar hamburger/links inline
- `<Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>` como wrapper padrão
- `<Stack direction={{ xs: "column", sm: "row" }}>` para formulários

---

## 9. "Pegadinhas" aprendidas (NÃO REPETIR)

### `.env.local` com BOM quebra o Vite
`Out-File -Encoding UTF8` do PowerShell 5.1 adiciona BOM (3 bytes), e o Vite
não lê a variável. Use `Out-File -Encoding ASCII` para arquivos `.env*`.
Confirmação: `Get-ChildItem .env.local | Select-Object Length` — 46 bytes = BOM, ~43 = OK.

### CORS precisa incluir a porta do Vite
`.env` do backend tem `CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000`.
Mudanças no `.env` exigem **reiniciar o Flask** (lê só no startup).

### MUI v6+/v7 trocou props para `slotProps`
- ❌ `InputLabelProps={{ shrink: true }}` → ✅ `slotProps={{ inputLabel: { shrink: true } }}`
- ❌ `inputProps={{ min: 1 }}` → ✅ `slotProps={{ htmlInput: { min: 1 } }}`
Usar as props antigas gera warning no console e campo renderiza errado (labels sobrepostos).

### Grid MUI v2 mudou a sintaxe
- ❌ `<Grid item xs={12} sm={6}>` → ✅ `<Grid size={{ xs: 12, sm: 6 }}>`

### SQLAlchemy 2.x não aceita strings em `joinedload`
- ❌ `joinedload(Aula.inscricoes).joinedload("aluno")` → ✅ `joinedload(Inscricao.aluno)`
E `Query.unique()` não existe no legacy Query do Flask-SQLAlchemy — o joinedload de coleção já deduplica sozinho.

### Flask lê `.env` só no boot
Qualquer mudança em `CORS_ORIGINS`, `JWT_SECRET_KEY`, etc. exige `Ctrl+C` + `python app.py`.

### Zone Identifier bloqueia scripts baixados
Scripts `.ps1` baixados de chat/web vêm marcados. Use `Unblock-File` antes:
```powershell
Unblock-File -Path .\start-dev.ps1
```

### PowerShell 5.1 quebra UTF-8 em body JSON
Por isso existe `Invoke-ApiJson` no `vela-init.ps1` que converte explicitamente:
```powershell
$params.Body = [System.Text.Encoding]::UTF8.GetBytes($json)
```

### PhpMyAdmin do XAMPP após mudar senha root
Se mudar a senha do MySQL, editar `C:\xampp\phpMyAdmin\config.inc.php`:
`auth_type = 'cookie'` (vai pedir login) ou `password = 'nova_senha'` com `AllowNoPassword = false`.

### URL de imagem em campo `<img>` deve ser URL DIRETA
Não aceita URL de página web (ex: `designdobom.com.br/category/imagem-para-sexta/`).
Precisa ser um link que termine em `.jpg`, `.png`, `.webp`, `.gif`, etc.
Pra testar, usar `https://picsum.photos/800/400` que sempre funciona.

### Backend pode não ter filtros documentados — sempre checar o blueprint
Exemplo: `routes/noticias.py` originalmente não tinha filtro `q` nenhum.
Tivemos que adicionar manualmente no backend para a busca funcionar no frontend.

---

## 10. Estado atual do projeto (snapshot 2026-11-20)

### Backend
- ✅ 8 blueprints implementados e manualmente testados
- ✅ Health check em `/api/v1/health`
- ✅ OpenAPI em `/apidocs` (via flasgger)
- ✅ Filtro `q` (busca por título) adicionado em `/noticias`
- ⬜ Deploy no Render.com
- ⬜ Migração para PostgreSQL em produção

### Frontend
- ✅ Setup completo (Vite + React + Tailwind + MUI)
- ✅ Autenticação completa com rotas protegidas
- ✅ Navbar mobile-first
- ✅ **Página Aulas completa** (lista, filtros, paginação, CRUD, inscrever)
- ✅ **Página Notícias completa** (lista, busca, CRUD, modal de leitura, suporte a imagem)
- ⬜ Página Doações (placeholder)
- ⬜ Página Voluntários (placeholder)
- ⬜ Página Relatório (placeholder — botão de baixar PDF)
- ⬜ Landing page pública (portar do PHP antigo)
- ⬜ Deploy no Vercel

### Infraestrutura
- ✅ Repo no GitHub (`Guictss/ceub_projeto_seminario_final_2026`)
- ✅ Script `start-dev.ps1`
- ⬜ GitHub Actions configurado

---

## 11. Projeto antigo (PHP/MySQL) — referência visual

- Repo: `Guictss/Desenvolvimento_de_Sistemas` (pasta `a3_vela/`)
- Rodando em `C:\xampp\htdocs\Desenvolvimento_de_Sistemas\a3_vela\`
- URL local: http://localhost/Desenvolvimento_de_Sistemas/a3_vela/
- Banco MySQL: `vela_para_todos` (reconstruído do zero — não havia dump no repo original)
- Credenciais MySQL: `root` / `ReapperOW31.`
- Mesmos usuários (senhas MD5 agora): `carlos@teste.com` / `123456` etc.

---

## 12. Template de página (copie para criar novas)

Para **Doações, Voluntários**, siga o padrão de `Aulas.jsx` (CRUD completo) ou `Noticias.jsx` (lista + conteúdo longo):

### Checklist de página de listagem
1. `useState` para `data`, `loading`, `erro`, `meta`, `filtros`, `filtrosAplicados`
2. `useCallback` com `carregar()` que chama `api.get("/recurso", { params })`
3. `useEffect` que dispara `carregar()` quando `filtrosAplicados` muda
4. Loading: `<CircularProgress>` centralizado
5. Erro: `<Alert severity="error">` com `extrairMensagemErro()` helper
6. Vazio: `<Alert severity="info">` com mensagem contextual (com/sem filtros)
7. Lista: `<Grid container>` com `<Grid size={{ xs: 12, sm: 6, md: 4 }}>` + card
8. Modal CRUD inline (componente no mesmo arquivo)
9. Dialog de confirmação de delete
10. Snackbar para feedback
11. Botões de criar só para professor (verificar `usuario.papel`)
12. Edit/delete só para o dono do recurso (ou todos os professores, conforme regra)
13. Para conteúdo longo: `GET /recurso/<id>` ao abrir modal de leitura/edição

### Helper padrão para erros amigáveis
Toda página deve ter este helper copiado (já implementado em `Noticias.jsx`):
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

## 13. Próximos passos planejados

1. Página **Doações** (listar + filtro por forma_pagamento + total)
2. Página **Voluntários** (listar + aprovar/recusar)
3. Página **Relatório** (botão que faz `GET /relatorios/inscricoes.pdf` e abre PDF)
4. Landing page pública (portar design do PHP antigo)
5. Melhorias de acessibilidade (warnings `aria-hidden` do MUI Dialog)
6. Deploy backend no Render + frontend no Vercel
7. GitHub Actions para lint + testes

---

_Última atualização: 2026-11-20 — mantenha este arquivo sincronizado com o código._
