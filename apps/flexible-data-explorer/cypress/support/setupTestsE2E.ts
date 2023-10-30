before(() => {
  cy.navigateToApp();
  cy.skipOnboardingGuide();
  cy.setupDataModelSelection();
  cy.resetAISearchCache();
});
