import { t } from 'testcafe';

import { WELLS_TAB_TITLE_KEY } from '../../../src/pages/authorized/search/constants';
import App from '../../__pages__/App';
import { deleteSavedSearches } from '../../fixtures/savedSearches';
import { startTest, logErrors } from '../../utils/utils';

fixture('Search wells page - map based testing')
  .meta({ page: 'well:map', tenant: App.tenant }) // Used to run a single test file
  .page(App.baseApp)
  .before(async () => {
    await deleteSavedSearches();
  })
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());
    await App.map.waitForMapRenders();
  })
  .afterEach(() => logErrors());

startTest('Display shortcut helper on polygon search', async () => {
  await App.map.clickDrawPolygonButton();
  await App.map.checkIfShortcutHelperExists();
});

startTest(
  'Cancel polygon search and hide shortcut helper on "Esc"',
  async () => {
    await App.map.drawPolygon();
    await App.map.checkIfShortcutHelperExists();
    await App.pressKey('esc');
    await App.map.checkIfShortcutHelperExists(false);
  }
);

startTest('Display edit mode helper', async () => {
  await App.map.drawPolygon();
  await App.map.checkIfShortcutHelperExists();
  await App.map.clickOnTheMap();
  await App.map.checkIfEditModeHelperExists();
});

startTest('Display confirmation message on leaving drawing mode', async () => {
  await App.map.clickDrawPolygonButton();
  await App.map.clickOutsideTheMap();
  await App.map.waitForConfirmationDialog();
  await App.map.exitDrawingMode();
});

startTest(
  'Display confirmation message on leaving incomplete search',
  async () => {
    await App.map.drawPolygon();
    await App.map.clickOutsideTheMap();
    await App.map.waitForConfirmationDialog();
  }
);

startTest('Display floating buttons on polygon select', async () => {
  await App.map.drawPolygon();
  await App.map.clickOnTheMap();
  await App.map.clickOnThePolygon();
  await App.map.checkIfFloatingButtonsAppears();
});

startTest('Accessing Well search via polygon', async () => {
  await App.map.doPolygonSearch();
  await App.wellSearchPage.clickSearchResultTab(WELLS_TAB_TITLE_KEY);
  await App.resultTable.hasResults();
});
