type SearchConfigColumn =
  | 'Common'
  | 'Assets'
  | 'Time series'
  | 'Files'
  | 'Events'
  | 'Sequences';

type SearchConfigProperty =
  | 'Name'
  | 'Description'
  | 'Content'
  | 'Description / Content'
  | 'External ID'
  | 'ID'
  | 'Metadata'
  | 'Type'
  | 'Source'
  | 'Labels'
  | 'Unit'
  | 'Subtype';

const openSearchConfig = () => {
  cy.log('Open search config');
  cy.clickButton('Config');
  cy.findByTestId('search-config').should('exist');
};

const saveSearchConfig = () => {
  cy.log('Save search config');
  cy.clickButton('Save');
  cy.findByTestId('search-config').should('not.exist');
};

const closeSearchConfig = () => {
  cy.log('Close search config');
  cy.clickButton('Cancel');
  cy.findByTestId('search-config').should('not.exist');
};

const getSearchConfigOption = (
  column: SearchConfigColumn,
  property: SearchConfigProperty
) => {
  return cy.findByTestId(`search-config-${column}`).containsExact(property);
};

const enableSearchConfig = (
  column: SearchConfigColumn,
  property: SearchConfigProperty
) => {
  cy.getSearchConfigOption(column, property)
    .as('searchConfigOption')
    .parent()
    .find('input[type="checkbox"]')
    .then((checkbox) => {
      if (checkbox.is(':not(:checked)')) {
        cy.log(`enable search config for "${column} => ${property}"`);
        cy.get('@searchConfigOption').click({ force: true });
      } else {
        cy.log(
          `search config for "${column} => ${property}" is already enabled`
        );
      }
    });
};

const disableSearchConfig = (
  column: SearchConfigColumn,
  property: SearchConfigProperty
) => {
  cy.getSearchConfigOption(column, property)
    .as('searchConfigOption')
    .parent()
    .find('input[type="checkbox"]')
    .then((checkbox) => {
      if (checkbox.is(':checked')) {
        cy.log(`disable search config for "${column} => ${property}"`);
        cy.get('@searchConfigOption').click({ force: true });
      } else {
        cy.log(
          `search config for "${column} => ${property}" is already disabled`
        );
      }
    });
};

Cypress.Commands.add('openSearchConfig', openSearchConfig);
Cypress.Commands.add('saveSearchConfig', saveSearchConfig);
Cypress.Commands.add('closeSearchConfig', closeSearchConfig);
Cypress.Commands.add('getSearchConfigOption', getSearchConfigOption);
Cypress.Commands.add('enableSearchConfig', enableSearchConfig);
Cypress.Commands.add('disableSearchConfig', disableSearchConfig);

export interface SearchConfigCommands {
  openSearchConfig: () => void;
  saveSearchConfig: () => void;
  closeSearchConfig: () => void;
  getSearchConfigOption: (
    column: SearchConfigColumn,
    property: SearchConfigProperty
  ) => Cypress.Chainable<JQuery<HTMLElement>>;
  enableSearchConfig: (
    column: SearchConfigColumn,
    property: SearchConfigProperty
  ) => void;
  disableSearchConfig: (
    column: SearchConfigColumn,
    property: SearchConfigProperty
  ) => void;
}
