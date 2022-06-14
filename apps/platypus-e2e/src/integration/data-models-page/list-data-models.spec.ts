describe('Platypus Data Models Page - List Data Models', () => {
  beforeEach(() => cy.visit('/'));

  it('should display title', () => {
    cy.getBySel('data-models-title').contains('Data Models');
  });

  it('should display data models cards', () => {
    // TODO we should consider resetting the mock server between tests so that
    // the creation of data models in other tests won't affect the number of
    // data model cards that we look for here
    // https://cognitedata.atlassian.net/browse/DX-635
    cy.getBySel('data-model-card').its('length').should('be.gte', 1);
  });

  it('should render the data model cards corectly', () => {
    cy.getBySel('data-model-card')
      .first()
      .getBySel('data-model-card-title')
      .contains('blog');
  });
});
