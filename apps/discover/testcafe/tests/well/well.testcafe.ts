import { t } from 'testcafe';

import { WELLS_TAB_TITLE_KEY } from '../../../src/pages/authorized/search/constants';
import App, { wellDataSearchPhrase, source } from '../../__pages__/App';
import { startTest, getPostLogger, progress, logErrors } from '../../utils';

// There could be filters applied with existing records
// To trigger clear all button, make sure to do a empty records search

const loggerPost = getPostLogger();
const sourcePill = `Source : ${source.toLowerCase()}`;

fixture('Search wells page - text and filter based testing')
  .meta({ page: 'well:search', tenant: App.project }) // Used to run a single test file
  .page(App.baseApp)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());
    await App.navigateToResultsPage(WELLS_TAB_TITLE_KEY);
  })
  .requestHooks(loggerPost)
  .afterEach(() => logErrors());

startTest('accessing Well search via text input', async () => {
  await App.wellSearchPage.doSearch(wellDataSearchPhrase);

  progress('Search results should be shown in a table');
  const count = await App.resultTable.getResultsCount();
  progress(`Found: ${count}`);
  await t.expect(count).gte(2);

  await App.resultTable.clickRowWithNthCheckbox(0);
  await App.wellSearchPage.clickWellInspectButton();
});

startTest.skip('Accessing the wellbore table', async () => {
  await App.wellSearchPage.doSearch(wellDataSearchPhrase);

  progress('Wellbore table not available before selecting a row');
  await t
    .expect(App.wellSearchPage.firstwellboreResultTableRow.exists)
    .eql(false);

  await App.resultTable.clickRowWithNthCheckbox(0);

  progress('Should include welbore table');
  await t
    .expect(App.wellSearchPage.firstwellboreResultTableRow.exists)
    .eql(true);
});

startTest('Apply Column Settings', async () => {
  const columnName = 'Well';

  await App.wellSearchPage.doEmptySearch();
  await App.resultTable.checkIfColumnExistsAndDisplayIfNotExists(columnName);

  await App.resultTable.clickColumnSettingButton('Open');
  await App.resultTable.clickColumnSettingsOption(columnName);
  await App.resultTable.clickColumnSettingButton('Close');
  await App.resultTable.checkIfColumnExists(columnName, false);

  await App.resultTable.clickColumnSettingButton('Open');
  await App.resultTable.clickColumnSettingsOption(columnName);
  await App.resultTable.clickColumnSettingButton('Close');
  await App.resultTable.checkIfColumnExists(columnName, true);
});

startTest('apply source filter', async () => {
  const category = App.filterClearPage.dataSourceCaption;
  const columnName = 'Source';
  const filterOptionText = source;

  await App.resultTable.checkIfColumnExistsAndDisplayIfNotExists(columnName);
  await App.sidebar.clickFilterCategory('Wells');
  await App.sidebar.clickFilterSubCategory(category);
  await App.sidebar.clickFilterOption(filterOptionText);
});

startTest('Show empty results state and clear search value', async () => {
  const search = '12345';

  await App.wellSearchPage.doSearch(search);
  await App.resultTable.hasNoResults();
  await App.filterClearPage.checkIfTagExists(search);
  await App.filterClearPage.clearSearchInput();
  await App.resultTable.hasResults();
});

startTest.skip('Check the well card on the map', async () => {
  progress('select all the rows');
  await App.resultTable.selectAllRows();

  progress('click the 1st row');
  await t.click(App.resultTable.getRowWithNth(0), { speed: 0.5 });

  progress('click the 2nd row');
  await t.click(App.resultTable.getRowWithNth(1), { speed: 0.5 });

  progress('Click to expand the map');
  await t.click(App.wellSearchPage.expandMapButton, {
    offsetX: 30,
    offsetY: 100,
    speed: 0.5,
  });

  await t.click(App.map.mapZoomOut, { speed: 0.5 });

  await t.expect(App.map.layerButton.exists).ok({ timeout: 3000 });

  progress('Click on the map icon');
  await t.click(App.map.mapContainer, {
    offsetX: 736,
    offsetY: 379,
    speed: 0.5,
  });

  progress('Check buttons exists');

  await t.expect(App.wellSearchPage.wellPreviewCloseButton.exists).ok();
  await t.expect(App.wellSearchPage.wellFeedbackButton.exists).ok();
  await t.expect(App.wellSearchPage.wellCardViewButton.exists).ok();

  progress(`Open feedback modal`);
  await t.click(App.wellSearchPage.wellFeedbackButton);

  progress(`Cancel feedback modal`);
  await t.click(App.generalFeedbackDialog.cancelButton);

  progress(`Close well card`);
  await t.click(App.wellSearchPage.wellPreviewCloseButton);

  await t
    .expect(App.wellSearchPage.wellPreviewCloseButton.exists)
    .notOk({ timeout: 3000 });
});

startTest('preserve well tab between routes', async () => {
  await App.wellSearchPage.doSearch(wellDataSearchPhrase);

  await App.topbar.navigateToFavorites();

  /**
   * Not worrying if fav page finished loading or not. Just need to change the route.
   */
  await t.wait(3000);

  await App.topbar.navigateToSearch();

  progress('Well result tab should be active');
  await t
    .expect(App.wellSearchPage.wellTabElement.hasClass('rc-tabs-tab-active'))
    .eql(true);
});

startTest(
  `Apply well filters and see if filter tags are available, clear ${sourcePill}`,
  async () => {
    await App.wellSearchPage.doSearch(wellDataSearchPhrase);

    await App.sidebar.clickFilterCategory('Wells');
    await App.sidebar.clickFilterSubCategory(
      App.filterClearPage.dataSourceCaption
    );
    await App.sidebar.clickFilterOption(source);

    await App.sidebar.clickGoBackArrow();

    await App.sidebar.wellFilterTag.exists(sourcePill, true);

    await App.sidebar.wellFilterTag.clickRemove(sourcePill);

    await App.sidebar.wellFilterTag.exists(sourcePill, false);
  }
);

startTest(
  'Apply well filters and see if filter tags are available, clear all',
  async () => {
    await App.wellSearchPage.doSearch(wellDataSearchPhrase);

    await App.sidebar.clickFilterCategory('Wells');
    await App.sidebar.clickFilterSubCategory(
      App.filterClearPage.dataSourceCaption
    );
    await App.sidebar.clickFilterOption(source);

    await App.sidebar.clickGoBackArrow();

    await App.sidebar.wellFilterTag.exists(sourcePill, true);

    await App.sidebar.wellFilterTag.clickClearAll();

    await App.sidebar.wellFilterTag.exists(sourcePill, false);
  }
);

startTest(
  'Display selected wells and wellbores count in bulk action bar',
  async () => {
    await App.wellSearchPage.doSearch(wellDataSearchPhrase);

    await App.resultTable.clickCheckboxOfRowWithText('F-1');

    await t.wait(500);

    await App.resultTable.clickCheckboxOfRowWithText('F-10');

    progress('Check if the bulk action bar is visible');
    await t.expect(App.resultTable.bulkActionBar.exists).ok();

    const wellCountText = '2 wells selected';
    progress(
      `Check if the selected wells count is displayed: ${wellCountText}`
    );
    await t
      .expect(App.resultTable.getBulkActionText(wellCountText).exists)
      .ok();

    const wellBoreCount = 'With 5 wellbores inside';
    progress(
      `Check if the selected wellbores count is displayed as: ${wellBoreCount}`
    );
    await t
      .expect(App.resultTable.getBulkActionText(wellBoreCount).exists)
      .ok();

    await App.resultTable.clickRowWithText('F-10');
    await App.resultTable.clickCheckboxOfRowWithText('Wellbore F-10');

    const wellBoreCountFinal = 'With 4 wellbores inside';
    progress(
      `Check if the selected wellbores count is updated: ${wellBoreCountFinal}`
    );
    await t
      .expect(App.resultTable.getBulkActionText(wellBoreCountFinal).exists)
      .ok();
  }
);

startTest('Apply well filters and click clear button', async () => {
  await App.wellSearchPage.doSearch(wellDataSearchPhrase);

  await App.sidebar.clickFilterCategory('Wells');
  await App.sidebar.clickFilterSubCategory(
    App.filterClearPage.dataSourceCaption
  );
  await App.sidebar.clickFilterOption(source);

  await App.sidebar.clickGoBackArrow();

  await App.sidebar.wellFilterTag.exists(sourcePill, true);

  await App.sidebar.wellFilterTag.clickClearButton();

  await App.sidebar.wellFilterTag.exists(sourcePill, false);
});
