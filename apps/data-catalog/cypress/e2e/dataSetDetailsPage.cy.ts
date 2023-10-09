import { targetAppPackageName } from '../config';
import { getUrl } from '../utils/getUrl';

describe('Data Set Details page', () => {
  it('Can open DataSet Detals page', () => {
    cy.visit(getUrl('/data-set/463411032340937'));
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();
    cy.getBySelector('data-set-title')
      .should('exist')
      .contains(/UnitConversionFiles/);

    cy.getBySelector('basic-info-card-name').contains(/UnitConversionFiles/);

    cy.getBySelector('basic-info-card-dataset-id').contains(/463411032340937/);
  });
});
