import { t } from 'testcafe';

import App from '../../__pages__/App';
import { startTest, logErrors, progress } from '../../utils';

fixture('map interface')
  .meta({ page: 'map', tenant: App.tenant }) // Used to run a single test file
  .page(App.baseUrl)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());
    await App.map.waitForMapRenders();
  })
  .afterEach(async () => logErrors());

startTest('Zoom in/out', async () => {
  progress(`Zoom in`);
  await t.click(App.map.mapZoomIn);

  progress(`Zoom out`);
  await t.click(App.map.mapZoomOut);
});

startTest('Check that elements on the map disappear', async () => {
  const {
    miniMap,
    drawPolygonButtonContainer,
    assetsButtonContainer,
    mapZoomIn,
    layerButtonContainer,
  } = App.map;

  /**
   * Ideally you would never want to check on className, but .visible or
   * filterVisible doesn't cut it here because Testcafe doesn't see elements with
   * opacity: 0 as invisible. From the documentation:
   *
   * The elements that do not have display: none or visibility: hidden CSS
   * properties and have non-zero width and height are considered visible.
   *
   * source: https://testcafe.io/documentation/402751/reference/test-api/selector/filtervisible
   *
   * The reason that opacity is used in these elements in stead of just not rendering them,
   * is that we need to be able to calculate their position at all times, also when they
   * are invisible. The IntersectionObserver takes care of this, but it can't do that
   * with elements that don't exist, or that removed from the DOM by visibiltiy: hidden or
   * display: none.
   *
   * Any other ideas are welcome here, but for now this is the solution I found.
   *
   * - Ronald
   */

  progress('Check that the elements are visible');
  await t.expect(layerButtonContainer.classNames).notContains('isHidden');
  await t.expect(assetsButtonContainer.classNames).notContains('isHidden');
  await t.expect(drawPolygonButtonContainer.classNames).notContains('isHidden');

  await t.expect(mapZoomIn.exists).ok();
  await t.expect(miniMap.exists).ok();

  progress('Open the search results');
  await App.navigateToResultsPage('Documents');

  progress('Check that the elements disappear');
  await t.expect(layerButtonContainer.classNames).contains('isHidden');
  await t.expect(assetsButtonContainer.classNames).contains('isHidden');
  await t.expect(drawPolygonButtonContainer.classNames).contains('isHidden');

  await t.expect(mapZoomIn.exists).notOk();
  await t.expect(miniMap.exists).notOk();

  progress('Make the map 20px bigger');
  await t.drag(App.documentSearchPage.resizeIcon, -20, 0);

  progress('Check that only the zoom controls become visible');
  await t.expect(layerButtonContainer.classNames).contains('isHidden');
  await t.expect(assetsButtonContainer.classNames).contains('isHidden');
  await t.expect(drawPolygonButtonContainer.classNames).contains('isHidden');

  await t.expect(mapZoomIn.exists).ok();
  await t.expect(miniMap.exists).notOk();

  progress('Make the map 100px bigger');
  await t.drag(App.documentSearchPage.resizeIcon, -100, 0);

  progress('Check that the layers button becomes visible');
  await t.expect(layerButtonContainer.classNames).notContains('isHidden');
  await t.expect(assetsButtonContainer.classNames).contains('isHidden');
  await t.expect(drawPolygonButtonContainer.classNames).contains('isHidden');

  await t.expect(mapZoomIn.exists).ok();
  await t.expect(miniMap.exists).notOk();

  progress('Make the map 100px bigger');
  await t.drag(App.documentSearchPage.resizeIcon, -100, 0);

  progress('Check that the assets button becomes visible');
  await t.expect(layerButtonContainer.classNames).notContains('isHidden');
  await t.expect(assetsButtonContainer.classNames).notContains('isHidden');
  await t.expect(drawPolygonButtonContainer.classNames).contains('isHidden');

  await t.expect(mapZoomIn.exists).ok();
  await t.expect(miniMap.exists).notOk();

  progress('Make the map 400px bigger');
  await t.drag(App.documentSearchPage.resizeIcon, -400, 0);

  progress('Check that the Polygon button and minimap become visible');
  await t.expect(layerButtonContainer.classNames).notContains('isHidden');
  await t.expect(assetsButtonContainer.classNames).notContains('isHidden');
  await t.expect(drawPolygonButtonContainer.classNames).notContains('isHidden');

  await t.expect(mapZoomIn.exists).ok();
  await t.expect(miniMap.exists).ok();
});
