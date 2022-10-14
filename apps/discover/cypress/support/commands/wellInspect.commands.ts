import {
  WellInspectViewModes,
  WellInspectTabs,
} from '../../../src/pages/authorized/search/well/inspect/constants';

Cypress.Commands.add(
  'switchToInspectViewMode',
  (viewMode: WellInspectViewModes) => {
    cy.log(`Switch to ${viewMode} view`);
    cy.findByTestId('multi-state-toggle').contains(viewMode).click();
  }
);

Cypress.Commands.add('goBackToInspectTab', (tab: WellInspectTabs) => {
  cy.log(`go back to ${tab} tab`);
  cy.findAllByTestId('go-back-button').click({ force: true });
  cy.verifyInspectTabSelection(tab);
});

export interface WellInspectCommands {
  switchToInspectViewMode(viewMode: WellInspectViewModes): void;
  goBackToInspectTab(tab: WellInspectTabs): void;
}
