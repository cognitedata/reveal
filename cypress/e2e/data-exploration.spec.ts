describe('first test', () => {
  it('open the page', () => {
    cy.visit('https://icanhazdadjoke.com/');
    cy.findAllByText(/joke/gi).should('exist');
  });``
});
