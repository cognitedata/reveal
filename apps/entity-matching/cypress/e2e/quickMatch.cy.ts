describe('Create Pipeline', () => {
  beforeEach(() => {
    cy.visitAndLoadPage();
  });

  it('should able to run a quick match', () => {
    cy.startQuickMatch();

    /**1. Select source */
    cy.getBySelector('source-select-step').should('exist');
    cy.assertElementWithTextExists(
      'source-select-step-title',
      '1. Select source'
    );
    cy.getBySelector('source-select-step-sub-title').should('exist');

    cy.selectItem('data-type', 'Time series');
    cy.searchAndSelectOption('data-set-select', 'Entity Matching e2e');
    cy.selectAllResults();

    cy.navigateToNextStep();

    /**2. Select target assets */
    cy.getBySelector('target-select-step').should('exist');
    cy.assertElementWithTextExists(
      'target-select-step-title',
      '2. Select target assets'
    );

    cy.searchAndSelectOption('data-set-select', 'Entity Matching e2e');
    cy.selectAllResults();

    cy.assertElementWithTextExists('back-button', 'Back');
    cy.navigateToNextStep();

    /**3. Configure pipeline
     * accept all the default settings
     */
    cy.getBySelector('model-configure-step').should('exist');
    cy.assertElementWithTextExists(
      'model-configure-step-title',
      '3. Configure model'
    );

    cy.assertElementWithTextExists('back-button', 'Back');
    cy.quickRunModel();

    /**3.5 Details */
    cy.getBySelector('create-model-step').should('exist');
    cy.waitForPipelineRunCompletion('create-model-step');

    /**4. Review results */
    cy.getBySelector('pipeline-review-results-step').should('exist');
    cy.assertElementWithTextExists(
      'pipeline-review-results-step-title',
      '4. Review results'
    );

    cy.checkTableContent('quick-match-results-table', [
      'VAL_23-FT-96158:X.Value',
      'VAL_23-KA-9101-M01-39B:X.Value',
      'VAL_23-KA-9101-M01-39A:X.Value',
      'VAL_23-FZSL-92542:X.Value',
      'VAL_23-TIC-92504:Control Module:PP',
    ]);

    cy.getBySelector('group-by-pattern').children().click();

    cy.checkTableContent('quick-match-rules-table', [
      'L_D-L-D...',
      'L_D-L-D-LD-DL...',
    ]);
  });
});
