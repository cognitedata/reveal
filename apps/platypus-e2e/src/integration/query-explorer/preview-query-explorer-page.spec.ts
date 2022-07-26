describe('Platypus Query Explorer Page - Preview', () => {
  beforeEach(() => {
    cy.request('http://localhost:4200/reset');
    cy.visit('/platypus/data-models/blog/latest/data/query-explorer');
  });

  it('should be able to query', () => {
    const query = `
    query {
      listPost (filter: {title: {eq: "Lorem Ipsum"}}) {
        items {
          title
          views
        }
      }
  }
`;

    const mockResult = {
      listPost: {
        items: [
          {
            title: 'Lorem Ipsum',
            views: 254,
          },
        ],
      },
    };
    cy.setQueryExplorerQuery(query);
    cy.clickQueryExplorerExecuteQuery();
    cy.assertQueryExplorerResult(mockResult);
  });
});
