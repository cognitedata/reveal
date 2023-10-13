describe('Create Pipeline', () => {
  beforeEach(() => {
    cy.visitAndLoadPage();
  });

  it('should able to create pipeline', () => {
    cy.createNewPipeline();

    /**1. Select source */
    cy.getBySelector('source-select-step').should('exist');
    cy.assertElementWithTextExists(
      'source-select-step-title',
      '1. Select source'
    );
    cy.getBySelector('source-select-step-sub-title').should('exist');

    cy.selectItem('data-type', 'Time series');
    cy.searchAndSelectOption('data-set-input', 'Entity Matching e2e');
    cy.selectAllResults();
    cy.navigateToNextStep();

    /**2. Select target assets */
    cy.getBySelector('target-select-step').should('exist');
    cy.assertElementWithTextExists(
      'target-select-step-title',
      '2. Select target assets'
    );
    cy.getBySelector('target-select-step-sub-title').should('exist');

    cy.searchAndSelectOption('data-set-input', 'Entity Matching e2e');
    cy.selectAllResults();

    cy.assertElementWithTextExists('back-button', 'Back');
    cy.navigateToNextStep();

    /**3. Configure pipeline
     * accept all the default settings
     */
    cy.getBySelector('pipeline-configure-step').should('exist');
    cy.assertElementWithTextExists(
      'pipeline-configure-step-title',
      '3. Configure pipeline'
    );

    cy.assertElementWithTextExists('back-button', 'Back');
    cy.navigateToNextStep();

    /**3.5 Details */
    cy.getBySelector('details-step').should('exist');
    cy.waitForPipelineRunCompletion('details-step');

    /**4. Review results */
    cy.getBySelector('pipeline-review-results-step').should('exist');
    cy.assertElementWithTextExists(
      'pipeline-review-results-step-title',
      '4. Review results'
    );

    cy.checkTableContent('pipeline-results-table', [
      'VAL_23-FT-96158:X.Value',
      'VAL_23-KA-9101-M01-39B:X.Value',
      'VAL_23-KA-9101-M01-39A:X.Value',
      'VAL_23-FZSL-92542:X.Value',
      'VAL_23-TIC-92504:Control Module:PP',
    ]);

    cy.getBySelector('group-by-pattern').children().click();

    cy.checkTableContent('pipeline-rules-table', [
      'L_D-L-D...',
      'L_D-L-D-LD-DL...',
    ]);
  });
  it('should confirm the creation and cleanup of a new pipeline with recent execution', () => {
    cy.assertElementWithTextExists('home-title', 'Entity Matching pipelines');

    cy.getBySelector('pipelines-table').within(() => {
      cy.get('tbody tr')
        .eq(0)
        .find('td')
        .eq(3)
        .invoke('text')
        .should((text) => {
          expect(text).to.include('a few seconds ago');
        });
      cy.get('tbody tr')
        .eq(0)
        .within(() => {
          cy.getBySelector('pipeline-actions').click();
          cy.getBySelector('pipeline-actions-delete').click();
        });
    });
    cy.getBySelector('pipeline-actions-delete-ok').click();
  });
});
