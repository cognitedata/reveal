const unifiedSigninUrls = [
  'apps.cognite.com',
  'apps-staging.cognite.com',
  'apps-test.cognite.com',
  'apps-preview.cognite.com',
  'localhost:8080',
];
const unifiedSignInAppName = 'cdf';

export const isUsingUnifiedSignin = (): boolean => {
  return (
    unifiedSigninUrls.includes(window.location.host) &&
    window.location.pathname.startsWith(`/${unifiedSignInAppName}`)
  );
};
