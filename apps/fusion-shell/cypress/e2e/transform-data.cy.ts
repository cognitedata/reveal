describe('Transform data page', () => {
  beforeEach(() => {
    cy.navigate('transformations');
    cy.ensurePageFinishedLoading();
  });

  it('Should open Transform data page', () => {
    cy.get('h3.cogs-title-3', { timeout: 20000 }).contains(/Transform data/);

    cy.get('.ant-table-wrapper tbody', { timeout: 20000 })
      .find('tr')
      .its('length')
      .should('be.gte', 1);
  });
});
