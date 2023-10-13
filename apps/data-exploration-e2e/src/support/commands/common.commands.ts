const containsExact = (
  subject: JQuery<HTMLElement>,
  content: string | number
) => {
  return cy.wrap(subject).contains(new RegExp(`^${content}$`));
};

const getDataTestId = (subject: JQuery<HTMLElement>) => {
  return cy.wrap(subject).invoke('attr', 'data-testid');
};

const goBack = () => {
  return cy.go('back');
};

const hover = (subject: JQuery<HTMLElement>) => {
  return cy.wrap(subject).trigger('mouseover');
};

Cypress.Commands.add(
  'containsExact',
  { prevSubject: 'optional' },
  containsExact
);
Cypress.Commands.add('getDataTestId', { prevSubject: true }, getDataTestId);
Cypress.Commands.add('goBack', goBack);
Cypress.Commands.add('hover', { prevSubject: true }, hover);

export interface CommonCommands {
  containsExact: (
    content: string | number
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  getDataTestId: () => Cypress.Chainable<string>;
  goBack: () => Cypress.Chainable<Cypress.AUTWindow>;
  hover: () => Cypress.Chainable<JQuery<HTMLElement>>;
}
