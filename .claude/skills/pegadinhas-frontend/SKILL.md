---
name: pegadinhas-frontend
description: Armadilhas conhecidas do frontend React do Projeto Vela Para Todos. Use quando encontrar flash de conteúdo, warning do MUI (slotProps, Grid v2, alignItems vazando pro DOM), erro de hydration (Chip/Box em Typography), problema de encoding no Vite 8, SPA routing 404 na Vercel, ESLint reclamando de globals Cypress, Leaflet com ícones quebrados, VLibras warnings. Inclui lazy initial state em Context, vercel.json rewrite, html lang pt-BR, e config correta do ESLint para cypress/.
---

# Pegadinhas do Frontend — NÃO REPETIR

> Erros que já pegamos no frontend React, com o fix pronto. Antes de mexer em
> `main.jsx`, `AuthContext`, `vite.config.js`, `eslint.config.js` ou componentes MUI,
> dá uma lida aqui.

---

## Encoding e arquivos

### `.env.local` com BOM quebra o Vite

`Out-File -Encoding UTF8` do PowerShell 5.1 adiciona BOM (3 bytes), e o Vite **não lê a variável**. Use `Out-File -Encoding ASCII` para arquivos `.env*`.

```powershell
# ❌ ERRADO
"VITE_API_URL=..." | Out-File -Encoding UTF8 .env.local

# ✅ CERTO
"VITE_API_URL=..." | Out-File -Encoding ASCII .env.local
```

### Vite 8 (Vercel) é estrito com UTF-8

Arquivos `.jsx` com encoding Latin1/CP1252 passam no Vite 7 local mas quebram com `[UNLOADABLE_DEPENDENCY] - stream did not contain valid UTF-8` no build da Vercel.

**Detecção + fix:**
```powershell
# Re-salvar como UTF-8 sem BOM
$path = "src\main.jsx"
$text = [System.IO.File]::ReadAllText($path)
[System.IO.File]::WriteAllText($path, $text, [System.Text.UTF8Encoding]::new($false))
```

### `<html lang="en">` padrão do Vite deve virar `"pt-BR"`

Screen readers e VLibras dependem disso. Trocar manualmente no `index.html`.

---

## React Context — hidratação de estado

### Hidratar estado do localStorage: use LAZY INITIAL STATE (não useEffect)

No React 18+ com StrictMode, `useState(null) + useEffect` causa flash de conteúdo errado.

```jsx
// ❌ ERRADO: causa flash de conteúdo não autorizado
const [usuario, setUsuario] = useState(null);
useEffect(() => { setUsuario(hidratarDoStorage()); }, []);

// ✅ CERTO: estado nasce já hidratado
const [usuario, setUsuario] = useState(() => hidratarDoStorage());
```

**Casos reais do projeto:**
- `WidgetAcessibilidade.jsx` — fonte voltava ao padrão no F5
- `AuthContext.jsx` — flash de "Acesso restrito" antes do dashboard carregar

**Padrão completo:**
```jsx
function hidratarUsuarioInicial() {
  try {
    const stored = localStorage.getItem("usuario");
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem("usuario");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(hidratarUsuarioInicial);
  // ...
}
```

---

## Material UI — breaking changes e warnings

### MUI v6+/v7 trocou props para `slotProps`

```jsx
// ❌ ERRADO
<TextField InputLabelProps={{ shrink: true }} />
<TextField inputProps={{ min: 1 }} />

// ✅ CERTO
<TextField slotProps={{ inputLabel: { shrink: true } }} />
<TextField slotProps={{ htmlInput: { min: 1 } }} />
```

### Grid MUI v2 mudou a sintaxe

```jsx
// ❌ ERRADO
<Grid item xs={12} sm={6}>

// ✅ CERTO
<Grid size={{ xs: 12, sm: 6 }}>
```

### Props responsivas (alignItems, textAlign, justifyContent) vão em `sx`

```jsx
// ❌ ERRADO (gera warning no console)
<Stack alignItems={{ xs: "flex-start", md: "center" }}>

// ✅ CERTO
<Stack sx={{ alignItems: { xs: "flex-start", md: "center" } }}>
```

### `alignItems` como prop direta em Stack/Grid vaza pro DOM (MESMO não-responsivo!)

Em versões recentes do MUI v6+, `alignItems="center"` como prop direta em `<Stack>` ou `<Grid container>` vaza como atributo HTML e gera warning React.

**Sempre dentro de `sx`**, mesmo quando é valor fixo:

```jsx
// ❌ ERRADO
<Stack alignItems="center">

// ✅ CERTO
<Stack sx={{ alignItems: "center" }}>
```

### `<Chip>` / `<Box>` dentro de `<Typography>` quebra HTML

`<Typography>` renderiza como `<p>` por padrão. HTML não permite `<div>` (que `Chip`, `Box`, `Card` viram) dentro de `<p>`. Dispara "hydration error" e warnings `<div> cannot be a descendant of <p>`.

**Soluções:**
- Tirar o `<Chip>` pra fora do Typography e colocar no Stack junto
- OU: `<Typography component="span" ...>` pra virar inline (mas perde margens de parágrafo)

**Nota:** `<svg>` (ícones MUI) são inline e PODEM ficar dentro de Typography sem problema.

### Títulos em branco sobre fundo azul precisam de `!important`

Usar `sx={{ color: "#ffffff !important" }}` porque o tema MUI sobrescreve `color="white"` em variants como `h1`, `h2`.

### aria-hidden warning ao abrir Dialog/Drawer

Botão que abre o Dialog/Drawer retém foco, aí o aria-hidden entra em conflito.

**Fix:** fazer o botão perder foco no `onClick`:
```jsx
onClick={(e) => { e.currentTarget.blur(); setOpen(true); }}
```

---

## Leaflet com Vite

### Ícones padrão quebrados

Se usar `<Marker>` sem `icon` custom, aparece quadrado quebrado. Fix com `L.Icon.Default.mergeOptions({...})`.

Se usar `L.divIcon` custom, **não precisa** desse fix (é o caso do `MapaLocalizacao.jsx` do projeto).

### Limitar zoom/pan

```jsx
<MapContainer
  minZoom={11}
  maxZoom={19}
  maxBounds={LIMITES}
  maxBoundsViscosity={1.0}
  worldCopyJump={false}
>
  <TileLayer noWrap={true} ... />
</MapContainer>
```

---

## Vercel / SPA routing

### SPA routing precisa de `vercel.json`

Sem ele, URLs tipo `/login` acessadas diretamente dão 404.

**Fix:** criar `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Deployment URL (com hash) ≠ Production/Preview URL

Pro CORS, SEMPRE usar o URL estável (`vela-para-todos.vercel.app`, `...-git-apresentacao-ceub-guicts.vercel.app`). URL com hash (`-abc123def.vercel.app`) muda a cada deploy.

### Vercel reusa projeto se importar o mesmo repo

Importar um repo já vinculado a outro projeto da mesma conta **NÃO** cria projeto novo — apenas cria deploy preview. Pra forçar separação, dar nome explicitamente diferente.

### Backend único serve todos os frontends

Render deploya UMA branch (`main`). PDFs, templates server-side vêm sempre da `main`, mesmo quando o frontend CEUB chama.

**Fix pendente:** query param `?tema=ceub` + lógica no `pdf_relatorio.py`.

---

## Cypress (16) e ESLint

### npm 10+ bloqueia scripts de pacotes por padrão

Pacotes como Cypress, Playwright, puppeteer têm `postinstall` que baixa binários. Nas versões recentes do npm, isso fica bloqueado com warning:
```
npm warn install-scripts 1 package has install scripts not yet covered by allowScripts
```

**Fix:**
```powershell
npm install-scripts approve cypress
npx cypress install
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

Warning: "The Electron browser is deprecated as a test browser".

**Fix:** trocar pra Chrome em `cypress:run`:
```json
"cypress:run": "cypress run --browser chrome"
```

### ESLint precisa de globals do Cypress em `cypress/`

Sem config, `cy`, `Cypress`, `describe`, `it` etc. acusam `no-undef` no lint.

**Fix no `eslint.config.js`:**
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

### Estrutura do Cypress é `cypress/e2e/` E `cypress/support/` (irmãos)

Se criar `cypress/support/e2e/` (dentro de support), os testes **NÃO** são encontrados. O Cypress procura em `cypress/e2e/*.cy.js` por padrão.

---

## Rotas e imagens

### Rota `/` deve ser Landing pública

Padrão da web — Dashboard privado vai em `/dashboard`. Após logout, redireciona para `/`.

### URL de imagem em `<img>` deve ser URL DIRETA

Não aceita URL de página web. Precisa terminar em `.jpg`, `.png`, `.webp`, `.gif`.

---

## VLibras

### VLibras tem warnings normais no console

A integração oficial do VLibras (`https://vlibras.gov.br/app/vlibras-plugin.js`) gera warnings sobre iframe/accelerometer/devicemotion que são INTERNOS e NÃO são bugs nossos.

**Não silenciar.** Não afeta funcionalidade.

---

## 📚 Skills relacionados

- `/testing-frontend` — Cypress em detalhe
- `/theming` — MUI tema + paletas FBVA/CEUB
- `/deploy` — Vercel, vercel.json, env vars
- `/troubleshooting` — erros gerais (incluindo PowerShell)
