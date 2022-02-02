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
    bluefield: '245a8a64-4142-4226-86fa-63d590de14c9',
    'azure-dev': '5a262178-942b-4c8f-ac15-f96642b73b56',
    ew1: 'f2c8ab5d-f405-4c8d-9434-d2db5c0d14c2',
    'az-eastus-1': '685cada6-524c-49f1-95c6-4b96eebe4b5b',
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
