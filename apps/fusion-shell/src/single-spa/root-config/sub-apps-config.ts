import { RegisterApplicationConfig } from 'single-spa';

import { match } from 'path-to-regexp';

import { matchesAny } from '../../app/utils/utils';

import { getAppManifest } from '../../app/utils/sub-apps-utils';

declare const System: any;

type RouteConfig = {
  route: string;
  option?: {
    end: boolean;
  };
};

const matcher = (config: RouteConfig) =>
  match(config.route, { end: config.option?.end || false });

const appManifest = getAppManifest();

const landingPageRoutes = [
  { route: '/:tenantName' },
  { route: '/:applicationName/:tenantName' },
].map(matcher);

const applications: RegisterApplicationConfig<any>[] = [
  {
    name: '@cognite/login-page',
    app: () => System.import('@cognite/login-page'),
    activeWhen: (location) => {
      return (
        location.pathname === '/' || matchesAny(location, landingPageRoutes)
      );
    },
  },
  {
    name: '@cognite/cdf-copilot',
    app: () => System.import('@cognite/cdf-copilot'),
    activeWhen: (location) => {
      // should be always mounted at root level
      return matchesAny(location, landingPageRoutes);
    },
  },
].concat(
  appManifest.apps
    .filter((appConfig) => appConfig.appType === 'single-spa')
    .map((appConfig) => {
      return {
        name: appConfig.appName,
        app: () => System.import(appConfig.appName),
        activeWhen: (location) => {
          return matchesAny(location, appConfig.routes.map(matcher));
        },
      };
    })
);

export default applications;
