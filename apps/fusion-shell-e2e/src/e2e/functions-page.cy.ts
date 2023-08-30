describe('Functions page', () => {
  beforeEach(() => {
    cy.navigate('functions');
  });

  it('Should open Cognite functions page', () => {
    cy.get('h1', { timeout: 20000 }).contains(/Functions/);
    cy.get('button.cogs-button.cogs-button--type-primary', {
      timeout: 20000,
    }).contains('Upload function');
  });
});
