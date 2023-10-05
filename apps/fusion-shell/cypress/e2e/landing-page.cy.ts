describe('fusion-shell', () => {
  beforeEach(() => {
    cy.navigate('');
    cy.ensurePageFinishedLoading();
  });

  it('should display welcome message', () => {
    cy.get("[data-testid='fusion-landing-page-welcome-message']").should(
      'exist'
    );
  });
});
