import { getFromLocalStorage, saveToLocalStorage } from '@cognite/storage';

import { AuthFlow, FlowStorage } from './types';

export const getFlowKey = (tenant?: string, env?: string) => {
  const environment = env ? `_env_${env}` : '';
  return tenant ? `flow_${tenant}${environment}` : `flow`;
};

export function saveFlow(flow: AuthFlow, options?: FlowStorage['options']) {
  saveToLocalStorage(getFlowKey(), { flow, options });
}

export function getFlow(tenant?: string, env?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenantFlow = getFromLocalStorage<FlowStorage>(getFlowKey(tenant, env));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generalFlow = getFromLocalStorage<FlowStorage>(getFlowKey());
  const f = tenantFlow || generalFlow;
  return {
    flow: f?.flow,
    options: f?.options,
  };
}

const debugMode = false;
export const log = (value: string, options?: unknown) => {
  if (debugMode) {
    // eslint-disable-next-line no-console
    console.log(`[Auth-Utils] ${value}`, options || '');
  }
};
