describe('Wells: Related documents', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
  });
  it('Should have zero results', () => {
    cy.performWellsSearch({
      search: { query: 'F-1' },
      select: { wells: ['F-1'] },
    });

    cy.openInspectView();

    cy.goToWellsTab('Related Documents');

    cy.findByTestId('search-header-breadcrumb').contains('0 files');
  });
});
