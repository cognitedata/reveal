describe('Data-models page', () => {
  beforeEach(() => {
    cy.navigate('data-models');
    cy.ensurePageFinishedLoading();
  });

  it('Should open Data models page', () => {
    cy.get('h3[data-cy="data-models-title"]', { timeout: 20000 }).contains(
      /Data models/
    );
    cy.get('button.cogs-button[data-cy="create-data-model-btn"]', {
      timeout: 20000,
    }).should('exist');
  });
});
