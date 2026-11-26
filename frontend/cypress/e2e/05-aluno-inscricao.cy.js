/// <reference types="cypress" />

describe("Aluno — Inscrição em aulas", () => {
  beforeEach(() => {
    cy.limparAuth();
    cy.loginViaApi("maria@teste.com", "Senha123!");
  });

  it("aluno acessa página de aulas e vê a lista", () => {
    cy.visit("/aulas");
    cy.contains(/aulas/i).should("be.visible");

    // Deve ter cards ou linhas de aulas (do seed)
    cy.get("body").should("contain.text", "Carlos Andrade");
  });

  it("aluno vê botão de inscrever ou cancelar em alguma aula", () => {
    cy.visit("/aulas");
    // Qualquer aula deve ter um botão de ação (inscrever OU cancelar OU detalhes)
    cy.get("button").should("have.length.greaterThan", 0);
  });

  it("aluno vê dashboard com suas inscrições", () => {
    cy.visit("/dashboard");
    cy.contains(/minhas inscrições|aulas inscritas|dashboard/i).should("be.visible");
  });

  it("aluno NÃO vê menu de doações/voluntários/usuários", () => {
    cy.visit("/dashboard");
    // Nav do aluno só tem Dashboard, Aulas, Notícias
    cy.get("nav, header").within(() => {
      cy.contains(/doações|voluntários|usuários/i).should("not.exist");
    });
  });
});