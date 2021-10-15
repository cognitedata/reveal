import { SidecarConfig } from '@cognite/sidecar';

/* eslint-disable no-underscore-dangle */
interface Sidecar extends SidecarConfig {
  __sidecarFormatVersion: number;
  applicationId: string;
  applicationName: string;
  appsApiBaseUrl: string;
  cdfApiBaseUrl: string;
  cdfCluster: string;
  docsSiteBaseUrl: string;
  intercom: string;
  nomaApiBaseUrl: string;
  mpServiceBaseURL: string;
  mixpanel: string;
}

// # -------------------------------------
// #
// #
// #
// # ONLY CHANGE THESE THINGS: (affects localhost only)
// #
// #
const PROD = false;
// examples: bluefield, greenfield, ew1, bp-northeurope, azure-dev, bp
// NOTE: leave on 'azure-dev' for testing in the PR's since that is the only place we have the FAKEIdp currently for this project:
const CLUSTER = 'ew1';
// #
// #
// #
// # -------------------------------------

const getAadApplicationId = (cluster: string) => {
  const ids: Record<string, string> = {
    bluefield: '245a8a64-4142-4226-86fa-63d590de14c9',
    'azure-dev': '5a262178-942b-4c8f-ac15-f96642b73b56',
    ew1: 'd584f014-5fa9-4b0b-953d-cc4837d093f3',
    'az-eastus-1': '685cada6-524c-49f1-95c6-4b96eebe4b5b',
  };

  const aadApplicationId = ids[cluster] || '';

  return {
    aadApplicationId,
  };
};

const generateBaseUrls = (cluster: string, prod = false) => {
  switch (cluster) {
    case 'ew1': {
      return {
        appsApiBaseUrl: 'https://apps-api.staging.cognite.ai',
        cdfApiBaseUrl: 'https://api.cognitedata.com',
        cdfCluster: '',
      };
    }
    default: {
      return {
        aadApplicationId: '245a8a64-4142-4226-86fa-63d590de14c9', // bluefield staging
        appsApiBaseUrl: prod
          ? `https://apps-api.${cluster}.cognite.ai`
          : `https://apps-api.staging.${cluster}.cognite.ai`,
        cdfApiBaseUrl: `https://${cluster}.cognitedata.com`,
        cdfCluster: cluster,
      };
    }
  }
};

const getmpServiceBaseURL = (cluster?: string) => {
  if (process.env.REACT_APP_MP_SERVICE_BASE_URL) {
    return process.env.REACT_APP_MP_SERVICE_BASE_URL;
  }
  if (cluster === 'ew1') {
    return 'https://maintenance-planner-service.staging.cognite.ai';
  }
  if (cluster) {
    return `https://maintenance-planner-service.staging.${cluster}.cognite.ai`;
  }
  return 'https://maintenance-planner-service.staging.cognite.ai';
};

// we are overwriting the window.__cogniteSidecar object because the tenant-selector
// reads from this variable, so when you test on localhost, it (TSA) will not access via this file
// but via the window.__cogniteSidecar global
// now that this var is updated, all should work as expected.
(window as any).__cogniteSidecar = {
  ...getAadApplicationId(CLUSTER),
  ...generateBaseUrls(CLUSTER, PROD),
  __sidecarFormatVersion: 1,
  // to be used only locally as a sidecar placeholder
  // when deployed with FAS the values below are partly overriden
  applicationId: 'ornate',
  applicationName: 'Cognite Ornate',
  docsSiteBaseUrl: 'https://docs.cognite.com',
  nomaApiBaseUrl: 'https://noma.development.cognite.ai',
  mpServiceBaseURL: getmpServiceBaseURL(CLUSTER),
  locize: {
    keySeparator: false,
    projectId: '1ee63b21-27c7-44ad-891f-4bd9af378b72', // <- move this to release-configs
    version: 'Production', // <- move this to release-configs
  },
  mixpanel: 'aab612b6f57003d2947a929bae33869a',
  intercomSettings: {
    app_id: 'ou1uyk2p',
    hide_default_launcher: true,
  },
  ...((window as any).__cogniteSidecar || {}),
};

export default (window as any).__cogniteSidecar as Sidecar;
