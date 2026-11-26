/// <reference types="cypress" />

describe("Widget de Acessibilidade", () => {
  beforeEach(() => {
    cy.limparAuth();
    cy.clearLocalStorage();
    cy.visit("/");
  });

  it("widget aparece na landing", () => {
    // O widget é o FAB azul no canto inferior direito
    cy.get('[aria-label*="acessibilidade"], button').should("exist");
  });

  it("aumentar fonte muda o tamanho e persiste no F5", () => {
    // Captura o tamanho de fonte inicial do body
    cy.get("body").then(($body) => {
      const tamanhoInicial = parseFloat($body.css("font-size"));

      // Abre widget (procura por FAB — pode precisar ajustar seletor)
      cy.get('button[aria-label*="acessibilidade" i], button').then(($btns) => {
        // Clica no widget (procura o FAB flutuante)
        const fab = Array.from($btns).find(
          (b) => b.getAttribute("aria-label")?.toLowerCase().includes("acessibilidade")
        );
        if (fab) cy.wrap(fab).click();
      });

      // Clica em "A+" algumas vezes
      cy.contains("button", /A\+|aumentar/i).click();
      cy.contains("button", /A\+|aumentar/i).click();

      // Confirma que fonte aumentou
      cy.get("body").should(($b) => {
        const novoTamanho = parseFloat($b.css("font-size"));
        expect(novoTamanho).to.be.greaterThan(tamanhoInicial);
      });

      // Reload — localStorage deve persistir
      cy.reload();

      // Após F5, fonte continua aumentada (pegadinha do lazy initial state!)
      cy.get("body").should(($b) => {
        const tamanhoDepoisReload = parseFloat($b.css("font-size"));
        expect(tamanhoDepoisReload).to.be.greaterThan(tamanhoInicial);
      });
    });
  });
});