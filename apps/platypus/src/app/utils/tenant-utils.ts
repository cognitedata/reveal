export const getTenant = (location = window.location) => {
  const { pathname } = location;
  const defaultTenant = 'platypus';
  if (!pathname) {
    return defaultTenant;
  }
  const match = pathname.replace('/cdf', '').match(/^\/([a-z0-9-]+)\/?/);
  if (!match) {
    return defaultTenant;
  }

  return match[1].trim();
};

// Very temporary hack, just testing out things
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
    window.location.pathname.startsWith(`/${unifiedSignInAppName}`)
  );
};
