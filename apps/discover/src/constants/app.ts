import {
  Service,
  SidecarConfig,
  CDFCluster,
  getDefaultSidecar,
  FakeIdp,
} from '@cognite/sidecar';

// More info: https://cog.link/discover-projects
const CLUSTER: CDFCluster =
  (process.env.REACT_APP_CLUSTER as CDFCluster) || 'bluefield';

// Run in production mode
const PROD = false;

// Use local api (localhost:8001)
const localDiscover = false;
const localComments = false;
/* ************************************************************************** *
 * -------------------------------------------------------------------------- *
 * -------------------- NO NEED TO CHANGE ANYTHING BELOW -------------------- *
 * -------------------------------------------------------------------------- *
 * ************************************************************************** */
const localServices: Service[] = [];
if (localDiscover) {
  localServices.push('discover-api');
}
if (localComments) {
  localServices.push('comment-service');
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore ignore because of e2e
const sidecarOverrides = global.window ? global.window.__cogniteSidecar : {}; // eslint-disable-line no-underscore-dangle

const getAadApplicationId = (cluster: string) => {
  const ids: Record<string, string> = {
    ew1: '26e59323-67cd-42a6-ae5b-c5c4815c7180',
    bluefield: '1f860e84-7353-4533-a088-8fbe3228400f',
    'azure-dev': '808c3e2e-7bc1-4211-8d9e-66b4a7a37d48',
    'bp-northeurope': '36fe7d14-ae1c-4312-aa0f-63064601bb7f',
  };

  const aadApplicationId = ids[cluster] || '';

  return {
    aadApplicationId,
  };
};

// add in the dyanmic USER_ID, so the login page will have it
// which is unique per 'yarn start' (apart from local, which users your git email)
const sidecarOverridesWithCustomFakeIdpUser: Partial<SidecarConfig> = {
  ...sidecarOverrides,
  fakeIdp:
    sidecarOverrides && sidecarOverrides.fakeIdp
      ? sidecarOverrides.fakeIdp.map((fakeIdp: FakeIdp) => {
          const isAdmin = fakeIdp.name?.toLowerCase().includes('admin');
          return {
            ...fakeIdp,
            userId: process.env.REACT_APP_E2E_USER
              ? (isAdmin ? 'admin-' : '') + process.env.REACT_APP_E2E_USER
              : fakeIdp.userId,
          };
        })
      : [],
};

export type DiscoverSidecarConfig = SidecarConfig & {
  mixpanel: string;
  unleash: string;
};

export const SIDECAR = {
  ...getAadApplicationId(CLUSTER),
  ...getDefaultSidecar({
    prod: PROD,
    cluster: CLUSTER,
    localServices,
  }),
  // disableLegacyLogin: true, // for testing
  // disableAzureLogin: true, // for testing

  enableUserManagement: true,

  locize: {
    keySeparator: false,
    projectId: 'b0fef6b6-5821-4946-9acc-cb9c41568a75',
    apiKey: process.env.REACT_APP_LOCIZE_API_KEY,
    // NOTE: this 'version' is set to 'Production' for the deployments
    // via the release-configs in application-services
    // if you have made big key changes, you will need to do a release
    // of the 'Production' keys, by copying the 'latest' into them via the
    // locize app: https://www.locize.app/p/b8u69o32
    // this is done because the 'Production' keys are cached for cost/performance
    // and the latest ones are live.
    version: 'latest',
  },
  intercomSettings: {
    app_id: 'ou1uyk2p',
    hide_default_launcher: true,
  },
  mixpanel:
    sidecarOverrides?.mixpanel ||
    process.env.REACT_APP_MIXPANEL_TOKEN ||
    'disabled',
  unleash: process.env.REACT_APP_UNLEASH || '',
  applicationId: PROD ? 'discover' : 'discover-staging',
  applicationName: 'Discover',
  ...sidecarOverridesWithCustomFakeIdpUser, // these will be populated from the server - MUST BE AT BOTTOM!
} as DiscoverSidecarConfig;

export const API_PLAYGROUND_DOMAIN = '/api/playground/projects';
export const CONTEXTUALIZE_URL = 'https://fusion.cognite.com/';
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_FILTER_ITEMS_COUNT = 10;
