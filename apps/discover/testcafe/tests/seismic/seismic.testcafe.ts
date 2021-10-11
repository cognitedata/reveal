import { t } from 'testcafe';

import App from '../../__pages__/App';
import { progress, logErrors } from '../../utils/utils';

fixture('Search seismic page')
  .meta({ page: 'seismic:search', tenant: App.tenant }) // Used to run a single test file
  .page(App.baseApp)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());
  })
  .afterEach(() => logErrors());

test('Seismic search with some bad text', async () => {
  await App.documentSearchPage.doSearch(`this-should-return-blank-results`);
  await App.navigateToResultsPage('Seismic');
  await App.filterClearPage.confimPageHasNoResult();
});

test('Seismic search with some good text', async () => {
  progress(`Coming soon`);
});

// -test('Seismic section view', async () => {
//   progress('Navigating to the seismic search page');
//   await t.expect(App.seismicSearchPage).ok();

//   await App.documentSearchPage.doSearch('F3');
//   await App.seismicSearchPage.clickSeismicTab();

//   progress('Checking for good search results: F3', true);

//   await logErrors(t);
//   await t
//     .expect(App.seismicSearchPage.searchResultsTable.innerText)
//     .contains('F3');
//   await t.click(App.resultTable.row);
//   await t.expect(App.resultTable.row.exists).ok();
//   await t.expect(App.resultTable.cellExpanded.exists).ok();

//   progress('Click the first survey file to select the survey');
//   await t.click(App.resultTable.getNthNestedResult(0), {
//     speed: 1,
//     offsetX: 25,
//   });

//   progress('Click view in button');
//   await t.click(App.seismicSearchPage.viewInButton, {
//     speed: 1,
//     offsetX: 25,
//   });

//   progress('Select section view');
//   await t.click(App.seismicSearchPage.sectionViewListItem, {
//     speed: 1,
//     offsetX: 25,
//   });

//   await t.expect(App.seismicSearchPage.sectionViewModalHeader.exists).ok();
// });
