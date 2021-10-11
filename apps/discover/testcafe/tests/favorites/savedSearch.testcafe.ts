import { t } from 'testcafe';

import { SHARE_SUCCESS_TOAST } from '../../../src/pages/authorized/favorites/modals/constants';
import App, { filename } from '../../__pages__/App';
import {
  createSavedSearches,
  deleteSavedSearches,
} from '../../fixtures/savedSearches';
import { logErrors, progress, startTest } from '../../utils';

const SAVED_SEARCH_NAME = `TESTCAFE_SAVED_SEARCH`;

fixture('Favorites saved search list')
  .meta({ page: 'favorites:savedSearch', tenant: App.tenant }) // Used to run a single test file
  .page(App.baseApp)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());

    progress('delete all');
    await deleteSavedSearches();

    progress('create a new set');
    await createSavedSearches(SAVED_SEARCH_NAME, { query: filename });

    progress('refresh the page to load the newly added record from use query');

    await t.eval(() => {
      // eslint-disable-next-line  no-restricted-globals
      location.reload();
    });

    progress('Go to favorite page');
    await App.topbar.clickNavigationTab('Favorites');
  })
  .afterEach(async () => logErrors());

startTest('Delete a saved search', async () => {
  await t.click(App.favoritesPage.favoriteSetTitle('Saved Searches'));

  await App.resultTable.hoverRowWithNth(0);
  await App.resultTable.clickRowWithNthIconWithTestId(
    0,
    'saved-search-action-delete'
  );

  await t.click(App.createFavoriteDialog.deleteButton());

  await t
    .expect(App.favoritesPage.favoriteSavedSearchEmptyContainer.exists)
    .ok();
});

startTest('Close delete modal without deleting', async () => {
  await t.click(App.favoritesPage.favoriteSetTitle('Saved Searches'));

  await App.resultTable.hoverRowWithNth(0);
  await App.resultTable.clickRowWithNthIconWithTestId(
    0,
    'saved-search-action-delete'
  );

  await t.click(App.createFavoriteDialog.closeIcon());

  await t
    .expect(App.favoritesPage.favoriteSavedSearchEmptyContainer.exists)
    .notOk();
  await t.expect(App.resultTable.row.exists).ok();
});

startTest('load a saved search', async () => {
  await t.click(App.favoritesPage.favoriteSetTitle('Saved Searches'));

  await App.resultTable.hoverRowWithNth(0);
  await App.resultTable.clickRowWithNthIconWithTestId(0, 'launch-saved-search');

  await App.filterClearPage.checkIfTagExists(filename, true);
});

startTest('Share saved search', async () => {
  await t.click(App.favoritesPage.favoriteSetTitle('Saved Searches'));

  await App.resultTable.hoverRowWithNth(0);
  await App.resultTable.clickRowWithNthIconWithTestId(
    0,
    'saved-search-action-share'
  );

  await App.favoritesPage.shareFavoriteDialog.checkIfOwnerIsDisplayed();
  await App.favoritesPage.shareFavoriteDialog.shareFavoriteWithUser(
    'Admin User'
  );
  await App.checkifToasterAppears(SHARE_SUCCESS_TOAST);
});

startTest('Unshare saved search', async () => {
  await t.click(App.favoritesPage.favoriteSetTitle('Saved Searches'));

  await App.resultTable.hoverRowWithNth(0);
  await App.resultTable.clickRowWithNthIconWithTestId(
    0,
    'saved-search-action-share'
  );
  await App.favoritesPage.shareFavoriteDialog.checkIfOwnerIsDisplayed();
  await App.favoritesPage.shareFavoriteDialog.shareFavoriteWithUser(
    'Admin User'
  );
  await App.checkifToasterAppears(SHARE_SUCCESS_TOAST);

  await App.favoritesPage.shareFavoriteDialog.checkIfSharedUserIsDisplayed(
    'Admin User'
  );
  await App.favoritesPage.shareFavoriteDialog.unshareFavorite();
  await App.checkifToasterAppears(SHARE_SUCCESS_TOAST);
});
