import login from './login.test';

beforeEach(login);

describe('Comments', () => {
  it('Checking comments page', () => {
    cy.log('Goto the comments page');
    cy.get('[role="tab"]').contains('Comments').click();

    cy.contains('Slider').click();

    cy.log('Checking for an asset to comment on');
    cy.contains('Asset name: test-item-3').click();
  });
});
