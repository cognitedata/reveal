import { match } from 'path-to-regexp';
import {
  RegisterApplicationConfig,
  registerApplication,
  start,
} from 'single-spa';

import { appManifests } from '../appManifests';

import { matchesAny } from './root-config/utils';

type RouteConfig = {
  route: string;
};

const matcher = (config: RouteConfig) => match(config.route, { end: false });

const applications: RegisterApplicationConfig[] = appManifests.map(
  (appConfig) => {
    return {
      name: appConfig.appName,
      app: () => System.import(appConfig.appName),
      activeWhen: (location) => {
        return matchesAny(location, appConfig.routes.map(matcher));
      },
    };
  }
);

applications.forEach((applicationConfig) => {
  registerApplication(applicationConfig);
});

start();
