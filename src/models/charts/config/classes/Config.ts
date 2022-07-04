import { isProduction } from 'models/charts/config/utils/environment';
import stagePart from 'models/charts/config/utils/stagePart';

// This is for storybooks. Need to remove putting in the webpack config
const env = typeof process !== 'undefined' ? process.env : ({} as any);

const {
  REACT_APP_ENV = 'development',
  REACT_APP_COMMIT_REF = 'local',
  REACT_APP_LOCIZE_API_KEY,
  REACT_APP_MIXPANEL_TOKEN,
  REACT_APP_DEBUG_TRANSLATIONS,
} = env;

interface LocalStorageItems {
  startPageLayout: 'grid' | 'list';
  locale: 'en' | 'en-gb' | 'nb' | 'ja';
  accessToken: string;
  firebaseToken: string;
  companyName: string;
  cogniteApiUrl: string;
}

export default class Config {
  static readonly azureAppId = '05aa256f-ba87-4e4c-902a-8e80ae5fb32e' as const;

  static readonly appName = `Cognite Charts ${stagePart()}`;

  static readonly firebaseAppName = isProduction ? 'charts' : 'charts-dev';

  static readonly version = REACT_APP_COMMIT_REF;

  static readonly environment = REACT_APP_ENV;

  static readonly privacyPolicyUrl = 'https://www.cognite.com/en/policy';

  static readonly cogniteHubGroupUrl =
    'https://hub.cognite.com/groups/charts-early-adopter-164';

  static readonly locizeProjectId = '1610fa5f-c8df-4aa8-9049-c08d8055d8ac';

  static readonly locizeApiKey = REACT_APP_LOCIZE_API_KEY;

  static readonly debugTranslations = Boolean(REACT_APP_DEBUG_TRANSLATIONS);

  static readonly mixpanelToken = REACT_APP_MIXPANEL_TOKEN;

  static readonly sentryDSN =
    'https://b35f7e3635d34e44bd24a354dfc4f13a@o124058.ingest.sentry.io/5509609';

  static readonly intercomAppId = 'ou1uyk2p';

  private static readonly LS_PREFIX = '@cognite/charts/';

  static lsGet<
    Key extends keyof LocalStorageItems,
    ReturnNullValue extends LocalStorageItems[Key] | undefined
  >(key: Key, returnIfNull?: ReturnNullValue) {
    return (localStorage.getItem(this.LS_PREFIX + key) ??
      returnIfNull) as ReturnNullValue extends LocalStorageItems[Key]
      ? LocalStorageItems[Key]
      : undefined;
  }

  static lsSave<Key extends keyof LocalStorageItems>(
    key: Key,
    value?: LocalStorageItems[Key] | null | undefined
  ) {
    if (value) {
      localStorage.setItem(this.LS_PREFIX + key, value);
    } else {
      localStorage.removeItem(this.LS_PREFIX + key);
    }
  }
}
