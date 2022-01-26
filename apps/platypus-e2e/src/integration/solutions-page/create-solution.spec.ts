describe('Platypus Solutions Page - List Solutions', () => {
  beforeEach(() => cy.visit('/'));

  it('should contain create button', () => {
    cy.getBySel('create-solution-btn').should('be.visible');
  });

  it('should display create form', () => {
    cy.getBySel('create-solution-btn').click();
    cy.getBySelLike('create-solution-modal').should('be.visible');
    cy.getBySelLike('modal-title').contains('Create solution');
  });

  it('should create solution', () => {
    cy.getBySel('create-solution-btn').click();
    cy.getBySel('input-solution-name').type('cypress-test');
    cy.getBySel('modal-ok-button').click();
    // we should be redirected to /dashboard
    cy.url().should('include', '/solutions/cypress-test/latest');
    cy.getCogsToast('success').contains('Solution successfully created');
  });
});
