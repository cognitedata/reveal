Cypress.Commands.add('assertStepTitle', (title: string) => {
  cy.assertElementWithTextExists('step-title', title);
});

Cypress.Commands.add('nextStep', () => {
  cy.assertElementWithTextExists('next-button', 'Next step')
    .click()
    .waitForPageToLoad();
});

Cypress.Commands.add('selectItem', (selectTestID, option) => {
  cy.getBySelector(selectTestID).click();
  cy.get('.cogs-select__menu') // TODO: don't use cogs class
    .children()
    .contains(option)
    .parent()
    .click()
    .waitForPageToLoad();
});

Cypress.Commands.add('selectDataset', (dataset: string) => {
  cy.selectItem('data-set-select', dataset);
});

Cypress.Commands.add('selectLabel', (label: string) => {
  cy.getBySelector('more-filters-button').click();
  cy.selectItem('label-select', label);
});

Cypress.Commands.add('selectAllEntities', (tableTestId: string) => {
  cy.getBySelector(tableTestId).click();
});

Cypress.Commands.add('clickStepsListItem', (stepTitle: string) => {
  cy.assertElementWithTextExists(
    'create-interactive-diagrams-step-title',
    stepTitle
  ).click();
});

Cypress.Commands.add('clickStepsListSubItem', (stepTitle: string) => {
  cy.assertElementWithTextExists(
    'create-interactive-diagrams-sub-step-title',
    stepTitle
  ).click();
});

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CreateFlowCommands {
  assertStepTitle: (title: string) => void;
  nextStep: () => void;
  selectItem: (selectTestID: string, option: string) => void;
  selectDataset: (dataset: string) => void;
  selectLabel: (label: string) => void;
  selectAllEntities: (tableTestId: string) => void;
  clickStepsListItem: (stepTitle: string) => void;
  clickStepsListSubItem: (stepTitle: string) => void;
}
