import { screen } from '@testing-library/testcafe';
import { t, Selector } from 'testcafe';

import {
  CREATE_SET_HEADER_BUTTON_TEXT,
  DELETE_SET_CONFIRM_BUTTON,
  FAVORITE_CARD_SWITCH,
  FAVORITE_LIST_SWITCH,
  DUPLICATED_SET_SUFFIX,
  DUPLICATE_SET_MODAL_BUTTON_TEXT,
  FAVORITE_SET_NO_DOCUMENTS,
  FAVORITE_SET_NO_WELLS,
  DUPLICATE_FAVORITE_CARD_BUTTON,
} from '../../src/pages/authorized/favorites/constants';
import { progress } from '../utils/utils';

import App from './App';
import { BaseSearchPage } from './BaseSearch';
import ShareFavoriteDialog from './ShareFavoriteDialog';

export const FAVORITE_DESCRIPTION_TESTCAFE = 'TESTING_DESC_CONTENT';

type Action = 'Edit' | 'Duplicate' | 'Share' | 'Delete';
type View = 'card' | 'list';

class FavoritesPage extends BaseSearchPage {
  public readonly shareFavoriteDialog = ShareFavoriteDialog;

  public readonly createNewFavoriteSetButton = Selector('button').withText(
    CREATE_SET_HEADER_BUTTON_TEXT
  );

  public readonly favoriteSetEmptyDocuments = Selector('span').withText(
    FAVORITE_SET_NO_DOCUMENTS
  );

  public readonly favoriteSetEmptyWells = Selector('span').withText(
    FAVORITE_SET_NO_WELLS
  );

  public readonly favoriteSetWellsTab = screen.getByRole('tab', {
    name: /Wells/,
  });

  public readonly favoriteSetTitle = (title: string) =>
    Selector('div').withExactText(title);

  public readonly favoriteSavedSearchEmptyContainer = Selector(
    '[data-testid="empty-state-container"]'
  );

  public readonly favoriteBulkActionBar = Selector(
    '[data-testid="table-bulk-actions"]'
  );

  public readonly favoriteShareButton = Selector(
    '[data-testid="favorite-set-action-share"]'
  );

  public readonly favoriteBulkActionButtons = (arialLabel: string) =>
    this.favoriteBulkActionBar
      .find('button')
      .withAttribute('aria-label', arialLabel);

  public readonly favoriteSetCardAction = (title: string, action: Action) =>
    screen
      .getByText(title)
      .parent()
      .find('button')
      .withAttribute('aria-label', action);

  public readonly favoriteSetItem = (itemTitle: string) =>
    Selector('[data-testid="table-row"]').find('button').withText(itemTitle);

  public readonly deleteModalConfirmButton = screen.getByText(
    DELETE_SET_CONFIRM_BUTTON,
    {
      selector: '.cogs-modal-footer-buttons > button',
    }
  );

  public readonly switchView = async (viewType: View) => {
    progress(`Switch to '${viewType}' view`);
    const testId =
      viewType === 'card' ? FAVORITE_CARD_SWITCH : FAVORITE_LIST_SWITCH;

    await t.click(screen.getByTestId(testId));
  };

  public readonly clickCreateNewButton = async () => {
    progress(`Click '${CREATE_SET_HEADER_BUTTON_TEXT}' button`);
    await t.click(this.createNewFavoriteSetButton);
  };

  public readonly favoriteBackButton = Selector('button').withAttribute(
    'aria-label',
    'Go back'
  );

  public readonly favoriteDropdownMenu = (title: string) =>
    Selector(`[data-testid="menu-button-${title}"]`);

  public readonly favoriteDropdownMenuItem = (
    setName: string,
    itemTitle: string
  ) =>
    Selector(`[data-testid="dropdown-menu-${setName}"]`)
      .find('button')
      .withText(itemTitle);

  public readonly goToWellTab = async () => {
    progress('Go to well tab');
    await t.click(this.favoriteSetWellsTab);
  };

  public readonly clickBackButton = async () => {
    progress('Click back button');
    await t.click(this.favoriteBackButton);
  };

  public readonly createFavoriteSet = async (setName = 'My favorite set') => {
    progress(`Create a new favorite set: ${setName}`);
    await this.clickCreateNewButton();

    await App.createFavoriteDialog.fillInNameAndDescription(setName);

    progress('Click create button', true);
    await t.click(App.createFavoriteDialog.createButton);
  };

  public readonly deleteFavoriteSet = async (setName = 'My favorite set') => {
    progress(`Delete favorite set: ${setName}`);
    await t.click(this.favoriteSetCardAction(setName, 'Delete'));

    progress('Confirm the deletion');
    await t.click(this.deleteModalConfirmButton);
  };

  public readonly openFavoriteSet = async (setName: string) => {
    progress(`Open the details page for the set: ${setName}`);
    await t.click(this.favoriteSetTitle(setName));

    progress(`Check if the set name title '${setName}' is shown`, true);
    await t.expect(this.favoriteSetTitle(setName).exists).ok({ timeout: 2000 });
  };

  public readonly checkIfFavoriteSetExists = async (
    setName: string,
    shouldExist = true
  ) => {
    progress(`Check if '${setName}' exists in favorites`);
    await t.expect(this.favoriteSetTitle(setName).exists).eql(shouldExist);
  };

  public readonly checkIfItemExistsInFavoriteSet = async (
    itemTitle: string,
    shouldExist = true,
    timeout = 3000
  ) => {
    progress(`Check if '${itemTitle}' exists in favorite set`);
    await t
      .expect(this.favoriteSetItem(itemTitle).exists)
      .eql(shouldExist, { timeout });
  };

  public readonly clickButtonInFavoriteSet = async (
    setName: string,
    action: Action
  ) => {
    progress(`Click the '${action}' button in the set`);
    await t.click(this.favoriteDropdownMenuItem(setName, action));
  };

  public readonly hoverDropDownMenuInFavoriteSet = async (setName: string) => {
    progress(`Hover the menu in the set`);
    await t.hover(this.favoriteDropdownMenu(setName));
  };

  public readonly checkIfFavoriteSetIsEmpty = async () => {
    progress('Check if the favorite set is empty');
    await t.expect(this.favoriteSetEmptyDocuments.exists).ok();
    await t.click(this.favoriteSetWellsTab);
    await t.expect(this.favoriteSetEmptyWells.exists).ok();
  };

  public readonly createDuplicateSet = async (
    setName: string,
    duplicateSetName: string
  ) => {
    await this.clickButtonInFavoriteSet(
      setName,
      DUPLICATE_FAVORITE_CARD_BUTTON
    );

    await App.createFavoriteDialog.checkIfNameFieldHasValue(
      `${setName}${DUPLICATED_SET_SUFFIX}`
    );

    await App.createFavoriteDialog.fillInNameAndDescription(duplicateSetName);

    progress(
      `Click "${DUPLICATE_SET_MODAL_BUTTON_TEXT}" button to create the duplicate`
    );
    await t.click(App.createFavoriteDialog.duplicateButton);
  };

  public readonly checkIfBulkActionBarExists = async () => {
    progress('Should show bulk action bar');
    await t.expect(App.favoritesPage.favoriteBulkActionBar.exists).eql(true);
    await t
      .expect(
        App.favoritesPage.favoriteBulkActionButtons('remove from set').exists
      )
      .eql(true);
    await t
      .expect(
        App.favoritesPage.favoriteBulkActionButtons('View the selected wells')
          .exists
      )
      .eql(true);
    await t
      .expect(
        App.favoritesPage.favoriteBulkActionButtons('Clear selection').exists
      )
      .eql(true);
  };
}

export default new FavoritesPage();
