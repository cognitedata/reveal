describe('Wells: Casings', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.log('Perform empty search');
    cy.performSearch('');

    cy.goToTab('Wells');
  });

  it('allows us to inspect bad casings for wellbores', () => {
    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: 'Source',
            value: {
              name: 'rigel',
              type: 'checkbox',
            },
          },
        ],
      },
    });

    cy.selectFirstWellInResults();

    cy.openInspectView();
    cy.goToWellsTab('Casings');

    cy.log('Inspect casings results');
    cy.get('[data-testid="depth-indicator"]').should('exist');
  });

  it('allows us to inspect good casings for wellbores', () => {
    cy.performWellsSearch({
      search: {
        filters: [
          {
            category: 'Source',
            value: {
              name: 'pyxis',
              type: 'checkbox',
            },
          },
        ],
      },
    });

    cy.log('Inspect first well in table');

    cy.findByTestId('well-result-table')
      .findAllByTestId('table-row')
      .first()
      .children()
      .first()
      .click();

    cy.openInspectView();
    cy.goToWellsTab('Casings');

    cy.log('Inspect casings results');
    cy.get('[data-testid="depth-indicator"]').should('exist');
  });
});
