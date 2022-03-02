// This type is copied; need to resolve tsconfig, somehow.
export type WellInspectTabs =
  | 'Overview'
  | 'Trajectories'
  | 'NDS Events'
  | 'NPT Events'
  | 'Casings'
  | 'Well Logs'
  | 'Related Documents'
  | 'Digital Rocks'
  | 'Geomechanics & PPFG'
  | '3D';

Cypress.Commands.add('goToWellsTab', (tab: WellInspectTabs) => {
  cy.log(`Go to wells ${tab} tab`);
  cy.findByTestId('well-inspect-navigation-tabs')
    .findByRole('tab', { name: tab })
    .should('be.visible')
    .click();

  // Disable for now, cypress tsconfig can't resolve external packages :(
  // const { path } = TAB_ITEMS.find((item) => item.name === tab);
  // cy.log('Check that the url matches the correct well inspect tab');
  // cy.url().should('contain', path);
});

Cypress.Commands.add('openInspectView', () => {
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

export interface WellsCommands {
  goToWellsTab(tab: any): void;
  openInspectView(): void;
  clearWellsSelection(): void;
}
