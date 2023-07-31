import jwtDecode from 'jwt-decode';
import {
  getFromLocalStorage,
  saveToLocalStorage,
  removeItem,
} from '@cognite/storage';

import { AuthFlow, FlowStorage } from './types';

export const getFlowKey = (project?: string, env?: string): string => {
  const environment = env ? `_env_${env}` : '';
  return project ? `flow_${project}${environment}`.toLowerCase() : `flow`;
};

export function saveFlow(
  flow: AuthFlow,
  options?: FlowStorage['options'],
  project?: string,
  env?: string
): void {
  saveToLocalStorage(getFlowKey(project, env), { flow, options });
}

export function removeFlow(project?: string, env?: string): void {
  removeItem(getFlowKey(project, env));
}

type Flow = {
  flow: AuthFlow | undefined;
  options: FlowStorage['options'];
};

export function getFlow(project?: string, env?: string): Flow {
  const projectFlow = getFromLocalStorage<FlowStorage>(
    getFlowKey(project, env)
  );
  const generalFlow = getFromLocalStorage<FlowStorage>(getFlowKey());
  const f = projectFlow || generalFlow;
  return {
    flow: f?.flow,
    options: f?.options,
  };
}

export const getProjectSpecificFlow = (project: string): Flow | undefined => {
  const projectFlow = getFromLocalStorage<FlowStorage>(getFlowKey(project));

  return projectFlow
    ? { flow: projectFlow.flow, options: projectFlow.options }
    : undefined;
};

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
