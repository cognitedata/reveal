import { EXPAND_MAP_TEXT } from '../../../src/pages/authorized/search/map/constants';

const CANCEL_POLYGON_BUTTON = 'Cancel polygon search';

type Coordinate =
  | {
      x?: number;
      y?: number;
    }
  | 'bottom'
  | 'bottomRight'
  | 'bottomLeft'
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'left'
  | 'center'
  | 'right';

export type MapPoints = {
  points?: Coordinate[];
  click?: {
    enter?: boolean;
    esc?: boolean;
  };
};

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
  points: Coordinate[],
  acceptMode?: 'doubleClick' | 'enter' | 'esc'
) => {
  cy.log('Draw the polygon');
  cy.findAllByRole('region').first().as('map').should('be.visible');

  points.forEach((point, index) => {
    if (typeof point === 'string') {
      cy.get('@map').click(point, { force: true });
    } else {
      cy.get('@map').click(point.x, point.y, { force: true });
    }

    if (index + 1 === points.length && acceptMode === 'doubleClick') {
      if (typeof point === 'string') {
        cy.get('@map').dblclick(point);
        return;
      }
      cy.get('@map').dblclick(point.x, point.y);
    }
  });

  if (acceptMode && acceptMode !== 'doubleClick') {
    cy.get('@map').type(`{${acceptMode}}`);
  }
};

const checkPolygonFloatingActionsAreVisible = (assertion?: boolean) => {
  cy.log(`Check polygon action buttons are ${assertion ? '' : 'not'} visible`);
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

const checkClickOnPolygonToEditIsVisible = () => {
  cy.log('Check click on the polygon to edit info icon');
  cy.findByTestId('edit-info-message').should('be.visible');
};

Cypress.Commands.add('enterPolygonEditMode', enterPolygonEditMode);
Cypress.Commands.add('checkPolygonIsClosed', checkPolygonIsClosed);
Cypress.Commands.add('closePolygonESC', closePolygonESC);
Cypress.Commands.add(
  'closePolygonWithCancelButton',
  closePolygonWithCancelButton
);
Cypress.Commands.add('closePolygonENTER', closePolygonENTER);
Cypress.Commands.add('drawPolygon', drawPolygon);
Cypress.Commands.add(
  'checkPolygonFloatingActionsAreVisible',
  checkPolygonFloatingActionsAreVisible
);
Cypress.Commands.add('deletePolygon', deletePolygon);
Cypress.Commands.add('triggerPolygonSearch', triggerPolygonSearch);
Cypress.Commands.add('closeByClickOutside', closeByClickOutside);
Cypress.Commands.add(
  'checkZoomControlsAreVisible',
  checkZoomControlsAreVisible
);
Cypress.Commands.add(
  'checkZoomControlsAreNotVisible',
  checkZoomControlsAreNotVisible
);
Cypress.Commands.add(
  'checkPolygonButtonIsVisible',
  checkPolygonButtonIsVisible
);
Cypress.Commands.add(
  'checkPolygonButtonIsNotVisible',
  checkPolygonButtonIsNotVisible
);
Cypress.Commands.add('checkMapInputIsVisible', checkMapInputIsVisible);
Cypress.Commands.add('checkMapInputIsNotVisible', checkMapInputIsNotVisible);
Cypress.Commands.add(
  'checkAssetsMenuButtonIsVisible',
  checkAssetsMenuButtonIsVisible
);
Cypress.Commands.add(
  'checkAssetsMenuButtonIsNotVisible',
  checkAssetsMenuButtonIsNotVisible
);
Cypress.Commands.add(
  'checkLayersMenuButtonIsVisible',
  checkLayersMenuButtonIsVisible
);
Cypress.Commands.add(
  'checkLayersMenuButtonIsNotVisible',
  checkLayersMenuButtonIsNotVisible
);
Cypress.Commands.add('dragResultsTable', dragResultsTable);
Cypress.Commands.add(
  'checkClickOnPolygonToEditIsVisible',
  checkClickOnPolygonToEditIsVisible
);

Cypress.Commands.add('expandMap', () => {
  cy.log('Expand map');
  cy.findByText(EXPAND_MAP_TEXT).click();
});

export interface MapCommands {
  expandMap(): void;
  enterPolygonEditMode(): void;
  checkPolygonIsClosed(): void;
  closePolygonESC(): void;
  closePolygonWithCancelButton(): void;
  closePolygonENTER(): void;
  drawPolygon(
    points: Coordinate[],
    acceptMode?: 'doubleClick' | 'enter' | 'esc'
  ): void;
  checkPolygonFloatingActionsAreVisible(assertion?: boolean): void;
  deletePolygon(): void;
  triggerPolygonSearch(): void;
  closeByClickOutside(): void;
  checkZoomControlsAreVisible(): void;
  checkZoomControlsAreNotVisible(): void;
  checkPolygonButtonIsVisible(): void;
  checkPolygonButtonIsNotVisible(): void;
  checkMapInputIsVisible(): void;
  checkMapInputIsNotVisible(): void;
  checkAssetsMenuButtonIsVisible(): void;
  checkAssetsMenuButtonIsVisible(): void;
  checkAssetsMenuButtonIsNotVisible(): void;
  checkLayersMenuButtonIsVisible(): void;
  checkLayersMenuButtonIsNotVisible(): void;
  dragResultsTable(offset: number): void;
  checkClickOnPolygonToEditIsVisible(): void;
}
