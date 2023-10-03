describe('Document Classifiers page', () => {
  beforeEach(() => {
    cy.navigate('documents');
    cy.ensurePageFinishedLoading();
  });

  it('Should open Document Classifiers page', () => {
    cy.get('h3.cogs-title-3', { timeout: 20000 }).contains(
      /Trained models for Document Type/
    );
  });
});
