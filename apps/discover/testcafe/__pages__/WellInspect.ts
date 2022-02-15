import { Selector, t } from 'testcafe';

import {
  SIDEBAR_SIZE,
  HIDE_TEXT,
  EXPAND_TEXT,
} from '../../src/pages/authorized/search/well/inspect/Sidebar/constants';
import { progress } from '../utils';

import App from './App';

class WellInspectPage {
  public readonly trajectoryTable = Selector(
    '[data-testid="trajectory-result-table"]'
  );

  public readonly trajectoryRows = this.trajectoryTable
    .find('tr')
    .withAttribute('data-testid', 'table-row');

  public readonly wellCount = (count: number) =>
    Selector('div').withText(
      `${count} / ${count} well${count > 1 ? 's' : ''} selected`
    );

  public readonly wellboreCount = (count: number) =>
    Selector('div').withText(
      `${count} / ${count} wellbore${count > 1 ? 's' : ''} selected`
    );

  public readonly resizeHandle = Selector(
    '[data-testid="resize-handle-horizontal"]'
  );

  public readonly wellboreDropdown = Selector(
    '[data-testid="wellbore-dropdown"]'
  );

  public readonly wellboreDropdownSearch = Selector(
    '[data-testid="dropdown-search-input"]'
  );

  public readonly doSearchInDropdown = async (search: string) => {
    progress(`Searching for '${search}'`);
    await t
      .click(this.wellboreDropdownSearch)
      .typeText(this.wellboreDropdownSearch, search, {
        speed: 0.5,
        replace: true,
      });
  };

  public readonly wellboreDropdownMenuItems = Selector('.cogs-menu-item');

  public readonly selectAllOption = (text: string) =>
    Selector('.cogs-checkbox').withText(text);

  public readonly sidebar = Selector('[data-testid="inspect-sidebar"]');

  public readonly isIndeterminate = (text: string) =>
    this.selectAllOption(text).find('div').hasClass('indeterminate');

  public readonly hideSidebarButton = this.sidebar
    .find('button')
    .withText(HIDE_TEXT);

  public readonly expandSidebarButton = this.sidebar
    .find('span')
    .withText(EXPAND_TEXT);

  clickHideSidebarButton = async () => {
    progress('Hide inspect sidebar');
    await t.click(this.hideSidebarButton);
  };

  clickExpandSidebarButton = async () => {
    progress('Expand inspect sidebar');
    await t.click(this.expandSidebarButton);
  };

  resizeInspectSidebarHorizontally = async (dragOffsetX: number) => {
    progress(`Resize sidebar horizontally: [dragOffsetX=${dragOffsetX}]`);
    await t.drag(this.resizeHandle, dragOffsetX, 0);
  };

  checkIfSidebarWidthEqualsTo = async (
    width: 'minimum' | 'maximum' | number
  ) => {
    const getExpectedWidth = (width: 'minimum' | 'maximum' | number) => {
      switch (width) {
        case 'minimum':
          return SIDEBAR_SIZE.min;
        case 'maximum':
          return SIDEBAR_SIZE.max;
        default:
          return Number(width);
      }
    };
    progress(`Sidebar should have ${width} width`);
    await t.expect(this.sidebar.clientWidth).eql(getExpectedWidth(width));
  };

  goToTrajectories = async () => {
    progress('Go to Trajectories');
    await t.click(this.getTab('Trajectories'));

    progress('Trajectory table should not be available');
    await t.expect(this.trajectoryTable.exists).notOk();

    // progress('Trajectory data should be available');
    // await t.expect(this.trajectoryRows.count).gt(0);
  };

  previewTrajectoryDataInCharts = async () => {
    progress('Preview trajectory data in charts');
    await t.click(Selector('[data-testid="preview-button"]'));
  };

  getTab = (tabName: string) =>
    Selector('div').withAttribute('role', 'tab').withText(tabName);

  getChartByName = (chartName: string) => Selector('text').withText(chartName);

  inspectNthWell = async (nth: number) => {
    progress(`Inspect well in row #: ${nth + 1}`);

    await App.resultTable.clickRowWithNthCheckbox(nth);
    await App.wellSearchPage.clickWellInspectButton(true);
    await this.checkIfWellInspectPageIsAvailable();
  };

  checkIfWellInspectPageIsAvailable = async () => {
    progress('Well inspect page should be available');
    await t.expect(App.wellSearchPage.inspectTabs.exists).ok();
  };

  checkIfWellCountIsDisplayed = async (count: number) => {
    progress('Well count should be displayed');
    await t.expect(this.wellCount(count).exists).eql(true);
  };

  checkIfWellboreCountIsDisplayed = async (count: number) => {
    progress('Wellbore count should be displayed');
    await t.expect(this.wellboreCount(count).exists).eql(true);
  };

  checkIfTrajectoryExists = async (chartName: string) => {
    progress(`Trajectory '${chartName}' chart should be available`);
    await t.expect(this.getChartByName(chartName).exists).ok();
  };
}

export default new WellInspectPage();
