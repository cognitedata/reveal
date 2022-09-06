import navigation from 'constants/navigation';

export const SEARCH_LINK_TEXT_KEY = 'Search';
export const FAVORITES_LINK_TEXT_KEY = 'Favorites';
export const DASHBOARD_LINK_TEXT_KEY = 'Dashboard';

export const ADMIN_FEEDBACK_LINK_TEXT_KEY = 'Feedback';
export const ADMIN_PROJECT_CONFIG_LINK_TEXT_KEY = 'Project Configuration';
export const ADMIN_CODE_DEFINITIONS_LINK_TEXT_KEY = 'Code Definitions';
export const ADMIN_MAP_CONFIG = 'Map Config';
export const ADMIN_REPORT_MANAGER = 'Report Panel';

export const adminMenuMap = {
  [navigation.ADMIN_FEEDBACK]: ADMIN_FEEDBACK_LINK_TEXT_KEY,
  [navigation.ADMIN_PROJECT_CONFIG]: ADMIN_PROJECT_CONFIG_LINK_TEXT_KEY,
  [navigation.ADMIN_LEGEND]: ADMIN_CODE_DEFINITIONS_LINK_TEXT_KEY,
  [navigation.ADMIN_MAP_CONFIG]: ADMIN_MAP_CONFIG,
  [navigation.ADMIN_REPORT_MANAGER]: ADMIN_REPORT_MANAGER,
} as const;

export const PATHNAMES = {
  SEARCH: 1,
  FAVORITES: 2,
  DASHBOARD: 3,
  ADMIN: 4,
} as const;
