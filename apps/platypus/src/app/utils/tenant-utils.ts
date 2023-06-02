export const getTenant = (location = window.location) => {
  const { pathname } = location;
  const defaultTenant = 'platypus';
  if (!pathname) {
    return defaultTenant;
  }

  // if unified signin, the url is apps.cognite.com/cdf/project
  // otherwise is fusion.cognite.com/project
  // when splitting, for fusion index is 1, for /cdf is 2
  const projectPathParamLocation = isUsingUnifiedSignin() ? 2 : 1;

  const match = new URL(window.location.href).pathname.split('/')[
    projectPathParamLocation
  ];

  return match || defaultTenant;
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
