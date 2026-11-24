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

**Status (2026-11-23):** **toda a parte visual/UX concluída**.
Identidade visual PHP (Login/Navbar/Cadastro/Usuarios), Leaflet (mapa real) e
acessibilidade (VLibras oficial + widget custom A+/A-/contraste com persistência) prontos.
**Em andamento:** deploy (Render backend + Vercel frontend) e GitHub Actions.

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
- **Leaflet + react-leaflet** (mapa interativo em "Onde estamos")
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
│   ├── app.py              # factory, registra 8 blueprints (incluindo /usuarios)
│   ├── config.py           # Base/Dev/Test/Prod configs
│   ├── extensions.py       # db, migrate, jwt, cors, limiter
│   ├── models/             # Usuario, Aula, Inscricao, Noticia, Doacao, Voluntario
│   ├── routes/             # auth, aulas, inscricoes (2 bps), noticias, doacoes, voluntarios, relatorios, usuarios
│   ├── schemas/            # Marshmallow (RegisterSchema, LoginSchema, UsuarioResponseSchema, UsuarioUpdateSchema, etc)
│   ├── services/pdf_relatorio.py
│   ├── utils/              # decorators (@professor_required, @aluno_required), pagination
│   ├── migrations/
│   ├── instance/vela.db
│   ├── .env
│   ├── openapi.yaml
│   └── vela-init.ps1
├── frontend/
│   ├── public/assets/img/  # imagens copiadas do PHP
│   ├── src/
│   │   ├── main.jsx        # Tema MUI com paleta FBVA completa + customizações
│   │   ├── App.jsx         # Routes (incluindo /cadastro e /usuarios)
│   │   ├── pages/          # Landing, Login, Cadastro, Dashboard, Aulas, Noticias, Doacoes, Voluntarios, Usuarios, Relatorio
│   │   ├── components/     # Layout, Navbar (visual PHP), PrivateRoute, ProfessorRoute, HeaderLanding, MapaLocalizacao, WidgetAcessibilidade
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
/                    → Landing publica (visual PHP 100% + Leaflet)
/login               → Login split-screen (esquerda azul com Zoe + direita form)
/cadastro            → Cadastro publico split-screen (mesmo padrao)
/dashboard           → Dashboard (ainda React/MUI padrao)
/aulas, /noticias    → privadas, qualquer logado
/doacoes, /voluntarios, /relatorio, /usuarios → privadas, so professor
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

> ⚠️ **Os IDs podem variar entre ambientes!** O seed original tem uma ordem; o
> banco atual pode ter outra. Sempre fazer `GET /usuarios` pra ver o ID real
> antes de testar PUT/DELETE em um ID específico.

| Papel     | E-mail              | Nome típico       |
|-----------|---------------------|-------------------|
| professor | `carlos@teste.com`  | Carlos Andrade    |
| professor | `teste@vela.com`    | Guilherme Teste   |
| aluno     | `maria@teste.com`   | Maria Silva       |

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
| POST | `/auth/register` | público | body `{nome, email, senha, data_nascimento, papel}`. Rate limit 3/min |
| POST | `/auth/login` | público | body `{email, senha}` -> `{access_token, refresh_token, usuario}`. Rate 5/min |
| POST | `/auth/refresh` | refresh JWT | retorna `{access_token}` |
| POST | `/auth/logout` | JWT | blocklist em memória |
| GET | `/auth/me` | JWT | dados do usuário logado |
| GET | `/usuarios` | professor | query: `page, per_page, papel, q` (busca em nome/email) |
| GET | `/usuarios/<id>` | próprio ou professor | — |
| PUT | `/usuarios/<id>` | próprio ou professor | body `{nome?, email?, data_nascimento?, papel?}` — só professor muda papel |
| DELETE | `/usuarios/<id>` | professor (não próprio) | protege CANNOT_DELETE_SELF |
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
| POST | `/doacoes` | público | body `{nome_doador, valor, forma_pagamento}`. Rate 10/min |
| GET | `/voluntarios` | professor | filtro: `status` |
| POST | `/voluntarios` | público | body `{nome, email, mensagem}`. Rate 3/min |
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

### Usuários — schemas
- **UsuarioResponseSchema**: id, nome, email, data_nascimento, papel, criado_em
- **RegisterSchema**: nome(3-100), email, senha(min 8, 1 letra + 1 número), data_nascimento (idade ≥ 14), papel
- **UsuarioUpdateSchema**: todos opcionais, mesmas validações. **Senha fora do escopo** (precisa endpoint próprio futuramente)

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
- Validação sempre com Marshmallow, erro 400 com `details`
- Rate limits em rotas públicas sensíveis (doações 10/min, voluntários 3/min, register 3/min)
- Busca textual em listagens: `query.filter(Model.campo.ilike(f"%{q}%"))` com param `q`
- Recursos com conteúdo longo: dois schemas separados (`ListSchema` + `DetailSchema`)
- Proteções de integridade: CANNOT_DELETE_SELF em `/usuarios`, verificação de email único em PUT

### Frontend
- Páginas em `src/pages/<Nome>.jsx` (arquivo único; componentes auxiliares inline)
- Componentes compartilhados em `src/components/`
- API via `src/services/api.js` (axios singleton, nunca `fetch` cru)
- Estado local com `useState` + `useEffect`; nada de Redux/Zustand
- Autenticação via `useAuth()` do `AuthContext`
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
Em versões recentes do MUI v6+, `alignItems="center"` como prop direta em `<Stack>` ou `<Grid container>` vaza como atributo HTML e gera warning React. **Sempre dentro de `sx`**, mesmo quando é valor fixo:
- ❌ `<Stack direction="row" alignItems="center">`
- ❌ `<Grid container alignItems="center">`
- ✅ `<Stack direction="row" sx={{ alignItems: "center" }}>`
- ✅ `<Grid container sx={{ alignItems: "center" }}>`

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

### Leaflet com Vite — ícones padrão quebrados
Se usar `<Marker>` sem `icon` custom, aparece quadrado quebrado no lugar do marcador. Fix:
```jsx
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });
```

Se usar `L.divIcon` custom, **não precisa** desse fix (é o caso do `MapaLocalizacao.jsx`).

### Limitar zoom/pan do Leaflet (evita ver planeta duplicado)
```jsx
<MapContainer
  minZoom={11}
  maxZoom={19}
  maxBounds={LIMITES}       // [[swLat, swLng], [neLat, neLng]]
  maxBoundsViscosity={1.0}  // trava elástica imediata
  worldCopyJump={false}
>
  <TileLayer noWrap={true} ... />
</MapContainer>
```

### Commitar antes de pausar sessão
Refatorações grandes não-commitadas se misturam com o trabalho do dia seguinte e confundem o `git diff` (aconteceu com a refatoração do Navbar entre 2026-11-20 e 2026-11-21: a refatoração visual apareceu misturada com o patch de adicionar link "Usuários"). **Sempre fazer `git status` + commit antes de pausar.**

### Testes manuais da API: nunca assumir IDs do seed
Os IDs reais do banco podem diferir dos IDs do seed SQL. Sempre fazer `GET /recurso` e usar o ID retornado antes de `PUT /recurso/<id>` ou `DELETE /recurso/<id>`. Já aconteceu de usar ID errado e editar/deletar o usuário errado (Carlos virou "Maria Silva Costa" por uns minutos).

### Hidratar estado do localStorage: use lazy initial state (não useEffect)
Em React 18+ com **StrictMode**, usar `useEffect` pra carregar valores salvos combinado com outro `useEffect` pra persistir causa **sobrescrita na segunda montagem**. O StrictMode monta o componente 2x pra detectar bugs; no segundo mount, o estado reinicia aos padrões, e o useEffect de persistência salva ESSES padrões no localStorage ANTES do useEffect de carga ler os valores reais. Solução correta — **lazy initial state**:

```jsx
// ❌ ERRADO: perde dados no StrictMode
const [valor, setValor] = useState(PADRAO);
useEffect(() => { setValor(JSON.parse(localStorage.getItem(KEY) || "{}")); }, []);
useEffect(() => { localStorage.setItem(KEY, JSON.stringify(valor)); }, [valor]);

// ✅ CERTO: estado nasce já hidratado
const [valor, setValor] = useState(() => {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return PADRAO; }
});
useEffect(() => { localStorage.setItem(KEY, JSON.stringify(valor)); }, [valor]);
```

Caso real: aconteceu no `WidgetAcessibilidade.jsx` — fonte aumentada e alto contraste voltavam ao padrão a cada F5.

### VLibras tem warnings normais no console
A integração oficial do VLibras (`https://vlibras.gov.br/app/vlibras-plugin.js`) **gera warnings normais** que NÃO são bugs nossos:
- "An iframe which has both allow-scripts and allow-same-origin..."
- "[Violation] Permissions policy violation: accelerometer is not allowed"
- "The devicemotion events are blocked by permissions policy"

São internos do VLibras (tenta usar acelerômetro/motion do dispositivo). **Não silenciar** — pode quebrar features do plugin.

### `<html lang="en">` padrão do Vite deve virar `"pt-BR"`
Template padrão do Vite cria o `index.html` com `lang="en"` e `<title>frontend</title>`. **Sempre trocar pra `pt-BR`** (screen readers e VLibras dependem disso) e colocar título real do projeto.

---

## 11. Estado atual do projeto (snapshot 2026-11-21)

### Backend
- ✅ 9 blueprints implementados e manualmente testados
- ✅ `/usuarios` CRUD administrativo (GET lista, GET detalhe, PUT, DELETE) com proteção CANNOT_DELETE_SELF
- ✅ Health check em `/api/v1/health`
- ✅ OpenAPI em `/apidocs` (via flasgger)
- ✅ Filtro `q` (busca por título) em `/noticias`
- ⬜ Deploy no Render.com
- ⬜ Migração para PostgreSQL em produção

### Frontend — Funcionalidade
- ✅ Setup completo (Vite + React + Tailwind + MUI + Leaflet)
- ✅ Autenticação completa com rotas protegidas
- ✅ Navbar interna mobile-first com Drawer
- ✅ **Página Aulas completa**
- ✅ **Página Notícias completa**
- ✅ **Página Doações completa**
- ✅ **Página Voluntários completa**
- ✅ **Página Relatório PDF** (abre em nova aba)
- ✅ **Página Cadastro público** (split-screen, validação client-side, grid 2 colunas)
- ✅ **Página Usuários admin** (filtros, busca, modal edição, dialog exclusão, proteção CANNOT_DELETE_SELF visual)
- ✅ **Landing pública completa com Leaflet**
- ⬜ Deploy no Vercel

### Frontend — Identidade visual do PHP
- ✅ Paleta FBVA completa no tema MUI
- ✅ Fonte system-ui (Segoe UI)
- ✅ Assets copiados (mascote, logos, patterns, fotos)
- ✅ Customizações MuiButton/MuiCard/MuiOutlinedInput
- ✅ **Landing refeita** com visual PHP (hero + Zoé + notícias fixas + acessibilidade + doação/voluntário com personalidade + onde estamos)
- ✅ Header com 7 links + Drawer hamburger no mobile
- ✅ **Login split-screen** (esquerda azul + Zoé animada + logo branca + "Bem-vindo de volta!"; direita form branco)
- ✅ **Cadastro split-screen** (mesmo padrão; grid 2 colunas: Email+Data, Senha+Confirmar)
- ✅ **Navbar admin** (branca + border-bottom amarelo 4px + logo horizontal + pill azul-claro com avatar + chip de papel + Sair amarelo)
- ✅ **Validação client-side uniforme** (Login + Cadastro) — adeus tooltip HTML5
- ✅ **Leaflet** (mapa real em "Onde estamos" da landing — Clube Nipo Brasileiro no SCES Sul, ícone customizado FBVA, zoom/pan limitados a Brasília)
- ✅ **VLibras oficial do governo** (canto inferior direito, tradução para Libras)
- ✅ **Widget customizado de acessibilidade** (FAB azul acima do VLibras com A+/A-/alto contraste/reset — persistência em localStorage via lazy initial state)
- ⬜ Páginas internas (dashboard, listas) com visual PHP mais enfático

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
8. Modal CRUD inline (componente no mesmo arquivo)
9. Dialog de confirmação de delete
10. Snackbar para feedback
11. Botões de criar só para professor (verificar `usuario.papel`)
12. Edit/delete só para o dono do recurso (ou proteção equivalente no backend)
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

- ✅ ~~Login split-screen~~
- ✅ ~~Navbar admin estilo PHP~~
- ✅ ~~Backend `routes/usuarios.py`~~
- ✅ ~~Página /cadastro pública~~
- ✅ ~~Página /usuarios admin~~
- ✅ ~~Leaflet (mapa real em "Onde estamos")~~
- ✅ ~~VLibras + widget acessibilidade~~
- 🚀 **Deploy backend Render + frontend Vercel** — PRÓXIMO
- GitHub Actions para lint + testes
- Páginas internas (dashboard, listas) com visual PHP mais enfático

---

_Última atualização: 2026-11-23 — Etapa 9 (Y) concluída (VLibras + widget acessibilidade). **Toda a parte visual/UX do projeto está pronta.** Próxima: deploy no Render + Vercel._

## 🚀 Deploy (produção)

### Backend — Render.com
- **Serviço**: `vela-para-todos-api` (Web Service, free tier)
- **URL**: https://vela-para-todos-api.onrender.com
- **Banco**: PostgreSQL free tier (mesma região, linkado via Internal Database URL)
- **Build Command**: `pip install -r requirements.txt && flask db upgrade && python seed.py`
- **Start Command**: `gunicorn "app:create_app()" --bind 0.0.0.0:$PORT`
- **Env vars obrigatórias**: `FLASK_ENV=production`, `SECRET_KEY`, `JWT_SECRET_KEY`,
  `DATABASE_URL` (auto do PostgreSQL linkado), `CORS_ORIGINS`, `PYTHON_VERSION=3.12.4`

### Frontend — Vercel (pendente)
- **Main (FBVA)**: `vela-para-todos.vercel.app` — branch `main`, root `frontend/`
- **CEUB**: `vela-para-todos-ceub.vercel.app` — branch `apresentacao-ceub`
- **Env var**: `VITE_API_URL=https://vela-para-todos-api.onrender.com/api/v1`

### ⚠️ Pegadinhas que custaram tempo no deploy

1. **SQLAlchemy 2+ não acha `psycopg`**: por padrão ele tenta o driver `psycopg` (v3),
   mas o `requirements.txt` instala `psycopg2-binary`. Fix no `config.py`:
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

2. **`python-dateutil` precisa estar explícito no `requirements.txt`**: funciona local
   porque chega "de carona" com outra lib, mas no Render não. Toda `import` direta
   TEM que estar declarada.

3. **`.env.example` vs `env.example`**: Windows/VS Code pode salvar sem o ponto inicial.
   O arquivo tem que ter o ponto, senão o git não trata como dotfile de referência.

4. **Render Free dorme após 15 min sem tráfego**: primeira requisição depois demora
   30-60 seg. Pra apresentação, acordar o backend 2 min antes.

5. **PowerShell `curl` ≠ curl real**: é alias pro `Invoke-WebRequest` (faz HTML parsing
   e avisa sobre scripts). Pra APIs JSON, usar `Invoke-RestMethod` (parseia direto)
   ou `curl.exe` (curl de verdade, nativo no Win10+).

6. **Primeiro deploy falhou precisa `Manual Deploy`**: Render não re-deploya sozinho
   depois de falhar na primeira criação do serviço. Botão "Manual Deploy → Deploy
   latest commit" no painel, ou push vazio (`git commit --allow-empty`).

### 🧪 Smoke test pós-deploy

```powershell
# Health
Invoke-RestMethod https://vela-para-todos-api.onrender.com/health
# Esperado: {db: connected, status: healthy, version: 1.0.0}

# Login
$body = @{email="carlos@teste.com"; senha="Senha123!"} | ConvertTo-Json
Invoke-RestMethod -Uri https://vela-para-todos-api.onrender.com/api/v1/auth/login `
  -Method POST -Body $body -ContentType "application/json"
```