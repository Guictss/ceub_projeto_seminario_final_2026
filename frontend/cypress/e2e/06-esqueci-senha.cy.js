/// <reference types="cypress" />

describe("Esqueci minha senha", () => {
  beforeEach(() => {
    cy.limparAuth();
  });

  it("acessa esqueci-senha via link no login", () => {
    cy.visit("/login");
    cy.contains(/esqueci.*senha/i).click();
    cy.url().should("include", "/esqueci-senha");
  });

  it("formulário tem campo de email", () => {
    cy.visit("/esqueci-senha");
    cy.get('input[type="email"]').should("be.visible");
    cy.contains("button", /enviar|solicitar|redefinir/i).should("be.visible");
  });

  it("submit mostra confirmação genérica (segurança)", () => {
    cy.visit("/esqueci-senha");
    cy.get('input[type="email"]').type("qualquer@teste.com");
    cy.contains("button", /enviar|solicitar|redefinir/i).click();

    // Resposta genérica de segurança: sempre 200, não revela se email existe
    cy.contains(/enviado|verifique|instruções|caixa de entrada/i, {
      timeout: 5000,
    }).should("be.visible");
  });

  it("redefinir-senha sem token redireciona", () => {
    cy.visit("/redefinir-senha");
    // Sem token, deve redirecionar pra esqueci-senha
    cy.url({ timeout: 5000 }).should("include", "/esqueci-senha");
  });
});