import { t } from 'testcafe';

import App from '../../__pages__/App';
import { startTest } from '../../utils/utils';

/*
 * THIS FILE IS FOR DEALING WITH THE SEARCH QUERY INFO PANEL
 */
fixture('Search query info')
  .meta({ page: 'searchQueryInfo', tenant: App.tenant }) // Used to run a single test file
  .page(App.baseApp)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());
  });

startTest('Open the search-query-info-panel', async () => {
  await App.sidebar.searchQueryInfoPanel.openSearchQueryInfoPanel();
  await App.sidebar.searchQueryInfoPanel.checkInfoPanelTab('Operators');
  await App.sidebar.searchQueryInfoPanel.checkInfoPanelTab('Phrases');
  await App.sidebar.searchQueryInfoPanel.checkInfoPanelTab(
    'Special characters'
  );
  await App.sidebar.searchQueryInfoPanel.checkInfoPanelTab('Ordering');
  await App.sidebar.searchQueryInfoPanel.closeSearchQueryInfoPanel();
});

startTest('Check for one time syntax info dialog', async () => {
  await App.sidebar.searchQueryInfoPanel.openSearchQueryInfoPanel();
  await App.sidebar.searchQueryInfoPanel.checkSyntaxRuleInfoContainerExists();

  await App.sidebar.searchQueryInfoPanel.closeSyntaxRuleInfoContainer();
  await App.sidebar.searchQueryInfoPanel.checkSyntaxInfoNotVisibleAfterReopen();
});
