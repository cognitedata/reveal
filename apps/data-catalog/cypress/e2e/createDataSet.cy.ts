import { targetAppPackageName } from '../config';
import { getUrl } from '../utils/getUrl';

describe('Create DataSet', () => {
  let dataSetExternalId = `CypressTest${Date.now()}`;

  it('Can create new dataset', () => {
    cy.visit(getUrl());
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();

    // Click on create data set, wait for modal to be shown and fill in the form
    cy.getBySelector('create-data-set-button').click();
    cy.getBySelector('dataset-form-name-input').type(dataSetExternalId);
    cy.getBySelector('dataset-form-description-input').type(dataSetExternalId);

    cy.get('.dataset-form-advanced-options-accordion').should('exist').click();
    cy.getBySelector('dataset-form-external-id-input').type(dataSetExternalId);

    cy.getBySelector('create-new-dataset-button').click();
    cy.getCogsToast('success').should('exist');
  });

  it('Can edit created dataset', () => {
    cy.visit(getUrl('', `search="${dataSetExternalId}"`));
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();

    // Click on create data set, wait for modal to be shown and fill in the form
    cy.get('[data-cy=data-sets-table] tbody tr:first-child')
      .find('[data-cy=row-actions-menu-button]')
      .click();
    cy.getBySelector('row-action-edit').click();
    cy.getBySelector('dataset-form-name-input').should('be.visible');
    cy.getBySelector('dataset-form-name-input').should('not.be.disabled');
    // eslint-disable-next-line
    cy.wait(1000);
    cy.getBySelector('dataset-form-name-input').click();
    cy.getBySelector('dataset-form-name-input').type(
      dataSetExternalId + ' Updated'
    );

    cy.getBySelector('update-dataset-button').click();
  });

  it('Can archive dataset', () => {
    cy.visit(getUrl('', `search="${dataSetExternalId}"`));
    cy.ensureSpaAppIsLoaded(targetAppPackageName);
    cy.ensurePageFinishedLoading();

    // Click on create data set, wait for modal to be shown and fill in the form
    cy.get('[data-cy=data-sets-table] tbody tr:first-child')
      .find('[data-cy=row-actions-menu-button]')
      .click();
    cy.getBySelector('row-action-archive').click();
    cy.getCogsToast('success').should('exist');
  });
});
