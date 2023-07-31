/*
 * ALIASES
 */
export const GET_GENERAL_FEEDBACK_ALIAS = 'getGeneralFeedback';
export const GET_DOCUMENT_FEEDBACK_ALIAS = 'getDocumentFeedback';

export const interceptGetGeneralFeedback = () => {
  cy.intercept({
    url: '*/feedback/general',
    method: 'GET',
  }).as(GET_GENERAL_FEEDBACK_ALIAS);
};

export const interceptGetDocumentFeedback = () => {
  cy.intercept({
    url: '*/feedback/object',
    method: 'GET',
  }).as(GET_DOCUMENT_FEEDBACK_ALIAS);
};
