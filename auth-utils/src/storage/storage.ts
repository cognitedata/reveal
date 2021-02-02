import noop from 'lodash/noop';

import { AuthFlow } from './types';

const STORAGE_VERSION = 4;

export const getKey = (tenant?: string, env?: string) => {
  const environment = env ? `env_${env}` : '';
  return tenant
    ? `cognite__auth__v${STORAGE_VERSION}_tenant_${tenant}_${environment}`
    : `cognite__auth__v${STORAGE_VERSION}`;
};

const getFlowKey = (tenant?: string, env?: string) =>
  `${getKey(tenant, env)}_flow`;

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

const saveToLocalStorage = <T>(key: string, payload: T) => {
  try {
    SAFE_LOCAL_STORAGE.setItem(key, JSON.stringify(payload));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
};

const getFromLocalStorage = <T>(key: string) => {
  try {
    const item = SAFE_LOCAL_STORAGE.getItem(key);
    if (!item) return undefined;
    return JSON.parse(item) as T;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  return undefined;
};

export function saveTenantFlow(
  { tenant, env }: { tenant: string; env?: string },
  flow: AuthFlow,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any
) {
  saveToLocalStorage(getFlowKey(tenant, env), { flow, options });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveFlow(flow: AuthFlow, options?: any) {
  saveToLocalStorage(getFlowKey(), { flow, options });
}

export function getFlow(tenant?: string, env?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenantFlow = getFromLocalStorage<{ flow: AuthFlow; options?: any }>(
    getFlowKey(tenant, env)
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generalFlow = getFromLocalStorage<{ flow: AuthFlow; options?: any }>(
    getFlowKey()
  );
  const f = tenantFlow || generalFlow;
  return {
    flow: f?.flow,
    options: f?.options,
  };
}
