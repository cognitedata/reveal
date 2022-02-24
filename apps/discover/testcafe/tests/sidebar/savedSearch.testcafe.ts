import { t } from 'testcafe';

import { REGION_FIELD_BLOCK } from '../../../src/modules/wellSearch/constantsSidebarFilters';
import App from '../../__pages__/App';
import { deleteSavedSearches } from '../../fixtures/savedSearches';
import {
  startTest,
  getNetworkLogger,
  logNetworkLoggerResults,
} from '../../utils';

const logger = getNetworkLogger('', {
  logRequestBody: false,
  logRequestHeaders: true,
  stringifyRequestBody: false,

  stringifyResponseBody: false,
  logResponseHeaders: false,
  logResponseBody: false,
});

const savedSearchName = 'TEST_SAVED_SEARCH';
const savedSearchNameWells = 'TEST_SAVED_SEARCH_WELLS';
const savedSearchNameEmpty = 'empty-via-save-button';
const savedSearchNameDocumentsOnly = 'TEST_SAVED_SEARCH_DOCUMENTS_ONLY';
const savedSearchNameWellsOnly = 'TEST_SAVED_SEARCH_WELLS_ONLY';

/*
 * THIS FILE IS FOR DEALING WITH SAVED SEARCHES FROM THE SEARCH PAGE ONLY
 *
 * for saved searches from the 'Favorites' page, use the 'favories/savedSearches.testcafe.ts' file
 *
 */
fixture
  .skip('Saved searches')
  .meta({ page: 'savedSearches', tenant: App.project }) // Used to run a single test file
  .page(App.baseApp)
  .requestHooks(logger) // <-- log network requests
  .before(async () => {
    await deleteSavedSearches();
  })
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());
  });

startTest('Add an empty and PDF saved search', async () => {
  await App.savedSearchesPage.clickSavedSearchesButton();
  await App.savedSearchesPage.typeTextInSavedSearchInput(savedSearchNameEmpty);
  await App.savedSearchesPage.clickInputClear();
  await App.savedSearchesPage.checkIfSavedSearchInputIsEmpty();
  await App.savedSearchesPage.typeTextInSavedSearchInput(savedSearchNameEmpty);
  await App.savedSearchesPage.saveNewSearch();
  await App.savedSearchesPage.clickSavedSearchesButton();
  await App.savedSearchesPage.checkIfSavedSearchExistsInPanel(
    savedSearchNameEmpty
  );
  logNetworkLoggerResults(logger);
});

startTest('Load some basic saved searches', async () => {
  await App.documentSearchPage.doSearch('pdf');
  await App.sidebar.clickFilterCategory('Documents');
  await App.sidebar.clickFilterSubCategory('File Type');
  await App.sidebar.clickFilterOption('PDF');
  await App.resultTable.hasNumberOfSearchResults(3);
  await App.savedSearchesPage.closeSavedSearchPanel();
  await App.savedSearchesPage.saveCurrentSearchToSavedSearch(savedSearchName);
});

startTest('Toggle between some saved searches', async () => {
  await App.savedSearchesPage.clickSavedSearchesButton();
  await App.savedSearchesPage.loadSavedSearchFromDropdown(savedSearchNameEmpty);
  await App.sidebar.clickFilterCategory('Documents');
  await App.sidebar.clickFilterSubCategory('File Type');
  await App.sidebar.fileType.isChecked('PDF', false);
  await App.savedSearchesPage.closeSavedSearchPanel();

  await App.savedSearchesPage.clickSavedSearchesButton();
  await App.savedSearchesPage.loadSavedSearchFromDropdown(savedSearchName);
  await App.sidebar.fileType.isChecked('PDF', true);
  await App.resultTable.hasResultsAtLeast(3);
  await App.savedSearchesPage.closeSavedSearchPanel();
});

startTest('Toggle between some saved searches and check polygon', async () => {
  // now check to make sure the polygon we draw is removed when we load the previous saved search
  await App.map.waitForMapRenders();
  await App.map.doPolygonSearch();
  // false to NOT clear filters (because we want the above polygon filter)
  await App.documentSearchPage.doSearchWithNoResults(false);
  await App.savedSearchesPage.clickSavedSearchesButton();
  await App.savedSearchesPage.loadSavedSearchFromDropdown(savedSearchName);
  await App.resultTable.hasResultsAtLeast(3);
});

startTest('Update saved search', async () => {
  await App.savedSearchesPage.clickSavedSearchesButton();
  await App.savedSearchesPage.typeTextInSavedSearchInput(savedSearchName);
  await App.savedSearchesPage.saveNewSearchOrOverwriteExisting();
});

startTest('Add wells to saved search', async () => {
  await App.sidebar.clickFilterCategory('Wells');
  await App.sidebar.clickFilterSubCategory(REGION_FIELD_BLOCK);
  await App.sidebar.clickFilterOption('SLEIPNER');

  await App.savedSearchesPage.clickSavedSearchesButton();
  await App.savedSearchesPage.typeTextInSavedSearchInput(savedSearchNameWells);
  await App.savedSearchesPage.saveNewSearch();
});

startTest('Load documents saved search to Documents tab', async () => {
  await App.navigateToResultsPageAndClearAllFilters('Documents');

  await App.sidebar.clickFilterCategory('Documents');
  await App.sidebar.clickFilterSubCategory('File Type');
  await App.sidebar.clickFilterOption('PDF');
  await App.savedSearchesPage.saveCurrentSearchToSavedSearch(
    savedSearchNameDocumentsOnly
  );

  await App.savedSearchesPage.clickSearchResultTab('Wells');
  await App.savedSearchesPage.clickSavedSearchesButton();
  await App.savedSearchesPage.loadSavedSearchFromDropdown(
    savedSearchNameDocumentsOnly
  );
  await App.savedSearchesPage.checkIfSearchResultTabIsActive('Documents');
});

startTest('Load wells saved search to Wells tab', async () => {
  await App.navigateToResultsPageAndClearAllFilters('Wells');

  await App.sidebar.clickFilterCategory('Wells');
  await App.sidebar.clickFilterSubCategory(REGION_FIELD_BLOCK);
  await App.sidebar.clickFilterOption('SLEIPNER');
  await App.savedSearchesPage.saveCurrentSearchToSavedSearch(
    savedSearchNameWellsOnly
  );

  await App.savedSearchesPage.clickSearchResultTab('Document');
  await App.savedSearchesPage.clickSavedSearchesButton();
  await App.savedSearchesPage.loadSavedSearchFromDropdown(
    savedSearchNameWellsOnly
  );
  await App.savedSearchesPage.checkIfSearchResultTabIsActive('Wells');
});
