describe('Create interactive diagrams', () => {
  beforeEach(() => {
    cy.visitAndLoadPage();

    cy.getBySelector('create-new-interactive-diagrams-button').click();
    cy.ensurePageFinishedLoading();
  });

  describe('Step 1: Select engineering diagrams', () => {
    it('should render the step', () => {
      cy.assertElementWithTextExists(
        'breadcrumb-item',
        'Create interactive diagrams'
      );

      cy.getBySelector('create-interactive-diagrams-step').should(
        'have.length',
        4
      );
      cy.assertElementWithTextExists(
        'create-interactive-diagrams-step-title',
        'Select engineering diagrams'
      );
      cy.assertElementWithTextExists(
        'create-interactive-diagrams-step-title',
        'Link to...'
      );
      cy.assertElementWithTextExists(
        'create-interactive-diagrams-step-title',
        'Select model'
      );
      cy.assertElementWithTextExists(
        'create-interactive-diagrams-step-title',
        'Review results'
      );

      cy.assertElementWithTextExists(
        'step-title',
        'Select engineering diagrams'
      );
      cy.getBySelector('filter-bar').should('exist');
      cy.getBySelector('diagram-selection-table').should('exist');
      cy.assertElementWithTextExists('back-button', 'Back');
      cy.assertElementWithTextExists('next-button', 'Next step');
    });
  });

  describe('Step 2.1: Link to other engineering diagrams', () => {
    it('should navigate to and render this step', () => {
      cy.assertElementWithTextExists(
        'create-interactive-diagrams-step-title',
        'Link to...'
      )
        .click()
        .ensurePageFinishedLoading();

      cy.assertElementWithTextExists(
        'breadcrumb-item',
        'Create interactive diagrams'
      );

      cy.assertElementWithTextExists(
        'create-interactive-diagrams-sub-step-title',
        'Other engineering diagrams'
      );
      cy.assertElementWithTextExists(
        'create-interactive-diagrams-sub-step-title',
        'Assets'
      );

      cy.getBySelector('filter-bar').should('exist');
      cy.getBySelector('diagram-selection-table').should('exist');
      cy.assertElementWithTextExists('next-button', 'Next step');
      cy.assertElementWithTextExists('back-button', 'Back');
      cy.assertElementWithTextExists('skip-button', 'Skip');
    });
  });

  describe('Step 2.2: Link to assets', () => {
    it('should navigate to and render this step', () => {
      cy.assertElementWithTextExists(
        'create-interactive-diagrams-step-title',
        'Link to...'
      )
        .click()
        .ensurePageFinishedLoading();
      cy.assertElementWithTextExists(
        'create-interactive-diagrams-sub-step-title',
        'Assets'
      )
        .click()
        .ensurePageFinishedLoading();

      cy.assertElementWithTextExists(
        'breadcrumb-item',
        'Create interactive diagrams'
      );

      cy.assertElementWithTextExists(
        'create-interactive-diagrams-sub-step-title',
        'Other engineering diagrams'
      );
      cy.assertElementWithTextExists(
        'create-interactive-diagrams-sub-step-title',
        'Assets'
      );

      cy.assertElementWithTextExists('step-title', 'Link to assets');
      cy.getBySelector('filter-bar').should('exist');
      cy.getBySelector('diagram-selection-table').should('exist');
      cy.assertElementWithTextExists('back-button', 'Back');
      cy.assertElementWithTextExists('next-button', 'Next step');
    });
  });

  describe('Step 3: Select model', () => {
    it('should navigate to and render this step', () => {
      cy.assertElementWithTextExists(
        'create-interactive-diagrams-step-title',
        'Link to...'
      )
        .click()
        .ensurePageFinishedLoading();
      cy.assertElementWithTextExists(
        'create-interactive-diagrams-step-title',
        'Select model'
      )
        .click()
        .ensurePageFinishedLoading();

      cy.assertElementWithTextExists('step-title', 'Select model');
      cy.getBySelector('model-options').should('exist');
      cy.assertElementWithTextExists('back-button', 'Back');
      cy.assertElementWithTextExists('next-button', 'Next step');
    });
  });

  describe('Step 4: Review results', () => {
    it('should navigate to and render this step', () => {
      cy.assertElementWithTextExists(
        'create-interactive-diagrams-step-title',
        'Link to...'
      )
        .click()
        .ensurePageFinishedLoading();
      cy.assertElementWithTextExists(
        'create-interactive-diagrams-step-title',
        'Select model'
      )
        .click()
        .ensurePageFinishedLoading();
      cy.assertElementWithTextExists(
        'create-interactive-diagrams-step-title',
        'Review results'
      )
        .click()
        .ensurePageFinishedLoading();

      cy.assertElementWithTextExists('step-title', 'Run the model');

      cy.getBySelector('setup-summary').should('exist');
      cy.getBySelector('results-preview').should('exist');
      cy.getBySelector('section-progress').should('exist');

      cy.assertElementWithTextExists('back-button', 'Back');
      cy.assertElementWithTextExists('next-button', 'Done');
    });
  });
});
