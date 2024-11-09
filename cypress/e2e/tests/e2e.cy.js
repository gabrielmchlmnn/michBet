describe('Testando a Home Page', () => {
    it('Deve carregar a home page corretamente', () => {
      // Visitando a URL do seu projeto local
      cy.visit('http://127.0.0.1:5500/michBet/index.html');
  
      // Verificando se o título da página está correto
      cy.title().should('eq', 'MichBet - Página inicial');
  
      // Verificando se um elemento específico existe na página
      cy.get('h1').should('contain.text', 'Aposte já');
  
    });
  });
  