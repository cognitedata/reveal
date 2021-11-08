import { t, Selector } from 'testcafe';

import { SEISMIC_NO_SURVEY_ERROR_MESSAGE } from '../../../src/modules/seismicSearch/constants';
import App from '../../__pages__/App';
import { progress, logErrors } from '../../utils';

fixture
  .skip('Search seismic page - map tests')
  .meta({ page: 'seismic:map', tenant: App.project }) // Used to run a single test file
  .page(App.baseApp)
  .afterEach(async () => {
    logErrors();
    await App.map.removeExsitingPolygons();
  });

test('Check map search - no results', async () => {
  progress('Navigating to the seismic search page');
  await t.expect(App.map).ok();

  await App.map.doLineSearch(App.map, {
    x: 35,
    y: 195,
    size: 0,
    offsetY: 150,
  });

  progress('Throw error about no surveys');
  await t
    .expect(Selector('div').withText(SEISMIC_NO_SURVEY_ERROR_MESSAGE).exists)
    .ok();

  progress('Click the delete icon to clear the line segment');
  await t.click(App.map.floatingDeleteButton);
});

test('Seismic search via a polygon - good case', async () => {
  await App.map.doPolygonSearch();
  await App.map.closeSearchDialog();
  await App.resultTable.clickRowWithNth(0);

  // progress('Double Click the first survey file to zoom in on the survey');
  // await t.doubleClick(App.resultTable.getNthNestedResult(1), {
  //   speed: 0.6,
  // });

  progress('Click the first survey file to select the survey');
  await t.click(App.resultTable.getNthNestedResult(0), {
    speed: 1,
    offsetX: 25,
  });

  // await App.map.closeSearchDialog();
  await App.map.doLineSearch(App.map, {
    x: 200,
    y: 0,
    size: 0,
    offsetY: 100,
  });

  progress('check the colour band button is there', true);
  await t.expect(App.seismicSearchPage.seismicColorbandButton.exists).ok();
  await t.click(App.seismicSearchPage.seismicColorbandButton, { speed: 0.6 });
  await t.click(App.seismicSearchPage.seismicColorbandButtonRed, {
    speed: 0.6,
  });
  await App.seismicSearchPage.closeSeismicModal();
});

test('Check map button interactions - Layers', async () => {
  await t.expect(App.map).ok();

  await t.expect(App.map.layerColumnsOpen.exists).notOk({ timeout: 500 });

  progress(`Click the 'Layers' button`);
  await t.click(App.map.layerButton);
  await t.expect(App.map.layerColumnsOpen.exists).ok();

  progress('Click the button again');
  await t.click(App.map.layerButton);

  progress('Layers should close', true);
  await t.expect(App.map.layerColumnsOpen.exists).notOk({ timeout: 500 });

  progress('Click the button again');
  progress('Layers should open', true);
  await t.click(App.map.layerButton);

  progress('Select the last checkbox');
  await t.click(App.map.layer1);

  // add test of checbox vis here?

  await App.map.closeSearchDialog();
  progress('Layers should close', true);
  await t.expect(App.map.layerColumnsOpen.exists).notOk({ timeout: 500 });
});

test('Check map button interactions - Assets', async () => {
  await t.expect(App.map).ok();

  progress('Click the third button `Assets`');
  await t.click(App.map.assetsButton);
  await t.click(App.map.assetsElement);
});

// -todo:
// -test('Check map button interactions - Licence search', async () => {
// });
