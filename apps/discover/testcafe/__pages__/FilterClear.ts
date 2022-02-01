import { screen } from '@testing-library/testcafe';
import { t, Selector } from 'testcafe';

import { NO_RESULTS_TEXT } from '../../src/components/emptyState/constants';
import {
  CLEAR_ALL_TEXT,
  SEARCH_VALUE_LABEL,
} from '../../src/components/tableEmpty/constants';
import {
  DATA_SOURCE,
  FIELD_BLOCK_OPERATOR,
} from '../../src/modules/wellSearch/constantsSidebarFilters';
import { progress } from '../utils';

class FilterClearPage {
  public readonly fieldBlockOperatorCaption = FIELD_BLOCK_OPERATOR;

  public readonly dataSourceCaption = 'Source';

  public readonly noResultMessage = Selector('span').withText(NO_RESULTS_TEXT);

  public readonly noResult = () => this.noResultMessage.parent().parent();

  public readonly clearAllFiltersBtn = () =>
    this.noResult().find('button').withText(CLEAR_ALL_TEXT).nth(0);

  public readonly searchInputContainer = () =>
    this.noResult().find('span').withText(SEARCH_VALUE_LABEL).nth(0);

  public readonly dataSourceContainer = () =>
    this.noResult().find('span').withText(DATA_SOURCE).nth(0);

  public readonly fieldContainer = () =>
    this.noResult().find('span').withText(FIELD_BLOCK_OPERATOR).nth(0);

  public readonly searchInputValue = (value: string) =>
    this.searchInputContainer().parent().find('span').withText(value).nth(0);

  public readonly searchInputCloseBtn = () =>
    this.searchInputContainer().parent().find('i[role="button"]').nth(0);

  public readonly getDataSourceCloseBtn = (nth = 0) =>
    this.dataSourceContainer().parent().find('i[role="button"]').nth(nth);

  public readonly getFieldCloseBtn = (nth = 0) =>
    this.fieldContainer().parent().find('i[role="button"]').nth(nth);

  public clearAllFilters = async () => {
    progress(`Searching for 'no results'`);
    try {
      const buttonExist = await this.noResultMessage.exists;

      if (buttonExist) {
        progress(`Clicking on clear all filters`);
        const clearAllButton = screen.getByText(CLEAR_ALL_TEXT);
        await t.click(clearAllButton);
      } else {
        progress(`Cannot find button`);
      }
    } catch (error) {
      progress(`Cannot find filter clear button: ${error}`);
    }
  };

  public confimPageHasNoResult = async () => {
    progress('No results page should appear');
    await t.expect(this.noResultMessage.exists).eql(true);
  };

  public getFilterTag = (name: string) =>
    screen.getAllByTestId('filter-tag').withText(name);

  public clickFilter = async (name: string) => {
    progress(`Clicking on clear '${name}' filter`);

    const element = this.getFilterTag(name);

    await t.click(element);
  };

  checkIfTagExists = async (name: string, exists = true) => {
    progress(`Check if '${name} filter tag ${exists ? '' : 'not'} exists`);
    await t
      .expect(this.getFilterTag(name).exists)
      .eql(exists, { timeout: 2000 });
  };

  clearSearchInput = async () => {
    progress('Clear search input');
    await t.click(this.searchInputCloseBtn());
  };
}

export default new FilterClearPage();
