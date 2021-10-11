import { Selector, t } from 'testcafe';

import { WELLS_TAB_TITLE_KEY } from '../../src/pages/authorized/search/constants';
import { progress } from '../utils';

import App from './App';
import { BaseSearchPage } from './BaseSearch';

class WellSearchPage extends BaseSearchPage {
  public readonly wellboreTable = Selector(
    '[data-testid="wellbore-result-table"]'
  );

  public readonly WellsInspectButton = Selector(
    '[data-testid="wells-inspect-button"]'
  );

  public readonly firstwellboreResultTableRow = this.wellboreTable.find(
    '[data-testid="table-cell"]'
  );

  public readonly inspectTabs = Selector(
    '[data-testid="well-inspect-navigation-tabs"]'
  );

  public readonly wellPreviewCloseButton = Selector('button').withAttribute(
    'data-testid',
    'preview-card-close-button'
  );

  public readonly wellFeedbackButton = Selector('button').withAttribute(
    'data-testid',
    'well-button-feedback'
  );

  public readonly wellCardViewButton = Selector('button').withAttribute(
    'data-testid',
    'well-button-view'
  );

  public readonly wellTabElement = Selector('[data-testid="result-panel-tabs"]')
    .find('span')
    .withExactText(WELLS_TAB_TITLE_KEY)
    .parent('div.rc-tabs-tab');

  public readonly addToFavoritesButton = Selector(
    '[data-testid="welldata-favorite-all-button"]'
  );

  clickWellInspectButton = async (indent = false) => {
    progress('Click the inspect button', indent);
    await t.click(this.WellsInspectButton);
  };

  clickAutoCompleteOptionInFilterDropdown = async (
    childTitle: string,
    dropdown: string,
    itemToSelect: string
  ) => {
    progress(`Click "${dropdown}" auto complete`);
    await t.click(App.sidebar.filterDropdown(childTitle, dropdown));

    progress('Click auto complete option');
    await t.click(
      App.sidebar.filterDropdownItem(childTitle, dropdown, itemToSelect)
    );
  };

  addSelectedWellsToFavoriteSet = async (setName: string) => {
    progress(`Add selected wells to favorite set: ${setName}`);

    progress('Click the add to favorites button', true);
    await t.click(this.addToFavoritesButton);

    progress('Check that the list of favorite sets appears', true);
    const favoriteSet = App.documentSearchPage.addToFavoriteSet(setName);
    await t.expect(favoriteSet.exists).ok({ timeout: 2000 });

    progress('Click favorite set to add', true);
    await t.click(favoriteSet);
  };
}

export default new WellSearchPage();
