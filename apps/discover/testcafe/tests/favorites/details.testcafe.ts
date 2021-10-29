import { t } from 'testcafe';

import App from '../../__pages__/App';
import {
  deleteFavorites,
  addFavorite,
  updateFavoriteContent,
} from '../../fixtures/favorites';
import { logErrors, progress, startTest, testRunId } from '../../utils';

const FAV_SET_NAME = `fav_${testRunId}`;
const documentsSearchPhrase = 'sample-pdf.pdf';
const documentId = 5974419898633335; // id for 'sample-pdf.pdf'
const wellId = 6412202718083235; // id for Well F-1

fixture('Favorites detail page')
  .meta({ page: 'favorites:details', tenant: App.tenant }) // Used to run a single test file
  .page(App.baseApp)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());

    progress('Go to favorite page');
    await App.topbar.clickNavigationTab('Favorites');
  })
  .before(async () => {
    progress('Delete all the favorite items');
    await deleteFavorites().catch((error: any) => {
      progress(error);
    });

    progress(`Add ${FAV_SET_NAME} favorite set`);
    const response = await addFavorite(FAV_SET_NAME);

    if (!response) {
      return;
    }

    progress(`Add document to the favorite set`);
    await updateFavoriteContent({
      id: response,
      updateData: { addDocumentIds: [documentId], wells: { [wellId]: [] } },
    });
  })
  .afterEach(async () => {
    logErrors();
  });

startTest('Add a document to the favorite set', async () => {
  await App.favoritesPage.openFavoriteSet(FAV_SET_NAME);
  await App.favoritesPage.checkIfItemExistsInFavoriteSet(documentsSearchPhrase);
  await App.favoritesPage.clickBackButton();
});

startTest('Add a well to the favorite set', async () => {
  await App.favoritesPage.openFavoriteSet(FAV_SET_NAME);
  await App.favoritesPage.goToWellTab();
  await App.resultTable.hasResults();
  await App.favoritesPage.clickBackButton();
});

startTest('check for wellbore result table in well table', async () => {
  await App.favoritesPage.openFavoriteSet(FAV_SET_NAME);
  progress('go to well tab');
  await t.click(App.favoritesPage.favoriteSetWellsTab);

  progress('Wellbore table not available before selecting a row');
  await t
    .expect(App.wellSearchPage.firstwellboreResultTableRow.exists)
    .eql(false);

  await App.resultTable.clickRowWithNth(0);

  progress('Should include welbore table');
  await t
    .expect(App.wellSearchPage.firstwellboreResultTableRow.exists)
    .eql(true);
});

startTest('check for bulk action bar in well table', async () => {
  await App.favoritesPage.openFavoriteSet(FAV_SET_NAME);
  progress('go to well tab');
  await t.click(App.favoritesPage.favoriteSetWellsTab);

  await App.resultTable.clickRowWithNthCheckbox(0);
  await App.favoritesPage.checkIfBulkActionBarExists();
});
