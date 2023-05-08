describe('data-exploration', () => {
  beforeEach(() => {
    // INFO: We first visit the url with the `externalOverride` and `overrideUrl` query params to override Explorer to use the local version.
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

  it('Should open Data Explorer from Home page', () => {
    cy.contains('Explore data').click();
    cy.url().should('include', 'http://cog-dss.localhost:8080/dss-dev/explore');
  });
});
