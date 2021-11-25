describe('Feedback page', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('BASE_URL'));
  });

  it('cannot be accessed by a normal user', () => {
    cy.login();
    cy.url().should('include', '/search');
    cy.checkAdminSettingsIsNotVisible();

    cy.checkUserCannotAccessPage('admin/feedback/general');
  });

  it('can be used to check reported feedback as Admin', () => {
    // intercept the feedback request so we can wait for the data
    cy.intercept({
      url: '*/user/roles*',
      method: 'GET',
    }).as('getUserRoles');

    cy.intercept({
      url: '*/feedback/general',
      method: 'GET',
    }).as('getGeneralFeedback');

    cy.intercept({
      url: '*/feedback/object',
      method: 'GET',
    }).as('getDocumentFeedback');

    cy.loginAsAdmin();

    cy.log(
      'Check that we have the Admin Settings button and open Feedback page'
    );
    cy.wait('@getUserRoles');

    cy.findByTestId('top-bar')
      .contains('Admin Settings')
      .should('exist')
      .click();
    cy.contains('Manage Feedback').should('be.visible').click();

    cy.log('Check that url changed to /admin/feedback/general');
    cy.url().should('contain', '/admin/feedback/general');

    cy.log(
      'Check that General Feedback button is active and Document Feedback inactive'
    );
    cy.findByRole('button', { name: 'General Feedback' }).should(
      'have.class',
      'cogs-btn-primary'
    );
    cy.findByRole('button', { name: 'Document Feedback' }).should(
      'have.class',
      'cogs-btn-ghost'
    );

    cy.log(
      'Wait for results and check that empty-state-container is not there'
    );

    cy.wait('@getGeneralFeedback');
    cy.findByTestId('empty-state-container').should('not.exist');

    // DOCUMENT FEEDBACK
    cy.log('Open Document Feedback page by button');
    cy.findByRole('button', { name: 'Document Feedback' })
      .click()
      .should('have.class', 'cogs-btn-primary');
    cy.findByRole('button', { name: 'General Feedback' }).should(
      'have.class',
      'cogs-btn-ghost'
    );

    cy.log(
      'The loading icon should be visible in the beginning and disappear when we get back the data'
    );
    cy.findByTestId('empty-state-container')
      .contains('Loading results')
      .should('be.visible');
    cy.wait('@getDocumentFeedback');
    cy.findByTestId('empty-state-container').should('not.exist');
  });
});
