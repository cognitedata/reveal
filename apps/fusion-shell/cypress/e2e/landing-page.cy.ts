describe('fusion-shell', () => {
  beforeEach(() => {
    cy.navigate('');
  });

  it('should display welcome message', () => {
    cy.get('h2.cogs-title-2').contains(/Welcome to Cognite Data Fusion/);
  });
});
