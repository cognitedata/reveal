import queryString from 'query-string';
import { useSearchParam } from 'hooks';
import { CLUSTER_KEY } from 'utils/constants';

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

export const useCluster = (): [string, (s: string) => void] => {
  const [searchParam, setSearchParam] = useSearchParam(CLUSTER_KEY);
  const { cdfCluster } = getSidecar();

  return [searchParam || cdfCluster, setSearchParam];
};

export const useAppsApiBaseUrl = (): string => {
  const [cluster] = useCluster();
  const prod = getEnvironment() === 'PRODUCTION';
  return `https://apps-api${prod ? '' : '.staging'}${
    cluster ? '.' : ''
  }${cluster}.cognite.ai`;
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
    hostname.includes('charts.cogniteapp.com') &&
    !hostname.includes('pr-') &&
    !hostname.includes('staging')
  ) {
    return 'PRODUCTION';
  }

  return 'DEVELOPMENT';
};

export const getBackendServiceBaseUrl = () => {
  let { origin } = window.location;

  const urlCluster = queryString.parse(window.location.search)[CLUSTER_KEY];

  if (origin.includes('localhost')) {
    return `https://as.staging.${urlCluster ? `${urlCluster}.` : ''}cognite.ai`;
  }

  if (origin.includes('.pr.')) {
    origin = origin.replace('.pr.', '.staging.');
  }

  const parsedCluster = origin.split('charts.')[1].split('cogniteapp.com')[0];
  const cluster = urlCluster ? `${urlCluster}.` : parsedCluster;

  return `https://as.${cluster}cognite.ai`;
};

export default {
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
