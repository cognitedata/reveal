import * as localForage from 'localforage';

import sdk from '@cognite/cdf-sdk-singleton';

export const CACHE_KEY = {
  SMALL_CHATBOT_DIMENTIONS: 'SMALL_CHATBOT_DIMENTIONS',
  CHATBOT_EXPANDED: 'CHATBOT_EXPANDED',
} as const;

const prefix = `cdf-copilot-${sdk.project}-`;

export const saveToCache = async <T>(key: keyof typeof CACHE_KEY, value: T) => {
  return localForage.setItem(`${prefix}${key}`, value);
};

export const getFromCache = async <T>(key: keyof typeof CACHE_KEY) => {
  return ((await localForage.getItem(`${prefix}${key}`)) || undefined) as
    | T
    | undefined;
};

export const clear = async () => {
  const keys = await localForage.keys();
  for (const key of keys) {
    if (key.startsWith(prefix)) {
      localForage.removeItem(key);
    }
  }
};
