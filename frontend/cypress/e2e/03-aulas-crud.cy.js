/// <reference types="cypress" />

describe("Professor — CRUD de Aulas", () => {
  beforeEach(() => {
    cy.limparAuth();
    cy.loginViaApi("carlos@teste.com", "Senha123!");
    cy.visit("/aulas");
  });

  it("professor vê lista de aulas", () => {
    cy.contains(/aulas/i).should("be.visible");
    // Ao menos uma aula do seed deve aparecer OU botão de criar
    cy.contains(/nova aula|criar|adicionar/i).should("be.visible");
  });

  it("professor abre modal de criar aula", () => {
    cy.contains("button", /nova aula|criar|adicionar/i).click();
    // Modal/dialog abre com campos
    cy.get('input[type="date"], input').should("be.visible");
  });

  it("aluno NÃO consegue criar aula (botão oculto)", () => {
    cy.limparAuth();
    cy.loginViaApi("maria@teste.com", "Senha123!");
    cy.visit("/aulas");

    // Aluno vê a lista mas NÃO vê botão de criar
    cy.contains(/nova aula|criar aula/i).should("not.exist");
  });
});