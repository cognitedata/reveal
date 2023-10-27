import { getAppUrl } from '@fusion/shared/cypress';

import { BASE_URL, CLUSTER, PROJECT } from '../constants/appConfig';
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
  cy.confirmDataModelSelection();
};

const skipOnboardingGuide = () => {
  cy.clearLocalStorage(`onboarding-modal-popup`);
  cy.clickButton('Close');
};

Cypress.Commands.add('navigateToApp', navigateToApp);
Cypress.Commands.add('setupDataModelSelection', setupDataModelSelection);
Cypress.Commands.add('skipOnboardingGuide', skipOnboardingGuide);

export interface AppCommands {
  navigateToApp: () => void;
  setupDataModelSelection: () => void;
  skipOnboardingGuide: () => void;
}
