const getButton = (value: string, attribute?: string) => {
  if (attribute) {
    return cy.get(`[${attribute}="${value}"]`);
  }
  return cy.contains(value);
};

const isButtonVisible = (value: string, attribute?: string) => {
  cy.getButton(value, attribute).should('be.visible');
};

const isButtonNotVisible = (value: string, attribute?: string) => {
  cy.getButton(value, attribute).should('not.be.visible');
};

const isButtonEnabled = (value: string, attribute?: string) => {
  cy.getButton(value, attribute).should('not.be.disabled');
};

const isButtonDisabled = (value: string, attribute?: string) => {
  cy.getButton(value, attribute).should('be.disabled');
};

const clickButton = (value: string, attribute?: string) => {
  cy.getButton(value, attribute).should('be.visible').click({ force: true });
};

Cypress.Commands.add('getButton', getButton);
Cypress.Commands.add('isButtonVisible', isButtonVisible);
Cypress.Commands.add('isButtonNotVisible', isButtonNotVisible);
Cypress.Commands.add('isButtonEnabled', isButtonEnabled);
Cypress.Commands.add('isButtonDisabled', isButtonDisabled);
Cypress.Commands.add('clickButton', clickButton);

export interface ButtonCommands {
  getButton(
    value: string,
    attribute?: string
  ): Cypress.Chainable<JQuery<HTMLElement>>;
  isButtonVisible(value: string, attribute?: string): void;
  isButtonNotVisible(value: string, attribute?: string): void;
  isButtonEnabled(value: string, attribute?: string): void;
  isButtonDisabled(value: string, attribute?: string): void;
  clickButton(value: string, attribute?: string): void;
}
