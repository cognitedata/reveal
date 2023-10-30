/**
 * We have site config for all the customers.
 * Hence the customers will not need to select data models.
 * So, we don't need to test data model selection as a smoke test.
 */
describe.skip('Data model selection', () => {
  after(() => {
    cy.clearSelectedDataModels();
    cy.setupSiteSelection();
  });

  it('should select single data model', () => {
    cy.clickIconButton('ChevronDown');
    cy.findByTestId('site-selection-menu').findByText('Custom').click();

    cy.selectDataModel({
      name: 'APM',
      version: '1',
      space: 'APM',
    });
    cy.confirmDataModelSelection();

    cy.contains('Custom').should('be.visible');
    cy.contains('APM').should('be.visible');
  });

  it('should select multiple data models', () => {
    cy.clickButton('APM');

    cy.clickButton('Continue');

    cy.selectDataModel({
      name: 'APM',
      version: '1',
      space: 'APM',
    });
    cy.selectDataModel({
      name: 'ApmSimple',
      version: '6',
      space: 'Tutorial_APM_Simple',
    });
    cy.confirmDataModelSelection();

    cy.contains('Custom').should('be.visible');
    cy.contains('APM, ApmSimple').should('be.visible');
  });
});
