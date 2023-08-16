/**
 * Generates an import-map.json dependencies and appends sdk-singleton and route-tracker with the latest version that we built
 */
function generateImportMapOverridesDependenciesPaths(
  importMapJson,
  versionHash,
  basePath = '/'
) {
  const importMap = importMapJson;

  // Replace our internal dependencies with the latest version that we built
  importMap.imports[
    '@cognite/cdf-sdk-singleton'
  ] = `${basePath}assets/dependencies/@cognite/${versionHash}/cdf-sdk-singleton/index.js`;
  importMap.imports[
    '@cognite/cdf-route-tracker'
  ] = `${basePath}assets/dependencies/@cognite/${versionHash}/cdf-route-tracker/index.js`;

  return importMap;
}

/**
 * subAppsConfig is the apps-manifest.json file in fusion-shell/src folder
 * Generates JSON object with the following structure:
 * {
 *  imports: {
 *   <sub-app-name>: <baseHref>/apps/<application-name>/index.js
 *  }
 * }
 *
 * Example:
 * {
 *  imports: {
 *    "@cognite/cdf-data-catalog": "/apps/cdf-data-catalog/index.js",
 *  }
 * }
 * @param {*} subAppsConfig
 * @returns
 */
function generateSubAppsImportMap(subAppsConfig, hostingEnv = 'staging') {
  const subAppsImportMap = {};

  subAppsConfig.apps
    .filter(
      (subAppConfig) =>
        subAppConfig.hosting &&
        subAppConfig.appType === 'single-spa' &&
        !subAppConfig.overrides?.[hostingEnv]?.appType
    )
    .forEach((subAppConfig) => {
      // Map to the proxy url for each sub-app.
      subAppsImportMap[
        subAppConfig.appName
      ] = `${subAppConfig.hosting[hostingEnv]}/index.js`;
    });

  return {
    imports: subAppsImportMap,
  };
}

/**
 * subAppsConfig is the apps-manifest.json file in fusion-shell/src folder
 * Generates JSON object with the following structure:
 * {
 *  imports: {
 *   <sub-app-name>: <baseHref>/apps/<application-name>/remoteEntry.js
 *  }
 * }
 *
 * Example:
 * {
 *  imports: {
 *    "cdf-data-catalog": "https://cdf-data-catalog.web.app/remoteEntry.js",
 *  }
 * }
 * @param {*} subAppsConfig
 * @returns
 */
function generateAppsRuntimeManifest(subAppsConfig, hostingEnv = 'staging') {
  const subAppsImportMap = [];

  subAppsConfig.apps.forEach((subAppConfig) => {
    if (subAppConfig.versionSpec) {
      subAppsImportMap.push(subAppConfig);
    } else {
      // Map to the proxy url for each sub-app.
      subAppsImportMap[
        subAppConfig.key
      ] = `${subAppConfig.hosting[hostingEnv]}/remoteEntry.js`;
      const isModuleFederation =
        subAppConfig.overrides?.[hostingEnv]?.appType === 'module-federation' ||
        subAppConfig.appType === 'module-federation';

      subAppsImportMap.push({
        key: subAppConfig.key,
        appName: subAppConfig.appName,
        appType: isModuleFederation ? 'module-federation' : 'single-spa',
        url: subAppConfig.hosting[hostingEnv],
        routes: subAppConfig.routes,
      });
    }
  });

  return {
    apps: subAppsImportMap,
  };
}

module.exports = {
  generateImportMapOverridesDependenciesPaths,
  generateSubAppsImportMap,
  generateAppsRuntimeManifest,
};
