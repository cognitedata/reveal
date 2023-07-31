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

export const isUsingUnifiedSignin = () => {
  return (
    unifiedSigninUrls.includes(window.location.host) &&
    window.location.pathname.split('/')?.filter(Boolean)?.at(0) ===
      unifiedSignInAppName
  );
};
