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
const CLUSTER: CDFCluster = 'ew1';
const LOCAL_COMMENTS_API = false;
const LOCAL_INSPECT_API = false;
// #
// #
// #
// # -------------------------------------

const getAadApplicationId = (cluster: string) => {
  const ids: Record<string, string> = {
    // these are all staging ids:
    greenfield: 'b8318db7-18d1-419d-a90a-40087c76b1cd', // <- react-demo
    bluefield: '245a8a64-4142-4226-86fa-63d590de14c9', // <- react-demo
    'azure-dev': '5a262178-942b-4c8f-ac15-f96642b73b56', // <- react-demo
    ew1: 'd584f014-5fa9-4b0b-953d-cc4837d093f3', // <- react-demo
  };

  const aadApplicationId = ids[cluster] || '';

  return {
    aadApplicationId,
  };
};

type InspectConfig = SidecarConfig & {
  inspectApiUrl: string;
  gptKey: string;
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
  applicationId: 'inspect-staging',
  applicationName: 'Asset Inspector',
  docsSiteBaseUrl: 'https://docs.cognite.com',
  inspectApiUrl: LOCAL_INSPECT_API
    ? 'http://localhost:5000'
    : 'https://api.staging.cogniteapp.com/asset-extractor',
  locize: {},
  gptKey: '-----insert-key-here-----',
  availableClusters: [
    {
      label: 'Multi customer environments',
      options: [{ value: '', label: 'Europe 1 (Google)' }],
    },
  ],
  disableSentry: true,
  disableTranslations: true,
  disableIntercom: true,
  enableUserManagement: false,

  ...((window as any).__cogniteSidecar || {}),
} as InspectConfig;

export default (window as any).__cogniteSidecar as InspectConfig;
