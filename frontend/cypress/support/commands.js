// URL da API (local). Ajustar se for rodar contra outro backend.
const API_URL = "http://localhost:5000/api/v1";

// ────────────────────────────────────────────────────────────────
// Login programático (via API) — mais rápido que preencher formulário
// Usar no beforeEach de testes que precisam só do estado logado
// ────────────────────────────────────────────────────────────────
Cypress.Commands.add("loginViaApi", (email, senha) => {
  cy.request("POST", `${API_URL}/auth/login`, { email, senha }).then((res) => {
    window.localStorage.setItem("access_token", res.body.access_token);
    window.localStorage.setItem("refresh_token", res.body.refresh_token);
    window.localStorage.setItem("usuario", JSON.stringify(res.body.usuario));
  });
});

// ────────────────────────────────────────────────────────────────
// Login via UI — preenche o form (teste do próprio fluxo de login)
// ────────────────────────────────────────────────────────────────
Cypress.Commands.add("loginUI", (email, senha) => {
  cy.visit("/login");
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(senha);
  cy.contains("button", /entrar/i).click();
});

// ────────────────────────────────────────────────────────────────
// Logout limpa tudo
// ────────────────────────────────────────────────────────────────
Cypress.Commands.add("limparAuth", () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});