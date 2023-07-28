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

const applications: RegisterApplicationConfig<any>[] = appManifest.apps
  .filter((appConfig) => appConfig.appType === 'single-spa')
  .map((appConfig) => {
    return {
      name: appConfig.appName,
      app: () => System.import(appConfig.appName),
      activeWhen: (location) => {
        return matchesAny(location, appConfig.routes.map(matcher));
      },
    };
  });

export default applications;
