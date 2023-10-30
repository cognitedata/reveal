import { getAppUrl } from '@fusion/shared/cypress';

import { BASE_URL, CLUSTER, PROJECT, SITE } from '../constants/appConfig';

const navigateToApp = () => {
  const url = getAppUrl(BASE_URL, PROJECT, 'search', CLUSTER);

  cy.visit(url);
  cy.url().should('include', `${BASE_URL}/${PROJECT}/search`);
  cy.get('.cogs-loader', { timeout: 30000 }).should('not.exist');
};

const setupSiteSelection = () => {
  window.localStorage.setItem(`selected-site-${PROJECT}`, JSON.stringify(SITE));
};

const skipOnboardingGuide = () => {
  cy.clearLocalStorage(`onboarding-modal-popup`);
  cy.clickButton('Close');
};
const resetAISearchCache = () => {
  cy.clearLocalStorage('recently-searched-ai-results-dss-dev');
};

Cypress.Commands.add('navigateToApp', navigateToApp);
Cypress.Commands.add('setupSiteSelection', setupSiteSelection);
Cypress.Commands.add('skipOnboardingGuide', skipOnboardingGuide);
Cypress.Commands.add('resetAISearchCache', resetAISearchCache);

export interface AppCommands {
  navigateToApp: () => void;
  setupSiteSelection: () => void;
  skipOnboardingGuide: () => void;
  resetAISearchCache: () => void;
}
