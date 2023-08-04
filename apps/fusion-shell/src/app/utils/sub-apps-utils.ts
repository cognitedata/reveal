import { AppManifest, ModuleFederationImportMap } from '../types';

let appsManifest: AppManifest;
let moduleFederationAppsImportMap: ModuleFederationImportMap = {};

export const getAppManifest = () => appsManifest;

export const getModuleFederationApps = () => moduleFederationAppsImportMap;

export const buildModuleFederationImportMap = (
  appsManifestJson: AppManifest
): ModuleFederationImportMap => {
  appsManifest = appsManifestJson;
  moduleFederationAppsImportMap = appsManifest.apps
    .filter((app) => app.appType === 'module-federation')
    .reduce((acc, app) => {
      acc[app.key] = app.url;
      return acc;
    }, {});

  return moduleFederationAppsImportMap;
};
