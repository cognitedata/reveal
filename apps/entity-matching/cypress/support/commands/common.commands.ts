/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

const { targetAppPackageName } = require('../../config');
const { getUrl } = require('../../utils/getUrl');

Cypress.Commands.add('getBySelector', (selector, ...args) => {
  return cy.get(`[data-testid  =${selector}]`, ...args);
});

Cypress.Commands.add('assertElementWithTextExists', (selector, text) => {
  return cy.getBySelector(selector).should('exist').contains(text);
});

Cypress.Commands.add('visitAndLoadPage', () => {
  cy.visit(getUrl());
  cy.ensureSpaAppIsLoaded(targetAppPackageName);
  cy.ensurePageFinishedLoading();
});

Cypress.Commands.add('selectItem', (selectTestID, option) => {
  cy.getBySelector(selectTestID).click();
  cy.getBySelector(`${selectTestID}-option`).contains(option).click();
});

Cypress.Commands.add('searchAndSelectOption', (testID, option) => {
  cy.getBySelector(testID).type(option).type('{enter}');
});

Cypress.Commands.add('selectAllResults', () => {
  // ToDo: don't use ant classes
  cy.get(
    '.ant-table-selection > .ant-checkbox-wrapper > .ant-checkbox > .ant-checkbox-input'
  ).check();
});

Cypress.Commands.add('navigateToNextStep', () => {
  cy.assertElementWithTextExists('next-button', 'Next step').click();
});

Cypress.Commands.add('waitForPipelineRunCompletion', (stepTestID: string) => {
  const timeoutInMs = 30000;
  cy.getBySelector(stepTestID, { timeout: timeoutInMs }).should('not.exist');
});

Cypress.Commands.add('checkSecondColumnContent', (rowIndex, expectedText) => {
  cy.get('tbody tr')
    .eq(rowIndex)
    .find('td')
    .eq(1)
    .invoke('text')
    .should((text) => {
      expect(text).to.include(expectedText);
    });
});

Cypress.Commands.add('checkSecondColumnContentInRows', (contentArray) => {
  contentArray.forEach((content, rowIndex) => {
    cy.checkSecondColumnContent(rowIndex, content);
  });
});

Cypress.Commands.add('checkTableContent', (tableTestId, contentArray) => {
  cy.getBySelector(tableTestId).within(() => {
    // Check the count of items in the table
    cy.get('tbody tr').should('have.length', contentArray.length);

    // Check the content of specific cells
    cy.checkSecondColumnContentInRows(contentArray);
  });
});

export interface CommonCommands {
  getBySelector<E extends Node = HTMLElement>(
    selector: string,
    options?: Partial<
      Cypress.Loggable &
        Cypress.Timeoutable &
        Cypress.Withinable &
        Cypress.Shadow
    >
  ): Cypress.Chainable<JQuery<E>>;
  assertElementWithTextExists<E extends HTMLElement>(
    selector: string,
    text: string
  ): Cypress.Chainable<JQuery<E>>;
  visitAndLoadPage(): Cypress.Chainable<any>;
  selectItem: (selectTestID: string, option: string) => void;
  searchAndSelectOption: (testID: string, option: string) => void;
  selectAllResults(): Cypress.Chainable<any>;
  navigateToNextStep(): Cypress.Chainable<any>;
  waitForPipelineRunCompletion(stepTestID: string): Cypress.Chainable<any>;
  checkSecondColumnContent(
    rowIndex: number,
    expectedText: string
  ): Cypress.Chainable<any>;
  checkSecondColumnContentInRows(
    contentArray: string[]
  ): Cypress.Chainable<any>;
  checkTableContent(
    tableTestId: string,
    contentArray: string[]
  ): Cypress.Chainable<any>;
}
