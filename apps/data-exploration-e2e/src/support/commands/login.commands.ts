import { BASE_URL, CLUSTER, ENV, OVERRIDE_URL, PROJECT } from '../config';

Cypress.Commands.add('fusionLogin', () => {
  cy.visit(
    `${BASE_URL}/${PROJECT}?env=${ENV}&cluster=${CLUSTER}&externalOverride=@cognite/cdf-data-exploration&overrideUrl=${OVERRIDE_URL}`
  );

  // There is a bug in Fusion that removes all the other query parameters, so we need to navigate again. (Will fix it later)
  cy.visit(`${BASE_URL}/${PROJECT}?env=${ENV}&cluster=${CLUSTER}`);
});

Cypress.Commands.add('navigateToExplorer', () => {
  cy.contains('Data Explorer').click();
  cy.url().should('include', `${BASE_URL}/${PROJECT}/explore`);
});

export interface LoginCommand {
  fusionLogin(): void;
  navigateToExplorer(): void;
}
