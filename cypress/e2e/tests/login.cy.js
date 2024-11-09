describe('Testando o formulário de login', () => {
    it('Deve fazer login corretamente', () => {
      cy.visit('http://127.0.0.1:5500/michBet/templates/html/login.html');
      
      // Preenchendo os campos de login
      cy.get('input[name="username"]').type('usuario_teste');
      cy.get('input[name="password"]').type('senha123');
      
      // Submetendo o formulário
      cy.get('button[type="submit"]').click();
      
    });
  });