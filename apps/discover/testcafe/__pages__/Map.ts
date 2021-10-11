import { screen } from '@testing-library/testcafe';
import { t, Selector } from 'testcafe';

import { progress } from '../utils';

import App from './App';

export const startingX = 250;
export const startingY = 100;
export const boxWidth = 600;
export const boxHeight = 450;

const MAP_CANVAS_DEFAULT_WIDTH = '800';

class Map {
  public readonly mapCanvas = Selector('canvas').withAttribute(
    'class',
    'mapboxgl-canvas'
  );

  drawPolygonButton = Selector('[data-testid="freedraw-button"]');

  drawPolygonButtonContainer = this.drawPolygonButton.parent().parent();

  floatingSearchButton = Selector('[data-testid="floating-search-button"]');

  floatingDeleteButton = Selector('[data-testid="floating-delete-button"]');

  mapZoomIn = Selector('[data-testid="map-zoom-in"]');

  mapZoomOut = Selector('[data-testid="map-zoom-out"]');

  mapContainer = Selector('[data-testid="map-container"]');

  layerColumnsOpen = Selector('[data-testid="columns-panel-open"]');

  layerButton = Selector('[data-testid="map-button-layers"]');

  layerButtonContainer = this.layerButton.parent().parent().parent();

  layer1 = Selector('[data-testid="layer-fields"]');

  assetsButton = Selector('[data-testid="map-button-assets"]');

  assetsButtonContainer = this.assetsButton.parent().parent().parent();

  assetsElement = Selector('[data-testid="asset-FRØY"]');

  shortcutHelper = Selector('[data-testid="shortcut-helper"]');

  editModeHelper = Selector('[data-testid="edit-info-message"]');

  miniMap = Selector('#mapboxgl-minimap');

  drawingModeLeaveConfirmation = Selector(
    '[data-testid="drawing-mode-leave-confirmation"]'
  );

  waitForMapRenders = async () => {
    progress('Wait for map canvas renders');
    // await t
    //   .expect(this.mapCanvas.getAttribute('width'))
    //   .notEql(MAP_CANVAS_DEFAULT_WIDTH, { timeout: 20000 });
    await t.wait(1000);
  };

  closeSearchDialog = async () => {
    progress('Click off to the side to close search dialog');
    await t.click(this.layerButton as Selector, {
      offsetX: startingX - 20,
      offsetY: startingY - 20,
      speed: 0.5,
    });
  };

  drawPolygon = async () => {
    await this.removeExsitingPolygons();

    progress('Click on the draw polygon button');
    await t.click(this.drawPolygonButton);

    progress('Click four times to make a square');
    await t.click(this.mapContainer, {
      offsetX: startingX,
      offsetY: startingY,
      speed: 0.7, // gives map time to render
    });

    await t.click(this.mapContainer, {
      offsetX: startingX + boxWidth,
      offsetY: startingY,
      speed: 0.8,
    });

    await t.click(this.mapContainer, {
      offsetX: startingX + boxWidth,
      offsetY: startingY + boxHeight,
      speed: 0.8,
    });

    await t.click(this.mapContainer, {
      offsetX: startingX,
      offsetY: startingY + boxHeight,
      speed: 0.8,
    });

    progress('Double click last item to open search options');
    await t.click(this.mapContainer, {
      offsetX: startingX,
      offsetY: startingY + boxHeight,
      speed: 0.5,
    });
  };

  doPolygonSearch = async () => {
    progress('Do polygon search');
    progress('Start drawing polygon', true);
    await this.drawPolygon();

    progress('Click the search icon to trigger the polygon search', true);
    await t.click(this.floatingSearchButton);
  };

  doLineSearch = async (
    page: any,
    {
      x = 0,
      y = 0,
      size = 30,
      offsetX = 0,
      offsetY = 0,
    }: {
      x?: number;
      y?: number;
      size?: number;
      offsetX?: number;
      offsetY?: number;
    } = {}
  ) => {
    progress('Click the draw line button');
    await t.click(page.drawLine, { speed: 0.6 });

    progress('Click twice to make a line');

    // factor in sidebar width, now that search results are showing it moves the map
    const startingLineXOffset = startingX + x;
    const startingLineYOffset = startingY + y + 200;

    await t.click(page.mapContainer, {
      offsetX: startingLineXOffset,
      offsetY: startingLineYOffset,
      speed: 0.6,
    });

    await t.doubleClick(page.mapContainer, {
      offsetX: startingLineXOffset - size + offsetX,
      offsetY: startingLineYOffset + size + offsetY,
      speed: 0.6,
    });

    progress('Click the search icon to trigger the polygon search');
    await t.click(page.floatingSearchButton);
  };

  removeExsitingPolygons = async () => {
    progress('Remove any existing polygons');
    if (await this.floatingDeleteButton.exists) {
      await t.click(this.floatingDeleteButton);
    }
  };

  clickDrawPolygonButton = async () => {
    progress('Click on the draw polygon button');
    await t.click(this.drawPolygonButton);
  };

  checkIfShortcutHelperExists = async (exists = true) => {
    progress('Shortcut helper should be displayed');
    await t.expect(this.shortcutHelper.exists).eql(exists);
  };

  clickOnTheMap = async () => {
    progress('Click on map free area');
    await t.click(this.mapContainer, {
      offsetX: 10,
      offsetY: 10,
      speed: 0.7, // gives map time to render
    });
  };

  clickOnThePolygon = async () => {
    progress('Click on the polygon');
    await t.click(this.mapContainer, {
      offsetX: startingX + boxWidth / 2,
      offsetY: startingY + boxHeight / 2,
      speed: 0.8,
    });
  };

  clickOutsideTheMap = async () => {
    progress('Click outside the map');
    await t.click(App.topbar.topbar);
  };

  waitForConfirmationDialog = async () => {
    progress('Wait for confirmation dialog');
    await t.expect(this.drawingModeLeaveConfirmation.exists).ok();
  };

  exitDrawingMode = async () => {
    progress('Exit drawing mode');
    await t.click(await screen.findByText('Exit & delete'));
  };

  checkIfFloatingButtonsAppears = async () => {
    progress('Check if the floating buttons appears');
    await t.expect(this.floatingSearchButton.exists).eql(true);
  };

  checkIfEditModeHelperExists = async () => {
    progress('Edit mode helper should be displayed');
    await t.expect(this.editModeHelper.exists).ok();
  };
}

export default new Map();
