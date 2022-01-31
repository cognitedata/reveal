describe('Wells: Search table', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();
  });
  it('Should select a well and remove selected selection on bulk action close', () => {
    cy.performWellsSearch({
      search: { query: 'F-' },
      select: { wells: ['F-1', 'F-10'] },
    });

    cy.clearWellsSelection();
  });

  it('Should do multiple search queries, and then deselect all wells (and wellbores)', () => {
    cy.performWellsSearch({
      search: { query: 'F-' },
      select: { wells: ['F-1', 'F-10'] },
    });

    cy.findByTestId('table-bulk-actions').should('be.visible');

    cy.performWellsSearch({
      search: { query: '15' },
      select: { wells: ['15/9-19'] },
    });

    cy.clearWellsSelection();
  });
});
