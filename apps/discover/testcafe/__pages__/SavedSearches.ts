import { screen } from '@testing-library/testcafe';
import { t, Selector } from 'testcafe';

import { OVERWRITE_SEARCH_MODAL_BUTTON_TEXT } from '../../src/components/modals/constants';
import { SAVED_SEARCHES_TAB_TEXT } from '../../src/pages/authorized/favorites/constants';
import { WELLS_TAB_TITLE_KEY } from '../../src/pages/authorized/search/constants';
import { SAVED_SEARCHES_MENU_CREATE_NEW_TEXT } from '../../src/pages/authorized/search/search/SavedSearches/constants';
import { progress } from '../utils';

import App from './App';
import { BaseSearchPage } from './BaseSearch';

class SavedSearchesPage extends BaseSearchPage {
  public readonly savedSearchesButton = Selector(
    '[data-testid="saved-searches-button"]'
  );

  public readonly createNewPanel = Selector('span').withText(
    SAVED_SEARCHES_MENU_CREATE_NEW_TEXT
  );

  public readonly savedSearchInput = Selector(
    '[data-testid="saved-search-input"]'
  );

  public readonly savedSearchInputClearButton = Selector(
    '[class="btn-reset input-clear-button"]'
  );

  public readonly saveNewSearchButton = Selector(
    '[data-testid="save-new-search-button"]'
  );

  public readonly overwriteSavedSearchButton = Selector('button').withText(
    OVERWRITE_SEARCH_MODAL_BUTTON_TEXT
  );

  public readonly savedSearchesTab = Selector('div.rc-tabs-tab-btn').withText(
    SAVED_SEARCHES_TAB_TEXT
  );

  public readonly savedSearchesPanelItem = (itemName: string) =>
    Selector('[class="cogs-menu-item"]').withText(itemName);

  public readonly savedSearchesTableItem = (itemName: string) =>
    Selector('[data-testid="table-cell"]').withText(itemName);

  public readonly wellsTab = Selector('div.rc-tabs-tab-btn').withText(
    WELLS_TAB_TITLE_KEY
  );

  /*
   *
   * FROM HERE DOWN ARE THE THINGS FOR THE SAVED SEARCH:
   *
   * --> IN THE SIDEBAR!
   *
   */

  typeTextInSavedSearchInput = async (search: string) => {
    progress(`Type ${search} in saved search input`);
    await t
      .click(this.savedSearchInput)
      .typeText(this.savedSearchInput, search, {
        speed: 0.5,
        replace: true,
      });
    await t.expect(this.savedSearchInput.value).eql(search);
  };

  saveNewSearchOrOverwriteExisting = async () => {
    await this.saveNewSearch();

    progress('Check if saved search already exists', true);
    if (await this.overwriteSavedSearchButton.exists) {
      progress('Overwrite saved search', true);
      await t.click(this.overwriteSavedSearchButton);
      await t.click(this.savedSearchesButton);
    }
  };

  closeSavedSearchPanel = async () => {
    progress('Click to the side to close the saved search panel');
    await t.click(this.savedSearchesButton, {
      offsetX: 400,
      offsetY: 40,
      speed: 0.5,
    });
  };

  saveNewSearch = async () => {
    progress('Click on `Save` button');
    await t.click(this.saveNewSearchButton);
  };

  checkIfSavedSearchInputIsEmpty = async () => {
    await t.expect(this.savedSearchInput.value).eql('');
  };

  loadSavedSearchFromDropdown = async (name: string) => {
    progress(`Click on a saved search: ${name}`);
    await t.click(screen.getByText(name));
  };

  clickInputClear = async () => {
    progress('Click `Clear` button');
    await t.click(this.savedSearchInputClearButton);
  };

  checkIfSavedSearchExistsInPanel = async (savedSearchName: string) => {
    await t
      .expect(this.savedSearchesPanelItem(savedSearchName).exists)
      .eql(true, { timeout: 2000 });
  };

  saveCurrentSearchToSavedSearch = async (savedSearchName: string) => {
    await this.closeSavedSearchPanel();
    await this.clickSavedSearchesButton();
    await this.typeTextInSavedSearchInput(savedSearchName);
    await this.saveNewSearchOrOverwriteExisting();
    await this.clickSavedSearchesButton();
    await this.checkIfSavedSearchExistsInPanel(savedSearchName);
    await this.closeSavedSearchPanel();
  };

  /*
   *
   * FROM HERE DOWN ARE THE THINGS FOR THE SAVED SEARCH:
   *
   * --> IN FAVORITES!
   *
   */
  clickSavedSearchesButton = async () => {
    progress('Click on the saved searches button');
    await t.click(this.savedSearchesButton);
    await t.expect(this.createNewPanel.exists).eql(true);
  };

  clickFavouritesAndGoToSavedSearches = async () => {
    await App.topbar.navigateToFavorites();

    progress('Click `Saved Searches` tab');
    await t.click(this.savedSearchesTab);
  };

  checkIfSavedSearchExistsInTable = async (savedSearchName: string) => {
    progress(`Check if ${savedSearchName} exists in table`);
    await t
      .expect(this.savedSearchesTableItem(savedSearchName).exists)
      .eql(true, { timeout: 2000 });
  };

  launchSavedSearch = async (savedSearchName: string) => {
    progress(`Launch saved search: '${savedSearchName}'`);

    const row = App.resultTable.getRowWithText(savedSearchName);
    const maximizeButton = row.find('button').withAttribute('id', 'maximize');

    await t.click(maximizeButton);
  };
}

export default new SavedSearchesPage();
