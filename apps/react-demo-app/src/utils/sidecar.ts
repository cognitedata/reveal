/* eslint-disable no-underscore-dangle */
import { SidecarConfig, getDefaultSidecar } from '@cognite/sidecar';

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
const LOCAL_COMMENTS_API = false;
// #
// #
// #
// # -------------------------------------

const getAadApplicationId = (cluster: string) => {
  const ids: Record<string, string> = {
    bluefield: '245a8a64-4142-4226-86fa-63d590de14c9', // <- react-demo
    'azure-dev': '5a262178-942b-4c8f-ac15-f96642b73b56', // <- react-demo
    ew1: 'd584f014-5fa9-4b0b-953d-cc4837d093f3', // <- react-demo
  };

  const aadApplicationId = ids[cluster] || '';

  return {
    aadApplicationId,
  };
};

// We are overwriting the window.__cogniteSidecar object because the tenant-selector
// reads from this variable, so when you test on localhost, it (TSA) will not access via this file
// but via the window.__cogniteSidecar global
// now that this var is updated, all should work as expected.
(window as any).__cogniteSidecar = {
  ...getDefaultSidecar({
    prod: PROD,
    cluster: CLUSTER,
    localServices: LOCAL_COMMENTS_API ? ['comment-service'] : [],
  }),
  ...getAadApplicationId(CLUSTER),
  __sidecarFormatVersion: 1,
  // to be used only locally as a sidecar placeholder
  // when deployed with FAS the values below are partly overriden
  applicationId: 'fas-demo',
  applicationName: 'React Demo (staging)',
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
