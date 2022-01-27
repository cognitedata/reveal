type WellsTab = 'Related Documents';

Cypress.Commands.add('goToWellsTab', (tab: WellsTab) => {
  cy.log(`Go to wells ${tab} tab`);
  cy.findByRole('tab', { name: tab }).should('be.visible').click();
});

export interface WellsCommands {
  goToWellsTab(tab: WellsTab): void;
}
