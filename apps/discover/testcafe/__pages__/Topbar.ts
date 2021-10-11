import { Selector, t } from 'testcafe';

import {
  SEARCH_LINK_TEXT_KEY,
  FAVORITES_LINK_TEXT_KEY,
} from '../../src/pages/authorized/menubar/constants';
import { progress } from '../utils';

class Topbar {
  public readonly topbar = Selector('[data-testid="top-bar"]');

  public readonly cogniteLogo = Selector('[data-testid="cognite-logo"]');

  public readonly generalFeedbackLink = Selector(
    'button.cogs-menu-item'
  ).withText('Feedback');

  public readonly feedbackDropdown = Selector(
    '[data-test-id="feedback-options"]'
  );

  public readonly clickNavigationTab = async (tabName: string) => {
    progress(`Clicking '${tabName}' tab in topbar`);

    const tab = this.topbar.find('button').withText(tabName);
    await t.click(tab);
  };

  navigateToFavorites = async () => {
    progress('Click on "Favorites" tab from topbar');
    await this.clickNavigationTab(FAVORITES_LINK_TEXT_KEY);
  };

  navigateToSearch = async () => {
    progress(`Click on "Search" tab from topbar`);
    await this.clickNavigationTab(SEARCH_LINK_TEXT_KEY);
  };
}

export default new Topbar();
