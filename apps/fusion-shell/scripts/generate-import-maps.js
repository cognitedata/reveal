const crypto = require('crypto');
const {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
} = require('fs');
const { resolve } = require('path');

const appManifests = require('../src/appManifestData');

const distFolder = resolve(__dirname, '../../../dist');
const dependenciesFolder = resolve(__dirname, '../public/dependencies');

const sdkSingletonDir = resolve(
  dependenciesFolder,
  '@cognite/cdf-sdk-singleton'
);
const routeTrackerDir = resolve(
  dependenciesFolder,
  '@cognite/cdf-route-tracker'
);

function deleteDestDirs() {
  [sdkSingletonDir, routeTrackerDir].forEach((dir) => {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}

function ensureDestDirsExists() {
  [sdkSingletonDir, routeTrackerDir].forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir);
    }
  });
}

function generateChecksum(str, algorithm, encoding) {
  return crypto
    .createHash(algorithm || 'md5')
    .update(str, 'utf8')
    .digest(encoding || 'hex');
}

function generateChecksumOnFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const checksum = generateChecksum(content);
  return checksum;
}

function copyJsFileWithChecksum(src, destFolder) {
  const checksum = generateChecksumOnFile(src);
  const destFilename = `${checksum}.js`;
  copyFileSync(src, resolve(destFolder, destFilename));
  return destFilename;
}

function copyLocalLibDependencies() {
  const sdkSingletonJsFilename = copyJsFileWithChecksum(
    resolve(distFolder, 'libs/shared/cdf-sdk-singleton-single-spa/index.js'),
    sdkSingletonDir
  );
  const routeTrackerJsFilename = copyJsFileWithChecksum(
    resolve(distFolder, 'libs/shared/cdf-route-tracker-single-spa/index.js'),
    routeTrackerDir
  );
  return { sdkSingletonJsFilename, routeTrackerJsFilename };
}

function generateImportMap(fusionEnv) {
  deleteDestDirs();
  ensureDestDirsExists();
  const { routeTrackerJsFilename, sdkSingletonJsFilename } =
    copyLocalLibDependencies();
  const imports = {
    '@cognite/cdf-sdk-singleton': `/dependencies/@cognite/cdf-sdk-singleton/${sdkSingletonJsFilename}`,
    '@cognite/cdf-route-tracker': `/dependencies/@cognite/cdf-route-tracker/${routeTrackerJsFilename}`,
  };
  appManifests
    .filter((app) => !!app.hosting)
    .forEach((app) => {
      const baseUrl = app.hosting?.[fusionEnv];
      if (!baseUrl) {
        throw new Error(`Missing hosting for ${app.appName} in ${fusionEnv}`);
      }
      // we can only load sub-apps from domains our customers have whitelisted
      // we had an incident about it here: https://cognitedata.slack.com/archives/C05RAGU91FD
      if (
        fusionEnv === 'production' &&
        !baseUrl.startsWith('/') &&
        !baseUrl.toLowerCase().endsWith('.cogniteapp.com')
      ) {
        throw new Error(
          `The app ${app.key} points to a domain for production which isn't allowed. Please use a *.cogniteapp.com domain`
        );
      }
      if (baseUrl.endsWith('.js')) {
        imports[app.appName] = baseUrl;
      } else {
        imports[app.appName] = `${baseUrl}/index.js`;
      }
    });
  return { imports };
}

module.exports = {
  generateImportMap,
};
