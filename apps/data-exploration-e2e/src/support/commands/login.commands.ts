Cypress.Commands.add('fusionLogin', () => {
  cy.visit(
    `http://cog-dss.localhost:8080/dss-dev?env=greenfield&cluster=greenfield.cognitedata.com&externalOverride=@cognite/cdf-data-exploration&overrideUrl=${Cypress.env(
      'OVERRIDE_URL'
    )}`
  );

  // There is a bug in Fusion that removes all the other query parameters, so we need to navigate again. (Will fix it later)
  cy.visit(
    'http://cog-dss.localhost:8080/dss-dev?env=greenfield&cluster=greenfield.cognitedata.com'
  );
});

Cypress.Commands.add('navigateToExplorer', () => {
  cy.contains('Data Explorer').click();
  cy.url().should('include', 'http://cog-dss.localhost:8080/dss-dev/explore');
});

export interface LoginCommand {
  fusionLogin(): void;
  navigateToExplorer(): void;
}
