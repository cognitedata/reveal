describe('data-exploration', () => {
  beforeEach(() => {
    // INFO: We first visit the url with the `externalOverride` and `overrideUrl` query params to override Explorer to use the local version.
    cy.visit(
      `http://cog-dss.localhost:8080/dss-dev?env=greenfield&cluster=greenfield.cognitedata.com&externalOverride=@cognite/cdf-data-exploration&overrideUrl=${Cypress.env(
        'OVERRIDE_URL'
      )}`
    );
  });

  it('Should open Data Explorer from Home page', () => {
    cy.contains('Explore data', { timeout: 10_000 }).click();
    cy.url().should('include', 'http://cog-dss.localhost:8080/dss-dev/explore');
  });
});
