import { getAppUrl } from '@fusion/shared/cypress';

import { BASE_URL, CLUSTER, ENV, OVERRIDE_URL, PROJECT } from '../config';

type ResourceTab =
  | 'Assets'
  | 'Time series'
  | 'Files'
  | 'Events'
  | 'Sequence'
  | 'All resources'
  | 'Hierarchy'
  | 'Details'
  | '3D';

const fusionLogin = () => {
  cy.visit(
    `${BASE_URL}/${PROJECT}?env=${ENV}&cluster=${CLUSTER}&externalOverride=@cognite/cdf-data-exploration&overrideUrl=${OVERRIDE_URL}`
  );
  // There is a bug in Fusion that removes all the other query parameters, so we need to navigate again. (Will fix it later)
  cy.visit(`${BASE_URL}/${PROJECT}?env=${ENV}&cluster=${CLUSTER}`);
};

const navigateToExplorer = () => {
  const url = getAppUrl(BASE_URL, PROJECT, 'explore', CLUSTER);

  cy.visit(url);
  cy.url().should('include', `${BASE_URL}/${PROJECT}/explore`);
};

const goToTab = (subject: JQuery<HTMLElement>, tab: ResourceTab) => {
  cy.log(`Go to ${tab} tab`);
  cy.wrap(subject)
    .findByRole('tab', { name: new RegExp(tab) })
    .should('be.visible')
    .click();
};

Cypress.Commands.add('fusionLogin', fusionLogin);
Cypress.Commands.add('navigateToExplorer', navigateToExplorer);
Cypress.Commands.add('goToTab', { prevSubject: 'optional' }, goToTab);

export interface AppCommands {
  fusionLogin: () => void;
  navigateToExplorer: () => void;
  goToTab: (tab: ResourceTab) => void;
}
