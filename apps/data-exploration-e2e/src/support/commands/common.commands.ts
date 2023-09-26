const containsExact = (
  subject: JQuery<HTMLElement>,
  content: string | number
) => {
  return cy.wrap(subject).contains(new RegExp(`^${content}$`));
};

const getDataTestId = (subject: JQuery<HTMLElement>) => {
  return cy.wrap(subject).invoke('attr', 'data-testid');
};

Cypress.Commands.add(
  'containsExact',
  { prevSubject: 'optional' },
  containsExact
);
Cypress.Commands.add('getDataTestId', { prevSubject: true }, getDataTestId);

export interface CommonCommands {
  containsExact: (
    content: string | number
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  getDataTestId: () => Cypress.Chainable<string>;
}
