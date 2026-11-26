/// <reference types="cypress" />

describe("Landing e Login", () => {
  beforeEach(() => {
    cy.limparAuth();
  });

  it("landing pública carrega os elementos principais", () => {
    cy.visit("/");
    cy.contains(/vela para todos/i).should("be.visible");
    cy.contains(/Conheça e participe/i).should("be.visible");
  });

  it("navega da landing até a página de login", () => {
    cy.visit("/");
    cy.contains(/login/i).click();
    cy.url().should("include", "/login");
    cy.contains(/acesse sua conta|bem-vindo/i).should("be.visible");
  });

  it("login com credenciais válidas redireciona ao dashboard", () => {
    cy.loginUI("carlos@teste.com", "Senha123!");
    cy.url({ timeout: 10000 }).should("include", "/dashboard");
    cy.contains(/dashboard/i).should("be.visible");
    cy.contains("Carlos Andrade").should("be.visible");
  });

  it("login com senha errada mostra erro", () => {
    cy.loginUI("carlos@teste.com", "SenhaErrada!");
    cy.contains(/credenciais inválidas|email ou senha|incorret/i, {
      timeout: 5000,
    }).should("be.visible");
    cy.url().should("include", "/login");
  });
});