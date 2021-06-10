/* eslint-disable no-underscore-dangle */

type Sidecar = {
  __sidecarFormatVersion: number;
  applicationId: string;
  applicationName: string;
  aadApplicationId: string;
  cdfApiBaseUrl: string;
  digitalCockpitApiBaseUrl: string;
  docsSiteBaseUrl: string;
  intercom: string;
  privacyPolicyUrl: string;
  mixpanel: string;
};

const PROD = false;
const CLUSTER = 'ew1';

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
        aadApplicationId: '24be28d3-60f4-42c6-a73f-8ee268e6f622', // bluefield
        appsApiBaseUrl: prod
          ? `https://apps-api.${cluster}.cognite.ai`
          : `https://apps-api.staging.${cluster}.cognite.ai`,
        cdfApiBaseUrl: `https://${cluster}.cognitedata.com`,
        cdfCluster: cluster,
      };
    }
  }
};

const sidecar: Sidecar = {
  ...generateBaseUrls(CLUSTER, PROD),
  __sidecarFormatVersion: 1,
  applicationId: 'digital-cockpit-dev',
  applicationName: 'Digital Cockpit (dev)',
  aadApplicationId: 'TBA',
  cdfApiBaseUrl: 'https://api.cognitedata.com',
  digitalCockpitApiBaseUrl:
    process.env.REACT_APP_DC_API_URL ||
    'https://digital-cockpit-api.staging.cognite.ai',
  docsSiteBaseUrl: 'https://docs.cognite.com',
  privacyPolicyUrl: 'https://www.cognite.com/en/policy',
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // eslint-disable-next-line no-underscore-dangle
  ...(window as any).__cogniteSidecar,
} as const;

(window as any).__cogniteSidecar = sidecar;

export default sidecar;
