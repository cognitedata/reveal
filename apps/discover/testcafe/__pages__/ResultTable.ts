import { screen } from '@testing-library/testcafe';
import { Selector, t } from 'testcafe';

import { CREATE_NEW_SET } from '../../src/components/add-to-favorite-set-menu/constants';
import { find, progress } from '../utils';

import App from './App';

class ResultTable {
  row = find('table-row');

  cellExpanded = find('table-cell-expanded');

  columnSettingsContainer = find('columns-panel-open');

  columnSettingsButton = find('organize-columns');

  bulkActionBar = find('table-bulk-actions');

  getBulkActionText = (text: string) =>
    this.bulkActionBar.find('div').withText(text);

  getColumnSettingsOptions = (columnName: string) => {
    return this.columnSettingsContainer.find('label').withText(columnName);
  };

  getColumnHeader = (name: string) => {
    return find('table-header-cell').withText(name).nth(0);
  };

  getNthColumnHeader = (nth: number) => {
    return find('table-header-cell').nth(nth);
  };

  getHeaderRow = () => screen.getByTestId('table-header-row').nth(0);

  /**
   * Retruns a row selector with a nth (zero-based index)
   */
  getRowWithNth = (nth: number) => this.row.nth(nth);

  /**
   * Retruns a row selector with a specific text
   */
  getRowWithText = (text: string) =>
    Selector('[data-testid="table-row"]').withText(text).nth(0);

  getCellWithText = (text: string) =>
    Selector('[data-testid="table-cell"]').withText(text).nth(0);

  getHoverDropdownMenu = () => Selector('.tippy-content');

  /**
   * ???
   */
  getNthNestedResult = (nth: number) => {
    return Selector(
      '[data-testid="table-cell-expanded"] [data-testid="table-cell"]'
    ).nth(nth);
  };

  /**
   * Retruns the amount of rows in the results table
   */
  getResultsCount = () => this.row.count;

  selectAllRows = async () => {
    progress('Select all rows');
    await t.click(this.getHeaderRow().find('[class*="checkbox-ui"]'));
  };

  /**
   * Hover on a given row
   */
  hoverRow = async (row: Selector) => {
    const MiddleChildNth = Math.floor((await row.childNodeCount) / 3);
    await t.hover(row.find('[data-testid="table-cell"]').nth(MiddleChildNth));
  };

  /**
   * Hover on a row with nth (zero-based index)
   */
  hoverRowWithNth = async (nth: number) => {
    progress(`Hover the row #:${nth + 1}`);

    await this.hoverRow(this.getRowWithNth(nth));
  };

  /**
   * Hover a row with a specific text in one of the cells
   */
  hoverRowWithText = async (text: string) => {
    progress(`Hover the row with text: "${text}"`);
    await this.hoverRow(Selector('[data-testid="table-row"]').withText(text));
  };

  /**
   * Click on a row with nth (zero-based index)
   */
  clickRowWithNth = async (nth: number) => {
    progress(`Click the row #:${nth + 1}`);
    const rowCellCount = await this.getRowWithNth(nth).childNodeCount;
    const MiddleChildNth = Math.floor(rowCellCount / 3);

    await t.click(
      this.getRowWithNth(nth)
        .find('[data-testid="table-cell"]')
        .nth(MiddleChildNth)
    );
  };

  /**
   * Click on a row with a specific text in one of the cells
   */
  clickRowWithText = async (text: string) => {
    progress(`Click the row with text: "${text}"`);
    await t.click(this.getCellWithText(text));
  };

  /**
   * Click on the checkbox in the row with nth (zero-based index)
   */
  clickRowWithNthCheckbox = async (nth: number) => {
    progress(`Click the checkbox in row #:${nth + 1}`);
    await t.click(this.getRowWithNth(nth).find('div[class*="checkbox-ui"]'));
  };

  clickCheckboxOfRowWithText = async (text: string) => {
    progress(`Click the checkbox of row with text ${text}`);
    await t.click(
      this.getCellWithText(text)
        .parent('[data-testid="table-row"]')
        .find('div[class*="checkbox-ui"]')
    );
  };

  clickRowWithNthButtonWithText = async (nth: number, buttonText: string) => {
    progress(`Click '${buttonText}' button in row #:${nth + 1}`);
    await t.click(this.getRowWithNth(nth).find('button').withText(buttonText));
  };

  clickRowWithNthIconWithTestId = async (nth: number, testId: string) => {
    progress(`Click '${testId}' button in row #:${nth + 1}`);
    await t.click(
      this.getRowWithNth(nth)
        .find('button')
        .withAttribute('data-testid', testId)
    );
  };

  openAddToFavoritesSubmenuOfRowHoverActions = async (text: string) => {
    await this.hoverRowWithText(text);

    progress(`Hover three dots of row with text ${text}`);
    await t.hover(
      this.getRowWithText(text).find('[data-testid="menu-button"]')
    );

    progress('Wait for the menu to show');
    await t.wait(500);

    progress('Hover the "Add to favorites" button');
    await t.hover(Selector('button').withText('Add to favorites'));
  };

  addRowItemToExistingFavoriteSetUsingHoverActions = async (
    text: string,
    setName: string
  ) => {
    await this.openAddToFavoritesSubmenuOfRowHoverActions(text);
    await t.click(Selector('button').withText(setName));
  };

  addRowItemToNewFavoriteSetUsingHoverActions = async (text: string) => {
    await this.addRowItemToExistingFavoriteSetUsingHoverActions(
      text,
      CREATE_NEW_SET
    );
  };

  hasResults = async () => {
    progress(`Search results should be shown in the table`);
    const resultsCount = await this.getResultsCount();
    await t.expect(resultsCount).gt(0);
  };

  hasNoResults = async () => {
    progress(`Search results should not be shown in the table`);
    const resultsCount = await this.getResultsCount();
    await t.expect(resultsCount).eql(0);

    progress('Wait for the no-results page to appear');
    const emptyStateExists = await App.filterClearPage.noResult().exists;
    await t.expect(emptyStateExists).eql(true);
  };

  hasResultsAtLeast = async (atLeast: number) => {
    progress(`Checking if search results has at least: '${atLeast}' results`);
    await t.expect(this.row.exists).ok({ timeout: 2000 });

    const foundCount = await this.getResultsCount();
    progress(`Found count: ${foundCount}`, true);
    await t.expect(foundCount).gte(atLeast);
  };

  hasNumberOfSearchResults = async (expectedCount: number) => {
    progress(`Checking if search results has '${expectedCount}' results`);
    await t.expect(this.row.exists).ok({ timeout: 2000 });

    const foundCount = await this.getResultsCount();
    progress(`Found count: ${foundCount}`, true);
    await t.expect(foundCount).eql(expectedCount);
  };

  collapseExpandedRows = async () => {
    const count = await this.getResultsCount();

    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line no-await-in-loop
      const isExpanded = await this.getRowWithNth(i).find(
        '[data-testid="table-cell-expanded"]'
      ).exists;

      if (isExpanded) {
        this.clickRowWithNth(i);
      }
    }
  };

  goToMoreOptionsOfRowIncludesCell = async (cellContent: string) => {
    progress(`Go to more options of row includes '${cellContent}'`);

    const row = Selector('[data-testid="table-row"]').nth(0);

    progress(`Hover row includes '${cellContent}' in result list`, true);
    await this.hoverRow(row);

    progress(`Hover more options`, true);
    await t.hover(row.find('[data-testid="menu-button"]'));
  };

  selectOptionFromMoreOptionsDropdown = async (option: string) => {
    progress(`Select option from more options dropdown: ${option}`);

    const dropdownOption = Selector('[class="cogs-menu"]')
      .find('button')
      .withExactText(option);

    await t.click(dropdownOption);
  };

  checkIfColumnExists = async (columnName: string, exists = true) => {
    progress(`Check if '${columnName}' column ${exists ? '' : 'not'} exists`);
    const columnExists = await this.getColumnHeader(columnName).exists;
    await t.expect(columnExists).eql(exists);
    return columnExists;
  };

  clickColumnSettingButton = async (action?: 'Open' | 'Close') => {
    progress(`${action || 'Click'} column setting ${action && 'button'}`);
    await t.click(this.columnSettingsButton);
  };

  clickColumnSettingsOption = async (columnName: string) => {
    progress(`Click ${columnName} option`);
    await t.click(this.getColumnSettingsOptions(columnName));
  };

  checkIfColumnSettingsPanelExists = async (exists = true) => {
    progress('Open column settings popup');
    await t.expect(this.columnSettingsContainer.exists).eql(exists);
  };

  checkIfColumnExistsAndDisplayIfNotExists = async (columnName: string) => {
    progress(`Check if ${columnName} column exists`);
    const columnExist = await App.resultTable.getColumnHeader(columnName)
      .exists;

    if (!columnExist) {
      progress(`Display ${columnName} column if since not exists`);
      await this.clickColumnSettingButton('Open');
      await this.checkIfColumnSettingsPanelExists();
      await this.clickColumnSettingsOption(columnName);
      await this.clickColumnSettingButton('Close');
    }
  };

  rowWithTextIsVisible = async (text: string) => {
    progress(`Expect ${text} in result table`);
    await t.expect(App.resultTable.getCellWithText(text).exists).ok();
  };

  /**
   * `View` button which appear on hover
   */
  clickViewButton = async (text: string) => {
    progress(`Click view button on line with text ${text}`);
    await t.click(
      this.getRowWithText(text).find('[data-testid="button-view-saved-search"]')
    );
  };

  hoverThreeDotsIcon = async (text: string) => {
    progress(`Click three dots on line with text ${text}`);
    await t.hover(
      this.getRowWithText(text).find('[data-testid="menu-button"]')
    );
  };

  clickHoverMenuItem = async (menuItem: string) => {
    progress(`Click ${menuItem} of menu`);
    await t.click(
      this.getHoverDropdownMenu().find('button').withText(menuItem)
    );
  };

  clickHoverViewButtonofRow = async (text: string) => {
    await this.hoverRowWithText(text);
    await this.clickViewButton(text);
  };

  hoverThreeDotHoverIconofRowAndClickMenuItem = async (
    text: string,
    item: string
  ) => {
    await this.hoverRowWithText(text);
    await this.hoverThreeDotsIcon(text);
    await this.clickHoverMenuItem(item);
  };
}

export default new ResultTable();
