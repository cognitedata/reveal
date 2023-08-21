describe('Data-explorer page', () => {
  beforeEach(() => {
    cy.navigate('explore');
  });

  it('Should open Data Explorer from Home page', () => {
    cy.url().should('include', 'https://localhost:8080/dss-dev/explore');
    cy.get('h6.cogs-title-6', { timeout: 20000 }).contains(/Common/);
  });
});
