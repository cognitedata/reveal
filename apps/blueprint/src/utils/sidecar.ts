import { SidecarConfig, getDefaultSidecar } from '@cognite/sidecar';

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
    ew1: 'e83b0114-b3b3-4c5e-951e-5d7d8ec42e9c',
    'az-eastus-1': 'c4e85ddf-8480-4a6f-bdf4-aecc5fc51c33',
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
    localServices: [],
  }),
  ...getAadApplicationId(CLUSTER),

  __sidecarFormatVersion: 1,
  // to be used only locally as a sidecar placeholder
  // when deployed with FAS the values below are partly overriden
  applicationId: 'blueprint',
  applicationName: 'Cognite Blueprint',
  docsSiteBaseUrl: 'https://docs.cognite.com',
  mixpanel: '9005dc917fa1262373e8376ddde2f779',
  ...((window as any).__cogniteSidecar || {}),
};

export default (window as any).__cogniteSidecar as Sidecar;
