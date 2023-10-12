const getFilter = (filterLabel: string) => {
  return cy.findByTestId(`filter-${filterLabel}`);
};

const clickSelectFilter = (filterLabel: string) => {
  cy.log(`Click filter: ${filterLabel}`);
  return cy
    .getFilter(filterLabel)
    .findByTestId(`select-${filterLabel}`)
    .click();
};

const clickSelectOption = (filter: JQuery<HTMLElement>, option: string) => {
  cy.wrap(filter)
    .getDataTestId()
    .then((filterDataTestId) => {
      cy.log(`Click filter option: ${option}`);
      cy.findByTestId(`${filterDataTestId}-menu-list`)
        .contains(option, { matchCase: false })
        .should('be.visible')
        .click();
    });

  return cy.wrap(filter);
};

const searchAndClickSelectOption = (
  filter: JQuery<HTMLElement>,
  option: string
) => {
  cy.wrap(filter)
    .getDataTestId()
    .then((filterDataTestId) => {
      cy.log(`Search filter option: "${option}"`);
      cy.findByTestId(`${filterDataTestId}-search-input`).type(option);
    });

  return cy.wrap(filter).clickSelectOption(option);
};

const clickBooleanOption = (filter: JQuery<HTMLElement>, option: string) => {
  cy.log(`Click option: ${option}`);
  cy.wrap(filter).contains(option).click();

  return cy.wrap(filter);
};

Cypress.Commands.add('getFilter', getFilter);
Cypress.Commands.add('clickSelectFilter', clickSelectFilter);
Cypress.Commands.add(
  'clickSelectOption',
  { prevSubject: true },
  clickSelectOption
);
Cypress.Commands.add(
  'searchAndClickSelectOption',
  { prevSubject: true },
  searchAndClickSelectOption
);
Cypress.Commands.add(
  'clickBooleanOption',
  { prevSubject: true },
  clickBooleanOption
);

export interface FilterCommands {
  getFilter: (filterLabel: string) => Cypress.Chainable<JQuery<HTMLElement>>;
  clickSelectFilter: (
    filterLabel: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  clickSelectOption: (option: string) => Cypress.Chainable<JQuery<HTMLElement>>;
  searchAndClickSelectOption: (
    option: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  clickBooleanOption: (
    option: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
}
