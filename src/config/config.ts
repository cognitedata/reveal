import sidecar from './sidecar';

export const CHART_VERSION = 1;

const {
  REACT_APP_API_KEY: apiKey,
  REACT_APP_RELEASE: release = 'release',
  REACT_APP_VERSION_NAME: versionName = '0.0.0',
  REACT_APP_VERSION_SHA: versionSha = 'development',
} = process.env;

export type BaseSidecar = {
  applicationId: string;
  appsApiBaseUrl: string;
  docsSiteBaseUrl: string;
  freshchatChannel: string;
  freshchatToken: string;
  mixpanel: string;
  intercom: string;
  infieldCacheApiBaseUrl: string;
};

export const getAppId = (): string => {
  return 'Cognite Charts';
};

export const getSidecar = () => sidecar;

export const getAppName = (): string => {
  return getSidecar().applicationId;
};

export const getAzureAppId = () => {
  return getEnvironment() === 'PRODUCTION'
    ? '05aa256f-ba87-4e4c-902a-8e80ae5fb32e'
    : 'd59a3ab2-7d10-4804-a51f-8c2ac969e605';
};

export const getEnvironment = (
  hostname = window.location.hostname
): 'PRODUCTION' | 'DEVELOPMENT' => {
  if (
    !hostname.includes('.pr.') &&
    !hostname.includes('.staging.') &&
    !hostname.includes('localhost')
  ) {
    return 'PRODUCTION';
  }

  return 'DEVELOPMENT';
};

export const getBackendServiceBaseUrl = (
  origin: string,
  urlCluster?: string | null | undefined
) => {
  let originCopy = origin;

  if (origin.includes('localhost')) {
    return `https://calculation-backend.staging.${
      urlCluster ? `${urlCluster}.` : ''
    }cognite.ai/v2`;
  }

  if (originCopy.includes('.pr.')) {
    originCopy = originCopy.replace('.pr.', '.staging.');
  }

  const isStaging = originCopy.includes('.staging.');
  const formattedUrlCluster = isStaging ? `staging.${urlCluster}` : urlCluster;
  const parsedCluster = originCopy
    .split('charts.')[1]
    .split('cogniteapp.com')[0];
  const cluster = urlCluster ? `${formattedUrlCluster}.` : parsedCluster;

  return `https://calculation-backend.${cluster}cognite.ai/v2`;
};

const configs = {
  appId: getAppId(),
  appName: getAppName(),
  apiKey,
  environment: getEnvironment(),
  version: {
    name: versionName,
    sha: versionSha,
    release,
  },
};

export default configs;
