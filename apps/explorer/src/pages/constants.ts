export const PAGES = {
  HOME: '/home',
  LOGOUT: '/logout',
  PROFILE: '/profile',
  NOT_FOUND: '/not_found',
};

const HOME_NAVIGATE = `${PAGES.HOME}/navigate`;

export const HOME_ROUTES = {
  HOME_NAVIGATE,
  HOME_NAVIGATE_SET_SRC: `${HOME_NAVIGATE}/set-src`,
  HOME_NAVIGATE_SET_DEST: `${HOME_NAVIGATE}/set-dest`,
  HOME_NAVIGATE_ROUTE: `${PAGES.HOME}/route`,
};
