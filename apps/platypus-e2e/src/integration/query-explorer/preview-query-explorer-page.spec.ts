describe('Platypus Query Explorer Page - Preview', () => {
  beforeEach(() =>
    cy.visit('/platypus/solutions/new-schema/latest/data/query-explorer')
  );

  it('should be able to query', () => {
    // eslint-disable-next-line
    cy.wait(300);

    const query = `{
  personQuery(limit: 1) {
    items {
      firstName
      lastName
      email
      age
    }
  }
}
`;

    const mockResult = {
      personQuery: {
        items: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@email.com',
            age: 30,
          },
        ],
      },
    };
    cy.setQueryExplorerQuery(query);
    cy.clickQueryExplorerExecuteQuery();
    cy.assertQueryExplorerResult(mockResult);
  });
});
