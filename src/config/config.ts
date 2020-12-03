/* eslint no-underscore-dangle: ["error", { "allow": ["__cogniteSidecar"] }] */

const {
  REACT_APP_API_KEY: apiKey,
  REACT_APP_RELEASE: release = 'release',
  REACT_APP_VERSION_NAME: versionName = '0.0.0',
  REACT_APP_VERSION_SHA: versionSha = 'development',
} = process.env;

declare global {
  interface Window {
    __cogniteSidecar: any;
  }
}

export const getAppName = (): string => {
  return window.__cogniteSidecar.applicationId;
};

export const getAppsApiBaseUrl = (): string => {
  return window.__cogniteSidecar.appsApiBaseUrl;
};

export const getCdfApiBaseUrl = (): string => {
  return window.__cogniteSidecar.cdfApiBaseUrl;
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
    hostname.includes('.preview.cogniteapp.com') ||
    hostname.includes('.pr.charts.cogniteapp.com')
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
