describe('Data Model Page - Existing Solution Preview', () => {
  beforeEach(() => {
    cy.request('http://localhost:4200/reset').then(() => {
      cy.visit('/platypus/data-models/blog/latest/data');
    });
  });

  it('should render page', () => {
    cy.getBySel('page-title').contains('Data model');

    // Should render the versions select
    cy.getBySel('schema-version-select').should('be.visible');

    // Should render toolbar and the edit schema button
    cy.getBySel('edit-schema-btn').should('be.visible');
  });

  it('should render the code editor', () => {
    // Should render the code editor
    cy.get('[aria-label="Code editor"]').click();
    cy.get('.monaco-editor textarea:first').should('be.visible');
  });

  it('should fill the code editor with text', () => {
    // This should come imported from the mock package
    const expectedSchema =
      'type Post {\n  title: String!\n  views: Int!\n  user: User\n tags: [String]\n comments: [Comment]\n}\n\ntype User {\n  name: String!\n}\n\ntype Comment {\n  body: String!\n  date: Timestamp!\n  post: Post\n}';

    cy.get('[aria-label="Code editor"]').click();
    cy.get('.monaco-editor textarea:first').should('be.visible');
    cy.getBySel('edit-schema-btn').should('be.visible').click();
    cy.get('.monaco-editor textarea:first')
      .type('{selectAll}')
      .should('have.value', expectedSchema);
  });

  it('should render the visualizer with mock data', () => {
    // Should render the visualizer
    cy.get('div#Post.node').should('be.visible');
    cy.get('div#Comment.node').should('be.visible');
  });

  it('should enter the type in UI editor and add new field & see changes in visualizer', () => {
    cy.get('[aria-label="UI editor"]').click();
    cy.contains('Post').click();
    cy.get('h5').contains('Post').should('be.visible');
    cy.getBySel('edit-schema-btn').should('be.visible').click();

    cy.addDataModelTypeField('Post', 'phone', true);

    // checks if visualizer updated with edited value
    cy.get('div#Post')
      .should('be.visible')
      .children()
      .getBySel('visualizer-type-field')
      .should('contain', 'phone')
      .and('contain', 'String!');
  });

  it('should create type and fields & see changes in visualizer', () => {
    cy.get('[aria-label="UI editor"]').click();
    cy.addDataModelType('Person');
    cy.addDataModelTypeField('Person', 'firstName');
    cy.addDataModelTypeField('Person', 'last_name');
    cy.addDataModelTypeField('Person', 'age');
    cy.editDataModelTypeFieldName('Person', 'last_name', 'lastName', false);

    cy.getDataModelFieldRow('age').should('be.visible');
    cy.getDataModelFieldRow('lastName').should('be.visible');

    // checks if visualizer updated with edited value
    cy.get('div#Person')
      .should('be.visible')
      .children()
      .getBySel('visualizer-type-field')
      .should('contain', 'lastName')
      .and('contain', 'String')
      .and('contain', 'age');
  });

  it('should add a type in UI editor and not see an error in the visualizer', () => {
    cy.get('[aria-label="UI editor"]').click();
    cy.getBySel('edit-schema-btn').click();
    cy.getBySel('add-type-btn').click();
    cy.getBySel('type-name-input').type('Dog');
    cy.getBySel('modal-ok-button').click();

    cy.get('#visualizer-wrapper')
      .contains('Unable to visualize')
      .should('not.exist');
  });

  it('should delete field inside type and see changes in visualizer', () => {
    cy.get('[aria-label="UI editor"]').click();
    cy.contains('Post').click();
    cy.get('h5').contains('Post').should('be.visible');
    // should delete field "title"
    cy.getBySel('edit-schema-btn').should('be.visible').click();
    cy.get('button[aria-label="Delete field"').first().click();
    cy.get('div#Post')
      .find('[data-cy="visualizer-type-field"]')
      .first()
      .should('not.contain', 'title');
  });
  it('should delete type and see that dependent types are cleared', () => {
    cy.get('[aria-label="UI editor"]').click();
    cy.getBySel('edit-schema-btn').should('be.visible').click();
    cy.get('[aria-label="Additional actions for Post"]').click();
    cy.get('button').contains('Delete type').should('be.visible').click();
    cy.getBySel('modal-ok-button').should('contain', 'Delete Type').click();
    cy.contains('Comment').click();
    cy.get('h5').contains('Comment').should('be.visible');
    cy.getBySel('editor_panel')
      .should('be.visible')
      .should('not.contain', 'Post');
    cy.get('div#visualizer-wrapper').should(
      'not.contain',
      'Unable to visualize schema.'
    );
    cy.get('div#Comment')
      .find('[data-cy="visualizer-type-field"]')
      .should('not.contain', 'Post');
  });

  it('schema generation should properly work between UI & Code & Visualizer', () => {
    // UI editor workflow
    cy.addDataModelType('Author');
    cy.get('h5').contains('Author').should('be.visible');

    cy.addDataModelTypeField('Author', 'user', true);
    cy.getDataModelFieldRow('user').find('[col-id="type"]').click();

    // for type, we are using popup cell editor and we should handle it differently
    cy.get('.ag-popup')
      .find('input[aria-autocomplete="list"]')
      .click({ force: true })
      .focus()
      .type('{selectAll}')
      .type('User{enter}');

    cy.get('div#Author.node')
      .should('be.visible')
      .children()
      .last()
      .should('contain', 'user')
      .and('contain', 'User');

    // Code Editor check for properly working
    cy.get('[aria-label="Code editor"]').click();
    cy.get('.monaco-editor textarea:first')
      .type('{selectAll}')
      .should('contain.value', 'type Author');
    // Visualizer correct output
    cy.get('div#visualizer-wrapper').should(
      'not.contain',
      'Unable to visualize schema.'
    );
  });

  it('should validate unsuported features when publishing', () => {
    cy.get('[aria-label="Code editor"]').click();
    cy.get('.monaco-editor textarea:first').should('be.visible');
    cy.getBySel('edit-schema-btn').should('be.visible').click();
    cy.get('.monaco-editor textarea:first').type(`
      type Test {
        user: User!
      }
      `);

    cy.getBySel('publish-schema-btn').click();

    // breaking changes dialog should be displayed even before publishing
    cy.getBySelLike('toast-title').contains(
      'Error: could not update data model'
    );
    cy.getBySelLike('toast-body').contains(
      'Your Data Model GraphQL schema contains errors.'
    );
  });

  it('should validate GraphQl schema with breaking changes when publishing', () => {
    cy.get('[aria-label="UI editor"]').click();
    cy.contains('Post').click();
    cy.get('h5').contains('Post').should('be.visible');
    // should delete field "title"
    cy.getBySel('edit-schema-btn').should('be.visible').click();
    cy.get('button[aria-label="Delete field"').first().click();
    cy.get('div#Post')
      .find('[data-cy="visualizer-type-field"]')
      .first()
      .should('not.contain', 'title');

    cy.getBySel('publish-schema-btn').click();

    // breaking changes dialog should be displayed even before publishing
    cy.getBySelLike('modal-title').contains('Breaking changes in data model');
  });
});
