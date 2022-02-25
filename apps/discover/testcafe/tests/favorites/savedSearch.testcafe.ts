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
  .meta({ page: 'favorites:savedSearch', tenant: App.project }) // Used to run a single test file
  .page(App.baseApp)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());

    progress('Delete all');
    await deleteSavedSearches();

    progress('Create a new set');
    await createSavedSearches(SAVED_SEARCH_NAME, { query: filename });

    progress('Refresh the page to load the newly added record from use query');

    await t.eval(() => {
      // eslint-disable-next-line  no-restricted-globals
      location.reload();
    });

    progress('Go to favorite page');
    await App.topbar.clickNavigationTab('Favorites');
  })
  .afterEach(async () => logErrors());

startTest('load a saved search', async () => {
  await t.click(App.favoritesPage.favoriteSetTitle('Saved Searches'));
  await App.resultTable.clickHoverViewButtonofRow(SAVED_SEARCH_NAME);
  await App.filterClearPage.checkIfTagExists(filename, true);
  //  await App.resultTable.rowWithTextIsVisible('Test PDF file');
});

startTest('Share saved search', async () => {
  await t.click(App.favoritesPage.favoriteSetTitle('Saved Searches'));

  await App.resultTable.hoverThreeDotHoverIconofRowAndClickMenuItem(
    SAVED_SEARCH_NAME,
    'Share'
  );

  await App.favoritesPage.shareFavoriteDialog.checkIfOwnerIsDisplayed();
  await App.favoritesPage.shareFavoriteDialog.shareFavoriteWithUser(
    'Admin User'
  );
  await App.checkifToasterAppears(SHARE_SUCCESS_TOAST);
});

startTest('Unshare saved search', async () => {
  await t.click(App.favoritesPage.favoriteSetTitle('Saved Searches'));

  await App.resultTable.hoverThreeDotHoverIconofRowAndClickMenuItem(
    SAVED_SEARCH_NAME,
    'Share'
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

startTest('Remove a saved search', async () => {
  await t.click(App.favoritesPage.favoriteSetTitle('Saved Searches'));

  await App.resultTable.hoverThreeDotHoverIconofRowAndClickMenuItem(
    SAVED_SEARCH_NAME,
    'Remove'
  );

  await App.deleteSavedSearchDialog.checkIfModalIsOpen();

  await App.deleteSavedSearchDialog.clickDeleteButton();
});

startTest('Close delete modal without deleting', async () => {
  await t.click(App.favoritesPage.favoriteSetTitle('Saved Searches'));

  await App.resultTable.hoverThreeDotHoverIconofRowAndClickMenuItem(
    SAVED_SEARCH_NAME,
    'Remove'
  );

  await t.click(App.createFavoriteDialog.closeIcon());

  await t
    .expect(App.favoritesPage.favoriteSavedSearchEmptyContainer.exists)
    .notOk();
  await t.expect(App.resultTable.row.exists).ok();
});
