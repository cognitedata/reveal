describe('Extraction pipelines page', () => {
  beforeEach(() => {
    cy.navigate('extpipes');
  });

  it('Should open Extraction pipelines page', () => {
    cy.get('h3.cogs-heading-3', { timeout: 20000 }).contains(
      /Extraction pipelines/
    );
  });
});
