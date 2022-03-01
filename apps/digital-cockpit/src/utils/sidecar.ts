/* eslint-disable no-underscore-dangle */
import { SidecarConfig, getDefaultSidecar } from '@cognite/sidecar';

type DCSidecarConfig = SidecarConfig & {
  mixpanel: string;
};

const PROD = false;
const CLUSTER = 'ew1';
// const CLUSTER = 'westeurope-1';
const localDigitalCockpit = !!process.env.REACT_APP_DC_API_URL;

const getAadApplicationId = (cluster: string) => {
  const ids: Record<string, string> = {
    bluefield: '24be28d3-60f4-42c6-a73f-8ee268e6f622',
    'westeurope-1': 'f9e9e254-d484-4789-aaed-8f6e2bde532a',
    ew1: 'dc0dc492-183f-4071-96b4-97c66a2161f4',
  };

  const aadApplicationId = ids[cluster] || '';

  return {
    aadApplicationId,
  };
};

// we are overwriting the window.__cogniteSidecar object because the tenant-selector
// reads from this variable, so when you test on localhost, it (TSA) will not access via this file
// but via the window.__cogniteSidecar global
// now that this var is updated, all should work as expected.
(window as any).__cogniteSidecar = {
  ...getDefaultSidecar({
    prod: PROD,
    cluster: CLUSTER,
    localServices: localDigitalCockpit ? ['digital-cockpit-api'] : [],
  }),
  ...getAadApplicationId(CLUSTER),
  __sidecarFormatVersion: 1,
  applicationId: 'digital-cockpit-dev',
  applicationName: 'Digital Cockpit (dev)',
  docsSiteBaseUrl: 'https://docs.cognite.com',
  privacyPolicyUrl: 'https://www.cognite.com/en/policy',
  ...((window as any).__cogniteSidecar || {}),
};

export default (window as any).__cogniteSidecar as DCSidecarConfig;
