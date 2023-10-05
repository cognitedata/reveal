describe('Extract data page', () => {
  beforeEach(() => {
    cy.navigate('extractors');
    cy.ensurePageFinishedLoading();
  });

  it('Should open Extract data page', () => {
    cy.get('h2.cogs-title-2', { timeout: 20000 }).contains(/Extract data/);
  });
});
