describe('Charts page', () => {
  beforeEach(() => {
    cy.navigate('charts');
  });

  // skipping this to for next-release, will re-enable after
  it('Should open Charts page', () => {
    cy.get('button.cogs-button[aria-label="New chart"]', {
      timeout: 20000,
    }).contains('New chart');
  });
});
