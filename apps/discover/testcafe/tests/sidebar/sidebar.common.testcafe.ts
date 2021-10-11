import { t } from 'testcafe';

import App from '../../__pages__/App';
import { startTest, logErrors } from '../../utils';

fixture('Test side bar functionality')
  .meta({ page: 'sidebar:common', tenant: App.tenant }) // Used to run a single test file
  .page(App.baseApp)
  .beforeEach(async () => {
    await t.useRole(App.getUserRole());
  })
  .afterEach(() => {
    return logErrors();
  });

startTest('Side bar should be open by default', async () => {
  await App.navigateToResultsPage('Documents');
  await App.sidebar.checkIfSidebarIsOpen();
});

startTest(
  'Close the side bar and it should preserve between routes',
  async () => {
    await App.navigateToResultsPage('Documents');
    await App.sidebar.checkIfSidebarIsOpen();
    await App.sidebar.clickHideSidebarButton();
    await App.sidebar.checkIfSidebarIsClose();

    await App.topbar.navigateToFavorites();
    /**
     * Do not worry if favotite page finished loading or not.
     * Just need to change the route.
     */
    await t.wait(3000);

    await App.topbar.navigateToSearch();
    await App.sidebar.checkIfSidebarIsClose();
  }
);

startTest(
  'Refresh the page and it should not preserve the previous search phrase',
  async () => {
    await App.navigateToResultsPage('Documents');
    await App.sidebar.checkIfSidebarIsOpen();
    await App.documentSearchPage.doSearchWithNoResults();
    await App.documentSearchPage.refreshPage();

    await App.sidebar.clickFilterCategory('Documents');
    await App.sidebar.clickFilterSubCategory('File Type');
    await App.sidebar.clickFilterOption('PDF');
    await App.resultTable.hasResults();
  }
);
