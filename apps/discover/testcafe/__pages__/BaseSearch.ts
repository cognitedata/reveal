import { t, Selector } from 'testcafe';

import { LOADING_TEXT } from '../../src/components/emptyState/constants';
import {
  EXPAND_SEARCH_RESULTS_TEXT,
  EXPAND_MAP_TEXT,
} from '../../src/pages/authorized/search/map/constants';
import { progress } from '../utils/utils';

import App from './App';

const SEARCH_QUERY_NO_RESULTS = 'NO_RESULTS_HERE';

/**
 * All the generic selectors and generic functions should be included here.
 * All the other pages should extend this page.
 */
export class BaseSearchPage {
  /**
   * Generic selectors
   */
  public readonly loadingScreen = Selector('span').withExactText(LOADING_TEXT);

  public readonly expandSearchResultsButton = Selector(
    '[data-testid="block-expander"]'
  ).withText(EXPAND_SEARCH_RESULTS_TEXT);

  public readonly expandMapButton = Selector(
    '[data-testid="expand-map"]'
  ).withText(EXPAND_MAP_TEXT);

  public readonly columnSettingsButton = Selector(
    '[data-testid="organize-columns"]'
  );

  public readonly columnSettingsContainer = Selector(
    '[data-testid="columns-panel-open"]'
  );

  public readonly searchResultsTab = (tabName: string) =>
    Selector('[role="tab"]').withText(tabName);

  public readonly activeSearchResultTab = (tabName: string) =>
    this.searchResultsTab(tabName).withAttribute('aria-selected', 'true');

  /**
   * Generic functions
   */
  public readonly refreshPage = async () => {
    progress('Refresh the page');
    await t.eval(() => window.location.reload());
  };

  public readonly expandSearchResults = async (indent = false) => {
    progress('Expand search results', indent);
    await t.click(this.expandSearchResultsButton);
  };

  public readonly doSearch = async (search: string, clearFilters = true) => {
    if (clearFilters) {
      progress('Clearing all filters');
      await App.filterClearPage.clearAllFilters();
    }
    await App.sidebar.mainSearch.doSearch(search);
  };

  public readonly doEmptySearch = async () => {
    await App.sidebar.mainSearch.doEmptySearch();
  };

  public readonly doSearchWithNoResults = async (clearFilters = true) => {
    await this.doSearch(SEARCH_QUERY_NO_RESULTS, clearFilters);
  };

  public readonly checkIfSearchPhraseNotEqualsTo = async (phrase: string) => {
    progress(`Check if search phrase not equals to '${phrase}'`);
    const searchPhrase = await App.sidebar.mainSearch.getSearchPhrase();
    await t.expect(searchPhrase).notEql(phrase);
  };

  public readonly getColumnSettingsOptions = (columnName: string) => {
    return this.columnSettingsContainer.find('label').withText(columnName);
  };

  public readonly clickSearchResultTab = async (tabName: string) => {
    progress(`Clicking '${tabName}' tab`);
    await t.click(this.searchResultsTab(tabName));
  };

  public readonly checkIfSearchResultTabIsActive = async (tabName: string) => {
    progress(`Checking if '${tabName}' tab is active`);
    await t.expect(this.activeSearchResultTab(tabName).exists).ok();
  };
}

export default new BaseSearchPage();
