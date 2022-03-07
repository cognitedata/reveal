describe('Data Model Page - Existing Solution Preview', () => {
  beforeEach(() => cy.visit('/platypus/solutions/new-schema/latest/data'));

  it('should render page', () => {
    cy.getBySel('page-title').contains('Data model');

    // Should render the versions select
    cy.getBySel('schema-version-select').should('be.visible');

    // Should render toolbar and the edit schema button
    cy.getBySel('edit-schema-btn').should('be.visible');
  });

  it('should render the code editor', () => {
    // Should render the code editor
    cy.get('.monaco-editor textarea:first').should('be.visible');
  });

  it('should render the code editor', () => {
    // This should come imported from the mock package
    const expectedSchema =
      '\ntype Person @template {\n  firstName: String\n  lastName: String\n  email: String\n  age: Long\n}\n\ntype Product @template {\n  name: String\n  price: Float\n  image: String\n  description: String\n}\n\ntype Category @template {\n  name: String\n  products: [Product]\n}\n\n';

    // Should render the code editor
    cy.get('.monaco-editor textarea:first').should('be.visible');

    cy.get('.monaco-editor textarea:first')
      .type('{selectAll}')
      .should('have.value', expectedSchema);
  });

  it('should render the visualizer', () => {
    // Should render the visualizer
    cy.get('div#Person.node').should('be.visible');
    cy.get('div#Category.node').should('be.visible');
  });
});
