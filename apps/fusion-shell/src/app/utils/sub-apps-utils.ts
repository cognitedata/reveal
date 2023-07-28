import { AppManifest, ModuleFederationImportMap } from '../types';

let appsManifest: AppManifest;

export const getAppManifest = () => appsManifest;

export const buildModuleFederationImportMap = (
  appsManifestJson: AppManifest
): ModuleFederationImportMap => {
  appsManifest = appsManifestJson;
  return appsManifest.apps.reduce((acc, app) => {
    acc[app.key] = app.url;
    return acc;
  }, {});
};
