import { getDataModelEndpointUrl } from '@platypus/platypus-core';

const checkQueryExplorer = (query: string, expectedResult: any) => {
  cy.setQueryExplorerQuery(query);
  cy.clickQueryExplorerExecuteQuery();
  cy.assertQueryExplorerResult(expectedResult);
};

describe('Data Model Page - Publish new schema', () => {
  beforeEach(() => {
    cy.request('http://localhost:4200/reset');
    cy.visit('/platypus/data-models/blog/blog/latest/data');
  });

  it('should edit data model version and publish changes', () => {
    cy.addDataModelType('Team');

    cy.getBySel('publish-schema-btn').click();

    // A toast message should notify user when schema has been published successfully
    cy.getBySel('toast-title').should('have.text', 'Data model updated');

    cy.ensureCurrentVersionIsNotDraft();

    cy.getBySel('btn-endpoint-modal').click();

    cy.getBySel('endpoint-url').should(
      'have.text',
      getDataModelEndpointUrl('platypus', 'blog', '1', 'http://localhost:4200')
    );

    // Navigate to Query explorer page and make sure that we can run queries against updated schema
    cy.visit('/platypus/data-models/blog/blog/latest/data/query-explorer');

    // const query = `
    //     query {
    //       listTeam {
    //         items {
    //           name
    //         }
    //       }
    //   }
    // `;

    // const expectedResult = {
    //   listTeam: {
    //     items: [],
    //   },
    // };
    // console.log('Checking result', query, expectedResult);
    // checkQueryExplorer(query, expectedResult);
  });

  it('should edit data model version, validate breaking changes and publish new version', () => {
    cy.getBySel('edit-schema-btn').click();

    cy.editDataModelTypeFieldName('User', 'name', 'userName');

    // click to select published v1, new field is not there
    cy.getBySel('schema-version-select').click().contains('Latest').click();
    cy.getBySel('type-list-item-User').click();
    cy.getBySel('schema-type-field').get('.input-value').contains('name');

    // click to select local draft again, new field is there
    cy.getBySel('schema-version-select').click().contains('draft').click();
    cy.getBySel('type-list-item-User').click();
    cy.getBySel('schema-type-field').get('.input-value').contains('userName');

    // click to select published v1, then click edit, new field is there
    cy.getBySel('schema-version-select').click().contains('Latest').click();
    cy.getBySel('edit-schema-btn').click();
    cy.getBySel('type-list-item-User').click();
    cy.getBySel('schema-type-field').get('.input-value').contains('userName');

    cy.getBySel('publish-schema-btn').click();

    cy.getBySelLike('modal-title').contains('Breaking changes in data model');
    cy.getBySelLike('modal-ok-button').contains('Publish new version');

    cy.getBySel('modal-ok-button').click();

    // A toast message should notify user when schema has been published successfully
    cy.getBySel('toast-title').should('have.text', 'Data model published');

    cy.ensureCurrentVersionIsNotDraft();

    cy.getBySel('schema-version-select').contains('v. 2');

    // go to v1 and check that the edit button is not visible
    cy.getBySel('schema-version-select').click().contains('v. 1').click();
    cy.getBySel('edit-schema-btn').should('not.exist');

    // click to return to latest and check we're on latest version again
    cy.getBySel('return-to-latest-btn').click();
    cy.getBySel('schema-version-select').contains('Latest');

    // Navigate to Query explorer page and make sure that we can run queries against updated schema
    cy.visit('/platypus/data-models/blog/blog/latest/data/query-explorer');

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

  it('should only show the published data model version after the localDraft is published', () => {
    cy.visit('/');

    cy.getBySel('create-data-model-btn').click();
    cy.getBySel('input-data-model-name').type('cypress-test');
    cy.getBySel('modal-ok-button').click();
    // we should be redirected to /dashboard
    cy.url().should('include', '/data-models/cypress-test/cypress-test/latest');
    cy.getCogsToast('success').contains('Data Model successfully created');

    // we should see version select dropdown with draft
    cy.getBySel('schema-version-select').contains('Local draft');

    cy.getBySel('no-types-add-type-btn').click();
    cy.getBySel('type-name-input').type('Person');
    cy.getBySel('modal-ok-button').click();

    cy.addDataModelTypeField('Person', 'name', 'String');
    cy.getBySel('publish-schema-btn').click();

    // we should see version select dropdown with latest
    cy.getBySel('schema-version-select').contains('Latest');
    cy.getBySel('schema-version-select').click();

    cy.get('.cogs-menu').children().should('have.length', 1);
  });
});
