describe('Data model selection', () => {
  before(() => {
    cy.navigateToApp();
    cy.setupDataModelSelection();
  });

  it('should select single data model', () => {
    cy.clickIconButton('ChevronDown');
    cy.findByTestId('site-selection-menu').findByText('Custom').click();

    cy.clickButton('MovieDM');

    cy.clickButton('Continue');

    cy.selectDataModel({
      name: 'ICTestModel1',
      version: '1',
      space: 'ICTestModel1',
    });
    cy.confirmDataModelSelection();
  });

  it('should select multiple data models', () => {
    cy.clickButton('ICTestModel1');

    cy.clickButton('Continue');

    cy.selectDataModel({
      name: 'ICTestModel1',
      version: '1',
      space: 'ICTestModel1',
    });
    cy.selectDataModel({
      name: 'ICTestModel2',
      version: '1',
      space: 'ICTestModel2',
    });
    cy.confirmDataModelSelection();
  });
});
