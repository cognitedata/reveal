const {
  REACT_APP_API_KEY: apiKey,
  REACT_APP_RELEASE: release = 'release',
  REACT_APP_VERSION_NAME: versionName = '0.0.0',
  REACT_APP_VERSION_SHA: versionSha = 'development',
} = process.env;

const CLUSTERED_URL_REGEX = /charts\.([^.]+)\.cogniteapp.com$/;

export const getAppName = (hostname = window.location.hostname): string => {
  // If the environment variable is set, then it takes precedence over
  // everything else.
  // Note: if we resolve this with the block above then we can't unit-test it.
  if (process.env.REACT_APPS_API_NAME) {
    return process.env.REACT_APPS_API_NAME;
  }

  if (
    hostname === 'charts.cogniteapp.com' ||
    hostname === 'preview.charts.cogniteapp.com'
  ) {
    return 'charts';
  }

  // No idea what this is, but let's assume it's production.
  return 'charts-dev';
};

export const getAppsApiBaseUrl = (
  hostname = window.location.hostname
): string => {
  // If the environment variable is set, then it takes precedence over
  // everything else.
  // Note: if we resolve this with the block above then we can't unit-test it.
  if (process.env.REACT_APP_APPS_API_BASE_URL) {
    return process.env.REACT_APP_APPS_API_BASE_URL;
  }

  if (
    hostname === 'charts.cogniteapp.com' ||
    hostname === 'preview.charts.cogniteapp.com'
  ) {
    return 'https://apps-api.cognite.ai';
  }

  if (
    hostname === 'localhost' ||
    hostname === 'staging.charts.cogniteapp.com' ||
    hostname.match(/\.preview\.cogniteapp\.com$/)
  ) {
    return 'https://development.apps-api.cognite.ai';
  }

  // Finally, handle dynamic clustering for the form:
  //   https://charts.<cluster>.cogniteapp.com/
  const match = hostname.match(CLUSTERED_URL_REGEX);
  if (match) {
    const [, cluster] = match;
    return `https://${cluster}.apps-api.cognite.ai`;
  }

  // No idea what this is, but let's assume it's production.
  return 'https://apps-api.cognite.ai';
};

export const getCdfApiBaseUrl = (
  hostname = window.location.hostname
): string => {
  // If the environment variable is set, then it takes precedence over
  // everything else.
  // Note: if we resolve this with the block above then we can't unit-test it.
  if (process.env.REACT_APP_CDF_API_BASE_URL) {
    return process.env.REACT_APP_CDF_API_BASE_URL;
  }

  // Handle dynamic clustering for the form:
  //   https://charts.<cluster>.cogniteapp.com/
  const match = hostname.match(CLUSTERED_URL_REGEX);
  if (match) {
    const [, cluster] = match;
    return `https://${cluster}.cognitedata.com`;
  }

  // No idea what this is, but let's assume it's production.
  return 'https://api.cognitedata.com';
};

export const getEnvironment = (hostname = window.location.hostname): string => {
  // If the environment variable is set, then it takes precedence over
  // everything else.
  // Note: if we resolve this with the block above then we can't unit-test it.
  if (process.env.REACT_APP_APPS_API_BASE_URL) {
    return process.env.REACT_APP_APPS_API_BASE_URL;
  }

  if (
    hostname === 'charts.cogniteapp.com' ||
    hostname === 'preview.charts.cogniteapp.com'
  ) {
    return 'PRODUCTION';
  }

  if (
    hostname === 'staging.charts.cogniteapp.com' ||
    hostname.match(/\.preview\.cogniteapp\.com$/)
  ) {
    return 'DEVELOPMENT';
  }

  // No idea what this is, but let's assume it's production.
  return 'LOCAL';
};

export default {
  appName: getAppName(),
  appsApiBaseURL: getAppsApiBaseUrl(),
  cdfApiBaseUrl: getCdfApiBaseUrl(),
  apiKey,
  environment: getEnvironment(),
  version: {
    name: versionName,
    sha: versionSha,
    release,
  },
};
