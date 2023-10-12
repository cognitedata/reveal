describe('Login redirect', () => {
  it('Should redirect to login page if the org is not logged in', () => {
    const baseUrl = 'https://local.cognite.ai:4200/';
    cy.visit(
      `${baseUrl}any-project-at-all-or-just-anything-really/explore/search`
    );
    cy.url().should('eq', baseUrl);
  });
});
