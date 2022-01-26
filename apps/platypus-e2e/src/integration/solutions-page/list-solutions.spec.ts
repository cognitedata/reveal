describe('Platypus Solutions Page - List Solutions', () => {
  beforeEach(() => cy.visit('/'));

  it('should display title', () => {
    cy.getBySel('solutions-title').contains('Solutions');
  });

  it('should display solutions cards', () => {
    cy.getBySelLike('solution-card').its('length').should('be.gt', 2);
  });

  it('should render the solution cards corectly', () => {
    cy.getBySelLike('solution-card')
      .first()
      .getBySel('solution-card-title')
      .contains('schema-versions-test');
  });
});
