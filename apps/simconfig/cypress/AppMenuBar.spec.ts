import login from './login.test';

beforeEach(login);

describe('App tests', () => {
  beforeEach(() => {
    cy.get('[data-cy="top-bar"]')
      .as('app top bar visible')
      .should('be.visible');
    cy.get('[data-cy="model-library-container"]')
      .as('model library visible')
      .should('be.visible');
  });

  it('Check for SimConfig App heading', () => {
    cy.log('Checking for page content');
    cy.contains('Cognite Simulator Configuration').as('page content visible');
  });

  it('Check for project name in App heading', () => {
    cy.get('#project-name').invoke('text').should('eq', 'simconfig-e2e');
  });

  it('Check for at least one connector status', () => {
    cy.get('#simulator-status-0').click();
    cy.get('#simulator-header-0').click();

    cy.get(
      '.cogs-collapse--ghost > .rc-collapse-item-active > .rc-collapse-content'
    )
      .invoke('text')
      .should('contain', 'Last seen')
      .and('contain', 'Data set')
      .and('contain', 'Connector version');

    cy.get(
      '.SimulatorInformation__SimulatorInformationContainer-sskn1g-0 > .rc-collapse > .rc-collapse-item > .rc-collapse-header'
    ).click();

    cy.get('.simulator-collapse')
      .invoke('text')
      .should('contain', 'Model files')
      .and('contain', 'Calculation files')
      .and('contain', 'Calculation run events');

    cy.get(
      '.SimulatorInformation__SimulatorInformationContainer-sskn1g-0 > .rc-collapse > .rc-collapse-item > .rc-collapse-header'
    ).click();

    cy.get('#simulator-header-0').click();
    cy.get('#simulator-status-0').click();
  });

  it('Should contain relevant tabs', () => {
    cy.get('#rc-tabs-0-tab-Model library').should('not.be.null');
    cy.get('#rc-tabs-0-tab-Run browser').should('not.be.null');
  });

  it('Should contain user avatar with logout button', () => {
    cy.get('.cogs-avatar').click();
    cy.get('.cogs-menu-item[data-cy="logout-button"]')
      .invoke('text')
      .should('contain', 'Logout');
  });

  it('Should log out successfully', () => {
    cy.get('.cogs-avatar').click();
    cy.get('.cogs-menu-item[data-cy="logout-button"]').click();
    cy.contains('Login with Fake IDP (azure-dev)');
  });
});
