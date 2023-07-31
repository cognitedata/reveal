import { AuthFlow } from '@cognite/auth-utils';
import { getFromLocalStorage } from '@cognite/storage';

// INFO: this whole implementation is copied from @cognite/auth-utils because of some problems with the resolving the dependency when building
type Flow = {
  flow: AuthFlow | undefined;
  options: FlowStorage['options'];
};

export type FlowStorage = {
  flow: AuthFlow;
  options?: {
    cluster?: string;
    project?: string;
    directory?: string;
  };
};

export const getFlowKey = (project?: string, env?: string): string => {
  const environment = env ? `_env_${env}` : '';
  return project ? `flow_${project}${environment}`.toLowerCase() : `flow`;
};

export const getProjectSpecificFlow = (project: string): Flow | undefined => {
  const projectFlow = getFromLocalStorage<FlowStorage>(getFlowKey(project));

  return projectFlow
    ? { flow: projectFlow.flow, options: projectFlow.options }
    : undefined;
};
