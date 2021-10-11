import { t, Selector } from 'testcafe';

import { SEARCH_QUERY_INFO_HEADER } from '../../../src/pages/authorized/search/search/SearchQueryInfoPanel/constants';
import { SearchQueryInfoTabType } from '../../../src/pages/authorized/search/search/SearchQueryInfoPanel/types';
import { progress } from '../../utils';

class SearchQueryInfoPanel {
  openSyntaxInfoButton = Selector('[aria-label="Syntax rules"]');

  SyntaxInfoPanel = () =>
    Selector('h5').withText(SEARCH_QUERY_INFO_HEADER).parent();

  SyntaxInfoPanelTab = (tab: SearchQueryInfoTabType) =>
    this.SyntaxInfoPanel().find('button').withText(tab);

  SyntaxInfoPanelTabContent = (text: SearchQueryInfoTabType) =>
    this.SyntaxInfoPanel().find(`[data-testid="${text}-tab"]`);

  closeSyntaxInfoButton = Selector('[aria-label="Close"]');

  SyntaxRuleInfoContainer = Selector(
    '[data-testid="syntax-rule-info-container"]'
  );

  CloseSyntaxRuleInfoContainerButton = this.SyntaxRuleInfoContainer.find(
    'button'
  ).withAttribute('aria-label', 'Close');

  checkSyntaxInfoNotVisibleAfterReopen = async () => {
    this.reopenSyntaxRulePanel();

    progress('Check that the dialog is not visible after reopen', true);
    await t.expect(this.SyntaxRuleInfoContainer.exists).notOk();
  };

  reopenSyntaxRulePanel = async () => {
    progress('Close syntax rule panel');
    await this.closeSearchQueryInfoPanel();

    progress('Re Open syntax rule panel');
    await this.openSearchQueryInfoPanel();
  };

  closeSearchQueryInfoPanel = async () => {
    progress('Close search query info panel');

    progress('Click the search-query-info-panel close button', true);
    await t.click(this.closeSyntaxInfoButton);

    progress('Check that the panel closes', true);
    await t.expect(this.SyntaxInfoPanel().exists).notOk();
  };

  closeSyntaxRuleInfoContainer = async () => {
    progress('Close syntax rule info dialog');

    progress('Click the info dialog close button', true);
    await t.click(this.CloseSyntaxRuleInfoContainerButton);

    progress('Check that the dialog is not visible', true);
    await t.expect(this.SyntaxRuleInfoContainer.exists).notOk();
  };

  checkSyntaxRuleInfoContainerExists = async () => {
    progress('Syntax rule container should be visible');
    await t.expect(this.SyntaxRuleInfoContainer.exists).ok();
  };

  openSearchQueryInfoPanel = async () => {
    progress('Open search query info panel');

    progress('Click the search-query-info-panel button', true);
    await t.click(this.openSyntaxInfoButton);

    progress('Check that the panel appears', true);
    await t.expect(this.SyntaxInfoPanel().exists).ok();
  };

  checkInfoPanelTab = async (tab: SearchQueryInfoTabType) => {
    progress(`Click the "${tab}" tab`);
    await t.click(this.SyntaxInfoPanelTab(tab));

    progress(`Check that the "${tab}" tab is shown`);
    await t.expect(this.SyntaxInfoPanelTabContent(tab).exists).ok();
  };
}

export default new SearchQueryInfoPanel();
