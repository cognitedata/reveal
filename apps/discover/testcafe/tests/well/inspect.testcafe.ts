import { t } from 'testcafe';

import { WELLS_TAB_TITLE_KEY } from '../../../src/pages/authorized/search/constants';
import App, { wellDataSearchPhrase } from '../../__pages__/App';
import { deleteSavedSearches } from '../../fixtures/savedSearches';
import { startTest, getPostLogger, logErrors, progress } from '../../utils';

const loggerPost = getPostLogger();

fixture('Well inspect')
  .meta({ page: 'well:inspect', tenant: App.project }) // Used to run a single test file
  .page(App.baseApp)
  .before(async () => {
    await deleteSavedSearches();
  })
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());
    await App.navigateToResultsPage(WELLS_TAB_TITLE_KEY);
  })
  .requestHooks(loggerPost)
  .afterEach(() => logErrors());

startTest('Assessing inspect navigation tab', async () => {
  await App.wellInspectPage.inspectNthWell(0);
  await App.wellInspectPage.checkIfWellCountIsDisplayed(1);
  await App.wellInspectPage.checkIfWellboreCountIsDisplayed(2);
  await App.wellInspectPage.clickHideSidebarButton();
  await App.wellInspectPage.clickExpandSidebarButton();
});

startTest('Inspect single wellbore', async () => {
  await App.wellSearchPage.doSearch(wellDataSearchPhrase);
  await App.resultTable.clickRowWithNthCheckbox(0);
  await App.resultTable.clickRowWithNthButtonWithText(1, 'View');
  await App.wellInspectPage.checkIfWellInspectPageIsAvailable();
  await App.wellInspectPage.checkIfWellCountIsDisplayed(1);
  await App.wellInspectPage.checkIfWellboreCountIsDisplayed(1);
});

startTest('Resize sidebar', async () => {
  await App.wellInspectPage.inspectNthWell(0);

  await App.wellInspectPage.resizeInspectSidebarHorizontally(500);
  await App.wellInspectPage.checkIfSidebarWidthEqualsTo('maximum');

  await App.wellInspectPage.resizeInspectSidebarHorizontally(-500);
  await App.wellInspectPage.checkIfSidebarWidthEqualsTo('minimum');
});

startTest.skip('Trajectory wellbore select dropdown', async () => {
  await App.resultTable.selectAllRows();
  await App.wellSearchPage.clickWellInspectButton();
  await App.wellInspectPage.checkIfWellInspectPageIsAvailable();

  await App.wellInspectPage.goToTrajectories();

  progress('Need to select all option in the dropdown');
  await t.expect(App.wellInspectPage.wellboreDropdown.exists).ok();
  await t
    .expect(App.wellInspectPage.wellboreDropdown.textContent)
    .contains('Wellbores');
  await t
    .expect(App.wellInspectPage.wellboreDropdown.textContent)
    .contains('All');
  await t
    .expect(App.wellInspectPage.wellboreDropdown.textContent)
    .notContains('0');

  progress('Deselect the select all option');
  await t.click(App.wellInspectPage.wellboreDropdown);
  await t.click(App.wellInspectPage.selectAllOption('All'));

  progress('Change values to "wellbore 0"', true);
  await t.click(App.wellInspectPage.wellboreDropdown);
  await t
    .expect(App.wellInspectPage.wellboreDropdown.textContent)
    .contains('Wellbore');

  await t
    .expect(App.wellInspectPage.wellboreDropdown.textContent)
    .contains('0');
});

startTest.skip('Trajectory wellbore search from dropdown', async () => {
  await App.resultTable.selectAllRows();
  await App.wellSearchPage.clickWellInspectButton();
  await App.wellInspectPage.checkIfWellInspectPageIsAvailable();

  await App.wellInspectPage.goToTrajectories();

  progress('should contain more that two wellbores');
  await t.expect(App.wellInspectPage.wellboreDropdown.exists).ok();
  await t.click(App.wellInspectPage.wellboreDropdown);

  await t.expect(App.wellInspectPage.wellboreDropdownMenuItems.count).gt(2);

  progress('Do a empty search in the dropdown input');
  await App.wellInspectPage.doSearchInDropdown('search');
  progress('Should return no records', true);
  await t.expect(App.wellInspectPage.wellboreDropdownMenuItems.count).eql(0);

  progress('Do a search in the dropdown input');
  await App.wellInspectPage.doSearchInDropdown('Wellbore 19');
  progress('Should return at least one record', true);
  await t.expect(App.wellInspectPage.wellboreDropdownMenuItems.count).gt(0); // including select all
});

startTest.skip('Trajectory wellbore select all indeterminate', async () => {
  await App.resultTable.selectAllRows();
  await App.wellSearchPage.clickWellInspectButton();
  await App.wellInspectPage.checkIfWellInspectPageIsAvailable();

  await App.wellInspectPage.goToTrajectories();

  await t.expect(App.wellInspectPage.wellboreDropdown.exists).ok();
  await t.click(App.wellInspectPage.wellboreDropdown);

  progress('should select all the item in the begning');
  await t.expect(App.wellInspectPage.isIndeterminate('All')).notOk();

  progress('Do a search in the dropdown input');
  await App.wellInspectPage.doSearchInDropdown('Wellbore 19');

  progress('Select all option for search result');
  await t.click(App.wellInspectPage.selectAllOption('All'));

  progress('Select all should change to indeterminate state', true);
  await t.expect(App.wellInspectPage.isIndeterminate('All')).ok();
});

startTest.skip('Inspect Well Trajectories', async () => {
  await App.resultTable.selectAllRows();
  await App.wellSearchPage.clickWellInspectButton();
  await App.wellInspectPage.checkIfWellInspectPageIsAvailable();

  await App.wellInspectPage.goToTrajectories();
  await App.wellInspectPage.previewTrajectoryDataInCharts();

  await App.wellInspectPage.checkIfTrajectoryExists('NS vs EW');
  await App.wellInspectPage.checkIfTrajectoryExists('TVD vs NS');
  await App.wellInspectPage.checkIfTrajectoryExists('TVD vs EW');
  await App.wellInspectPage.checkIfTrajectoryExists('TVD vs ED');
  await App.wellInspectPage.checkIfTrajectoryExists('TVD 3D view');
});

startTest.skip(
  'Access inspect page by clicking well head View button',
  async () => {
    await App.resultTable.hoverRowWithNth(0);
    await App.resultTable.clickRowWithNthButtonWithText(0, 'View');
    await App.wellInspectPage.checkIfWellInspectPageIsAvailable();
  }
);

startTest.skip(
  'Access inspect page by clicking well bore View button',
  async () => {
    await App.resultTable.clickRowWithNth(1);
    await App.resultTable.clickRowWithNthButtonWithText(1, 'View');
    await App.wellInspectPage.checkIfWellInspectPageIsAvailable();
  }
);
