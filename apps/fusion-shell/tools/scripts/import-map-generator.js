#!/usr/bin/env node
var fs = require('fs');

const {
  generateSubAppsImportMap,
  generateImportMapOverridesDependenciesPaths,
  generateAppsRuntimeManifest,
} = require('./lib/import-map-utils');

const { generateCSPHeader } = require('./lib/http-headers-utils');

// for mock or dev, use staging, otherwise use the one from nx_task_target_configuration
var configuration = process.argv[2] || 'staging';
const importMapsEnv =
  configuration === 'mock' || configuration === 'development'
    ? 'staging'
    : configuration;

// Create Base64 hash
var versionHash =
  process.argv[3] || Buffer.from(Date.now().toString()).toString('base64');
var basePath = '/';

// Generate import map config for core libraires
var importMap = JSON.parse(
  fs.readFileSync('./apps/fusion-shell/src/import-map.json', 'utf8')
);

console.log(`Generating import map for (${versionHash})...`);
importMap = generateImportMapOverridesDependenciesPaths(
  importMap,
  versionHash,
  basePath
);

fs.writeFileSync(
  './dist/apps/fusion-shell/import-map.json',
  JSON.stringify(importMap, null, 2)
);

// Read the sub-apps config so we can generate sub-apps-import-map.json
const subAppsConfig = JSON.parse(
  fs.readFileSync('./apps/fusion-shell/src/apps-manifest.json', 'utf8')
);

console.log(`Generating sub-apps import map for (${versionHash})...`);
const subAppsImportMap = generateSubAppsImportMap(subAppsConfig, importMapsEnv);

fs.writeFileSync(
  './dist/apps/fusion-shell/sub-apps-import-map.json',
  JSON.stringify(subAppsImportMap, null, 2)
);

console.log(
  `Generating sub-apps module federation map for (${versionHash})...`
);

const subAppsModuleFederationMap = generateAppsRuntimeManifest(
  subAppsConfig,
  importMapsEnv
);

fs.writeFileSync(
  './dist/apps/fusion-shell/apps-manifest.json',
  JSON.stringify(subAppsModuleFederationMap, null, 2)
);

console.log(
  `Injecting dev scripts and Content-Security-Policy meta tag in index.html for env: ${configuration}`
);
var indexHtml = `./dist/apps/fusion-shell/index.html`;

fs.readFile(indexHtml, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }

  const cspHeader = generateCSPHeader(subAppsConfig, importMapsEnv);
  const cspRegex = /<!-- CSP Header -->/gim;
  var result = data.replace(cspRegex, `<meta http-equiv="Content-Security-Policy" content="${cspHeader}" >`);

  if (configuration !== 'production') {
    const devScripts = `
<script src="assets/dependencies/import-map-overrides@1.14.6/dist/import-map-overrides.js"></script>
<script src="assets/dependencies/query-string@7.1.1/dist/query-string.js"></script>
<import-map-overrides-full show-when-local-storage="devtools" dev-libs></import-map-overrides-full>
<script src="assets/dependencies/dev-setup.js"></script>`;

    const regex = /<!-- DEV Scripts -->/gm;
    result = result.replace(regex, devScripts);
  }

  fs.writeFile(indexHtml, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});
