import { WorkflowStep } from 'modules/workflows';
import { paths } from './paths';

export type PathData = {
  path: (
    tenant: string,
    workflowId?: string | number,
    fileId?: string | number
  ) => string;
  staticPath: string;
  title: string;
  workflowStepName?: WorkflowStep;
  skippable?: boolean;
  showOnStepList?: boolean;
};

export const routesMap = () => {
  const map: PathData[] = Object.values(paths);
  return map;
};

export const stepsMap = () => {
  return routesMap().filter((path: PathData) => path.showOnStepList);
};
