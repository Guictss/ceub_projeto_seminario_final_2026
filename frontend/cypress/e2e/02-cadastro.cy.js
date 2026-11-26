/// <reference types="cypress" />

describe("Cadastro público", () => {
  beforeEach(() => {
    cy.limparAuth();
    cy.visit("/cadastro");
  });

  it("formulário de cadastro aparece com todos os campos", () => {
    cy.contains(/cadastre-se|criar conta|cadastro/i).should("be.visible");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
  });

  it("senha muito curta mostra erro", () => {
    // Email único pra não colidir
    const email = `teste${Date.now()}@teste.com`;

    cy.get('input').then(($inputs) => {
      // Preenche os campos de forma robusta (independente da ordem)
      cy.get('input[name="nome"], input').first().type("Teste Curto");
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').first().type("abc");
    });

    cy.contains("button", /cadastrar|criar/i).click();

    // Espera erro de validação
    cy.contains(/mínimo|8 caracteres|senha/i, { timeout: 5000 }).should("be.visible");
  });

  it("volta pra login via link", () => {
    // Clica especificamente num LINK (não botão "Voltar ao início")
    cy.get('a').contains(/faça login|fazer login/i).click();
    cy.url().should("include", "/login");
  });
});