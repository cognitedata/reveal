#!/usr/bin/env node
var fs = require('fs');
const {
  generateSubAppsImportMap,
} = require('../../firebase-functions/proxy-config-utils');

var configuration = (process.argv[2] || 'staging').replace('fusion-', '');
var target = process.argv[3] || 'cdf';
var versionHash = process.argv[4] || Date.now();
var basePath = target === 'cdf' ? '/cdf/' : '/';

// Generate import map config for core libraires
var importMap = JSON.parse(
  fs.readFileSync('./apps/fusion-shell/src/import-map.json', 'utf8')
);

// if fusion, remove /cdf/ prefix
if (target === 'fusion') {
  for (var key in importMap.imports) {
    importMap.imports[key] = importMap.imports[key].replace(/^\/cdf\//gim, '/');
  }
}

// Replace our internal dependencies with the latest version that we built
importMap.imports[
  '@cognite/cdf-sdk-singleton'
] = `${basePath}assets/dependencies/@cognite/${versionHash}/cdf-sdk-singleton/index.js`;
importMap.imports[
  '@cognite/cdf-route-tracker'
] = `${basePath}assets/dependencies/@cognite/${versionHash}/cdf-route-tracker/index.js`;

console.log(`Generating import map for ${target}(${versionHash})...`);
fs.writeFileSync(
  './dist/apps/fusion-shell/cdf/import-map.json',
  JSON.stringify(importMap, null, 2)
);

// We need the correct import map manifest folder for the sub-apps so we can generate the proxy config
var importMapManifestFolder =
  configuration === 'production' || configuration === 'fusion'
    ? 'production'
    : 'next-release';

// Generate sub-apps import map config
var subAppsImportMapManifest = JSON.parse(
  fs.readFileSync(
    `./apps/fusion-shell/src/environments/fusion/${importMapManifestFolder}/sub-apps-import-map.json`,
    'utf8'
  )
);

console.log(`Generating sub-apps import map for ${target}(${versionHash})...`);
var subAppsImportMap = generateSubAppsImportMap(
  subAppsImportMapManifest,
  basePath
);

fs.writeFileSync(
  './dist/apps/fusion-shell/cdf/sub-apps-import-map.json',
  JSON.stringify(subAppsImportMap, null, 2)
);
