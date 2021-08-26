import { getFromLocalStorage, saveToLocalStorage } from '@cognite/storage';
import jwtDecode from 'jwt-decode';

import { AuthFlow, FlowStorage } from './types';

export const getFlowKey = (tenant?: string, env?: string): string => {
  const environment = env ? `_env_${env}` : '';
  return tenant ? `flow_${tenant}${environment}` : `flow`;
};

export function saveFlow(
  flow: AuthFlow,
  options?: FlowStorage['options']
): void {
  saveToLocalStorage(getFlowKey(), { flow, options });
}

type Flow = {
  flow: AuthFlow | undefined;
  options: FlowStorage['options'];
};

export function getFlow(tenant?: string, env?: string): Flow {
  const tenantFlow = getFromLocalStorage<FlowStorage>(getFlowKey(tenant, env));
  const generalFlow = getFromLocalStorage<FlowStorage>(getFlowKey());
  const f = tenantFlow || generalFlow;
  return {
    flow: f?.flow,
    options: f?.options,
  };
}

const debugMode = false;
export const log = (value: string, options?: unknown): void => {
  if (debugMode) {
    // eslint-disable-next-line no-console
    console.log(`[Auth-Utils] ${value}`, options || '');
  }
};

export function decodeTokenUid(token: string): string | undefined {
  try {
    // always 'try' a decode, because we are not guaranteed a jwt
    const decodedToken = jwtDecode(token) as any;

    return decodedToken.oid || decodedToken.email || decodedToken.unique_name;
  } catch (error) {
    if (debugMode) {
      // eslint-disable-next-line no-console
      console.log(`[Auth-Utils] Failed to decode token`, error);
    }

    return '';
  }
}
