/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle  */
import { SidecarConfig, getDefaultSidecar } from '@cognite/sidecar';

export interface PlatypusSidecarConfig extends SidecarConfig {
  disableTranslations?: boolean;
  disableLoopDetector?: boolean;
  disableSentry?: boolean;
  disableIntercom?: boolean;
  disableReactQuery?: boolean;
  unleash: string;
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
const CLUSTER = 'greenfield';
const LOCAL_COMMENTS_API = false;
// #
// #
// #
// # -------------------------------------

const getAadApplicationId = (cluster: string) => {
  const ids: Record<string, string> = {
    bluefield: 'f56098d7-7c63-4a15-9083-0ce92c80c292',
    greenfield: '4770c0f1-7bb6-43b5-8c37-94f2a9306757',
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
    localServices: LOCAL_COMMENTS_API ? ['comment-service'] : [],
  }),
  ...getAadApplicationId(CLUSTER),
  __sidecarFormatVersion: 1,
  // to be used only locally as a sidecar placeholder
  // when deployed with FAS the values below are partly overriden
  applicationId: 'Platypus',
  applicationName: 'Platypus',
  docsSiteBaseUrl: 'https://docs.cognite.com',
  nomaApiBaseUrl: 'https://noma.development.cognite.ai',
  enableUserManagement: false,
  disableTranslations: false,
  disableLoopDetector: false,
  disableSentry: true,
  disableIntercom: false,
  disableReactQuery: false,
  unleash: 'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE',
  reactQueryDevtools: {
    disabled: true,
  },
  ...((window as any).__cogniteSidecar || {}),
};

export default (window as any).__cogniteSidecar as PlatypusSidecarConfig;
