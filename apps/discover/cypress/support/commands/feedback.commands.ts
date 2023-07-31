import { FeedbackPostBody } from '@cognite/discover-api-types';

import { SIDECAR } from '../../../src/constants/app';
import { PROJECT } from '../../app.constants';

import { getTokenHeaders } from './helpers';

Cypress.Commands.add(
  'openGeneralFeedbackModal',
  (comment: string, createFeedback?: boolean) => {
    cy.findByRole('button', { name: 'Help' }).click();
    cy.findByRole('button', { name: 'Feedback' }).click();
    cy.findByRole('dialog').findByText('Feedback').should('be.visible');
    if (createFeedback) {
      cy.findByPlaceholderText('Feedback').type(comment);
      cy.findByRole('button', { name: 'Send' }).click();
    } else {
      cy.findByRole('button', { name: 'Cancel' }).should('be.visible').click();
    }
  }
);

Cypress.Commands.add(
  'deleteFeedback',
  (id: string, feedbackType: string): Cypress.Chainable => {
    return cy.request({
      method: 'DELETE',
      url: `${SIDECAR.discoverApiBaseUrl}/${PROJECT}/feedback/${feedbackType}/${id}`,
      headers: getTokenHeaders(true),
    });
  }
);

const createFeedback = (payload: FeedbackPostBody, type: string) => {
  cy.log(`Create ${type} feedback`);
  return cy.request({
    method: 'POST',
    url: `${SIDECAR.discoverApiBaseUrl}/${PROJECT}/feedback/${type}`,
    headers: getTokenHeaders(true),
    body: payload,
  });
};

const clickDocumentFeedbackButton = () => {
  cy.log('Open Document Feedback page by button');

  cy.findByRole('button', { name: 'Document Feedback' })
    .click()
    .should('have.class', 'cogs-btn-primary');
};

const clickGeneralFeedbackButton = () => {
  cy.log('Open General Feedback page by button');
  cy.findByRole('button', { name: 'General Feedback' })
    .click()
    .should('have.class', 'cogs-btn-primary');
};

const isTableEmptyStateVisible = (visible: boolean) => {
  cy.log('Check empty state of feedback table');
  cy.findByTestId('empty-state-container').should(
    visible ? 'exist' : 'not.exist'
  );
};

const clickViewArchivedButton = () => {
  cy.log('Click `View Archived` button');
  cy.findByTestId('view-archived')
    .scrollIntoView()
    .should('be.visible')
    .click();
};

const sortDataOnCreatedDate = () => {
  cy.log('Sort table on created date');
  cy.findAllByTestId('table-header-cell')
    .contains('Created on')
    .scrollIntoView()
    .click();
};

const getNthTableRow = (nth: number) => {
  return cy.findAllByTestId('table-row').eq(nth);
};

const clickNthRowArchiveFeedbackIcon = (nth: number) => {
  cy.log(`Click ${nth + 1} row archive icon`);
  cy.getNthTableRow(nth)
    .findByLabelText('Archive feedback')
    .should('be.visible')
    .click();
};

const clickNthRowCommentIcon = (nth: number) => {
  cy.log(`Click ${nth + 1} row comment icon`);
  cy.getNthTableRow(nth).findByLabelText('Comment').click();
};

const clickOnAssignedToLabelOnNthRow = (nth: number) => {
  cy.log(`Click ${nth + 1} row assigned to label`);
  cy.getNthTableRow(nth).scrollIntoView().findByLabelText('Unassigned').click();
};

const clickFeedbackUnassignButton = () => {
  cy.log('Click feedback unassign button');
  cy.findByTestId('unassign-feedback').should('be.visible').click();
};

const checkAssignedToLabelOnNthRow = (nth: number, label?: string) => {
  cy.log(`Check visibility of ${nth + 1} row assigned to label`);
  cy.getNthTableRow(nth)
    .scrollIntoView()
    .findByLabelText('Unassigned')
    .should('have.text', label || 'Unassigned');
};

const clickWarningModalCancelButton = () => {
  cy.log('Click `Cancel` button on warning modal');
  cy.findByTestId('warning-modal-cancel').should('be.visible').click();
};

const clickWarningModalUnassignButton = () => {
  cy.log('Click `Unassign` button on warning modal');
  cy.findByTestId('warning-modal-unassign').should('be.visible').click();
};

const clickCloseCommentSection = () => {
  cy.log('Click `Close` icon on comment section');
  cy.findByLabelText('Close').should('be.visible').click();
};

const clickNthRowRevertArchivedButton = (nth: number) => {
  cy.log(`Click revert archived button on ${nth + 1} row`);
  cy.getNthTableRow(nth).findByTestId('button-recover').click();
};

const checkNthRowStatus = (nth: number, label?: string) => {
  cy.log(`Check status of ${nth + 1} row`);
  cy.getNthTableRow(nth)
    .scrollIntoView()
    .findByLabelText('ChevronDown')
    .should('have.text', label || 'New');
};

const clickNthRowStatus = (nth: number) => {
  cy.log(`Click ${nth + 1} row status section`);
  cy.getNthTableRow(nth)
    .scrollIntoView()
    .findByLabelText('ChevronDown')
    .click();
};

Cypress.Commands.add('createFeedback', createFeedback);
Cypress.Commands.add(
  'clickDocumentFeedbackButton',
  clickDocumentFeedbackButton
);
Cypress.Commands.add('clickGeneralFeedbackButton', clickGeneralFeedbackButton);
Cypress.Commands.add('isTableEmptyStateVisible', isTableEmptyStateVisible);
Cypress.Commands.add('clickViewArchivedButton', clickViewArchivedButton);
Cypress.Commands.add('sortDataOnCreatedDate', sortDataOnCreatedDate);
Cypress.Commands.add('getNthTableRow', getNthTableRow);
Cypress.Commands.add(
  'clickNthRowArchiveFeedbackIcon',
  clickNthRowArchiveFeedbackIcon
);
Cypress.Commands.add('clickNthRowCommentIcon', clickNthRowCommentIcon);
Cypress.Commands.add(
  'clickOnAssignedToLabelOnNthRow',
  clickOnAssignedToLabelOnNthRow
);

Cypress.Commands.add(
  'clickFeedbackUnassignButton',
  clickFeedbackUnassignButton
);
Cypress.Commands.add(
  'checkAssignedToLabelOnNthRow',
  checkAssignedToLabelOnNthRow
);

Cypress.Commands.add(
  'clickWarningModalCancelButton',
  clickWarningModalCancelButton
);

Cypress.Commands.add(
  'clickWarningModalUnassignButton',
  clickWarningModalUnassignButton
);

Cypress.Commands.add('clickCloseCommentSection', clickCloseCommentSection);
Cypress.Commands.add(
  'clickNthRowRevertArchivedButton',
  clickNthRowRevertArchivedButton
);

Cypress.Commands.add('checkNthRowStatus', checkNthRowStatus);

Cypress.Commands.add('clickNthRowStatus', clickNthRowStatus);

export interface FeedbackCommands {
  openGeneralFeedbackModal(comment: string, createFeedback?: boolean): void;
  deleteFeedback(id: string, feedbackType: string): Cypress.Chainable;
  createFeedback(
    payload: FeedbackPostBody,
    type: string
  ): Cypress.Chainable<Cypress.Response<any>>;
  createGeneralFeedback(payload: FeedbackPostBody): void;
  clickDocumentFeedbackButton(): void;
  clickGeneralFeedbackButton(): void;
  isTableEmptyStateVisible(visible: boolean): void;
  clickViewArchivedButton(): void;
  sortDataOnCreatedDate(): void;
  getNthTableRow(nth: number): Cypress.Chainable<JQuery<HTMLElement>>;
  clickNthRowArchiveFeedbackIcon(nth: number): void;
  clickNthRowCommentIcon(nth: number): void;
  clickOnAssignedToLabelOnNthRow(nth: number): void;
  clickFeedbackUnassignButton(): void;
  checkAssignedToLabelOnNthRow(nth: number, label?: string): void;
  clickWarningModalCancelButton(): void;
  clickWarningModalUnassignButton(): void;
  clickCloseCommentSection(): void;
  clickNthRowRevertArchivedButton(nth: number): void;
  checkNthRowStatus(nth: number, label?: string): void;
  clickNthRowStatus(nth: number): void;
}
