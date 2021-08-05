/* eslint-disable no-underscore-dangle */

type Sidecar = {
  __sidecarFormatVersion: number;
  applicationId: string;
  applicationName: string;
  aadApplicationId: string;
  appsApiBaseUrl: string;
  cdfApiBaseUrl: string;
  cdfCluster: string;
  digitalCockpitApiBaseUrl: string;
  docsSiteBaseUrl: string;
  intercom: string;
  privacyPolicyUrl: string;
  mixpanel: string;
};

const PROD = false;
const CLUSTER = 'ew1';
// const CLUSTER = 'westeurope-1';

const generateBaseUrls = (cluster: string, prod = false) => {
  switch (cluster) {
    case 'ew1': {
      return {
        aadApplicationId: 'b1340a2b-1e14-466f-8a9c-22ebbd948b16',
        appsApiBaseUrl: 'https://apps-api.staging.cognite.ai',
        cdfApiBaseUrl: 'https://api.cognitedata.com',
        cdfCluster: '',
        digitalCockpitApiBaseUrl:
          process.env.REACT_APP_DC_API_URL ||
          'https://digital-cockpit-api.staging.cognite.ai',
      };
    }
    case 'westeurope-1': {
      return {
        aadApplicationId: 'f9e9e254-d484-4789-aaed-8f6e2bde532a',
        appsApiBaseUrl: 'https://apps-api.westeurope-1.cognite.ai',
        cdfApiBaseUrl: 'https://westeurope-1.cognitedata.com',
        digitalCockpitApiBaseUrl:
          process.env.REACT_APP_DC_API_URL ||
          'https://digital-cockpit-api.westeurope-1.cognite.ai',
      };
    }
    default: {
      return {
        aadApplicationId: '24be28d3-60f4-42c6-a73f-8ee268e6f622', // bluefield
        appsApiBaseUrl: prod
          ? `https://apps-api.${cluster}.cognite.ai`
          : `https://apps-api.staging.${cluster}.cognite.ai`,
        cdfApiBaseUrl: `https://${cluster}.cognitedata.com`,
        cdfCluster: cluster,
        digitalCockpitApiBaseUrl:
          process.env.REACT_APP_DC_API_URL ||
          'https://digital-cockpit-api.staging.cognite.ai',
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
  applicationId: 'digital-cockpit-dev',
  applicationName: 'Digital Cockpit (dev)',
  docsSiteBaseUrl: 'https://docs.cognite.com',
  privacyPolicyUrl: 'https://www.cognite.com/en/policy',
  ...((window as any).__cogniteSidecar || {}),
};

export default (window as any).__cogniteSidecar as Sidecar;
