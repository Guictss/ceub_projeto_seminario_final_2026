# CLAUDE.md — frontend/

> Quick-reference para trabalhar no **frontend React** do Projeto Vela Para Todos.
> Carregado automaticamente quando o Claude trabalha nesta pasta.
>
> 📖 Para visão geral do projeto, ver `../CLAUDE.md`.
> 🎨 Para paletas, componentes de tema MUI e convenções visuais do PHP → skill `/theming`.
> ⚠️ Para armadilhas conhecidas, usar skill `/pegadinhas-frontend`.

---

## 1. Estrutura

```text
frontend/
├── public/assets/img/      # imagens copiadas do PHP (mascote Zoé, patterns, logos)
├── src/
│   ├── main.jsx            # Tema MUI + paleta FBVA (ou CEUB na outra branch)
│   ├── App.jsx             # Routes
│   ├── pages/              # Landing, Login, Cadastro, EsqueciSenha, RedefinirSenha,
│   │                       #   Dashboard, Aulas, Noticias, Doacoes, Voluntarios,
│   │                       #   Usuarios, Relatorio
│   ├── components/         # Layout, Navbar, PrivateRoute, ProfessorRoute,
│   │                       #   HeaderLanding, MapaLocalizacao, WidgetAcessibilidade
│   ├── contexts/           # AuthContext (lazy initial state — SEM flash)
│   ├── services/api.js     # axios singleton + interceptor JWT (silent refresh)
│   ├── index.css
│   └── utils/
├── cypress/                # E2E — 7 specs, 23 testes (ver skill /testing-frontend)
├── vite.config.js
├── vercel.json             # rewrite pra SPA routing (/(.*) → /index.html)
├── cypress.config.js
├── eslint.config.js        # config com globals Cypress pra cypress/
├── .env.local              # VITE_API_URL
└── package.json
```

---

## 2. Como rodar

```powershell
cd C:\dev\a3-vela\frontend
npm run dev                 # http://localhost:5173
```

Ou tudo em paralelo com `..\start-dev.ps1` (recomendado).

### Scripts disponíveis

```json
"dev": "vite",
"build": "vite build",
"preview": "vite preview",
"lint": "eslint .",
"cypress:open": "cypress open",
"cypress:run": "cypress run --browser chrome",
"test:e2e": "start-server-and-test dev http://localhost:5173 cypress:run"
```

---

## 3. Padrões de código

### Arquitetura
- **Páginas** em `src/pages/<Nome>.jsx` (arquivo único; componentes auxiliares inline)
- **Componentes compartilhados** em `src/components/`
- **API** via `src/services/api.js` (axios singleton, **nunca** `fetch` cru)
- **Estado local** com `useState` + `useEffect`; **nada de Redux/Zustand**
- **Autenticação** via `useAuth()` do `AuthContext` (lazy initial state)

### UX
- **Loading/erro/vazio** sempre tratados em páginas de lista
- **Feedback** via `<Snackbar>` do MUI ou `<Alert>` inline
- **Confirmação de ação destrutiva** via `<Dialog>`
- **Erros amigáveis** com helper `extrairMensagemErro(data)` (ver seção 5)
- **Validação visual**: campos com `error={}` e `helperText` com contagem
- **Botão desabilitado** enquanto form inválido (`disabled={!tituloValido}`)
- **Recursos com conteúdo longo**: modal de leitura faz `GET /recurso/<id>` quando abre
- **PDF**: `responseType: "blob"` + `window.open(URL.createObjectURL)`

### Validação client-side em TODOS os formulários

Para evitar o tooltip HTML5 feio ("Preencha este campo"), todo form público/privado:

1. `noValidate` no `<Box component="form">`
2. Função `validarLocal()` que retorna `true/false` e preenche `erroCampos`
3. `handleSubmit` chama `validarLocal()` antes do POST
4. TextFields com `error={!!erroCampos.campo}` e `helperText={erroCampos.campo}`
5. Bônus UX: `onChange` limpa o erro do próprio campo

**Referência:** `Login.jsx` e `Cadastro.jsx`.

---

## 4. MUI + Tailwind — ambos no mesmo projeto

O projeto mistura MUI e Tailwind. Alguns componentes usam
`className="flex items-center gap-2"` (Tailwind) ao invés de
`sx={{ display: "flex", alignItems: "center", gap: 1 }}` (MUI). **Ambos funcionam.**

**Ao copiar padrões de uma página pra outra, respeite a convenção já adotada naquele componente.**

---

## 5. Helper padrão de erros amigáveis

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

## 6. Template de página admin (bate com Voluntarios, Usuarios)

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

### Checklist mínimo para nova página de listagem

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

**Referências:** `Aulas.jsx` (CRUD completo), `Noticias.jsx` (conteúdo longo),
`Doacoes.jsx` (listagem simples com resumo), `Usuarios.jsx` (lista + filtros + modal + dialog).

---

## 7. Mobile-first (requisito do projeto)

- **Listagens:** `<Grid size={{ xs: 12, sm: 6, md: 4 }}>`
- **Navbar interna (autenticada):** `useMediaQuery(theme.breakpoints.down("md"))` pra Drawer hamburger
- **Landing publica:** também tem Drawer hamburger no mobile (em `components/HeaderLanding.jsx`)
- **Container padrão:** `<Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>`
- **Forms:** `<Stack direction={{ xs: "column", sm: "row" }}>`

---

## 8. AuthContext (lazy initial state)

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
  // ... login/logout
}
```

⚠️ **NUNCA** `useState(null) + useEffect` pra hidratar storage — causa flash de "Acesso restrito" em rotas privadas no F5.

---

## 9. Lint (ESLint 10)

```powershell
npm run lint                # verifica
npm run lint -- --fix       # auto-fix
```

Config em `eslint.config.js` com bloco especial pra `cypress/**/*.{js,cy.js}` liberando globals `cy`, `Cypress`, `describe`, `it`, `expect`, `assert`.

CI roda `npm run lint` — PR vermelho barra merge.

---

## 10. Rotas

```
/                           → Landing publica (visual PHP 100% + Leaflet)
/login                      → Login split-screen (esquerda azul com Zoé + direita form)
/cadastro                   → Cadastro publico split-screen
/esqueci-senha              → Solicita link de reset por email
/redefinir-senha?token=XXX  → Define nova senha com token temporário
/dashboard                  → Recharts (métricas diferentes por papel)
/aulas, /noticias           → privadas, qualquer logado
/doacoes, /voluntarios,
/relatorio, /usuarios       → privadas, só professor
```

Logout redireciona para `/`. Fallback de URL desconhecida também vai pra `/`.

---

## 11. Variáveis de ambiente

`frontend/.env.local` (local):
```
VITE_API_URL=http://localhost:5000/api/v1
```

Em produção, configurado no painel da Vercel:
```
VITE_API_URL=https://vela-para-todos-api.onrender.com/api/v1
```

⚠️ `.env.local` precisa ser salvo como **ASCII** (não UTF-8 com BOM) — PowerShell 5.1 `Out-File -Encoding UTF8` quebra o Vite. Use `-Encoding ASCII`.

---

## 12. Checklist antes de commitar

1. `npm run lint` — sem warnings
2. `npm run build` — Vite builda sem erro
3. `npm run cypress:run` — 23 testes verdes (se mudou fluxos)
4. `git status` + `git diff` revisados
5. Se mudou paleta: testar nas 2 branches (main FBVA + apresentacao-ceub)

---

## 📚 Skills relacionados

- `/pegadinhas-frontend` — armadilhas (MUI slotProps, Grid v2, Vite 8 UTF-8, SPA routing, lazy init state)
- `/testing-frontend` — Cypress, commands, specs
- `/theming` — FBVA ↔ CEUB, componentes de tema MUI, convenções PHP
- `/deploy` — Vercel + env vars + vercel.json
- `/troubleshooting` — erros comuns (encoding, VLibras, Leaflet)
