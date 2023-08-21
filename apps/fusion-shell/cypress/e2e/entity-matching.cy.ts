describe('Entity matching page', () => {
  beforeEach(() => {
    cy.navigate('entity-matching-new');
  });

  it('Should open Entity matching page', () => {
    cy.get('h3.cogs-title-3', { timeout: 20000 }).contains(
      /Entity Matching pipelines/
    );
    cy.get('.ant-table-wrapper tbody', { timeout: 20000 })
      .find('tr')
      .its('length')
      .should('be.gte', 1);
  });
});
