describe('User Profile', () => {
  before(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.log('Open user profile from tobpar menu');
    cy.findByLabelText('Open user profile').click();
  });

  it('has the necessary user information', () => {
    cy.log('check that the email is visible');
    cy.findByText(Cypress.env('REACT_APP_E2E_USER')).should('be.visible');

    cy.log('check the name is visible');
    cy.findByLabelText('Name').should(
      'have.value',
      `Normal User ${Cypress.env('USER_PREFIX').toUpperCase()}`
    );

    cy.log('check Company label and name are visible');
    cy.findByText('Company').should('be.visible');
    cy.findByText('New name').should('be.visible');
  });

  it('shows access rights for various APIs', () => {
    cy.get('[data-testid="access-list-item-geospatial"]').should('not.exist');
    cy.findByText('Show my access').should('be.visible').click();
    cy.get('[data-testid="access-list-item-geospatial"]').should('be.visible');
  });

  it('can be used to logout of current project', () => {
    cy.findByRole('button', { name: 'Logout' }).should('be.visible').click();
    cy.url().should('equal', `${Cypress.env('BASE_URL')}/`);
  });
});
