describe('Relationships', () => {
  before(() => {
    cy.performEmptySearch();
    cy.selectSearchCategory('Asset');
  });

  it('Should navigate to relationships page', () => {
    const asset = 'WMT:23-FG-96103';
    const description = 'VRD - PH 1STSTG LUBE OIL RET';

    cy.performSearch(asset);
    cy.containsExact(asset).click();

    cy.findByTestId('page-header').containsExact('Asset').should('be.visible');
    cy.findByTestId('page-header').containsExact(asset).should('be.visible');
    cy.findByTestId('page-header')
      .containsExact(description)
      .should('be.visible');

    cy.findByText('Parent').should('be.visible');
    cy.findByText('Pressure').should('be.visible');
    cy.findByText('Specification').should('be.visible');

    cy.findByText('Properties').should('be.visible');
    cy.findByText('Children').should('be.visible');
    cy.findByText('Metrics').should('be.visible');
    cy.findByText('Documents').scrollIntoView().should('be.visible');
  });

  it('Should navigate to child relationships', () => {
    const asset = 'WMT:23-FG-96103';
    const child = 'WMT:23-TAH-96103';
    const description = 'SOFT TAG VRD - PH 1STSTG COMP THRUST BRG IN';

    cy.containsExact(child).click();

    cy.findByTestId('page-header').containsExact('Asset').should('be.visible');
    cy.findByTestId('page-header').containsExact(child).should('be.visible');
    cy.findByTestId('page-header')
      .containsExact(description)
      .should('be.visible');

    cy.getById('parent').findByText(asset).should('exist');
  });
});
