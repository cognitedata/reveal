import noop from 'lodash/noop';

import { AuthFlow, AuthResult, AuthResults } from './types';

const STORAGE_VERSION = 1;
const getKey = () => `cognite__auth__v${STORAGE_VERSION}__storage`;
const NO_PROJECT_KEY = '__noproject__';
/**
 * Define a no-op localStorage implementation to use as a fallback when
 * localStorage can't be used (eg, private browsing).
 */
const FAKE_LOCAL_STORAGE = {
  getItem: noop,
  removeItem: noop,
  setItem: () => undefined,
  clear: noop,
};

const SAFE_LOCAL_STORAGE = localStorage || FAKE_LOCAL_STORAGE;

const getTenant = () => {
  const { pathname } = window.location;
  if (!pathname) {
    return NO_PROJECT_KEY;
  }
  const match = pathname.match(/^\/([a-z0-9-]+)\/?/);
  if (!match) {
    return NO_PROJECT_KEY;
  }
  return match[1];
};

const saveToLocalStorage = <T>(key: string, payload: T) => {
  try {
    SAFE_LOCAL_STORAGE.setItem(key, JSON.stringify(payload));
  } catch (e) {
    console.error(e);
  }
};

const getFromLocalStorage = <T>(key: string) => {
  try {
    const item = SAFE_LOCAL_STORAGE.getItem(key);
    if (!item) return undefined;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(e);
  }
};

export const saveAuthResult = (authresult: AuthResult, optTenant?: string) => {
  const tenant = getTenant();
  const data = getFromLocalStorage<AuthResults>(getKey()) || {};
  saveToLocalStorage(getKey(), { ...data, [optTenant || tenant]: authresult });
};

export const retrieveAuthResult = (): AuthResult | undefined => {
  const tenant = getTenant();
  const data = getFromLocalStorage<AuthResults>(getKey()) || {};
  return data[tenant];
};

export const clearByProject = (project: string) => {
  const data = getFromLocalStorage<AuthResults>(getKey()) || {};
  delete data[project];
  saveToLocalStorage(getKey(), data);
};

export const clearByNoProject = () => {
  const project = NO_PROJECT_KEY;
  clearByProject(project);
};

export const initialiseOnRedirectFlow = (authFlow: AuthFlow) => {
  const tenant = getTenant();
  console.log(tenant);
  if (tenant !== NO_PROJECT_KEY) {
    console.warn(
      'Trying to initialize redirect when already a project is selected'
    );
    throw Error('Cannot initialise redirect on a project route');
  }
  saveAuthResult({ authFlow });
};

export const isAuthFlow = (authFlow: AuthFlow) => {
  const res = retrieveAuthResult();
  return res && res.authFlow === authFlow;
};

export const isNoAuthFlow = () => {
  const res = retrieveAuthResult();
  if (!res) return true;
  return false;
};
