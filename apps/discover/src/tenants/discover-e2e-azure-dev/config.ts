import config from '../discover-e2e-config';

/**
 * This config should be sync with `discover-e2-bluefield` tenant.
 * If there are changes to be made, add them to '../test-config.ts'.
 */
export default {
  ...config,

  // Enabling only for azure-dev since the wells SDK v2 only supports for azure-dev currently.
  enableWellSDKV3: true,

  wells: {
    ...config.wells,
    nds: {
      enabled: true,
    },
    npt: {
      enabled: true,
    },
  },
};
