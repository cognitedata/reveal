describe('Data Model Page - Toggle Schema Visualizer', () => {
  const createNewDataModel = (dataModelName: string) => {
    cy.visit('/');

    cy.getBySel('create-data-model-btn').click();
    cy.getBySel('input-data-model-name').type(dataModelName);
    cy.getBySel('modal-ok-button').click();
    cy.url().should('include', `/data-models/${dataModelName}/latest`);
    cy.getCogsToast('success').contains('Data Model successfully created');

    cy.getBySel('schema-version-select').contains('Local draft');
  };

  beforeEach(() => {
    cy.request('http://localhost:4200/reset');
    cy.visit('/platypus/data-models/blog/latest/data');
  });

  it('should test toggling schema visualizer due to excess types', () => {
    cy.getBySel('edit-schema-btn').should('be.visible').click();
    cy.get('[aria-label="Code editor"]').click();

    let gqlSchema = ``;

    for (let i = 1; i < 32; i++) {
      gqlSchema += `type Type${i} { field${i}: String }\n`;
    }

    cy.get('.monaco-editor textarea:first')
      .should('be.visible')
      .type(gqlSchema, {
        delay: 0,
        parseSpecialCharSequences: false,
      });

    cy.getBySel('schema-visualizer-toggle-btn').should('be.visible').click();
    cy.getBySel('schema-visualizer-err-ctr').should('be.visible');
    cy.visit('/platypus/data-models/blog/latest/data');
    cy.getBySel('schema-visualizer-err-ctr').should('be.visible');
    cy.getBySel('schema-visualizer-toggle-btn').should('be.visible').click();
    cy.getBySel('schema-visualizer-err-ctr').should('not.exist');

    const newModelName = 'cypress-test';
    createNewDataModel(newModelName);

    cy.get('[aria-label="Code editor"]').click();

    cy.get('.monaco-editor textarea:first')
      .should('be.visible')
      .type(gqlSchema, {
        delay: 0,
        parseSpecialCharSequences: false,
      });

    cy.getBySel('schema-visualizer-toggle-btn').should('be.visible').click();
    cy.getBySel('schema-visualizer-err-ctr').should('be.visible');
    cy.visit(`/platypus/data-models/${newModelName}/latest/data`);
    cy.getBySel('schema-visualizer-err-ctr').should('be.visible');

    cy.visit('/platypus/data-models/blog/latest/data');
    cy.getBySel('schema-visualizer-err-ctr').should('not.exist');
  });
});
