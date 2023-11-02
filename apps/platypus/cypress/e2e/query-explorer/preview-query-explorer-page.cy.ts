import { getUrl } from '../../utils/url';

describe('Platypus Query Explorer Page - Preview', () => {
  beforeEach(() => {
    cy.request('http://localhost:4201/reset');
    cy.visit(getUrl('/blog/blog/latest/query-explorer'));
    cy.ensurePageFinishedLoading();
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
      data: {
        listPost: {
          items: [
            {
              title: 'Lorem Ipsum',
              views: 254,
            },
          ],
        },
      },
    };
    cy.setQueryExplorerQuery(query);
    cy.clickQueryExplorerExecuteQuery();
    cy.assertQueryExplorerResult(mockResult);
  });
});
