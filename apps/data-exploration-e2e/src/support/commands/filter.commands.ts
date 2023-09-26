const getFilter = (filterLabel: string) => {
  return cy.findByTestId(`filter-${filterLabel}`);
};

const clickFilter = (filterLabel: string) => {
  cy.log(`Click filter: ${filterLabel}`);
  return cy.getFilter(filterLabel).should('be.visible').click();
};

const searchAndClickOption = (filter: JQuery<HTMLElement>, option: string) => {
  cy.wrap(filter)
    .getDataTestId()
    .then((filterDataTestId) => {
      const filterLabel = filterDataTestId.replace('filter-', '');

      cy.log(`Search filter option "${option}" in "${filterLabel}" filter`);
      cy.findByTestId(`filter-${filterLabel}-search-input`).type(option);

      cy.log(`Click filter option: ${option}`);
      cy.findByTestId(`filter-${filterLabel}-menu-list`)
        .contains(option, { matchCase: false })
        .should('be.visible')
        .click();
    });

  return cy.wrap(filter);
};

Cypress.Commands.add('getFilter', getFilter);
Cypress.Commands.add('clickFilter', clickFilter);
Cypress.Commands.add(
  'searchAndClickOption',
  { prevSubject: true },
  searchAndClickOption
);

export interface FilterCommands {
  getFilter: (filterLabel: string) => Cypress.Chainable<JQuery<HTMLElement>>;
  clickFilter: (filterLabel: string) => Cypress.Chainable<JQuery<HTMLElement>>;
  searchAndClickOption: (
    option: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
}
