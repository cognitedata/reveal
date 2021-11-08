import { t } from 'testcafe';

import App, { fileType, documentCategory, source } from '../../__pages__/App';
import { startTest, getNetworkLogger } from '../../utils';

const logger = getNetworkLogger();

fixture
  .skip('Search History')
  .meta({ page: 'history:search', tenant: App.project }) // Used to run a single test file
  .page(App.baseApp)
  .requestHooks(logger) // <-- log network requests
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());
  });

startTest(
  'Last search should be listed in search history immediately',
  async () => {
    const uniqueSearchPhrase = Math.random().toString(36).substr(2, 5);
    await App.documentSearchPage.searchAndApplyFilters(
      uniqueSearchPhrase,
      fileType,
      documentCategory,
      source
    );

    await App.sidebar.mainSearch.clickOnSearchInput();
    await App.sidebar.searchSuggesionPanelIsOpen();
    await App.sidebar.searchHistoryVisible(uniqueSearchPhrase);
  }
);

startTest('Search history get suggested', async () => {
  const uniqueSearchPhrase = Math.random().toString(36).substr(2, 5);
  await App.documentSearchPage.searchAndApplyFilters(
    uniqueSearchPhrase,
    fileType,
    documentCategory,
    source
  );

  await App.documentSearchPage.refreshPage();

  /**
   * Need to wait to page load so search input has search history loaded.
   */
  await t.wait(5000);

  await App.sidebar.mainSearch.clickOnSearchInput();
  await App.sidebar.searchSuggesionPanelIsOpen();
  await App.sidebar.searchHistoryVisible(uniqueSearchPhrase);
  await App.sidebar.clickSearchHistoryItem(uniqueSearchPhrase);

  await App.documentSearchPage.verifySearchPhraseAndFilters(
    uniqueSearchPhrase,
    fileType,
    documentCategory,
    source,
    true
  );
});
