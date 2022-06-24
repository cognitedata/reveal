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
const CLUSTER: CDFCluster =
  (process.env.REACT_APP_CLUSTER as CDFCluster) || 'azure-dev';
const LOCAL_COMMENTS_API = false;
// #
// #
// #
// # -------------------------------------

const getAadApplicationId = (cluster: string) => {
  // these are all staging ids:
  const ids: Record<string, string> = {
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

type ExplorerConfig = SidecarConfig;

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
  applicationId: 'explorer',
  applicationName: 'Cognite Office Explorer',
  availableClusters: [
    {
      label: 'Multi customer environments',
      options: [{ value: '', label: 'Europe 1 (Google)' }],
    },
    {
      label: 'Staging environments',
      options: [
        { value: 'azure-dev', label: 'azure-dev' },
        { value: 'greenfield', label: 'greenfield' },
        { value: 'bluefield', label: 'bluefield' },
      ],
    },
  ],
  disableSentry: true,
  disableTranslations: true,
  disableIntercom: true,
  enableUserManagement: false,
  disableLegacyLogin: true,
  disableInternalMetrics: true,
  ...((window as any).__cogniteSidecar || {}),
  reactQueryDevtools: {
    disabled: false,
  },
} as ExplorerConfig;

export default (window as any).__cogniteSidecar as ExplorerConfig;
