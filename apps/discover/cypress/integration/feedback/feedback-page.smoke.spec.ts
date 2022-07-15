import { FeedbackPostBody } from '@cognite/discover-api-types';

import { getDocumentFeedback } from '../../../src/domain/feedback/service/__fixtures/getDocumentFeedback';
import { getGeneralFeedback } from '../../../src/domain/feedback/service/__fixtures/getGeneralFeedback';
import {
  DISMISSED,
  INCORRECT_DOCUMENT_TYPE,
  INCORRECT_GEO_LABEL,
  IN_PROGRESS,
  NEW,
  OTHER,
  RESOLVED,
  UNASSIGN_WARNING,
} from '../../../src/pages/authorized/admin/feedback/constants';
import {
  GET_DOCUMENT_FEEDBACK_ALIAS,
  GET_GENERAL_FEEDBACK_ALIAS,
  interceptGetDocumentFeedback,
  interceptGetGeneralFeedback,
} from '../../support/interceptions/feedback';
import {
  GET_USER_ROLE_ALIAS,
  interceptGetUserRoles,
} from '../../support/interceptions/user';

describe.skip('Feedback', () => {
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

  describe.skip('Admin User Feedback', () => {
    beforeEach(() => {
      interceptGetUserRoles();
      interceptGetGeneralFeedback();
      interceptGetDocumentFeedback();

      cy.visit(Cypress.env('BASE_URL'));
      cy.loginAsAdmin();
      cy.wait(`@${GET_USER_ROLE_ALIAS}`, { requestTimeout: 20000 });
      cy.acceptCookies();

      cy.log(
        'Check that we have the Admin Settings button and open Feedback page'
      );

      cy.clickAdminSettings();
      cy.contains('Feedback').should('be.visible').click();
    });

    describe('Admin User Document Feedback', () => {
      const dateNow = new Date();
      const comment = `Feedback ${dateNow}`;

      before(() => {
        const payload: FeedbackPostBody = getDocumentFeedback({ comment });
        cy.createFeedback(payload, 'object');
      });

      it('can check reported feedback as Admin', () => {
        cy.log('Check that url changed to /admin/feedback/general');
        cy.url().should('contain', '/admin/feedback/general');

        cy.log(
          'Check that General Feedback button is active and Document Feedback inactive'
        );
        cy.findByRole('button', { name: 'General Feedback' }).should(
          'be.visible'
        );
        cy.findByRole('button', { name: 'Document Feedback' }).should(
          'be.visible'
        );

        cy.log(
          'Wait for results and check that empty-state-container is not there'
        );

        cy.wait(`@${GET_GENERAL_FEEDBACK_ALIAS}`);
        cy.isTableEmptyStateVisible(false);

        // DOCUMENT FEEDBACK
        cy.clickDocumentFeedbackButton();
        cy.findByRole('button', { name: 'General Feedback' }).should(
          'be.visible'
        );

        cy.log(
          'The loading icon should be visible in the beginning and disappear when we get back the data'
        );
        cy.findByTestId('empty-state-container')
          .contains('Loading results')
          .should('be.visible');
        cy.wait(`@${GET_DOCUMENT_FEEDBACK_ALIAS}`);
        cy.findByTestId('empty-state-container').should('not.exist');
      });

      it('Should render all details in document feedback table', () => {
        cy.clickDocumentFeedbackButton();
        cy.isTableEmptyStateVisible(false);
        cy.sortDataOnCreatedDate();

        cy.getNthTableRow(0)
          .as('firstRow')
          .findByTitle(comment)
          .should('be.visible');

        cy.get('@firstRow').contains(INCORRECT_DOCUMENT_TYPE);
        cy.get('@firstRow').contains(INCORRECT_GEO_LABEL);
        cy.get('@firstRow').contains(OTHER);
        cy.get('@firstRow').findByLabelText('Unassigned').should('be.visible');
        cy.clickGeneralFeedbackButton();
      });

      it('Archive feedback', () => {
        cy.clickDocumentFeedbackButton();
        cy.isTableEmptyStateVisible(false);
        cy.sortDataOnCreatedDate();

        cy.clickNthRowArchiveFeedbackIcon(0);

        cy.contains(comment).should('not.exist');
        cy.clickViewArchivedButton();

        cy.sortDataOnCreatedDate();
        cy.contains(comment).should('be.visible');

        cy.clickNthRowRevertArchivedButton(0);

        cy.contains(comment).should('not.exist');
        cy.clickViewArchivedButton();
        cy.sortDataOnCreatedDate();
        cy.contains(comment).should('be.visible');
      });

      it('Document feedback comment section', () => {
        cy.clickDocumentFeedbackButton();
        cy.isTableEmptyStateVisible(false);
        cy.sortDataOnCreatedDate();
        cy.clickNthRowCommentIcon(0);
        cy.findByTestId('comments-root').should('be.visible');
        cy.clickCloseCommentSection();
      });

      it('Admin user assignment', () => {
        cy.clickDocumentFeedbackButton();
        cy.isTableEmptyStateVisible(false);
        cy.sortDataOnCreatedDate();

        cy.checkAssignedToLabelOnNthRow(0);
        cy.clickOnAssignedToLabelOnNthRow(0);

        cy.contains('Assign to').click();
        cy.get('.cogs-menu-item')
          .eq(1)
          .then((element: JQuery<HTMLElement>) => {
            const userName = element[0].innerText;
            console.log('element', element[0].innerText);
            cy.get('.cogs-menu-item').eq(1).click();
            cy.wait(`@${GET_DOCUMENT_FEEDBACK_ALIAS}`);
            cy.contains(comment);

            cy.checkAssignedToLabelOnNthRow(0, userName);
            cy.clickOnAssignedToLabelOnNthRow(0);
          });

        cy.clickFeedbackUnassignButton();
        cy.contains(UNASSIGN_WARNING).should('be.visible');
        cy.clickWarningModalCancelButton();
        cy.clickOnAssignedToLabelOnNthRow(0);

        cy.clickFeedbackUnassignButton();
        cy.clickWarningModalUnassignButton();
        cy.wait(`@${GET_DOCUMENT_FEEDBACK_ALIAS}`);
        cy.checkAssignedToLabelOnNthRow(0);
      });

      it('Status assignment', () => {
        cy.clickDocumentFeedbackButton();
        cy.isTableEmptyStateVisible(false);
        cy.sortDataOnCreatedDate();

        cy.checkNthRowStatus(0);
        cy.clickNthRowStatus(0);

        cy.get('.cogs-menu').contains(NEW).should('be.disabled');
        cy.get('.cogs-menu').contains(IN_PROGRESS).should('be.enabled');
        cy.get('.cogs-menu').contains(RESOLVED).should('be.enabled');
        cy.get('.cogs-menu').contains(DISMISSED).should('be.enabled').click();

        cy.wait(`@${GET_DOCUMENT_FEEDBACK_ALIAS}`);

        cy.checkNthRowStatus(0, DISMISSED);
      });
    });

    describe('Admin User General Feedback', () => {
      const dateNow = new Date();
      const comment = `Feedback ${dateNow}`;

      before(() => {
        const payload = getGeneralFeedback({
          comment,
          user: Cypress.env('REACT_APP_E2E_USER'),
        });
        cy.createFeedback(payload, 'general');
      });

      it('Should render all details in general feedback table', () => {
        cy.log('test');
        cy.isTableEmptyStateVisible(false);
        cy.sortDataOnCreatedDate();

        cy.getNthTableRow(0)
          .as('firstRow')
          .findByTitle(comment)
          .should('be.visible');

        cy.get('@firstRow').findByLabelText('Unassigned').should('be.visible');
      });

      it('Archive general feedback', () => {
        cy.isTableEmptyStateVisible(false);
        cy.sortDataOnCreatedDate();

        cy.clickNthRowArchiveFeedbackIcon(0);

        cy.contains(comment).should('not.exist');
        cy.clickViewArchivedButton();

        cy.sortDataOnCreatedDate();
        cy.contains(comment).should('be.visible');

        cy.clickNthRowRevertArchivedButton(0);

        cy.contains(comment).should('not.exist');
        cy.clickViewArchivedButton();
        cy.sortDataOnCreatedDate();
        cy.contains(comment).should('be.visible');
      });

      it('General feedback comment section', () => {
        cy.isTableEmptyStateVisible(false);
        cy.sortDataOnCreatedDate();
        cy.clickNthRowCommentIcon(0);
        cy.findByTestId('comments-root').should('be.visible');
        cy.clickCloseCommentSection();
      });

      it('Admin user assignment', () => {
        cy.isTableEmptyStateVisible(false);
        cy.sortDataOnCreatedDate();

        cy.checkAssignedToLabelOnNthRow(0);
        cy.clickOnAssignedToLabelOnNthRow(0);

        cy.contains('Assign to').click();
        cy.get('.cogs-menu-item')
          .eq(1)
          .then((element: JQuery<HTMLElement>) => {
            const userName = element[0].innerText;
            console.log('element', element[0].innerText);
            cy.get('.cogs-menu-item').eq(1).click();
            cy.wait(`@${GET_GENERAL_FEEDBACK_ALIAS}`);
            cy.contains(comment);

            cy.checkAssignedToLabelOnNthRow(0, userName);
            cy.clickOnAssignedToLabelOnNthRow(0);
          });

        cy.clickFeedbackUnassignButton();
        cy.contains(UNASSIGN_WARNING).should('be.visible');
        cy.clickWarningModalCancelButton();
        cy.clickOnAssignedToLabelOnNthRow(0);

        cy.clickFeedbackUnassignButton();
        cy.clickWarningModalUnassignButton();
        cy.wait(`@${GET_GENERAL_FEEDBACK_ALIAS}`);
        cy.checkAssignedToLabelOnNthRow(0);
      });

      it('Status assignment', () => {
        cy.isTableEmptyStateVisible(false);
        cy.sortDataOnCreatedDate();

        cy.checkNthRowStatus(0);
        cy.clickNthRowStatus(0);

        cy.get('.cogs-menu').contains(NEW).should('be.disabled');
        cy.get('.cogs-menu').contains(IN_PROGRESS).should('be.enabled');
        cy.get('.cogs-menu').contains(RESOLVED).should('be.enabled');
        cy.get('.cogs-menu').contains(DISMISSED).should('be.enabled').click();

        cy.wait(`@${GET_GENERAL_FEEDBACK_ALIAS}`);

        cy.checkNthRowStatus(0, DISMISSED);
      });
    });
  });
});
