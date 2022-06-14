describe('Platypus Data Models Page - Create Data Model', () => {
  beforeEach(() => cy.visit('/'));

  it('should contain create button', () => {
    cy.getBySel('create-data-model-btn').should('be.visible');
  });

  it('should display create form', () => {
    cy.getBySel('create-data-model-btn').click();
    cy.getBySelLike('create-data-model-modal').should('be.visible');
    cy.getBySelLike('modal-title').contains('Create Data Model');
  });

  it('should create data model', () => {
    cy.getBySel('create-data-model-btn').click();
    cy.getBySel('input-data-model-name').type('cypress-test');
    cy.getBySel('modal-ok-button').click();
    // we should be redirected to /dashboard
    cy.url().should('include', '/data-models/cypress-test/latest');
    cy.getCogsToast('success').contains('Data Model successfully created');
  });
});
