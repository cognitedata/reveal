import { AppManifest } from '../types';
import {
  buildModuleFederationImportMap,
  getAppManifest,
} from './sub-apps-utils';

describe('SubApp Utils', () => {
  it('Should create module federation import map', () => {
    const appRuntimeManifest = {
      apps: [
        {
          key: 'cdf-access-management',
          appName: '@cognite/cdf-access-management',
          appType: 'single-spa',
          url: 'https://cdf-access-management-preview.web.app',
        },
        {
          key: 'cdf-coding-conventions',
          appName: '@cognite/cdf-coding-conventions',
          appType: 'single-spa',
          url: 'https://cdf-coding-conventions-preview.web.app',
        },
      ],
    } as AppManifest;

    const moduleFederationConfig =
      buildModuleFederationImportMap(appRuntimeManifest);

    expect(getAppManifest()).toEqual(appRuntimeManifest);
    expect(moduleFederationConfig).toEqual(
      expect.objectContaining({
        'cdf-access-management':
          'https://cdf-access-management-preview.web.app',
        'cdf-coding-conventions':
          'https://cdf-coding-conventions-preview.web.app',
      })
    );
  });
});
