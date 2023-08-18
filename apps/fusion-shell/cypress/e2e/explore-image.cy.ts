describe('Explore image page', () => {
  beforeEach(() => {
    cy.navigate('vision/explore');
  });

  it('Should open Explore image page', () => {
    cy.get('h2.cogs-title-2', { timeout: 20000 }).contains(
      /Image and video management/
    );
  });
});
