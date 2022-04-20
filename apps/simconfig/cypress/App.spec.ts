import login from './login.test';

beforeEach(login);

describe('App tests', () => {
  it('Check for SimConfig App heading', () => {
    cy.log('Checking for page content');
    cy.contains('Cognite Simulator Configuration');
  });
});
