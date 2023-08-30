describe('Data-explorer page', () => {
  beforeEach(() => {
    cy.navigate('explore');
  });

  it('Should open Data Explorer from Home page', () => {
    cy.get('h6.cogs-title-6', { timeout: 20000 }).contains(/Common/);
  });
});
