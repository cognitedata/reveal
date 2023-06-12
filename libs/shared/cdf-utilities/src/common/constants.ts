export const SELECTED_LANGUAGE_LS_KEY = '@cognite/fusion/selected-language';

export enum ModalWidth {
  small = 400,
  medium = 600,
  large = 800,
}

export const ABSOLUTE_TIME_FORMAT = 'DD MMM YYYY HH:mm:ss';
export const RELATIVE_TIME_THRESHOLD_IN_HOURS = 36;
export const TOOLTIP_DELAY_IN_MS = 300;

/**
 * In order to support login via the frontend-proxy, while simultaneously supporting
 * cdf-ui-hub's cdf-hub-login-page, we want to expose this condition in order to know
 * appropriately which login flow to display, hence we export this single point of reference.
 */
export const unifiedSigninUrls = [
  'apps.cognite.com',
  'apps-staging.cognite.com',
  'apps-test.cognite.com',
  'apps-preview.cognite.com',
  'localhost:8080',
];

export const unifiedSignInAppName = 'cdf';
