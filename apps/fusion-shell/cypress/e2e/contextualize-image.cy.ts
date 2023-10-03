describe('Contextualize Imagery Data page', () => {
  beforeEach(() => {
    cy.navigate('vision/workflow/process');
    cy.ensurePageFinishedLoading();
  });

  it('Should open Contextualize Imagery Data page', () => {
    cy.get('h2.cogs-title-2', { timeout: 20000 }).contains(
      /Contextualize Imagery Data/
    );
  });
});
