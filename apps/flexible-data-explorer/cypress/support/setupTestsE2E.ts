before(() => {
  cy.navigateToApp();
  cy.skipOnboardingGuide();
  cy.setupDataModelSelection();
});
