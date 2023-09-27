describe('Interactive engineering diagram page', () => {
  beforeEach(() => {
    cy.navigate('interactive-diagrams');
  });

  it('Should open Interactive engineering diagram page', () => {
    cy.get('h4.cogs-title-4', { timeout: 20000 }).contains(
      /Pending interactive diagrams/
    );
  });
});
