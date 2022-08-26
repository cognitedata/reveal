import { interceptCoreNetworkRequests } from '../../support/commands/helpers';
import {
  STATIC_LOCATION_DOCUMENT,
  STATIC_LOCATION_WELL,
} from '../../support/constants';

const polygonWithNoResults = [
  { x: 100, y: 100 },
  { x: 300, y: 100 },
  { x: 200, y: 200 },
];
const polygonWithResults = [
  { x: 200, y: 200 },
  { x: 700, y: 200 },
  { x: 700, y: 300 },
  { x: 200, y: 300 },
];
const testPoints = [
  { x: 500, y: 500 },
  { x: 700, y: 700 },
  { x: 650, y: 300 },
];
const invalidPolygon = [
  { x: 500, y: 500 },
  { x: 1000, y: 500 },
  { x: 1000, y: 750 },
  { x: 750, y: 300 },
];

describe('Map', () => {
  beforeEach(() => {
    const coreRequests = interceptCoreNetworkRequests();
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.wait(coreRequests);
  });

  describe('Polygon search', () => {
    it('edit mode can be started and stopped in different ways', () => {
      cy.checkPolygonIsClosed();

      cy.enterPolygonEditMode();
      cy.findByTestId('finish-info-message').should('be.visible');
      cy.findByTestId('cancel-info-message').should('be.visible');
      cy.findByTestId('shortcut-helper').should('be.visible');

      // Close polygon tool by pressing ESC
      cy.closePolygonESC();
      cy.checkPolygonIsClosed();

      // Close by cancel button
      cy.enterPolygonEditMode();
      cy.closePolygonWithCancelButton();
      cy.checkPolygonIsClosed();

      // Close by pressing ENTER
      cy.enterPolygonEditMode();
      cy.drawPolygon([], 'enter');
      cy.checkPolygonIsClosed();

      // This is an edge case that was fixed. do not remove this test.
      // should see floating action buttons visible with one edge in bottom right
      cy.enterPolygonEditMode();
      cy.drawPolygon([...testPoints, 'bottomRight'], 'enter');
      cy.checkPolygonFloatingActionVisibility(true);
      cy.closePolygonWithCancelButton();

      // Close by pressing outside of map
      cy.enterPolygonEditMode();
      cy.closeByClickOutside();
      cy.checkPolygonIsClosed();

      //
      // now draw a polygon on the map and trigger search:
      //
      cy.enterPolygonEditMode();
      cy.drawPolygon(polygonWithNoResults, 'doubleClick');
      cy.checkPolygonFloatingActionVisibility(true);
      cy.deletePolygon();
      cy.checkPolygonFloatingActionVisibility();
      cy.closePolygonESC();
      cy.checkPolygonIsClosed();

      // draw invalid polygon search
      cy.enterPolygonEditMode();
      cy.drawPolygon(invalidPolygon, 'enter');
      cy.checkPolygonFloatingActionVisibility(true);
      cy.triggerPolygonSearch();
      cy.checkPolygonIsInvalid();
      cy.clickClearAllFilterButtonInNoResultDocumentsTable();
      cy.expandMap();
      cy.checkPolygonButtonIsVisible();
      cy.closePolygonESC();
      cy.closePolygonESC();
      cy.checkPolygonIsClosed();

      cy.enterPolygonEditMode();
      cy.drawPolygon(polygonWithResults, 'enter');
      cy.checkPolygonFloatingActionVisibility(true);
      cy.triggerPolygonSearch();

      cy.findByTestId('side-bar')
        .findAllByRole('button', {
          name: 'Custom Polygon',
        })
        .should('have.length', 2);

      cy.log('Check the document search is correct');
      cy.findByTestId('doc-result-table')
        .findByTitle(STATIC_LOCATION_DOCUMENT)
        .should('be.visible');

      cy.log('Check the well search is correct');
      cy.goToTab('Wells');
      cy.findByTestId('well-result-table')
        .findByTitle(STATIC_LOCATION_WELL)
        .should('be.visible');

      cy.log('Click clear all button in wells table and check the result');
      cy.clickClearAllFilterButtonInWellsTable();
      cy.findByTestId('wellbore-result-table')
        .findAllByTestId('table-row')
        .should('have.length.above', 1);

      cy.expandMap();
      cy.checkPolygonButtonIsVisible();
    });
  });

  describe('Controls', () => {
    it('should show and hide controls based on table width', () => {
      cy.checkPolygonButtonIsVisible();
      // cy.checkMapInputIsVisible(); // removed feature till there is better test data
      // cy.checkAssetsMenuButtonIsVisible(); // removed feature
      cy.checkLayersMenuButtonIsVisible();
      cy.checkZoomControlsAreVisible();

      cy.expandResultTable();

      cy.checkPolygonButtonIsNotVisible();
      // cy.checkMapInputIsNotVisible();
      // cy.checkAssetsMenuButtonIsNotVisible();
      cy.checkLayersMenuButtonIsNotVisible();
      cy.checkZoomControlsAreNotVisible();

      cy.dragResultsTable(-20);
      cy.checkPolygonButtonIsNotVisible();
      // cy.checkMapInputIsNotVisible();
      // cy.checkAssetsMenuButtonIsNotVisible();
      cy.checkLayersMenuButtonIsNotVisible();
      cy.checkZoomControlsAreVisible();

      cy.dragResultsTable(-100);
      cy.checkPolygonButtonIsNotVisible();
      // cy.checkMapInputIsNotVisible();
      // cy.checkAssetsMenuButtonIsNotVisible();
      cy.checkLayersMenuButtonIsVisible();
      cy.checkZoomControlsAreVisible();

      cy.dragResultsTable(-100);
      cy.checkPolygonButtonIsNotVisible();
      // cy.checkMapInputIsNotVisible();
      // cy.checkAssetsMenuButtonIsVisible();
      cy.checkLayersMenuButtonIsVisible();
      cy.checkZoomControlsAreVisible();

      cy.dragResultsTable(-400);
      cy.checkPolygonButtonIsVisible();
      // cy.checkMapInputIsVisible(); // removed feature
      // cy.checkAssetsMenuButtonIsVisible(); // removed feature
      cy.checkLayersMenuButtonIsVisible();
      cy.checkZoomControlsAreVisible();
    });
  });
});
