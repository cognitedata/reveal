#!/usr/bin/env node
var fs = require('fs');

const {
  generateSubAppsImportMap,
  generateImportMapOverridesDependenciesPaths,
  generateAppsRuntimeManifest,
} = require('./lib/import-map-utils');

const { generateCSPHeader } = require('./lib/http-headers-utils');

// for mock or dev, use staging, otherwise use the one from nx_task_target_configuration
var configuration = (process.argv[2] || 'staging').replace('fusion-', '');
const importMapsEnv =
  configuration === 'mock' || configuration === 'development'
    ? 'staging'
    : configuration;

// Create Base64 hash
var versionHash =
  process.argv[4] || Buffer.from(Date.now().toString()).toString('base64');
var target = process.argv[3] || 'cdf';
var basePath = target === 'cdf' ? '/cdf/' : '/';

// Generate import map config for core libraires
var importMap = JSON.parse(
  fs.readFileSync('./apps/fusion-shell/src/import-map.json', 'utf8')
);

console.log(`Generating import map for ${target}(${versionHash})...`);
importMap = generateImportMapOverridesDependenciesPaths(
  importMap,
  versionHash,
  basePath
);

fs.writeFileSync(
  './dist/apps/fusion-shell/cdf/import-map.json',
  JSON.stringify(importMap, null, 2)
);

// Read the sub-apps config so we can generate sub-apps-import-map.json
const subAppsConfig = JSON.parse(
  fs.readFileSync('./apps/fusion-shell/src/apps-manifest.json', 'utf8')
);

console.log(`Generating sub-apps import map for ${target}(${versionHash})...`);
const subAppsImportMap = generateSubAppsImportMap(subAppsConfig, importMapsEnv);

fs.writeFileSync(
  './dist/apps/fusion-shell/cdf/sub-apps-import-map.json',
  JSON.stringify(subAppsImportMap, null, 2)
);

console.log(
  `Generating sub-apps module federation map for ${target}(${versionHash})...`
);

const subAppsModuleFederationMap = generateAppsRuntimeManifest(
  subAppsConfig,
  importMapsEnv
);

fs.writeFileSync(
  './dist/apps/fusion-shell/cdf/apps-manifest.json',
  JSON.stringify(subAppsModuleFederationMap, null, 2)
);

console.log(`Updating firebase.json with the appropriate http headers...`);
const firebaseConfig = JSON.parse(
  fs.readFileSync('./dist/apps/fusion-shell/firebase.json', 'utf8')
);

firebaseConfig.hosting.headers.push({
  source: '/**',
  headers: [
    {
      key: 'Content-Security-Policy',
      value: generateCSPHeader(subAppsConfig, importMapsEnv),
    },
  ],
});

fs.writeFileSync(
  './dist/apps/fusion-shell/firebase.json',
  JSON.stringify(firebaseConfig, null, 2)
);

console.log(`Injecting dev scripts in index.html for evn: ${configuration}`);
if (configuration !== 'production') {
  var indexHtml = `./dist/apps/fusion-shell/cdf/index.html`;
  fs.readFile(indexHtml, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }

    const devScripts = `
<script src="assets/dependencies/import-map-overrides@1.14.6/dist/import-map-overrides.js"></script>
<script src="assets/dependencies/query-string@7.1.1/dist/query-string.js"></script>
<import-map-overrides-full show-when-local-storage="devtools" dev-libs></import-map-overrides-full>
<script src="assets/dependencies/dev-setup.js"></script>`;

    const regex = /<!-- DEV Scripts -->/gm;
    var result = data.replace(regex, devScripts);

    fs.writeFile(indexHtml, result, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  });
}
