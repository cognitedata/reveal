import { registerApplication, start } from 'single-spa';

import { isUsingUnifiedSignin } from '@cognite/cdf-utilities';

import applications from './root-config/sub-apps-config';

const isUnifiedSignin = isUsingUnifiedSignin();
const unifiedSignInDisabledApps = [
  '@cognite/login-page',
  '@cognite/cdf-copilot',
];

// For unified signin, we don't need the login page
// because another app(login app) will be used
applications
  .filter((application) =>
    isUnifiedSignin
      ? !unifiedSignInDisabledApps.includes(application.name)
      : true
  )
  .forEach((applicationConfig) => {
    registerApplication(applicationConfig);
  });

start();
