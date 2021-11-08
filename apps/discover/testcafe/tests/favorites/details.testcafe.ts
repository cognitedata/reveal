import { t } from 'testcafe';

import App, { filename } from '../../__pages__/App';
import { getOneDocument } from '../../fixtures/documents';
import {
  deleteFavorites,
  addFavorite,
  updateFavoriteContent,
} from '../../fixtures/favorites';
import { getOneWell } from '../../fixtures/wells';
import {
  // getPostLogger,
  logErrors,
  // logNetworkLoggerResults,
  progress,
  startTest,
  shortTestRunId,
} from '../../utils';

const FAV_SET_NAME = `fav_${shortTestRunId}`;

// const loggerPost = getPostLogger();

fixture('Favorites detail page')
  .meta({ page: 'favorites:details', tenant: App.project }) // Used to run a single test file
  .page(App.baseApp)
  // .requestHooks(loggerPost)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());

    progress('Go to favorite page');
    await App.topbar.clickNavigationTab('Favorites');
  })
  .before(async () => {
    progress('Delete all the favorite items');
    const doc = await getOneDocument({ name: filename });
    const well = await getOneWell();

    if (!doc) {
      return;
    }

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
      updateData: {
        addDocumentIds: [doc.id],
        wells: { [well.matchingId]: [] },
      },
    });

    // logNetworkLoggerResults(loggerPost);
  })
  .afterEach(async () => {
    logErrors();
  });

startTest('Add a document to the favorite set', async () => {
  await App.favoritesPage.openFavoriteSet(FAV_SET_NAME);
  await App.favoritesPage.checkIfItemExistsInFavoriteSet(filename);
  await App.favoritesPage.clickBackButton();
});

startTest(
  'Add a well and check for wellbore result table in well table',
  async () => {
    await App.favoritesPage.openFavoriteSet(FAV_SET_NAME);
    await App.favoritesPage.goToWellTab();
    await App.resultTable.hasResults();
    await App.favoritesPage.clickBackButton();

    await App.favoritesPage.openFavoriteSet(FAV_SET_NAME);
    await App.favoritesPage.goToWellTab();

    progress('Wellbore table not available before selecting a row');
    await t
      .expect(App.wellSearchPage.firstwellboreResultTableRow.exists)
      .eql(false);

    await App.resultTable.clickRowWithNth(0);

    progress('Should include welbore table');
    await t
      .expect(App.wellSearchPage.firstwellboreResultTableRow.exists)
      .eql(true);
  }
);

startTest.skip('check for bulk action bar in well table', async () => {
  await App.favoritesPage.openFavoriteSet(FAV_SET_NAME);
  progress('go to well tab');
  await t.click(App.favoritesPage.favoriteSetWellsTab);

  await App.resultTable.clickRowWithNthCheckbox(0);
  await App.favoritesPage.checkIfBulkActionBarExists();
});
