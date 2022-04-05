import {
  WellInspectTabs,
  TAB_NAMES,
} from '../../../src/pages/authorized/search/well/inspect/constants';

Cypress.Commands.add('goToWellsInspectTab', (tab: WellInspectTabs) => {
  cy.log(`Go to wells ${tab} tab`);

  if (tab === TAB_NAMES.THREE_DEE) {
    cy.findByLabelText(TAB_NAMES.THREE_DEE).should('be.visible').click();
    return;
  }

  cy.findByTestId('well-inspect-navigation-tabs')
    .findByRole('tab', { name: tab })
    .should('be.visible')
    .click();

  // Disable for now, cypress tsconfig can't resolve external packages :(
  // const { path } = TAB_ITEMS.find((item) => item.name === tab);
  // cy.log('Check that the url matches the correct well inspect tab');
  // cy.url().should('contain', path);
});

Cypress.Commands.add('openInspectView', (selectedWells?: number) => {
  if (selectedWells > 0) {
    cy.log(
      'Check that we see table bulk actions with correct number of selected wells'
    );
    cy.findByTestId('table-bulk-actions')
      .should('be.visible')
      .contains(
        `${selectedWells} well${selectedWells > 1 ? 's' : ''} selected`
      );
  }
  cy.log('Open inspect view');
  cy.findByTestId('table-bulk-actions')
    .findByRole('button', { name: 'View' })
    .should('exist')
    .click();
});

Cypress.Commands.add('clearWellsSelection', () => {
  cy.log('Closing wells table bulk actions');
  cy.findByTestId('table-bulk-actions').should('be.visible');
  cy.findByTestId('wells-bulk-action-close').click();
  cy.findByTestId('table-bulk-actions').should('not.be.visible');
});

Cypress.Commands.add('selectFirstWellInResults', () => {
  cy.log('Select first well in result list');
  // First row
  cy.findByTestId('well-result-table')
    .findAllByTestId('table-row')
    .first()
    .children()
    .first()
    .click();
});

Cypress.Commands.add(
  'checkWellsBulkSelectionCount',
  (wellCount: number, wellboresCount?: number) => {
    cy.log('Check bulk actions selection count');
    cy.findByText(`${wellCount} ${wellCount > 1 ? 'wells' : 'well'} selected`);

    if (wellboresCount) {
      cy.findByText(
        `With ${wellboresCount} ${
          wellboresCount > 1 ? 'wellbores' : 'wellbore'
        } inside`
      );
    }
  }
);

export interface WellsCommands {
  goToWellsInspectTab(tab: any): void;
  openInspectView(selectedWells?: number): void;
  clearWellsSelection(): void;
  selectFirstWellInResults(): void;
  checkWellsBulkSelectionCount(
    wellCount: number,
    wellboresCount?: number
  ): void;
}
