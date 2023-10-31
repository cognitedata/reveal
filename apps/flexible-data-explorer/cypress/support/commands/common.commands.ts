const containsExact = (
  subject: JQuery<HTMLElement>,
  content: string | number
) => {
  return cy.wrap(subject).contains(new RegExp(`^${content}$`));
};

const goBack = () => {
  return cy.go('back');
};

const hover = (subject: JQuery<HTMLElement>) => {
  return cy.wrap(subject).trigger('mouseover');
};

const pressKeyTab = (subject: JQuery<HTMLElement>) => {
  const keyCode = 9;

  cy.wrap(subject).trigger('keydown', { keyCode });
  cy.wrap(subject).trigger('keyup', { keyCode });

  return cy.wrap(subject);
};

Cypress.Commands.add(
  'containsExact',
  { prevSubject: 'optional' },
  containsExact
);
Cypress.Commands.add('goBack', goBack);
Cypress.Commands.add('hover', { prevSubject: true }, hover);
Cypress.Commands.add('pressKeyTab', { prevSubject: 'optional' }, pressKeyTab);

export interface CommonCommands {
  containsExact: (
    content: string | number
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  goBack: () => Cypress.Chainable<Cypress.AUTWindow>;
  hover: () => Cypress.Chainable<JQuery<HTMLElement>>;
  pressKeyTab: () => Cypress.Chainable<JQuery<HTMLElement>>;
}
