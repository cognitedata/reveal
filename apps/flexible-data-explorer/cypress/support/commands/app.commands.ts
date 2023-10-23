import { getAppUrl } from '@fusion/shared/cypress';

import { BASE_URL, CLUSTER, PROJECT } from '../constants/app';
import { PREFERRED_DATA_MODEL } from '../constants/dataModels';

const navigateToApp = () => {
  const url = getAppUrl(BASE_URL, PROJECT, 'search', CLUSTER);

  cy.visit(url);
  cy.url().should('include', `${BASE_URL}/${PROJECT}/search`);
  cy.get('.cogs-loader', { timeout: 30000 }).should('not.exist');
};

const setupDataModelSelection = () => {
  cy.clearSelectedDataModels();
  cy.selectDataModel(PREFERRED_DATA_MODEL);
};

Cypress.Commands.add('navigateToApp', navigateToApp);
Cypress.Commands.add('setupDataModelSelection', setupDataModelSelection);

export interface AppCommands {
  navigateToApp: () => void;
  setupDataModelSelection: () => void;
}
