describe('Platypus Data Models Page - Delete Data Model', () => {
  const modelName = 'cypress-test';
  const modelType = 'CypressTestType';
  const modelTypeField = 'cypressTestField';

  beforeEach(() => {
    cy.request('http://localhost:4200/reset');
    cy.visit('/');
  });

  it('should delete and recreate data model with same name and confirm it is empty', () => {
    cy.getBySel('create-data-model-btn').click();
    cy.getBySel('input-data-model-name').type(`${modelName}`);
    cy.getBySel('modal-ok-button').click();

    cy.url().should('include', `/data-models/${modelName}/latest`);
    cy.getCogsToast('success')
      .contains('Data Model successfully created')
      .click();

    cy.getBySel('no-types-add-type-btn').click();

    cy.getBySel('type-name-input').type(modelType);
    cy.getBySel('modal-ok-button').click();

    cy.addDataModelTypeField(modelType, modelTypeField);

    cy.get(`div#${modelType}.node`)
      .should('be.visible')
      .contains(modelTypeField);

    cy.getBySel('publish-schema-btn').click();
    cy.getBySel('toast-title')
      .should('have.text', 'Data model published')
      .click();

    cy.getBySel('back-to-all-models-btn').click();
    cy.url().should('not.include', `${modelName}/latest`);

    cy.getBySel(`data-model-card-menu-${modelName}`).click();
    cy.getBySel(`delete-data-model-menu-item-${modelName}`).click();
    cy.getBySel('data-model-confirm-deletion-checkbox').click();
    cy.getBySel('modal-ok-button').click();
    cy.getBySel('toast-body').should(
      'include.text',
      `Data Model «${modelName}» was deleted.`
    );

    cy.getBySel('create-data-model-btn').click();
    cy.getBySel('input-data-model-name').type(`${modelName}`);
    cy.getBySel('modal-ok-button').click({ force: true });
    cy.url().should('include', `/data-models/${modelName}/latest`);
    cy.getCogsToast('success').contains('Data Model successfully created');

    cy.getBySel('no-types-add-type-btn').should('be.visible');
  });
});
