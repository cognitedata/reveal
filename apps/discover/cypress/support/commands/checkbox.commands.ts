const findCheckbox = (searchFor: string, contains: string) => {
  cy.log(`Finding checkbox containing : ${contains} `);
  return cy
    .findAllByTestId(searchFor)
    .contains(contains)
    .should('be.visible')
    .click({ force: true });
};

const clickCheckbox = ($subject?) => {
  cy.wrap($subject)
    //.parentsUntil('[class*="JoyCheckbox"]')
    .click({ force: true });
};

const getCheckboxLabel = ($subject?) => {
  return cy.wrap($subject).parent().parent().parent().invoke('text');
};

Cypress.Commands.add('findCheckbox', findCheckbox);
Cypress.Commands.add('clickCheckbox', { prevSubject: true }, clickCheckbox);
Cypress.Commands.add(
  'getCheckboxLabel',
  { prevSubject: true },
  getCheckboxLabel
);

export interface CheckboxCommands {
  findCheckbox(
    value: string,
    contains: string
  ): Cypress.Chainable<JQuery<HTMLElement>>;
  clickCheckbox($subject?): void;
  getCheckboxLabel($subject?): Cypress.Chainable<string>;
}
