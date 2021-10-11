import { t } from 'testcafe';

import { SHARE_SUCCESS_TOAST } from '../../../src/pages/authorized/favorites/modals/constants';
import App from '../../__pages__/App';
import { deleteFavorites } from '../../fixtures/favorites';
import { logErrors, progress, startTest, testRunId } from '../../utils';

const FAV_SET_NAME = `TESTCAFE_${testRunId}`;

fixture('Favorites share')
  .meta({ page: 'favorites:share', tenant: App.tenant }) // Used to run a single test file
  .page(App.baseApp)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());

    progress('Delete All the favorite Items beforeEach');
    await deleteFavorites();

    progress('Go to favorite page');
    await App.topbar.clickNavigationTab('Favorites');
  })
  .afterEach(async () => logErrors());

startTest('Share favorite set', async () => {
  await App.favoritesPage.clickCreateNewButton();
  await App.createFavoriteDialog.fillInNameAndDescription(FAV_SET_NAME);
  await App.createFavoriteDialog.clickCreateButton();
  await App.favoritesPage.checkIfFavoriteSetExists(FAV_SET_NAME);

  await App.favoritesPage.clickShareButton();
  await App.favoritesPage.shareFavoriteDialog.checkIfOwnerIsDisplayed();
  await App.favoritesPage.shareFavoriteDialog.shareFavoriteWithUser(
    'Admin User'
  );
  await App.checkifToasterAppears(SHARE_SUCCESS_TOAST);
});

startTest('Unshare favorite set', async () => {
  await App.favoritesPage.clickCreateNewButton();
  await App.createFavoriteDialog.fillInNameAndDescription(FAV_SET_NAME);
  await App.createFavoriteDialog.clickCreateButton();
  await App.favoritesPage.checkIfFavoriteSetExists(FAV_SET_NAME);

  await App.favoritesPage.clickShareButton();
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
