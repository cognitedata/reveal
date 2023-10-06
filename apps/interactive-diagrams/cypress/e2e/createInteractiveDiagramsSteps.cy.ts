describe('Run through Create interactive diagrams steps', () => {
  beforeEach(() => {
    cy.visitAndLoadPage();
    cy.getBySelector('create-new-interactive-diagrams-button').click();
    cy.waitForPageToLoad();
  });

  it('check for common components', () => {
    cy.assertElementWithTextExists(
      'breadcrumb-item',
      'Create interactive diagrams'
    );

    cy.getBySelector('create-interactive-diagrams-step').should(
      'have.length',
      4
    );
  });

  it('Can flow the flow using steps list', () => {
    cy.assertStepTitle('Select engineering diagrams');
    cy.clickStepsListItem('Link to...');
    cy.assertStepTitle('Link to other engineering diagrams');
    cy.clickStepsListSubItem('Assets');
    cy.assertStepTitle('Link to assets');
    cy.clickStepsListItem('Select model');
    cy.assertStepTitle('Select model');
    cy.clickStepsListItem('Review results');
    cy.assertStepTitle('Run the model');
  });

  it('fallow the flow', () => {
    // Step 1: Select engineering diagrams
    cy.assertStepTitle('Select engineering diagrams');
    cy.getBySelector('filter-bar').should('exist');
    cy.getBySelector('diagram-selection-table').should('exist');
    cy.assertElementWithTextExists('back-button', 'Back');

    cy.selectDataset('Interactive Diagrams');
    cy.selectLabel('ID E2E Data');
    cy.selectAllEntities('diagram-selection-table-select-all');

    cy.nextStep();

    // Step 2.1: Link to other engineering diagrams
    cy.assertStepTitle('Link to other engineering diagrams');
    cy.getBySelector('resources-selection-table').should('exist');
    cy.assertElementWithTextExists('next-button', 'Next step');
    cy.assertElementWithTextExists('back-button', 'Back');
    cy.assertElementWithTextExists('skip-button', 'Skip');

    cy.selectDataset('Interactive Diagrams');
    cy.selectLabel('ID E2E Data');
    cy.selectAllEntities('resources-selection-table-select-all');

    cy.nextStep();

    // Step 2.2: Link to assets
    cy.assertStepTitle('Link to assets');
    cy.getBySelector('filter-bar').should('exist');
    cy.getBySelector('resources-selection-table').should('exist');
    cy.assertElementWithTextExists('back-button', 'Back');

    cy.selectDataset('Interactive Diagrams');
    cy.selectAllEntities('resources-selection-table-select-all');

    cy.nextStep();

    // Step 3: Select model
    cy.assertStepTitle('Select model');
    cy.getBySelector('model-options').should('exist');
    cy.assertElementWithTextExists('back-button', 'Back');

    cy.nextStep();

    // Step 4: Review results
    cy.assertStepTitle('Run the model');

    cy.getBySelector('setup-summary').should('exist');
    cy.getBySelector('results-preview').should('exist');
    cy.getBySelector('section-progress').should('exist');
    cy.assertElementWithTextExists('diagrams-selection-info', '10');
    cy.assertElementWithTextExists('files-selection-info', '10');
    cy.assertElementWithTextExists('assets-selection-info', '10');
    cy.assertElementWithTextExists('model-selection-info', 'standard');

    cy.assertElementWithTextExists('back-button', 'Back');
    cy.assertElementWithTextExists('next-button', 'Done');
  });
});
