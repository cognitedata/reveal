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

export interface FeedbackCommands {
  openGeneralFeedbackModal(comment: string, createFeedback?: boolean): void;
}
