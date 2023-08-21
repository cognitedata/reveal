const {
  generateImportMapOverridesDependenciesPaths,
  generateSubAppsImportMap,
  generateAppsRuntimeManifest,
} = require('./import-map-utils');

describe('ImportMap Utils', () => {
  const importMapJson = {
    imports: {
      react: '/assets/dependencies/react@16.12.0/umd/react.production.min.js',
    },
  };

  const appsManifestJson = {
    apps: [
      {
        key: 'cdf-access-management',
        appName: '@cognite/cdf-access-management',
        appType: 'single-spa',
        hosting: {
          staging: 'https://cdf-access-management-staging.web.app',
          preview: 'https://cdf-access-management-preview.web.app',
          production: 'https://cdf-access-management-prod.web.app',
        },
        routes: [
          { route: '/:tenantName/access-management' },
          { route: '/:applicationName/:tenantName/access-management' },
        ],
      },
      {
        key: 'cdf-dashboard-sessions-ui',
        appName: '@cognite/cdf-dashboard-sessions-ui',
        appType: 'single-spa',
        versionSpec: '~0.2.6',
        routes: [{ route: '/:tenantName/dashboard-sessions' }],
      },
      {
        key: 'cdf-data-catalog',
        appName: '@cognite/cdf-data-catalog',
        appType: 'single-spa',
        hosting: {
          staging: 'https://cdf-data-catalog-staging.web.app',
          preview: 'https://cdf-data-catalog-preview.web.app',
          production: 'https://cdf-data-catalog-prod.web.app',
        },
        overrides: {
          preview: {
            appType: 'module-federation',
          },
        },
        routes: [
          { route: '/:tenantName/data-catalog' },
          { route: '/:tenantName/data-catalog/data-set/:dataSetId' },
        ],
      },
    ],
  };

  it('Should generate import-map.json dependencies', () => {
    const result = generateImportMapOverridesDependenciesPaths(
      importMapJson,
      '1234567890'
    );

    expect(result).toEqual(
      expect.objectContaining({
        imports: {
          ...importMapJson.imports,
          '@cognite/cdf-sdk-singleton':
            '/assets/dependencies/@cognite/1234567890/cdf-sdk-singleton/index.js',
          '@cognite/cdf-route-tracker':
            '/assets/dependencies/@cognite/1234567890/cdf-route-tracker/index.js',
        },
      })
    );
  });

  it('Should generate sub-apps-import-map.json', () => {
    const result = generateSubAppsImportMap(appsManifestJson, 'preview');

    expect(Object.keys(result.imports).length).toBe(1);
    expect(result).toEqual(
      expect.objectContaining({
        imports: {
          '@cognite/cdf-access-management':
            'https://cdf-access-management-preview.web.app/index.js',
        },
      })
    );
  });

  it('Should generate runtime apps-manifest.json', () => {
    const result = generateAppsRuntimeManifest(appsManifestJson, 'preview');
    const expected = {
      apps: [
        {
          key: 'cdf-access-management',
          appName: '@cognite/cdf-access-management',
          appType: 'single-spa',
          url: 'https://cdf-access-management-preview.web.app',
          routes: [
            { route: '/:tenantName/access-management' },
            { route: '/:applicationName/:tenantName/access-management' },
          ],
        },
        {
          key: 'cdf-dashboard-sessions-ui',
          appName: '@cognite/cdf-dashboard-sessions-ui',
          appType: 'single-spa',
          versionSpec: '~0.2.6',
          routes: [{ route: '/:tenantName/dashboard-sessions' }],
        },
        {
          key: 'cdf-data-catalog',
          appName: '@cognite/cdf-data-catalog',
          appType: 'module-federation',
          url: 'https://cdf-data-catalog-preview.web.app',
          routes: [
            { route: '/:tenantName/data-catalog' },
            { route: '/:tenantName/data-catalog/data-set/:dataSetId' },
          ],
        },
      ],
    };

    expect(result.apps.length).toBe(3);
    result.apps.forEach((el, idx) => {
      // check each element of the array, individually
      expect(el).toEqual(expect.objectContaining(expected.apps[idx]));
    });
  });
});
