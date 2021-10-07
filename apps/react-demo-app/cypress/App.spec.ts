import login from './login.test';

beforeEach(login);

describe('App tests', () => {
  it('Check sidecar page content', () => {
    cy.log('Goto the sidecar page');
    cy.contains('Sidecar Info').click();

    cy.log('Checking for page content');
    cy.contains('What is the Sidecar').click();
  });

  it('Checking sdk setup', () => {
    cy.log('Goto the SDK page');
    cy.contains('Cognite SDK').click();

    // log('Checking for page content');
    // eslint-disable-next-line @cognite/no-unissued-todos
    // TODO - add content into this tenant and check for it here
  });

  it('Logout redirects to the main page', () => {
    cy.log('Open sidebar');
    cy.get('[aria-label="Open sidebar"]').click();

    cy.log('Click logout button');
    cy.get('button[aria-label="Logout"]').click();

    cy.location().should((location) => {
      expect(location.href.slice(0, -1)).eql(location.origin);
    });
  });
});
