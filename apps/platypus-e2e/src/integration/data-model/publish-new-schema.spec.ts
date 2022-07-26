const checkQueryExplorer = (query: string, expectedResult: any) => {
  cy.setQueryExplorerQuery(query);
  cy.clickQueryExplorerExecuteQuery();
  cy.assertQueryExplorerResult(expectedResult);
};

describe('Data Model Page - Publish new schema', () => {
  beforeEach(() => {
    cy.request('http://localhost:4200/reset');
    cy.visit('/platypus/data-models/blog/latest/data');
  });

  it('should edit data model version and publish changes', () => {
    cy.addDataModelType('Team');

    cy.getBySel('publish-schema-btn').click();

    // A toast message should notify user when schema has been published successfully
    cy.getBySel('toast-title').should('have.text', 'Data model updated');

    cy.ensureCurrentVersionIsNotDraft();

    // Navigate to Query explorer page and make sure that we can run queries against updated schema
    cy.visit('/platypus/data-models/blog/latest/data/query-explorer');

    const query = `
    query {
      listTeam {
        items {
          name
        }
      }
  }
`;

    const expectedResult = {
      listTeam: {
        items: [],
      },
    };
    checkQueryExplorer(query, expectedResult);
  });

  it('should edit data model version, validate breaking changes and publish new version', () => {
    cy.getBySel('edit-schema-btn').click();

    cy.editDataModelTypeFieldName('User', 'name', 'userName');
    // eslint-disable-next-line
    cy.wait(500);

    cy.getBySel('publish-schema-btn').click();

    cy.getBySelLike('modal-title').contains('Breaking changes in data model');
    cy.getBySelLike('modal-ok-button').contains('Publish new version');

    cy.getBySel('modal-ok-button').click();

    // A toast message should notify user when schema has been published successfully
    cy.getBySel('toast-title').should('have.text', 'Data model published');

    cy.ensureCurrentVersionIsNotDraft();

    cy.getBySel('schema-version-select').contains('v. 2');

    // Navigate to Query explorer page and make sure that we can run queries against updated schema
    cy.visit('/platypus/data-models/blog/latest/data/query-explorer');

    const query = `
    query {
      listUser {
        items {
          userName
        }
      }
  }
`;

    const expectedResult = {
      listUser: {
        items: [],
      },
    };
    checkQueryExplorer(query, expectedResult);
  });
});
