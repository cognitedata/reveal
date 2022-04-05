import { EXPAND_SEARCH_RESULTS_TEXT } from '../../../src/pages/authorized/search/map/constants';
import {
  STATIC_LOCATION_DOCUMENT,
  STATIC_LOCATION_WELL,
} from '../../support/constants';

describe('Map', () => {
  before(() => {
    cy.visit(Cypress.env('BASE_URL'));
    cy.login();
    cy.acceptCookies();

    cy.wait(2000); // give the map time to render
  });

  const CANCEL_POLYGON_BUTTON = 'Cancel polygon search';
  const enterPolygonEditMode = () => {
    cy.log('Enter edit mode by pressing "Polygon tool" button');
    cy.findByRole('button', { name: /freedraw button/i }).click();
  };

  const checkPolygonIsClosed = () => {
    cy.log('Check that helper buttons are not visible');
    cy.findByTestId('shortcut-helper').should('not.exist');
  };

  const closePolygonESC = () => {
    cy.log('Close polygon tool by pressing ESC');
    cy.get('body').type('{esc}');
  };

  const closePolygonWithCancelButton = () => {
    cy.log(`Close polygon tool by "${CANCEL_POLYGON_BUTTON}" button`);
    cy.findByText(CANCEL_POLYGON_BUTTON).click();
  };

  const closePolygonENTER = () => {
    cy.log('Close polygon tool by pressing ENTER');
    cy.findAllByRole('region').first().type('{enter}');
  };

  const drawPolygon = (
    points: { x: number; y: number }[],
    acceptMode: 'doubleClick' | 'enter' = 'doubleClick'
  ) => {
    cy.log('Draw the polygon');
    cy.findAllByRole('region').first().as('map').should('be.visible');

    points.forEach((point, index) => {
      cy.get('@map').click(point.x, point.y);

      if (index + 1 === points.length) {
        if (acceptMode === 'doubleClick') {
          cy.get('@map').dblclick(point.x, point.y);
        }

        if (acceptMode === 'enter') {
          cy.get('@map').type('{enter}');
        }
      }
    });
  };

  const checkPolygonFloatingActionsAreVisible = (assertion?: boolean) => {
    cy.log(
      `Check polygon action buttons are ${assertion ? '' : 'not'} visible`
    );
    cy.findByTestId('map-container')
      .findByRole('button', {
        name: /search/i,
      })
      .should(`${assertion ? '' : 'not.'}exist`);

    cy.findByTestId('map-container')
      .findByRole('button', {
        name: /delete/i,
      })
      .should(`${assertion ? '' : 'not.'}exist`);
  };

  const deletePolygon = () => {
    console.log('Delete polygon py pressing "X" action button');
    cy.findByTestId('map-container')
      .findByRole('button', {
        name: /delete/i,
      })
      .should('be.visible')
      .click();
  };

  const triggerPolygonSearch = () => {
    cy.log('Trigger polygon search by pressing "Search" button');
    cy.findByTestId('map-container')
      .findByRole('button', {
        name: /search/i,
      })
      .should('be.visible')
      .click();
  };

  const closeByClickOutside = () => {
    cy.log('Click on Discover logo');
    cy.findByTestId('cognite-logo').click();
    cy.findByText('Exit polygon mode and delete the polygon?').should(
      'be.visible'
    );
    cy.findByRole('button', { name: 'Exit & delete' }).click();
  };

  const checkZoomControlsAreVisible = () => {
    cy.log('Check zoom controls are visible');
    cy.findByRole('button', { name: 'Zoom out' }).should('be.visible');
    cy.findByRole('button', { name: 'Zoom in' }).should('be.visible');
  };

  const checkZoomControlsAreNotVisible = () => {
    cy.log('Check zoom controls are visible');
    cy.findByRole('button', { name: 'Zoom out' }).should('not.exist');
    cy.findByRole('button', { name: 'Zoom in' }).should('not.exist');
  };

  const checkPolygonButtonIsVisible = () => {
    cy.log('check polygon button is visible');
    cy.findByRole('button', { name: /freedraw button/i }).should('be.visible');
  };

  const checkPolygonButtonIsNotVisible = () => {
    cy.log('check polygon button is not visible');
    cy.findByRole('button', { name: /freedraw button/i }).should(
      'not.be.visible'
    );
  };

  const checkMapInputIsVisible = () => {
    cy.log('check map input is visible');
    cy.findByTestId('map-input-search').should('be.visible');
  };

  const checkMapInputIsNotVisible = () => {
    cy.log('check map input is not visible');
    cy.findByTestId('map-input-search').should('not.be.visible');
  };

  const checkAssetsMenuButtonIsVisible = () => {
    cy.log('check assets menu button is visible');
    cy.findByRole('button', { name: 'Map Assets' }).should('be.visible');
  };

  const checkAssetsMenuButtonIsNotVisible = () => {
    cy.log('check assets menu button is not visible');
    cy.findByRole('button', { name: 'Map Assets' }).should('not.be.visible');
  };

  const checkLayersMenuButtonIsVisible = () => {
    cy.log('check layers menu button is visible');
    cy.findByRole('button', { name: 'Layers' }).should('be.visible');
  };

  const checkLayersMenuButtonIsNotVisible = () => {
    cy.log('check layers menu button is not visible');
    cy.findByRole('button', { name: 'Layers' }).should('not.be.visible');
  };

  const dragResultsTable = (offset: number) => {
    cy.log(`Dragging results table, offset: ${offset}`);
    cy.findByTestId('resize-handle-horizontal').then((el) => {
      const positionX = el[0].getBoundingClientRect().x;
      cy.wrap(el)
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientX: positionX + offset })
        .trigger('mouseup', { force: true });
    });
  };

  describe('Polygon search', () => {
    it('edit mode can be started and stopped in different ways', () => {
      checkPolygonIsClosed();

      enterPolygonEditMode();
      cy.findByTestId('finish-info-message').should('be.visible');
      cy.findByTestId('cancel-info-message').should('be.visible');
      cy.findByTestId('shortcut-helper').should('be.visible');

      // Close polygon tool by pressing ESC
      closePolygonESC();
      checkPolygonIsClosed();

      // Close by cancel button
      enterPolygonEditMode();
      closePolygonWithCancelButton();
      checkPolygonIsClosed();

      // Close by pressing ENTER
      enterPolygonEditMode();
      closePolygonENTER();
      checkPolygonIsClosed();

      // Close by pressing outside of map
      enterPolygonEditMode();
      closeByClickOutside();
      checkPolygonIsClosed();
    });

    it('allows us to draw a polygon on the map and trigger search', () => {
      enterPolygonEditMode();
      drawPolygon([
        { x: 100, y: 100 },
        { x: 300, y: 100 },
        { x: 200, y: 200 },
      ]);
      checkPolygonFloatingActionsAreVisible(true);
      deletePolygon();
      checkPolygonFloatingActionsAreVisible();

      drawPolygon(
        [
          { x: 600, y: 200 },
          { x: 700, y: 200 },
          { x: 650, y: 300 },
        ],
        'enter'
      );
      checkPolygonFloatingActionsAreVisible(true);
      triggerPolygonSearch();

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
    });
  });

  describe('Controls', () => {
    before(() => {
      cy.findByTestId('cognite-logo').click();
    });

    it('should show and hide controls based on table width', () => {
      checkPolygonButtonIsVisible();
      checkMapInputIsVisible();
      checkAssetsMenuButtonIsVisible();
      checkLayersMenuButtonIsVisible();
      checkZoomControlsAreVisible();

      cy.log('expand search results');
      cy.findByText(EXPAND_SEARCH_RESULTS_TEXT).click();

      checkPolygonButtonIsNotVisible();
      checkMapInputIsNotVisible();
      checkAssetsMenuButtonIsNotVisible();
      checkLayersMenuButtonIsNotVisible();
      checkZoomControlsAreNotVisible();

      dragResultsTable(-20);
      checkPolygonButtonIsNotVisible();
      checkMapInputIsNotVisible();
      checkAssetsMenuButtonIsNotVisible();
      checkLayersMenuButtonIsNotVisible();
      checkZoomControlsAreVisible();

      dragResultsTable(-100);
      checkPolygonButtonIsNotVisible();
      checkMapInputIsNotVisible();
      checkAssetsMenuButtonIsNotVisible();
      checkLayersMenuButtonIsVisible();
      checkZoomControlsAreVisible();

      dragResultsTable(-100);
      checkPolygonButtonIsNotVisible();
      checkMapInputIsNotVisible();
      checkAssetsMenuButtonIsVisible();
      checkLayersMenuButtonIsVisible();
      checkZoomControlsAreVisible();

      dragResultsTable(-400);
      checkPolygonButtonIsVisible();
      checkMapInputIsVisible();
      checkAssetsMenuButtonIsVisible();
      checkLayersMenuButtonIsVisible();
      checkZoomControlsAreVisible();
    });
  });
});
