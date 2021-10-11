import { t } from 'testcafe';

import { DUPLICATED_SET_SUFFIX } from '../../../src/pages/authorized/favorites/constants';
import App from '../../__pages__/App';
import { addFavorite, deleteFavorites } from '../../fixtures/favorites';
import { progress, testRunId, startTest, logErrors } from '../../utils';

const FAV_SET_NAME = `TESTCAFE_${testRunId}`;
const DUPLICATE_SET_NAME = `${FAV_SET_NAME}_DUPLICATED`;
const EDITED_SET_NAME = `${FAV_SET_NAME}_EDITED_NAME`;
const EDITED_SET_DESCRIPTION = `${FAV_SET_NAME}_EDITED_DESCRIPTION`;
const wellDataSearchPhrase = 'Well F';

fixture('Favorites overview page')
  .meta({ page: 'favorites:overview', tenant: App.tenant }) // Used to run a single test file
  .page(App.baseUrl)
  .beforeEach(async () => {
    // Login with admin first to trigger /sync call
    await t.useRole(App.getAdminRole());
    await App.logout();

    await t.useRole(App.getUserRole());

    progress('Delete All the favorite Items beforeEach');
    await deleteFavorites();

    progress(`Add ${FAV_SET_NAME} favorite set`);
    await addFavorite(FAV_SET_NAME);

    progress('Go to favorite page');
    await App.topbar.clickNavigationTab('Favorites');
  })
  .afterEach(async () => logErrors());

startTest(`Cancel creating a duplicate`, async () => {
  await App.favoritesPage.clickButtonInFavoriteSet(FAV_SET_NAME, 'Duplicate');
  await App.createFavoriteDialog.checkIfNameFieldHasValue(
    `${FAV_SET_NAME}${DUPLICATED_SET_SUFFIX}`
  );
  await App.createFavoriteDialog.fillInNameAndDescription(DUPLICATE_SET_NAME);
  await App.createFavoriteDialog.clickCancelButton();
  await App.favoritesPage.checkIfFavoriteSetExists(DUPLICATE_SET_NAME, false);
});

startTest(`Create a duplicate`, async () => {
  await App.favoritesPage.createDuplicateSet(FAV_SET_NAME, DUPLICATE_SET_NAME);
  await App.favoritesPage.checkIfFavoriteSetExists(FAV_SET_NAME);
  await App.favoritesPage.checkIfFavoriteSetExists(DUPLICATE_SET_NAME);
});

startTest(`Cancel editing the duplicated set`, async () => {
  await App.favoritesPage.createDuplicateSet(FAV_SET_NAME, DUPLICATE_SET_NAME);
  await App.favoritesPage.clickButtonInFavoriteSet(DUPLICATE_SET_NAME, 'Edit');
  await App.createFavoriteDialog.checkIfNameFieldHasValue(DUPLICATE_SET_NAME);
  await App.createFavoriteDialog.clickSaveButton();
  await App.createFavoriteDialog.fillInNameAndDescription(EDITED_SET_NAME);
  await App.createFavoriteDialog.clickCancelButton();
  await App.favoritesPage.checkIfFavoriteSetExists(EDITED_SET_NAME, false);
});

startTest(`Edit the duplicated set`, async () => {
  await App.favoritesPage.createDuplicateSet(FAV_SET_NAME, DUPLICATE_SET_NAME);
  await App.favoritesPage.clickButtonInFavoriteSet(DUPLICATE_SET_NAME, 'Edit');
  await App.createFavoriteDialog.checkIfNameFieldHasValue(DUPLICATE_SET_NAME);
  await App.createFavoriteDialog.fillInNameAndDescription(EDITED_SET_NAME);
  await App.createFavoriteDialog.clickSaveButton();
  await App.favoritesPage.checkIfFavoriteSetExists(DUPLICATE_SET_NAME, false);
  await App.favoritesPage.checkIfFavoriteSetExists(EDITED_SET_NAME);
});

startTest(`Edit only the description of set`, async () => {
  await App.favoritesPage.clickButtonInFavoriteSet(FAV_SET_NAME, 'Edit');
  await App.createFavoriteDialog.fillInDescription(EDITED_SET_DESCRIPTION);
  await App.createFavoriteDialog.clickSaveButton();
  await t.wait(3000);
  await App.favoritesPage.checkIfFavoriteSetExists(FAV_SET_NAME);
  await App.favoritesPage.clickButtonInFavoriteSet(FAV_SET_NAME, 'Edit');
  await App.createFavoriteDialog.checkIfDescriptionFieldHasValue(
    EDITED_SET_DESCRIPTION
  );
});

/** @TODO(PP-1523) - SHARING:
 * - Add test for unsharing a favorite set with another user
 */

startTest.skip(`Check that favorite set exists in both views`, async () => {
  await App.favoritesPage.checkIfFavoriteSetExists(FAV_SET_NAME);
  await App.favoritesPage.switchView('list');
  await App.favoritesPage.checkIfFavoriteSetExists(FAV_SET_NAME);
});

startTest('Add a well to the set', async () => {
  await App.navigateToResultsPage('Wells');
  await App.wellSearchPage.doSearch(wellDataSearchPhrase);
  await App.resultTable.clickRowWithNthCheckbox(0);
  await App.wellSearchPage.addSelectedWellsToFavoriteSet(FAV_SET_NAME);
});
