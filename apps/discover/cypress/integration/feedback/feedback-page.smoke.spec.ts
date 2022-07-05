describe('Feedback', () => {
  describe('Normal User', () => {
    before(() => {
      cy.visit(Cypress.env('BASE_URL'));
      cy.login();
      cy.acceptCookies();
    });

    beforeEach(() => {
      cy.intercept({
        url: '**/feedback/object',
        method: 'POST',
      }).as('submitDocumentFeedback');

      cy.intercept({
        url: '**/feedback/general',
        method: 'POST',
      }).as('submitGeneralFeedback');
    });

    it('cannot access the feedback page', () => {
      cy.url().should('include', '/search');
      cy.checkAdminSettingsIsNotVisible();
      cy.checkUserCannotAccessPage('admin/feedback/general');
    });

    it('can submit document feedback', () => {
      const document = 'mercury';
      const docType = 'Drilling Report';
      const comment =
        'This is some additional info I am sending with the feedback';

      cy.log('submit feedback');
      cy.performSearch(document);
      cy.findByTestId('doc-result-table')
        .findAllByTestId('table-row')
        .first()
        .children()
        .last()
        .children()
        .first()
        .invoke('attr', 'style', 'opacity: 1')
        .findByTestId('menu-button')
        .click({ force: true });

      cy.log('Open feedback modal');
      cy.findByRole('button', { name: 'Leave feedback' }).click({
        force: true,
      });
      cy.findByRole('dialog')
        .should('be.visible')
        .findByText('Feedback')
        .should('be.visible');

      cy.log('Mark document as incorrect geo');
      cy.findByText('Incorrect geographic tag').should('be.visible').click();

      cy.log('mark document as incorrect type and set type');
      cy.findByText('Incorrect document type').should('be.visible').click();
      cy.findByText('Select document type').click();
      cy.findByText(docType).click();

      cy.log('Add additional feedback');
      cy.findByTestId('feedback-text').type(comment);

      cy.log('Submit feedback');
      cy.findByRole('button', { name: 'Send' }).click();
      cy.findByText('Your feedback has been received').should('be.visible');

      // check network request to confirm feedback is sent
      cy.wait('@submitDocumentFeedback', { requestTimeout: 10000 }).then(
        (interception) => {
          const requestBody = interception.request.body.payload;
          assert.equal(requestBody.comment, comment);
          assert.equal(requestBody.suggestedType, docType);
          assert.equal(requestBody.isIncorrectGeo, true);
          assert.equal(requestBody.isSensitiveData, false);
          assert.equal(requestBody.isOther, false);
          assert.equal(interception.response.statusCode, 200);
          assert.isDefined(
            interception.response.body.id,
            'feedback Id is returned in response'
          );

          cy.deleteFeedback(interception.response.body.id, 'object').then(
            (response) => {
              assert.equal(response.status, 204);
            }
          );
        }
      );
    });

    it('can Undo the document feedback submit', () => {
      cy.log('submit feedback');
      cy.performSearch('');
      cy.findByTestId('doc-result-table')
        .findAllByTestId('table-row')
        .first()
        .children()
        .last()
        .children()
        .first()
        .invoke('attr', 'style', 'opacity: 1')
        .findByTestId('menu-button')
        .click({ force: true });

      cy.log('Open feedback modal');
      cy.findByRole('button', { name: 'Leave feedback' }).click({
        force: true,
      });
      cy.findByRole('dialog')
        .should('be.visible')
        .findByText('Feedback')
        .should('be.visible');

      cy.log('Mark document as incorrect geo');
      cy.findByText('Incorrect geographic tag').should('be.visible').click();

      cy.log('mark document as incorrect type and set type');
      cy.findByText('Incorrect document type').should('be.visible').click();
      cy.findByText('Select document type').click();
      cy.findByText('Drilling Report').click();

      cy.log('Add additional feedback');
      cy.findByTestId('feedback-text').type(
        'This is some additional info I am sending with the feedback'
      );

      cy.log('Submit feedback');
      cy.findByRole('button', { name: 'Send' }).click();

      cy.findByText('Your feedback has been received').should('be.visible');
      cy.findByRole('button', { name: 'Undo' }).should('be.visible').click();

      // check that we didn't send a network request for feedback
    });

    it('can submit general feedback from anywhere in the app', () => {
      const comment = 'This is some general feedback I am sending';
      cy.log('Submit feedback from favorites page');
      cy.goToFavoritesPage();
      cy.openGeneralFeedbackModal(comment, true);
      cy.wait('@submitGeneralFeedback', { requestTimeout: 10000 }).then(
        (interception) => {
          assert.equal(interception.request.body.payload.comment, comment);
          assert.exists(interception.request.body.payload.screenshotB64);
          assert.equal(interception.response.statusCode, 200);
          cy.deleteFeedback(interception.response.body.id, 'general').then(
            (response) => {
              assert.equal(response.status, 204);
            }
          );
        }
      );

      cy.log('Undo feedback creation');
      cy.openGeneralFeedbackModal(comment, true);
      cy.findByRole('button', { name: 'Undo' }).should('be.visible').click();

      cy.log('See if modal opens from Search page');
      cy.findByTestId('cognite-logo').click();
      cy.openGeneralFeedbackModal('', false);

      cy.log('See if modal opens from Well Inspect page');
      cy.expandResultTable();
      cy.goToTab('Wells');
      cy.selectFirstWellInResults();
      cy.openInspectView();
      cy.openGeneralFeedbackModal('', false);
    });
  });

  describe('Admin User', () => {
    before(() => {
      cy.intercept({
        url: '**/user/roles',
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

      cy.visit(Cypress.env('BASE_URL'));
      cy.loginAsAdmin();
      cy.wait('@getUserRoles', { requestTimeout: 10000 });
      cy.acceptCookies();

      cy.log(
        'Check that we have the Admin Settings button and open Feedback page'
      );

      cy.findByTestId('top-bar')
        .contains('Admin Settings')
        .should('exist')
        .click();
      cy.contains('Feedback').should('be.visible').click();
    });

    it('can check reported feedback as Admin', () => {
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
});
