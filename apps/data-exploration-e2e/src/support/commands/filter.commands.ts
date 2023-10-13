type SelectMenuSelectorConfig = {
  subMenu?: boolean;
};

const getFilter = (filterLabel: string) => {
  return cy.findByTestId(`filter-${filterLabel}`);
};

const getSelectFilter = (subject: JQuery<HTMLElement>, filterLabel: string) => {
  return cy.wrap(subject).findByTestId(`select-${filterLabel}`);
};

const clickSelectFilter = (filterLabel: string) => {
  cy.log(`Click filter: ${filterLabel}`);
  return cy.getFilter(filterLabel).getSelectFilter(filterLabel).click();
};

const getSelectMenu = (
  filter: JQuery<HTMLElement>,
  config: SelectMenuSelectorConfig = {}
) => {
  const { subMenu } = config;

  return cy
    .wrap(filter)
    .getDataTestId()
    .then((filterDataTestId) => {
      const menuDataTestId = subMenu
        ? `${filterDataTestId}-menu-list-child`
        : `${filterDataTestId}-menu-list`;

      return cy.findByTestId(menuDataTestId);
    });
};

const searchOption = (
  filter: JQuery<HTMLElement>,
  option: string,
  config?: SelectMenuSelectorConfig
) => {
  cy.log(`Search filter option: "${option}"`);
  cy.wrap(filter)
    .getSelectMenu(config)
    .findByTestId('search-input')
    .type(option);

  return cy.wrap(filter);
};

const getSelectOption = (
  filter: JQuery<HTMLElement>,
  option: string,
  config?: SelectMenuSelectorConfig
) => {
  return cy
    .wrap(filter)
    .getSelectMenu(config)
    .contains(option, { matchCase: false })
    .should('be.visible');
};

const hoverSelectOption = (
  filter: JQuery<HTMLElement>,
  option: string,
  config?: SelectMenuSelectorConfig
) => {
  cy.log(`Hover filter option: ${option}`);
  cy.wrap(filter).getSelectOption(option, config).hover();

  return cy.wrap(filter);
};

const clickSelectOption = (
  filter: JQuery<HTMLElement>,
  option: string,
  config?: SelectMenuSelectorConfig
) => {
  cy.log(`Click filter option: ${option}`);
  cy.wrap(filter).getSelectOption(option, config).click();

  return cy.wrap(filter);
};

const searchAndClickSelectOption = (
  filter: JQuery<HTMLElement>,
  option: string,
  config?: SelectMenuSelectorConfig
) => {
  return cy
    .wrap(filter)
    .searchOption(option, config)
    .clickSelectOption(option, config);
};

const clickBooleanOption = (filter: JQuery<HTMLElement>, option: string) => {
  cy.log(`Click option: ${option}`);
  cy.wrap(filter).contains(option).click();

  return cy.wrap(filter);
};

Cypress.Commands.add('getFilter', getFilter);
Cypress.Commands.add(
  'getSelectFilter',
  { prevSubject: 'optional' },
  getSelectFilter
);
Cypress.Commands.add('clickSelectFilter', clickSelectFilter);
Cypress.Commands.add('getSelectMenu', { prevSubject: true }, getSelectMenu);
Cypress.Commands.add('searchOption', { prevSubject: true }, searchOption);
Cypress.Commands.add('getSelectOption', { prevSubject: true }, getSelectOption);
Cypress.Commands.add(
  'hoverSelectOption',
  { prevSubject: true },
  hoverSelectOption
);
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
  getSelectFilter: (
    filterLabel: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  clickSelectFilter: (
    filterLabel: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  getSelectMenu: (
    config?: SelectMenuSelectorConfig
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  searchOption: (
    option: string,
    config?: SelectMenuSelectorConfig
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  getSelectOption: (
    option: string,
    config?: SelectMenuSelectorConfig
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  hoverSelectOption: (
    option: string,
    config?: SelectMenuSelectorConfig
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  clickSelectOption: (
    option: string,
    config?: SelectMenuSelectorConfig
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  searchAndClickSelectOption: (
    option: string,
    config?: SelectMenuSelectorConfig
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  clickBooleanOption: (
    option: string
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
}
