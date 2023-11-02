// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    ensureCanvasFinishedLoading(): void;
    createNewCanvas(): void;
    renameCanvas(canvasName: string): void;
    deleteCanvas(): void;
    navigateToHomePage(): void;
    duplicateCanvas(): void;
    shareCanvas(): void;
    copyCanvas(): void;
    addResources(tabName: string, tabID: string): void;
  }
}

Cypress.Commands.add('ensureCanvasFinishedLoading', () => {
  cy.contains('Loading canvases').should('be.visible', { timeout: 20000 });
  cy.contains('Loading canvases').should('not.exist', { timeout: 40000 });
});

Cypress.Commands.add('createNewCanvas', () => {
  cy.getBySel('create-new-canvas-button').click({ timeout: 20000 });
});

Cypress.Commands.add('renameCanvas', (canvasName: string) => {
  cy.contains('h5 span', 'Untitled canvas', { timeout: 20000 }).click();
  cy.get('input[value="Untitled canvas"]', { timeout: 20000 })
    .click()
    .type('{selectall}')
    .type(canvasName);
  cy.get('[aria-label="Checkmark"]').click();
});

Cypress.Commands.add('deleteCanvas', () => {
  cy.get('button[aria-label="Delete canvas"]', { timeout: 20000 })
    .eq(0)
    .click();

  cy.get('.cogs-modal-footer-buttons')
    .should('exist')
    .within(() => {
      cy.contains('button', 'Delete').click({ force: true });
    });
});

Cypress.Commands.add('navigateToHomePage', () => {
  cy.get('[aria-label="Go to Industrial Canvas home page"]').click({
    force: true,
  });

  cy.get("[data-testid='homeHeader']", {
    timeout: 30000,
  }).should('exist');

  cy.get('[aria-label="Delete canvas"]', { timeout: 20000 }).should(
    'have.attr',
    'aria-disabled',
    'false'
  );
});

Cypress.Commands.add('duplicateCanvas', () => {
  cy.get('[aria-label="Duplicate canvas"]').eq(0).click();

  cy.contains('Untitled canvas (copy)', { timeout: 20000 }).should(
    'be.visible'
  );
});

Cypress.Commands.add('shareCanvas', () => {
  cy.get('[aria-label="Share canvas"]').eq(0).click();

  cy.contains('Make public', { timeout: 20000 }).click();

  cy.contains('Done').click();
});

Cypress.Commands.add('copyCanvas', () => {
  cy.get('[aria-label="Copy canvas link"]').eq(0).click();

  cy.contains('Canvas link copied').should('exist');
});

Cypress.Commands.add('addResources', (tabName: string, tabID: string) => {
  cy.contains('Add data').click();

  cy.contains('[role="tab"]', tabName).click();

  cy.get(`[id="${tabID}-resource-selector"]`)
    .should('exist')
    .within(() => {
      cy.get('input[type="checkbox"]', { timeout: 20000 })
        .eq(1)
        .check({ force: true });
    });

  cy.contains('Add to canvas').click();

  cy.contains('Resource(s) added to your canvas').should('exist');
});
