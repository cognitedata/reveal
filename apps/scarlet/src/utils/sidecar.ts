/* eslint-disable no-underscore-dangle */
import { SidecarConfig, getDefaultSidecar, CDFCluster } from '@cognite/sidecar';

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
const CLUSTER: CDFCluster = 'az-eastus-1';
// #
// #
// #
// #
// # -------------------------------------

const getAadApplicationId = (cluster: string) => {
  const ids: Record<string, string> = {
    'az-eastus-1': '7a12c4e5-1266-4a18-969a-15d86e7a702b',
  };

  const aadApplicationId = ids[cluster] || '';

  return {
    aadApplicationId,
  };
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

// We are overwriting the window.__cogniteSidecar object because the tenant-selector
// reads from this variable, so when you test on localhost, it (TSA) will not access via this file
// but via the window.__cogniteSidecar global
// now that this var is updated, all should work as expected.
(window as any).__cogniteSidecar = {
  ...getDefaultSidecar({
    prod: PROD,
    cluster: CLUSTER,
    localServices: [],
  }),
  ...getAadApplicationId(CLUSTER),
  __sidecarFormatVersion: 1,
  // to be used only locally as a sidecar placeholder
  // when deployed with FAS the values below are partly overriden
  applicationId: 'scarlet',
  applicationName: 'Cognite Scarlet',
  docsSiteBaseUrl: 'https://docs.cognite.com',
  nomaApiBaseUrl: 'https://noma.development.cognite.ai',
  mpServiceBaseURL: getmpServiceBaseURL(CLUSTER),
  locize: {
    keySeparator: false,
    // projectId: '1ee63b21-27c7-44ad-891f-4bd9af378b72', // <- move this to release-configs
    version: 'Production', // <- move this to release-configs
  },
  // availableClusters: [
  //   {
  //     label: 'Multi customer environments',
  //     options: [{ value: '', label: 'Europe 1 (Google)', legacyAuth: true }],
  //   },
  //   {
  //     label: 'Single customer environments',
  //     options: [
  //       { value: 'bp-northeurope', label: 'BP North Europe' },
  //       { value: 'omv', label: 'OMV', legacyAuth: true },
  //       { value: 'pgs', label: 'PGS', legacyAuth: true },
  //       { value: 'power-no', label: 'Power NO (Google)', legacyAuth: true },
  //     ],
  //   },
  //   {
  //     label: 'Staging environments',
  //     options: [
  //       { value: 'greenfield', label: 'greenfield', legacyAuth: true },
  //       { value: 'bluefield', label: 'bluefield' },
  //       { value: 'azure-dev', label: 'azure-dev' },
  //     ],
  //   },
  // ],
  // intercomSettings: {
  //   app_id: 'ou1uyk2p',
  //   hide_default_launcher: true,
  // },
  // enableUserManagement: true,
  ...((window as any).__cogniteSidecar || {}),
} as SidecarConfig;

export default (window as any).__cogniteSidecar;
