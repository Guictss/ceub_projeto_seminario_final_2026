---
name: testing-frontend
description: Suite de testes E2E com Cypress 16 do frontend React do Projeto Vela Para Todos — 23 testes em 7 specs cobrindo fluxos críticos. Use ao escrever ou debugar teste Cypress, adicionar custom command, configurar cypress.config.js, lidar com start-server-and-test, ou entender breaking changes do Cypress 16 (sem Cypress.env, Chrome ao invés de Electron). Inclui estrutura das specs, commands (loginViaApi, loginUI, limparAuth) e integração com ESLint.
---

# Testes do Frontend (Cypress E2E)

> **Status:** 23 testes em 7 specs 🎯 — suíte roda em ~46s
> Cypress 16 + start-server-and-test. Cobre os fluxos críticos end-to-end.

---

## Como rodar

```powershell
cd C:\dev\a3-vela\frontend

# Interativo (UI do Cypress — recomendado pra escrever/debugar)
npm run cypress:open

# Headless (como no CI)
npm run cypress:run

# Com start-server-and-test (sobe frontend automaticamente)
npm run test:e2e
```

**Pré-requisito:** backend precisa estar rodando em `http://localhost:5000` (interativo) ou `test:e2e` sobe o frontend (mas backend ainda precisa ser iniciado manualmente).

---

## Estrutura

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

### O que cada spec cobre

| Spec | Fluxo |
|---|---|
| `01-landing-login` | Landing pública carrega, botão login funciona, login com professor + aluno, logout |
| `02-cadastro` | Novo aluno se cadastra, validações de e-mail/senha/idade |
| `03-aulas-crud` | Professor cria aula, edita, deleta |
| `04-acessibilidade` | Widget A+/A-/contraste persiste no localStorage |
| `05-aluno-inscricao` | Aluno vê aulas disponíveis, se inscreve, cancela |
| `06-esqueci-senha` | Fluxo de recuperação com token JWT temporário |
| `07-cannot-delete-self` | Proteção CANNOT_DELETE_SELF funciona |

---

## Custom commands (`cypress/support/commands.js`)

| Command | Uso |
|---|---|
| `cy.loginViaApi(email, senha)` | Login programático via `POST /auth/login` + popula localStorage. Rápido, pra `beforeEach` |
| `cy.loginUI(email, senha)` | Login preenchendo o formulário (testa o fluxo real) |
| `cy.limparAuth()` | `clearLocalStorage()` + `clearCookies()` — isolamento entre testes |

### Exemplo de uso

```js
describe("Aulas CRUD como professor", () => {
  beforeEach(() => {
    cy.limparAuth();
    cy.loginViaApi("carlos@teste.com", "Senha123!");
  });

  it("professor consegue criar aula", () => {
    cy.visit("/aulas");
    cy.contains("Nova aula").click();
    cy.get('input[name="descricao"]').type("Aula de teste");
    // ...
    cy.contains("Aula criada").should("be.visible");
  });
});
```

### Implementação de `loginViaApi`

```js
const API_URL = "http://localhost:5000/api/v1";  // hardcoded (ver pegadinha abaixo)

Cypress.Commands.add("loginViaApi", (email, senha) => {
  cy.request("POST", `${API_URL}/auth/login`, { email, senha }).then((res) => {
    window.localStorage.setItem("access_token", res.body.access_token);
    window.localStorage.setItem("refresh_token", res.body.refresh_token);
    window.localStorage.setItem("usuario", JSON.stringify(res.body.usuario));
  });
});
```

---

## cypress.config.js

```js
import { defineConfig } from "cypress";

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

---

## Scripts no package.json

```json
"cypress:open": "cypress open",
"cypress:run": "cypress run --browser chrome",
"test:e2e": "start-server-and-test dev http://localhost:5173 cypress:run"
```

---

## Breaking changes do Cypress 16 — já aplicados

### `Cypress.env()` removido

Agora é `Cypress.expose()` ou `cy.env()`. No projeto, optamos por **hardcodar** `API_URL` no `commands.js` — é só URL de dev local.

### Electron deprecado como browser

Rodamos com Chrome:
```json
"cypress:run": "cypress run --browser chrome"
```

### npm 10+ bloqueia postinstall

Cypress tem `postinstall` que baixa ~500MB. Em npm 10+, fica bloqueado.

**Fix (uma vez só):**
```powershell
npm install-scripts approve cypress
npx cypress install
```

---

## ESLint pra `cypress/`

Sem config específica, `cy`, `Cypress`, `describe`, `it`, `expect`, `assert` dão erro `no-undef`.

**Fix já aplicado em `eslint.config.js`:**
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

---

## Estrutura de pastas — CUIDADO

Cypress procura specs em `cypress/e2e/*.cy.js` **por padrão**. Se criar `cypress/support/e2e/` (dentro de support), os testes **NÃO** são encontrados.

```
cypress/
├── e2e/          ← aqui vão as specs
└── support/      ← commands + hooks (IRMÃO de e2e)
```

---

## Dependência do backend

Cypress precisa do backend rodando em `http://localhost:5000` pra `loginViaApi` funcionar. Opções:

1. **Dev normal:** `..\start-dev.ps1` sobe os dois, depois `npm run cypress:open` em outro terminal
2. **Só frontend:** `npm run test:e2e` sobe o Vite, mas backend ainda é manual
3. **Backend separado:** `cd backend ; python app.py` em outro terminal

⚠️ Backend em dev precisa de `RATELIMIT_ENABLED = False` em `DevelopmentConfig`, senão Cypress bate em 429 (vários logins no `beforeEach`).

---

## Como adicionar um teste novo

1. Escolher a spec apropriada (ou criar `08-xxx.cy.js`)
2. Usar `beforeEach(() => { cy.limparAuth(); cy.loginViaApi(email, senha); })`
3. Escrever `it("faz tal coisa", () => { ... })` com asserts usando `cy.contains`, `cy.get`
4. Rodar com `npm run cypress:open` pra ver visualmente
5. Rodar headless pra confirmar `npm run cypress:run`
6. Commitar — o CI já pega

---

## Seletores — boas práticas

### Preferir texto visível (resiliente a refactor)
```js
cy.contains("Nova aula").click();
cy.contains("Aula criada com sucesso").should("be.visible");
```

### Fallback pra atributos semânticos
```js
cy.get('input[name="email"]').type("maria@teste.com");
cy.get('a[href="/login"]').click();
```

### Evitar seletores por classe CSS (quebram em refactor)
```js
// ❌ ruim
cy.get(".MuiButton-root.sc-xyz123").click();
```

---

## 📚 Skills relacionados

- `/pegadinhas-frontend` — Cypress 16 breaking changes
- `/testing-backend` — pytest + TestingConfig
- `/deploy` — CI/CD (Cypress NÃO roda no CI atualmente, só pytest)
