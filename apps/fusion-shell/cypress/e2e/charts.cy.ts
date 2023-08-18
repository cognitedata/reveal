describe('Charts page', () => {
  beforeEach(() => {
    cy.navigate('charts');
  });

  it('Should open Charts page', () => {
    cy.get('button.cogs-button[aria-label="New chart"]', {
      timeout: 20000,
    }).contains('New chart');
  });
});
