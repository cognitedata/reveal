const getButton = (
  subject: JQuery<HTMLElement>,
  value: string,
  attribute?: string
) => {
  if (!attribute) {
    return cy.wrap(subject).contains(value);
  }

  const selector = `[${attribute}="${value}"]`;

  if (subject) {
    return cy.wrap(subject).find(selector).first();
  }

  return cy.get(selector).first();
};

const clickButton = (
  subject: JQuery<HTMLElement>,
  value: string,
  attribute?: string
) => {
  cy.wrap(subject).getButton(value, attribute).should('be.visible').click();
};

const clickIconButton = (subject: JQuery<HTMLElement>, ariaLabel: string) => {
  cy.wrap(subject).clickButton(ariaLabel, 'aria-label');
};

Cypress.Commands.add('getButton', { prevSubject: 'optional' }, getButton);
Cypress.Commands.add('clickButton', { prevSubject: 'optional' }, clickButton);
Cypress.Commands.add(
  'clickIconButton',
  { prevSubject: 'optional' },
  clickIconButton
);

export interface ButtonCommands {
  getButton(
    value: string,
    attribute?: string
  ): Cypress.Chainable<JQuery<HTMLElement>>;
  clickButton(value: string, attribute?: string): void;
  clickIconButton: (ariaLabel: string) => void;
}
