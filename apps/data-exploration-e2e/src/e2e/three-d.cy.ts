import { THREED_NAME, THREED_ID } from '../support/constant';
import {
  FILES_SEARCH_ALIAS,
  interceptFilesSearch,
} from '../support/interceptions/interceptions';

describe('3D', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();
  });

  beforeEach(() => {
    interceptFilesSearch();
  });

  it('should go to 3D tab ', () => {
    cy.goToTab('3D');
    cy.wait(`@${FILES_SEARCH_ALIAS}`);
    cy.tableContentShouldBeVisible('3d-model-table');
  });

  it('should be able to view 3D model', () => {
    cy.performSearch(THREED_NAME);

    cy.getTableById('3d-model-table')
      .contains(THREED_NAME)
      .should('be.visible')
      .click();

    cy.url().should('include', 'threeD');
    cy.url().should('include', THREED_ID);

    cy.goBack();
    cy.findByTestId('3d-model-table').should('be.visible');
  });
});
