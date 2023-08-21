describe('Raw explorer page', () => {
  beforeEach(() => {
    cy.navigate('raw');
  });

  it('Should open Extract data page', () => {
    cy.get('h5.cogs-title-5', { timeout: 20000 }).contains(/RAW Explorer/);
  });
});
