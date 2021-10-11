import { t } from 'testcafe';

import App from '../../__pages__/App';
import { deleteFavorites } from '../../fixtures/favorites';
import { logErrors, progress, startTest, testRunId } from '../../utils';

const FAV_SET_NAME = `TESTCAFE_${testRunId}`;

fixture('Favorites adding new set')
  .meta({ page: 'favorites:newSets', tenant: App.tenant }) // Used to run a single test file
  .page(App.baseApp)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());

    progress('Delete All the favorite Items beforeEach');
    await deleteFavorites();

    progress('Go to favorite page');
    await App.topbar.clickNavigationTab('Favorites');
  })
  .afterEach(async () => logErrors());

startTest('Create a new favorite set', async () => {
  await App.favoritesPage.clickCreateNewButton();
  await App.createFavoriteDialog.clickCreateButton();

  await App.createFavoriteDialog.fillInNameAndDescription(FAV_SET_NAME);
  await App.createFavoriteDialog.clickCancelButton();
  await App.favoritesPage.checkIfFavoriteSetExists(FAV_SET_NAME, false);

  await App.favoritesPage.clickCreateNewButton();

  await App.createFavoriteDialog.fillInNameAndDescription(FAV_SET_NAME);
  await App.createFavoriteDialog.clickCreateButton();
  await App.favoritesPage.checkIfFavoriteSetExists(FAV_SET_NAME);
  await App.favoritesPage.openFavoriteSet(FAV_SET_NAME);
  await App.favoritesPage.checkIfFavoriteSetIsEmpty();
});
