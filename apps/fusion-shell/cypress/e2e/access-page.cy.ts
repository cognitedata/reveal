describe('Access-management page', () => {
  beforeEach(() => {
    cy.navigate('access-management');
    cy.ensurePageFinishedLoading();
  });

  it('should display welcome message and display table with access groups', () => {
    cy.get('h1.cogs-title-1', { timeout: 20000 }).contains(/Access management/);
  });
});
