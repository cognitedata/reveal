import I18NextChainedBackend from 'i18next-chained-backend';
import LastUsed from 'locize-lastused';
import { locizePlugin } from 'locize';
import { initReactI18next, setI18n } from 'react-i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import {
  isDevelopment,
  isPR,
  isProduction,
} from 'models/charts/config/utils/environment';
import Config from 'models/charts/config/classes/Config';
import I18NextLocalStorageBackend from 'i18next-localstorage-backend';
import I18NextLocizeBackend from 'i18next-locize-backend';
import i18next from 'i18next';
import { LocizeLanguages } from 'models/charts/user-preferences/types/LocizeLanguages';

export default class I18N {
  static initialOptions = [
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本' },
  ];

  private static reactOptions = {
    bindI18n: 'languageChanged editorSaved',
    useSuspense: false,
  };

  private static locizeOptions = {
    projectId: Config.locizeProjectId,
    apiKey: isDevelopment || isPR ? Config.locizeApiKey : undefined,
    referenceLng: 'en',
    version: isProduction ? 'production' : 'latest',
    allowedAddOrUpdateHosts: ['localhost'],
  };

  private static fallbacks = {
    nb: ['en'],
    nn: ['en'],
    'en-GB': ['en'],
    'en-US': ['en'],
    'ja-JP': ['ja'],
    default: ['en'],
  };

  private static backends = {
    localStorage: {
      backend: I18NextLocalStorageBackend,
      options: {
        prefix: '@cognite/charts/translations_',
        expirationTime: 60 * 60 * 1000,
      },
    },
    locize: {
      backend: I18NextLocizeBackend,
      options: {
        ...this.locizeOptions,
        fallbackLng: this.fallbacks,
      },
    },
  };

  private static fetchBackends(...keys: (keyof typeof this.backends)[]) {
    return {
      backends: keys.map((key) => this.backends[key].backend),
      backendOptions: keys.map((key) => this.backends[key].options),
    };
  }

  static locizeBackend() {
    return i18next.services.backendConnector.backend.backends[
      isProduction ? 1 : 0
    ];
  }

  static fetchAvailableLanguages(): Promise<typeof this.initialOptions> {
    return new Promise((resolve, reject) => {
      this.locizeBackend().getLanguages(
        (err: any, languages: LocizeLanguages) => {
          if (err) reject(new Error('Failed to fetch Languages'));
          const languageOptions = Object.keys(languages).map((key) => ({
            value: key,
            label: languages[key].nativeName,
          }));
          resolve(languageOptions);
        }
      );
    });
  }

  static changeLanguage(language: string) {
    i18next.changeLanguage(language);
  }

  static get currentLanguage() {
    return i18next.language;
  }

  static initialize() {
    if (!Config.locizeProjectId) throw new Error('Locize is not configured!');

    i18next.options.react = this.reactOptions;
    setI18n(i18next);
    i18next
      .use(I18NextChainedBackend)
      .use(LastUsed)
      .use(locizePlugin)
      .use(I18nextBrowserLanguageDetector)
      .use(initReactI18next)
      .init({
        debug: Config.debugTranslations,
        updateMissing: isDevelopment,
        saveMissing: isDevelopment,
        react: this.reactOptions,
        interpolation: {
          escapeValue: false,
        },
        backend: isProduction
          ? this.fetchBackends('localStorage', 'locize')
          : this.fetchBackends('locize'),
        locizeLastUsed: this.locizeOptions,
        fallbackLng: this.fallbacks,
        defaultNS: 'global',
        detection: {
          order: ['localStorage'],
          lookupLocalStorage: '@cognite/charts/language',
          caches: ['localStorage'],
          htmlTag: document.documentElement,
        },
      });
  }
}
