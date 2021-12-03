describe('Wells inspect view', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.log('Perform empty search');
    cy.performSearch('');

    cy.log('Go to wells tab');
    cy.findByRole('tab', { name: 'Wells' }).should('be.visible').click();
  });

  describe('NPT Events', () => {
    it('allow us to see NPT data in different views', () => {
      cy.log('Set source to Volve');
      cy.findByTestId('side-bar')
        .contains('Source')
        .should('be.visible')
        .click();
      cy.findByTestId('side-bar')
        .contains('volve')
        .should('be.visible')
        .click();

      cy.log('Select all wells');
      cy.findByTitle('Toggle All Rows Selected').should('be.visible').click();

      cy.log(
        'Check that we see table bulk actions with correct number of selected wells'
      );
      cy.findByTestId('table-bulk-actions')
        .should('be.visible')
        .contains('11 wells selected');

      cy.log('Open inspect view');
      cy.findByTestId('table-bulk-actions')
        .findByRole('button', { name: 'View' })
        .should('exist')
        .click();

      cy.log('Go to NPT Events tab');
      cy.findByRole('tablist')
        .findByRole('tab', { name: 'NPT Events' })
        .should('be.visible')
        .click();

      cy.url().should('contain', '/wells/inspect/eventsNpt');
      cy.log('Graph should be the default selected view');
      cy.findByTestId('npt-events-graph').should('be.visible');

      cy.log('Switch to table view');
      cy.findByTestId('graph-view-switch').contains('Table').click();
      cy.log('Check that we have filters');
      cy.findByTestId('search-box-input').should('be.visible');
      cy.contains('NPT Duration (hrs)').should('be.visible');
      cy.contains('NPT Code').should('be.visible');
      cy.contains('NPT Detail Code').should('be.visible');

      cy.log('Switch back to graph view');
      cy.findByTestId('graph-view-switch').contains('Graph').click();
      cy.log('Check that we see the legend footer');
      cy.contains('NPT Codes').should('be.visible');

      cy.log('Open single wellbore view');
      cy.findAllByTestId('bar-label').first().click();
      cy.findByLabelText('next-wellbore').should('be.visible').click();
    });
  });
});
