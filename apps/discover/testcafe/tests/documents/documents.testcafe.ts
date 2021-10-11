import { t } from 'testcafe';

import { DOCUMENT_TAB_TITLE_KEY } from '../../../src/pages/authorized/search/constants';
import App, { filename, fileType } from '../../__pages__/App';
import { startTest, getPostLogger, progress, logErrors } from '../../utils';

const noResultName = 'unique12345';
const duplicateFileName = 'duplicate document.json';

const loggerPost = getPostLogger();

fixture('Search documents page')
  .meta({ page: 'search:documents', tenant: App.tenant }) // Used to run a single test file
  .page(App.baseUrl)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());
    await App.navigateToResultsPage(DOCUMENT_TAB_TITLE_KEY);
  })
  .requestHooks(loggerPost)
  .afterEach(() => logErrors());

// eslint-disable-next-line jest/no-commented-out-tests
/* startTest('Add to Favourites modal should appear', async () => {
  await App.documentSearchPage.doCommonSearch();

  progress('Click the checkbox in first row');
  await t.click(App.documentSearchPage.searchResultRowNthCheckbox(0));

  progress('Click the add to favorites button');
  await t.click(App.documentSearchPage.addToFavoriteButton);

  progress('Check that the favourites modal appears', true);
  await t.expect(App.documentSearchPage.addToFavoritesModal.exists).ok();
}); */

startTest('Show expanded metadata on row click', async () => {
  await App.documentSearchPage.doSearch(duplicateFileName);
  await App.resultTable.clickRowWithText(duplicateFileName);

  progress('Check document row is expanded and metadata is visible', true);
  await t.expect(App.documentSearchPage.documentMetadata.exists).ok();

  progress(
    'Check that Original path is correct and that it has 2 entries for duplicated document',
    true
  );
  await App.documentSearchPage.checkIfTextExistsInDocumentMetadata(
    '/path 1/path_2/path3/'
  );
  await App.documentSearchPage.checkIfTextExistsInDocumentMetadata(
    '/path 1/path_2/path3/path4/'
  );
});

startTest('Accessing Document search via input', async () => {
  await App.documentSearchPage.doSearch(filename);
  await App.resultTable.hasResults();

  await App.sidebar.clickFilterCategory('Documents');
  await App.sidebar.clickFilterSubCategory('File Type');
  await App.sidebar.clickFilterOption('PDF');

  await App.resultTable.clickRowWithNth(0);

  progress('It should expand and show details');
  await t.expect(App.resultTable.cellExpanded.exists).ok();
  await App.documentSearchPage.checkIfTextExistsInDocumentMetadata('Author');
});

startTest('Refining search by using file type filters', async () => {
  await App.documentSearchPage.doSearch(filename);
  await App.resultTable.hasResults();

  const originalCount = await App.resultTable.getResultsCount();

  await App.sidebar.clickFilterCategory('Documents');
  await App.sidebar.clickFilterSubCategory('File Type');
  await App.sidebar.clickFilterOption('PDF');

  await App.sidebar.clickFilterSubCategory('File Type'); // Collapse
  await App.sidebar.clickFilterSubCategory('File Type'); // Expand
  await App.sidebar.fileType.isChecked('PDF', true);

  await App.sidebar.clickGoBackArrow();
  await App.sidebar.documentFilterTag.clickRemove('PDF');
  await App.resultTable.hasNumberOfSearchResults(originalCount);
});

startTest(
  'Add document filter and remove by pressing the filter tag',
  async () => {
    await App.sidebar.clickFilterCategory('Documents');
    await App.sidebar.clickFilterSubCategory('File Type');
    await App.sidebar.clickFilterOption(fileType);
    await App.filterClearPage.clickFilter(fileType);
  }
);

// this test is flaky, we need to look at stability for it.

// eslint-disable-next-line jest/no-commented-out-tests
// startTest('should mark all checkbox filters and clear them', async () => {
//   progress('Navigating to the document search page');

//   await t.expect(App.documentSearchPage).ok();

//   await App.documentSearchPage.clearGlobalFiltersIfExists();

//   progress(`Click Document Filter tab`);
//   await t.click(App.documentSearchPage.filterDocumentButton);

//   progress(`Click on "File Type", "Document Category", and "Source"`);
//   await t.click(App.documentSearchPage.filterCategory('File Type'));
//   await t.click(App.documentSearchPage.filterCategory('Document Category'));
//   await t.click(App.documentSearchPage.filterCategory('Source'));

//   progress(`Click all checkboxes in the pane`);
//   const countFilterFacets = await App.documentSearchPage.documentFilterAllCheckboxes
//     .count;

//   for (let i = 0; i < countFilterFacets; i++) {
//     // eslint-disable-next-line no-await-in-loop
//     await t.click(App.documentSearchPage.documentFilterAllCheckboxes.nth(i));
//   }

//   progress(`Check if number of checkboxes active is equal to filter tags`);
//   const countFilerTags = await App.documentSearchPage.documentFilterAllTags.count;

//   await t.expect(countFilerTags).eql(countFilterFacets);

//   progress(`Clear all filters by pressing "Clear all" filter tag`);
//   await t.click(App.documentSearchPage.documentfilterTag('Clear all'));

//   const countFilterTagsUpdated = await App.documentSearchPage.documentFilterAllTags
//     .count;

//   await t.expect(countFilterTagsUpdated).eql(0);
// });

// -test.todo('Refining search by using document type filters');

startTest('refine search by using document date range', async () => {
  await App.documentSearchPage.doSearch(filename);
  await App.sidebar.clickFilterCategory('Documents');
  await App.sidebar.clickFilterSubCategory('Date Range');
  await App.sidebar.dateRange.setDateRange();
  await App.filterClearPage.confimPageHasNoResult();
  await App.filterClearPage.clickFilter('Created:');
  await App.resultTable.clickRowWithText(filename);
});

startTest(
  'Empty search should trigger after clearing blank search',
  async () => {
    await App.documentSearchPage.doSearch(noResultName);
    await App.filterClearPage.confimPageHasNoResult();
    await App.filterClearPage.clearAllFilters();
    await App.resultTable.hasResultsAtLeast(7);
  }
);

startTest('Set search input with filters', async () => {
  await App.documentSearchPage.doSearch(noResultName);
  await App.sidebar.clickFilterCategory('Documents');
  await App.sidebar.clickFilterSubCategory('File Type');
  await App.sidebar.clickNthFilterOption(0);
  await App.filterClearPage.confimPageHasNoResult();
  await App.filterClearPage.clickFilter('Compressed');
  await App.filterClearPage.confimPageHasNoResult();
  await App.filterClearPage.clickFilter(noResultName);
  await App.resultTable.hasResultsAtLeast(1);
});

// -startTest('Accessing column setting model', async () => {
//   progress('Navigating to the document search page');
//   await t.expect(App.documentSearchPage).ok();

//   progress('Do a empty search');
//   await App.documentSearchPage.emptySearch();
//   await t.wait(500); // Give the toast some time to do a empty search

//   progress('Make sure column settings is not opened yet');
//   await t.expect(App.documentSearchPage.columnSettingsContainer.exists).eql(false);

//   progress('Click column setting button');
//   await t.click(App.documentSearchPage.columnSettingsButton);

//   progress('Open column settings popup');
//   await t.expect(App.documentSearchPage.columnSettingsContainer.exists).eql(true);

//   await t.click(App.documentSearchPage.wellsResultsTab);

//   // Go to wells page and come back
//   progress('Go to wells page');
//   await t.click(App.documentSearchPage.wellsResultsTab);

//   progress('Come back to document page');
//   await t.click(App.documentSearchPage.documentsResultsTab);

//   progress('Make sure column settings is not opened yet');
//   await t.expect(App.documentSearchPage.columnSettingsContainer.exists).eql(false);

//   progress('Click column setting button');
//   await t.click(App.documentSearchPage.columnSettingsButton);

//   progress('Open column settings popup');
//   await t.expect(App.documentSearchPage.columnSettingsContainer.exists).eql(true);
// });

// -startTest('Column setting remove column option', async () => {
//   progress('Navigating to the document search page');
//   await t.expect(App.documentSearchPage).ok();

//   progress('Do a empty search');
//   await App.documentSearchPage.emptySearch();
//   await t.wait(500); // Give the toast some time to do a empty search

//   const columnName = 'File Name';
//   progress(`Make sure ${columnName} exist in the table`);
//   await t
//     .expect(App.resultTable.getColumnHeader(columnName).exists)
//     .eql(true);

//   progress('Open column settings');
//   await t.click(App.documentSearchPage.columnSettingsButton);

//   progress(`De-select ${columnName} option `);
//   await t.click(App.documentSearchPage.getColumnSettingsOptions(columnName));

//   progress('Close column setting button');
//   await t.click(App.documentSearchPage.columnSettingsButton);

//   progress(`Make sure ${columnName} removed in the table`);
//   await t
//     .expect(App.resultTable.getColumnHeader(columnName).exists)
//     .eql(false);

//   progress('Open column settings');
//   await t.click(App.documentSearchPage.columnSettingsButton);

//   progress(`select ${columnName} option `);
//   await t.click(App.documentSearchPage.getColumnSettingsOptions(columnName));

//   progress('Close column setting button');
//   await t.click(App.documentSearchPage.columnSettingsButton);

//   progress(`Make sure ${columnName} exist in the table`);
//   await t
//     .expect(App.resultTable.getColumnHeader(columnName).exists)
//     .eql(true);
// });

// -test('Sort Documents By File Name', async () => {
//   const columnName = 'File Name';

//   progress('Navigating to the document search page');
//   await t.expect(App.documentSearchPage).ok();

//   progress('Do a empty search');
//   await App.documentSearchPage.emptySearch();
//   await t.wait(500); // Give the toast some time to do a empty search

//   progress('Sort documents by file name in descending order');
//   await App.resultTable.clickOnHeader(t, columnName);
//   await t.wait(500); // Give the toast some time to sort
//   let fileNameList = await App.documentSearchPage.getFileNameList();
//   await t.expect(isSorted(fileNameList, 'desc')).eql(true);

//   progress('Sort documents by file name in ascending order');
//   await App.resultTable.clickOnHeader(t, columnName);
//   await t.wait(500); // Give the toast some time to sort
//   fileNameList = await App.documentSearchPage.getFileNameList();
//   await t.expect(isSorted(fileNameList)).eql(true);
// });

// eslint-disable-next-line jest/no-disabled-tests
startTest.skip('Extract documents from parent folder', async () => {
  await App.documentSearchPage.doSearch(`${filename}`);
  await App.resultTable.clickRowWithText(filename);

  progress('Check document parent path exists', true);
  await t.expect(App.documentSearchPage.parentPath.exists).ok();

  const parentPath = await App.documentSearchPage.parentPath.textContent;

  progress('Check document extract button exists', true);
  await t.expect(App.documentSearchPage.extractByParentButton.exists).ok();

  progress(`Click to extract documents by parent folder`);
  await t.click(App.documentSearchPage.extractByParentButton);

  progress(`Click to close preview`);
  await t.click(App.documentSearchPage.previewCloseButton);

  const docCount = await App.resultTable.getResultsCount();

  progress('Check extracted documents count is greater than one', true);
  await t.expect(docCount).gt(0);

  progress(`Click to preview first document`);
  await App.resultTable.clickRowWithNth(0);

  const firstDocParentPath = await App.documentSearchPage.parentPath
    .textContent;

  progress('Check first doc parent path', true);
  await t.expect(firstDocParentPath).eql(parentPath);

  progress(`Click to close preview`);
  await t.click(App.documentSearchPage.previewCloseButton);

  if (docCount > 1) {
    progress(`Click to preview first document`);
    await t.click(App.resultTable.row.nth(docCount - 1));

    const lastDocParentPath = await App.documentSearchPage.parentPath
      .textContent;

    progress('Check last doc parent path', true);
    await t.expect(lastDocParentPath).eql(parentPath);

    progress(`Click to close preview`);
    await t.click(App.documentSearchPage.previewCloseButton);
  }
});

startTest('Click on topbar cognite logo', async () => {
  progress('Click on Cognite logo');
  await t.click(App.topbar.cogniteLogo);

  progress('Search result should be collapsed', true);
  await t.expect(App.documentSearchPage.expandMapButton.exists).notOk();
});

// -startTest('Click view document hover button', async () => {
//   progress('Navigating to the document search page');
//     await App.documentSearchPage.doCommonSearch();

//   progress('Hover the first row');
//   await t.hover(App.documentSearchPage.searchResultNthRow(0));

//   progress('Click View button');
//   await t.click(App.documentSearchPage.searchResultNthRowbuttonWithText(0, 'View'));
// });

startTest('Click Preview document hover button', async () => {
  await App.documentSearchPage.doSearch(filename);
  await App.resultTable.hoverRowWithNth(0);
  await App.resultTable.clickRowWithNthButtonWithText(0, 'Preview');

  progress('Can see PDF Modal');
  await t.expect(App.documentSearchPage.documentPreviewModal.exists).ok();
});

startTest('Document search and filters are preserved', async () => {
  await App.documentSearchPage.doSearch(`${filename}`);

  await App.sidebar.clickFilterCategory('Documents');
  await App.sidebar.clickFilterSubCategory('File Type');
  await App.sidebar.clickFilterOption('PDF');

  await App.sidebar.clickFilterSubCategory('Document Category');
  await App.sidebar.clickFilterOption('Unclassified');

  await App.sidebar.clickFilterSubCategory('Source');
  await App.sidebar.clickFilterOption('Test-Drive');

  await App.topbar.navigateToFavorites();

  /**
   * Not worrying if favotite page finished loading or not. Just need to change the route.
   */
  await t.wait(3000);

  await App.topbar.navigateToSearch();

  await App.sidebar.fileType.isChecked('PDF', true);
  await App.sidebar.fileType.isChecked('Unclassified', true);
  await App.sidebar.fileType.isChecked('Test-Drive', true);
});

startTest('Search phrase and filters get cleared on reload', async () => {
  await App.documentSearchPage.doSearch(`${filename}`);

  await App.sidebar.clickFilterCategory('Documents');
  await App.sidebar.clickFilterSubCategory('File Type');
  await App.sidebar.clickFilterOption('PDF');

  await App.sidebar.clickFilterSubCategory('Document Category');
  await App.sidebar.clickFilterOption('Unclassified');

  await App.sidebar.clickFilterSubCategory('Source');
  await App.sidebar.clickFilterOption('Test-Drive');

  await App.documentSearchPage.refreshPage();

  await App.documentSearchPage.checkIfSearchPhraseNotEqualsTo(`${filename}`);

  await App.sidebar.clickFilterCategory('Documents');
  await App.sidebar.clickFilterSubCategory('File Type');
  await App.sidebar.fileType.isChecked('PDF', false);

  await App.sidebar.clickFilterSubCategory('Document Category');
  await App.sidebar.fileType.isChecked('Unclassified', false);

  await App.sidebar.clickFilterSubCategory('Source');
  await App.sidebar.fileType.isChecked('Test-Drive', false);
});

// i'm not sure what unique thing this is testing
// startTest(
//   'Load all documents when no filters have been applied',
//   async () => {
//     progress('Counting number of results when no filters have been applied');
//     const resultTableRow = App.resultTable.row;
//     await t.expect(resultTableRow.count).gt(0);
//     const noFiltersResultsCount = await resultTableRow.count;

//     progress('No filter tags should be applied');
//     const numberOfAppliedFiltersTags = await App.documentSearchPage
//       .filterTagsAll.count;
//     await t.expect(numberOfAppliedFiltersTags).eql(0);

//     progress('Do an empty search');
//     await App.documentSearchPage.emptySearch();

//     progress('Counting number of results for empty search');
//     await t.expect(resultTableRow.count).gt(0);
//     const emptySearchResultsCount = await resultTableRow.count;

//     progress('Comparing result counts');
//     await t.expect(noFiltersResultsCount).eql(emptySearchResultsCount);
//   },
// );

startTest(
  'Apply document filters and see if filter tags are available, clear filter tag',
  async () => {
    await App.documentSearchPage.doSearch(`${filename}`);

    await App.sidebar.clickFilterCategory('Documents');
    await App.sidebar.clickFilterSubCategory('File Type');
    await App.sidebar.clickFilterOption('PDF');

    await App.sidebar.clickFilterSubCategory('Document Category');
    await App.sidebar.clickFilterOption('Unclassified');

    await App.sidebar.clickFilterSubCategory('Source');
    await App.sidebar.clickFilterOption('Test-Drive');

    await App.sidebar.clickGoBackArrow();

    await App.sidebar.documentFilterTag.exists('PDF', true);

    await App.sidebar.documentFilterTag.exists('unclassified', true);

    await App.sidebar.documentFilterTag.exists('test-drive', true);

    await App.sidebar.documentFilterTag.clickRemove('PDF');

    await App.sidebar.documentFilterTag.exists('PDF', false);
  }
);

startTest(
  'Apply document filters and see if filter tags are available, clear all',
  async () => {
    await App.documentSearchPage.doSearch(`${filename}`);

    await App.sidebar.clickFilterCategory('Documents');
    await App.sidebar.clickFilterSubCategory('File Type');
    await App.sidebar.clickFilterOption('PDF');

    await App.sidebar.clickFilterSubCategory('Document Category');
    await App.sidebar.clickFilterOption('Unclassified');

    await App.sidebar.clickFilterSubCategory('Source');
    await App.sidebar.clickFilterOption('Test-Drive');

    await App.sidebar.clickGoBackArrow();

    await App.sidebar.documentFilterTag.exists('PDF', true);

    await App.sidebar.documentFilterTag.exists('unclassified', true);

    await App.sidebar.documentFilterTag.exists('test-drive', true);

    await App.sidebar.documentFilterTag.clickClearAll();

    await App.sidebar.documentFilterTag.exists('PDF', false);

    await App.sidebar.documentFilterTag.exists('unclassified', false);

    await App.sidebar.documentFilterTag.exists('test-drive', false);
  }
);
