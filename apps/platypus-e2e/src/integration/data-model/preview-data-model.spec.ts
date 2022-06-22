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
      'type Post @view {\n  title: String!\n  views: Int!\n  user: User\n tags: [String]\n comments: [Comment]\n}\n\ntype User @view {\n  name: String!\n}\n\ntype Comment @view {\n  body: String!\n  date: Timestamp!\n  post: Post\n}';

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

  // it('Adds type with template directive using ui editor', () => {
  //   cy.get('[aria-label="UI editor"]').click();
  //   cy.getBySel('edit-schema-btn').should('be.visible').click();
  //   cy.getBySel('add-type-btn').should('be.visible').click();
  //   cy.getBySel('type-name-input').should('be.visible').type('CypressTestType');
  //   cy.getBySel('modal-ok-button').should('be.visible').click();

  //   cy.getBySel('schema-type-field').type('name');
  //   cy.getBySel('checkbox-field-required').click();
  //   cy.getBySel('type-view-back-button').should('be.visible').click();
  //   cy.getBySel('type-list-item-CypressTestType').should('be.visible');
  //   //Test UI Editor type list
  //   cy.getBySel('type-list-item-CypressTestType')
  //     .contains('span', 'template')
  //     .should('be.visible');

  //   //Test visualizer
  //   cy.get('div.node#CypressTestType').should('be.visible');
  //   cy.get('div.node#CypressTestType')
  //     .contains('span', 'Template')
  //     .should('be.visible');
  // });

  it('should enter the type in UI editor and add new field & see changes in visualizer', () => {
    cy.get('[aria-label="UI editor"]').click();
    cy.contains('Post').click();
    cy.get('h5').contains('Post').should('be.visible');
    cy.getBySel('edit-schema-btn').should('be.visible').click();
    cy.get('button[aria-label="Add field"]').click();
    cy.getBySel('schema-type-field').last().type('phone');
    cy.getBySel('checkbox-field-required').last().click();
    // checks if visualizer updated with edited value
    cy.get('div#Post')
      .should('be.visible')
      .children()
      .getBySel('visualizer-type-field')
      .should('contain', 'phone')
      .and('contain', 'String!');
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
    cy.get('[aria-label="UI editor"]').click();
    cy.getBySel('edit-schema-btn').click();
    cy.get('button[aria-label="Add type"]').click();
    cy.get('input[name="typeName"]').should('be.visible').type('Author');
    cy.get('button[data-cy="modal-ok-button"]').click();
    cy.get('h5').contains('Author').should('be.visible');
    cy.getBySel('schema-type-field').first().type('user');

    // by default we set type as String
    cy.getBySel('select-String')
      .children()
      .get('input[aria-autocomplete="list"]')
      .focus()
      .type('User{enter}');
    cy.getBySel('select-User').contains('User');
    cy.getBySel('checkbox-field-required').first().click();
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
    cy.get('div#Author')
      .should('be.visible')
      .children()
      .last()
      .should('contain', 'user')
      .and('contain', 'User!');
  });
});
