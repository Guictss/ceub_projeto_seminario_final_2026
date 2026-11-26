/// <reference types="cypress" />

describe("Proteção CANNOT_DELETE_SELF", () => {
  beforeEach(() => {
    cy.limparAuth();
    cy.loginViaApi("carlos@teste.com", "Senha123!");
  });

  it("professor acessa página de usuários", () => {
    cy.visit("/usuarios");
    cy.contains(/usuários/i).should("be.visible");
    // Carlos deve aparecer na lista
    cy.contains("Carlos Andrade").should("be.visible");
  });

  it("API bloqueia delete do próprio usuário com erro", () => {
    // Pega o ID do Carlos via /auth/me
    cy.request({
      method: "GET",
      url: "http://localhost:5000/api/v1/auth/me",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("access_token")}`,
      },
    }).then((res) => {
      const meuId = res.body.id;

      // Tenta deletar a si mesmo — deve falhar
      cy.request({
        method: "DELETE",
        url: `http://localhost:5000/api/v1/usuarios/${meuId}`,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("access_token")}`,
        },
        failOnStatusCode: false,
      }).then((del) => {
        // Esperado: 400 / 403 / 409 (CANNOT_DELETE_SELF)
        expect(del.status).to.be.oneOf([400, 403, 409, 422]);
      });
    });
  });

  it("aluno não pode acessar /usuarios (403 ou redirect)", () => {
    cy.limparAuth();
    cy.loginViaApi("maria@teste.com", "Senha123!");
    cy.visit("/usuarios");

    // Ou mostra "Acesso restrito" ou redireciona
    cy.contains(/acesso restrito|exclusiv/i, { timeout: 5000 }).should("be.visible");
  });
});