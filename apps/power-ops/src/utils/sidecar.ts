/* eslint-disable no-underscore-dangle */
import { SidecarConfig, getDefaultSidecar, Service } from '@cognite/sidecar';

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
const CLUSTER = 'azure-dev';
const LOCAL_SERVICES: Service[] = ['power-ops-api', 'sniffer-service'];
// #
// #
// #
// # -------------------------------------

const getAadApplicationId = (cluster: string) => {
  const ids: Record<string, string> = {
    greenfield: '24771fe6-16f7-4f4c-afbe-93897c914310', // <- power-ops
    bluefield: 'd6e4e244-9b1f-4e42-9831-74c239e0c2ae', // <- power-ops
    'azure-dev': 'd5128515-81db-49b5-a718-1760686fb958', // <- power-ops
    'az-power-no-northeurope': 'ebcd14e2-9c0e-4c66-9c05-eab3e4920c25', // <- power-ops
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
    localServices: LOCAL_SERVICES?.length ? LOCAL_SERVICES : [],
  }),
  ...getAadApplicationId(CLUSTER),
  __sidecarFormatVersion: 1,
  // to be used only locally as a sidecar placeholder
  // when deployed with FAS the values below are partly overriden
  applicationId: 'power-ops',
  applicationName: 'Power Ops',
  docsSiteBaseUrl: 'https://docs.cognite.com',
  nomaApiBaseUrl: 'https://noma.development.cognite.ai',
  locize: {
    keySeparator: false,
    projectId: '1ee63b21-27c7-44ad-891f-4bd9af378b72', // <- move this to release-configs
    version: 'Production', // <- move this to release-configs
  },
  intercomSettings: {
    app_id: 'ou1uyk2p',
    hide_default_launcher: true,
  },
  enableUserManagement: true,
  ...((window as any).__cogniteSidecar || {}),
} as SidecarConfig;

export default (window as any).__cogniteSidecar;
