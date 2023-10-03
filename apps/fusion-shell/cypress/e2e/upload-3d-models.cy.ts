describe('Upload 3D models page', () => {
  beforeEach(() => {
    cy.navigate('3d-models');
    cy.ensurePageFinishedLoading();
  });

  it('Should open Upload 3D models page', () => {
    cy.get('h5.3dm-namespace__Title-3dm-namespace__sc-116iz9-0', {
      timeout: 20000,
    }).contains(/3D models/);

    cy.get('button.cogs-button.cogs-button--type-primary').contains(
      'Add model'
    );
  });
});
