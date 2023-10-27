import { PROJECT } from '../constants/appConfig';

type DataModelInfo = {
  name: string;
  version: string;
  space: string;
};

const getDataModelSelector = () => {
  return cy.findByTestId('data-model-selector');
};

const clearSelectedDataModels = () => {
  cy.clearLocalStorage(`selected-data-models-${PROJECT}`);
};

const selectDataModel = ({ name, version, space }: DataModelInfo) => {
  cy.log(`Select data model: ${name}-${version}-${space}`);

  cy.getDataModelSelector()
    .should('be.visible')
    .findByTestId(`data-model-${name}-${version}-${space}`)
    .scrollIntoView()
    .click();
};

const confirmDataModelSelection = () => {
  cy.getDataModelSelector().clickButton('Confirm');
  cy.getDataModelSelector().should('not.exist');
};

Cypress.Commands.add('getDataModelSelector', getDataModelSelector);
Cypress.Commands.add('clearSelectedDataModels', clearSelectedDataModels);
Cypress.Commands.add('selectDataModel', selectDataModel);
Cypress.Commands.add('confirmDataModelSelection', confirmDataModelSelection);

export interface DataModelSelectorCommands {
  getDataModelSelector: () => Cypress.Chainable<JQuery<HTMLElement>>;
  clearSelectedDataModels: () => void;
  selectDataModel: (info: DataModelInfo) => void;
  confirmDataModelSelection: () => void;
}
