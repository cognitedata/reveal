import { within, screen } from '@testing-library/testcafe';
import { t, Selector } from 'testcafe';

import { CLEAR_ALL_TEXT } from '../../src/components/tableEmpty/constants';
import { EXPAND_FILTERS_TEXT } from '../../src/pages/authorized/search/search/SideBar/constants';
import { progress } from '../utils';

import DateRange from './sidebar/DateRange';
import DocumentFilterTag from './sidebar/DocumentFilterTag';
import FileType from './sidebar/FileType';
import MainSearch from './sidebar/MainSearch';
import SearchQueryInfoPanel from './sidebar/SearchQueryInfoPanel';
import WellFilterTag from './sidebar/WellFilterTag';

class Sidebar {
  dateRange = DateRange;

  fileType = FileType;

  mainSearch = MainSearch;

  searchQueryInfoPanel = SearchQueryInfoPanel;

  documentFilterTag = DocumentFilterTag;

  wellFilterTag = WellFilterTag;

  hideSidebarButton = Selector('[data-testid="hide-sidebar"]');

  expandSidebarButton = Selector('[data-testid="block-expander"]').withText(
    EXPAND_FILTERS_TEXT
  );

  goBackArrow = Selector('[data-testid="base-button-margin-wrapper"]').find(
    'button'
  );

  filterCategory = (category: string) =>
    Selector(`[data-test-filter-title="${category}"]`);

  filterOption = Selector('[data-testid="filter-checkbox-label"]');

  searchSuggetionsPanel = Selector('.cogs-select__group');

  filterDropdown = (category: string, dropdown: string) =>
    this.filterCategory(category)
      .parent('div.rc-collapse-item')
      .find('span')
      .withText(dropdown)
      .parent('[data-testid="filter-item-wrapper"]')
      .find('div.cogs-autocomplete');

  filterDropdownItem = (
    category: string,
    dropdown: string,
    itemToSelect: string
  ) =>
    this.filterCategory(category)
      .parent('div.rc-collapse-item')
      .find('span')
      .withText(dropdown)
      .parent('[data-testid="filter-item-wrapper"]')
      .find('div[data-testid="filter-option-label"]')
      .withText(itemToSelect);

  filterClearButton = () => Selector('[data-testid="clear-button"]');

  filterCategoryClearButton = (category: string) =>
    this.filterCategory(category).parent().find('button').withText('Clear');

  documentFilterTagWithText = (text: string) =>
    Selector('[data-testid="side-bar"]')
      .find('[data-testid="document-filter-container"]')
      .find('[data-testid="filter-tag"]')
      .withText(text);

  documentClearAllFilterTag = () =>
    Selector('[data-testid="side-bar"]')
      .find('[data-testid="document-filter-container"]')
      .find('[data-testid="clear-all-filter-button"]')
      .withText(CLEAR_ALL_TEXT);

  wellFilterTagWithText = (text: string) =>
    Selector('[data-testid="side-bar"]')
      .find('[data-testid="well-filter-container"]')
      .find('[data-testid="filter-tag"]')
      .withText(text);

  wellClearAllFilterTag = () =>
    Selector('[data-testid="side-bar"]')
      .find('[data-testid="clear-all-filter-button"]')
      .withText(CLEAR_ALL_TEXT);

  searchHistorySugession = (phrase: string) =>
    this.searchSuggetionsPanel.find('div').withExactText(phrase);

  checkIfSidebarIsOpen = async () => {
    progress('Check if the sidebar is open');
    progress('Hide side bar button should be visible', true);
    await t.expect(this.hideSidebarButton.exists).ok();
  };

  checkIfSidebarIsClose = async () => {
    progress('Check if the sidebar is close');
    progress('Expand side bar button should be visible', true);
    await t.expect(this.expandSidebarButton.exists).ok();
  };

  clickHideSidebarButton = async () => {
    progress('Hide the sidebar');
    await t.click(this.hideSidebarButton);
  };

  clickExpandSidebarButton = async () => {
    progress('Expand the sidebar');
    await t.click(this.expandSidebarButton);
  };

  clickFilterCategory = async (name: string) => {
    progress(`Select filter cateogry: ${name}`);

    const element = within(screen.getByTestId('side-bar')).getByText(name);
    await t.click(element);
  };

  clickFilterSubCategory = async (name: string) => {
    progress(`Select filter sub cateogry: ${name}`);

    const element = screen.getByRole('button', { name });
    await t.click(element);
  };

  getFilterOption = (name: string) => this.filterOption.withText(name);

  clickFilterOption = async (name: string) => {
    progress(`Click checkbox of filter option: ${name}`);
    await t.click(this.getFilterOption(name));
  };

  clickNthFilterOption = async (nth: number) => {
    progress(`Click checkbox filter option #: ${nth + 1}`);
    await t.click(this.filterOption.nth(nth));
  };

  clearFilterCategory = async (category: string) => {
    progress(`Clear filter sub-category: ${category}`);
    await t.click(this.filterCategoryClearButton(category));
  };

  clickGoBackArrow = async () => {
    progress('Click go back arrow to collpase filters');
    await t.click(this.goBackArrow);
  };

  searchSuggesionPanelIsOpen = async () => {
    progress('Search suggesion panel is visible');
    await t.expect(this.searchSuggetionsPanel.exists).ok();
  };

  searchHistoryVisible = async (phrase: string) => {
    progress('Search history item is visible');
    await t.expect(this.searchHistorySugession(phrase).exists).ok();
  };

  clickSearchHistoryItem = async (phrase: string) => {
    progress('Click search history item');
    await t.click(this.searchHistorySugession(phrase));
  };
}

export default new Sidebar();
