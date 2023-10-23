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

Cypress.Commands.add('containsExact', { prevSubject: true }, containsExact);
Cypress.Commands.add('goBack', goBack);
Cypress.Commands.add('hover', { prevSubject: true }, hover);

export interface CommonCommands {
  containsExact: (
    content: string | number
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  goBack: () => Cypress.Chainable<Cypress.AUTWindow>;
  hover: () => Cypress.Chainable<JQuery<HTMLElement>>;
}
