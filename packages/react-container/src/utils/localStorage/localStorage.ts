import noop from 'lodash/noop';
import { reportException } from '@cognite/react-errors';
import { Metrics } from '@cognite/metrics';

import { log } from '../log';

const STORAGE_VERSION = 2;

const BASE_KEY = `__v${STORAGE_VERSION}__storage`;

let currentTenant: string | undefined;
let currentAppName: string | undefined;

/**
 * Define a no-op localStorage implementation to use as a fallback when
 * localStorage can't be used (eg, private browsing).
 */
const FAKE_LOCAL_STORAGE = {
  getItem: noop,
  removeItem: noop,
  setItem: () => undefined,
};

const metrics = Metrics.create('LocalStorage');

/**
 * Provide a reference to localStorage that's safe to use (because it falls back
 * to the no-op implementation).
 */
const SAFE_LOCAL_STORAGE = localStorage || FAKE_LOCAL_STORAGE;

interface InitOptions {
  tenant?: string;
  appName?: string;
}
export const init = ({ tenant, appName }: InitOptions) => {
  currentTenant = tenant || currentTenant;
  currentAppName = appName;
};

export const ASSET_ID_STORAGE_KEY = 'selected-asset-id';

export const KEY_LAST_TENANT = 'last_CDF_project';

/** Create a key useful to store things at the root level. */
const createRootKey = (key: string) => {
  return `${BASE_KEY}/${key}`;
};

/** Create a key useful to store things on the app (opin, opin-dev) level. */
const createAppKey = (key: string) => {
  return `${currentAppName}/${key}`;
};

/** Create a key useful for storing things on the tenant level. */
const createTenantKey = (key: string) => {
  return `${currentTenant}/${key}`;
};

const getRootItem = <T>(key: string, defaultValue?: T): T | undefined => {
  const rootKey = createRootKey(key);

  const stringValue = SAFE_LOCAL_STORAGE.getItem(rootKey);
  if (stringValue === null) {
    return defaultValue;
  }

  try {
    return JSON.parse(stringValue);
  } catch (ex) {
    log<string>(ex, [stringValue], 2);
    return defaultValue;
  }
};

const getAppItem = <T>(key: string, defaultValue?: T) => {
  const appKey = createAppKey(key);
  return getRootItem<T>(appKey, defaultValue);
};

const setRootItem = <T>(key: string, data: T) => {
  try {
    const item = SAFE_LOCAL_STORAGE.setItem(
      createRootKey(key),
      JSON.stringify(data)
    );
    return item;
  } catch (ex) {
    // This happens if the local storage is full or the user is browing privately.
    // Simulating native behaviour of localStorage.setItem
    return undefined;
  }
};

const setAppItem = <T>(key: string, data: T) => {
  const appKey = createAppKey(key);
  setRootItem(appKey, data);
};

export const getRootString = <T, D = undefined>(
  key: string,
  defaultValue?: D
): T | D | undefined => {
  const rootKey = createRootKey(key);
  const maybeJson = SAFE_LOCAL_STORAGE.getItem(rootKey) || `"${defaultValue}"`;

  try {
    return JSON.parse(maybeJson);
  } catch (error) {
    reportException(error, { maybeJson }).then((errorId) => {
      metrics.track('getRootString', {
        errorId,
      });
    });
    return defaultValue;
  }
};

export const getItem = <T>(key: string, defaultValue?: T) => {
  const tenantKey = createTenantKey(key);
  return getAppItem<T>(tenantKey, defaultValue);
};

export const setItem = <T>(key: string, data: T) => {
  const tenantKey = createTenantKey(key);
  setAppItem(tenantKey, data);
};

export const removeItem = (key: string): void => {
  const tenantKey = createTenantKey(key);
  const appKey = createAppKey(tenantKey);
  const rootKey = createRootKey(appKey);
  localStorage.removeItem(rootKey);
};

export const storage = {
  init,
  getItem,
  setItem,
  getRootItem,
  setRootItem,
  getRootString,
  removeItem,
};
