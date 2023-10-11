import { targetAppPackageName } from '../config';
import { getUrl } from '../utils/getUrl';

describe('Data Catalog page', () => {
  it('Data Catalog application can be opened', () => {
    cy.visit(getUrl());
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();
    cy.getBySelector('data-catalog-page-title')
      .should('exist')
      .contains(/Data Catalog/);
    cy.getBySelector('data-sets-table').should('exist');
    cy.getBySelector('create-data-set-button').should('exist');
  });

  it('Can search DataSets', () => {
    cy.visit(getUrl());
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();
    cy.getBySelector('data-sets-search-input').type('UnitConversionFiles');

    cy.get('[data-cy=data-sets-table] tbody tr')
      .its('length')
      .should('be.eq', 1);

    cy.get('[data-cy=data-sets-table] tbody tr > td:first-child').should(
      'contains.text',
      'UnitConversionFiles'
    );
  });
});
