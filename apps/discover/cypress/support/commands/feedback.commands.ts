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

export interface FeedbackCommands {
  openGeneralFeedbackModal(comment: string, createFeedback?: boolean): void;
  deleteFeedback(id: string, feedbackType: string): Cypress.Chainable;
}
