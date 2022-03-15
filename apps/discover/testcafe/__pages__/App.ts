import { screen } from '@testing-library/testcafe';
import { Selector, t } from 'testcafe';

import { adminUser, regularUser } from '../__roles__/users';
import { progress } from '../utils';

import BaseSearchPage from './BaseSearch';
import CreateFavoriteDialog from './CreateFavoriteDialog';
import DeleteSavedSearchDialog from './DeleteSavedSearchDialog';
import DocumentSearchPage from './DocumentSearch';
import FavoritesPage from './Favorites';
import FilterClearPage from './FilterClear';
import GeneralFeedbackDialog from './GeneralFeedbackDialog';
import Map from './Map';
import ObjectFeedbackDialog from './ObjectFeedbackDialog';
import ResultTable from './ResultTable';
import SavedSearchesPage from './SavedSearches';
import SeismicSearchPage from './SeismicSearch';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import UserProfilePage from './UserProfile';
import WellInspectPage from './WellInspect';
import WellSearchPage from './WellSearch';

// 'fixture inserting tests' need to know public readonly
export const projectPrefix = 'discover-e2e-';
export const cluster = process.env.REACT_APP_CLUSTER || 'bluefield';
export const project = `${projectPrefix}${cluster}`;
export const filename = '15_9_19_A_1980_01_01';
export const fileType = 'PDF';
export const documentCategory = 'Unclassified';
export const source = 'Volve';
export const operator = 'Statoil Norway';
export const duplicateFileName = 'Volve_Well_Summary_15_9-19.pdf';
export const wellDataSearchPhrase = 'F';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';

class App {
  public readonly cluster = cluster;

  public readonly project = project;

  public readonly baseUrl = baseUrl;

  public readonly baseApp = `${baseUrl}/${project}`;

  public readonly documentSearchPage = DocumentSearchPage;

  public readonly favoritesPage = FavoritesPage;

  public readonly filterClearPage = FilterClearPage;

  public readonly generalFeedbackDialog = GeneralFeedbackDialog;

  public readonly savedSearchesPage = SavedSearchesPage;

  public readonly seismicSearchPage = SeismicSearchPage;

  public readonly sidebar = Sidebar;

  public readonly topbar = Topbar;

  public readonly map = Map;

  public readonly objectFeedbackDialog = ObjectFeedbackDialog;

  public readonly createFavoriteDialog = CreateFavoriteDialog;

  public readonly resultTable = ResultTable;

  public readonly wellInspectPage = WellInspectPage;

  public readonly wellSearchPage = WellSearchPage;

  public readonly userProfilePage = UserProfilePage;

  public readonly toaster = Selector('div[class*="Toastify"]');

  public readonly avatar = Selector('#user-avatar');

  public readonly logoutButton = screen.getByRole('button', { name: 'Logout' });

  public readonly deleteSavedSearchDialog = DeleteSavedSearchDialog;

  getUserRole = () => regularUser;

  getAdminRole = () => adminUser;

  logout = async () => {
    await t.click(this.avatar);
    await t.click(this.logoutButton);
  };

  pressKey = async (key: string) => {
    progress(`Press key: ${key}`);
    await t.pressKey(key);
  };

  public readonly navigateToResultsPage = async (pageTabName: string) => {
    progress(`Navigating to the '${pageTabName}' page`);
    await t.navigateTo(this.baseApp);
    await BaseSearchPage.expandSearchResults();
    await BaseSearchPage.clickSearchResultTab(pageTabName);
    await t.expect(this).ok();
  };

  public readonly navigateToResultsPageAndClearAllFilters = async (
    pageTabName: string
  ) => {
    await this.navigateToResultsPage(pageTabName);
    await BaseSearchPage.doSearchWithNoResults(false);
    await this.filterClearPage.confimPageHasNoResult();
    await this.filterClearPage.clearAllFilters();
  };

  public readonly checkifToasterAppears = async (text: string) => {
    progress(`Check for confirmation toast`, true);
    await t
      .expect(this.toaster.find('div').withText(text).exists)
      .ok({ timeout: 2000 });
  };
}

export default new App();
