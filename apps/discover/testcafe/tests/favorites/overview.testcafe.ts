import { t } from 'testcafe';

import {
  DUPLICATED_SET_SUFFIX,
  DUPLICATE_FAVORITE_CARD_BUTTON,
  EDIT_FAVORITE_CARD_BUTTON,
} from '../../../src/pages/authorized/favorites/constants';
import { WELLS_TAB_TITLE_KEY } from '../../../src/pages/authorized/search/constants';
import App, { wellDataSearchPhrase } from '../../__pages__/App';
import { addFavorite, deleteFavorites } from '../../fixtures/favorites';
import { progress, shortTestRunId, startTest, logErrors } from '../../utils';

const FAV_SET_NAME = `f_${shortTestRunId}`;
const DUPLICATE_SET_NAME = `${FAV_SET_NAME}_DUPLICATED`;
const EDITED_SET_NAME = `${FAV_SET_NAME}_EDITED_NAME`;
const EDITED_SET_DESCRIPTION = `${FAV_SET_NAME}_EDITED_DESCRIPTION`;

fixture('Favorites overview page')
  .meta({ page: 'favorites:overview', tenant: App.project }) // Used to run a single test file
  .page(App.baseUrl)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());
    progress('Go to favorite page');
    await App.topbar.clickNavigationTab('Favorites');
    // await t.wait(2000); // for cdf
  })
  .before(async () => {
    progress('Delete all the favorite items');
    await deleteFavorites();

    progress(`Add ${FAV_SET_NAME} favorite set`);
    await addFavorite(FAV_SET_NAME);
  })
  .afterEach(async () => logErrors());

startTest(`Cancel creating a duplicate`, async () => {
  await App.favoritesPage.hoverDropDownMenuInFavoriteSet(FAV_SET_NAME);
  await App.favoritesPage.clickButtonInFavoriteSet(
    FAV_SET_NAME,
    DUPLICATE_FAVORITE_CARD_BUTTON
  );
  await App.createFavoriteDialog.checkIfNameFieldHasValue(
    `${FAV_SET_NAME}${DUPLICATED_SET_SUFFIX}`
  );
  await App.createFavoriteDialog.fillInNameAndDescription(DUPLICATE_SET_NAME);
  await App.createFavoriteDialog.clickCancelButton();
  await App.favoritesPage.checkIfFavoriteSetExists(DUPLICATE_SET_NAME, false);
});

startTest(`Create a duplicate`, async () => {
  await App.favoritesPage.hoverDropDownMenuInFavoriteSet(FAV_SET_NAME);
  await App.favoritesPage.createDuplicateSet(FAV_SET_NAME, DUPLICATE_SET_NAME);
  await App.favoritesPage.checkIfFavoriteSetExists(FAV_SET_NAME);
  await App.favoritesPage.checkIfFavoriteSetExists(DUPLICATE_SET_NAME);
  await App.favoritesPage.deleteFavoriteSet(DUPLICATE_SET_NAME);
});

startTest(`Cancel editing the duplicated set`, async () => {
  await App.favoritesPage.hoverDropDownMenuInFavoriteSet(FAV_SET_NAME);
  await App.favoritesPage.createDuplicateSet(FAV_SET_NAME, DUPLICATE_SET_NAME);
  await App.favoritesPage.hoverDropDownMenuInFavoriteSet(DUPLICATE_SET_NAME);
  await App.favoritesPage.clickButtonInFavoriteSet(
    DUPLICATE_SET_NAME,
    EDIT_FAVORITE_CARD_BUTTON
  );
  await App.createFavoriteDialog.checkIfNameFieldHasValue(DUPLICATE_SET_NAME);
  await App.createFavoriteDialog.clickSaveButton();
  await App.createFavoriteDialog.fillInNameAndDescription(EDITED_SET_NAME);
  await App.createFavoriteDialog.clickCancelButton();
  await App.favoritesPage.checkIfFavoriteSetExists(EDITED_SET_NAME, false);
});

startTest(`Edit the duplicated set`, async () => {
  await App.favoritesPage.hoverDropDownMenuInFavoriteSet(FAV_SET_NAME);
  await App.favoritesPage.createDuplicateSet(FAV_SET_NAME, DUPLICATE_SET_NAME);
  await App.favoritesPage.hoverDropDownMenuInFavoriteSet(DUPLICATE_SET_NAME);
  await App.favoritesPage.clickButtonInFavoriteSet(
    DUPLICATE_SET_NAME,
    EDIT_FAVORITE_CARD_BUTTON
  );
  await App.createFavoriteDialog.checkIfNameFieldHasValue(DUPLICATE_SET_NAME);
  await App.createFavoriteDialog.fillInNameAndDescription(EDITED_SET_NAME);
  await App.createFavoriteDialog.clickSaveButton();
  await App.favoritesPage.checkIfFavoriteSetExists(DUPLICATE_SET_NAME, false);
  await App.favoritesPage.checkIfFavoriteSetExists(EDITED_SET_NAME);
});

// startTest(`Edit the duplicated set`, async () => {
//   await App.favoritesPage.createDuplicateSet(FAV_SET_NAME, DUPLICATE_SET_NAME);
//   await App.favoritesPage.clickButtonInFavoriteSet(DUPLICATE_SET_NAME, 'Edit');
//   await App.createFavoriteDialog.checkIfNameFieldHasValue(DUPLICATE_SET_NAME);
//   await App.createFavoriteDialog.fillInNameAndDescription(EDITED_SET_NAME);
//   await App.createFavoriteDialog.clickSaveButton();
//   await App.favoritesPage.checkIfFavoriteSetExists(DUPLICATE_SET_NAME, false);
//   await App.favoritesPage.checkIfFavoriteSetExists(EDITED_SET_NAME);
// });

startTest(`Edit only the description of set`, async () => {
  await App.favoritesPage.hoverDropDownMenuInFavoriteSet(FAV_SET_NAME);
  await App.favoritesPage.clickButtonInFavoriteSet(
    FAV_SET_NAME,
    EDIT_FAVORITE_CARD_BUTTON
  );
  await App.createFavoriteDialog.fillInDescription(EDITED_SET_DESCRIPTION);
  await App.createFavoriteDialog.clickSaveButton();
  await t.wait(3000);
  await App.favoritesPage.checkIfFavoriteSetExists(FAV_SET_NAME);
  await App.favoritesPage.hoverDropDownMenuInFavoriteSet(FAV_SET_NAME);
  await App.favoritesPage.clickButtonInFavoriteSet(
    FAV_SET_NAME,
    EDIT_FAVORITE_CARD_BUTTON
  );
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

// NOTE: this should NOT be here, it's a search result test.
startTest('Add a well to the set', async () => {
  await App.navigateToResultsPage(WELLS_TAB_TITLE_KEY);
  await App.wellSearchPage.doSearch(wellDataSearchPhrase);
  await App.resultTable.clickRowWithNthCheckbox(0);
  await App.wellSearchPage.addSelectedWellsToFavoriteSet(FAV_SET_NAME);
});
