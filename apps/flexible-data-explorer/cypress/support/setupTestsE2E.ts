before(() => {
  cy.navigateToApp();
  cy.skipOnboardingGuide();
  cy.resetAISearchCache();
});
