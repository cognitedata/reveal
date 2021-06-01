/* eslint-disable no-underscore-dangle */

export type Sidecar = {
  __sidecarFormatVersion: number;
  applicationId: string;
  applicationName: string;
  appsApiBaseUrl: string;
  cdfApiBaseUrl: string;
  cdfCluster: string;
  docsSiteBaseUrl: string;
  intercom: string;
  nomaApiBaseUrl: string;
};

// # -------------------------------------
// #
// #
// #
// # ONLY CHANGE THESE THINGS: (affects localhost only)
// #
// #
const PROD = false;
const CLUSTER = 'ew1';
// #
// #
// #
// # -------------------------------------

const generateBaseUrls = (cluster: string, prod: boolean = false) => {
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

// we are overwriting the window.__cogniteSidecar object because the tenant-selector
// reads from this variable, so when you test on localhost, it (TSA) will not access via this file
// but via the window.__cogniteSidecar global
// now that this var is updated, all should work as expected.
(window as any).__cogniteSidecar = {
  ...generateBaseUrls(CLUSTER, PROD),
  __sidecarFormatVersion: 1,
  // to be used only locally as a sidecar placeholder
  // when deployed with FAS the values below are partly overriden
  applicationId: 'cognuit-dev',
  cognuitApiBaseUrl: 'https://cognuit-cognitedata-development.cognite.ai',
  cognuitCdfProject: 'subsurface-test',

  disableTranslations: true,
  ...((window as any).__cogniteSidecar || {}),
} as Sidecar;

export default (window as any).__cogniteSidecar;
