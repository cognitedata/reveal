const getButton = (value: string, attribute?: string) => {
  if (attribute) {
    return cy.get(`[${attribute}="${value}"]`);
  }
  return cy.contains(value);
};

const clickButton = (value: string, attribute?: string) => {
  cy.getButton(value, attribute).should('be.visible').click({ force: true });
};

Cypress.Commands.add('getButton', getButton);
Cypress.Commands.add('clickButton', clickButton);

export interface ButtonCommands {
  getButton(
    value: string,
    attribute?: string
  ): Cypress.Chainable<JQuery<HTMLElement>>;
  clickButton(value: string, attribute?: string): void;
}
