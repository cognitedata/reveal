import { WorkflowStep } from 'modules/workflows';
import { paths } from './paths';

export type PathData = {
  path: (
    tenant: string,
    workflowId: string | number,
    fileId?: string | number
  ) => string;
  staticPath: string;
  title: string;
  workflowStepName?: WorkflowStep;
  isNotStep?: boolean;
  skippable?: boolean;
};

export default function routesMap() {
  const map: PathData[] = Object.values(paths).filter(
    (path: PathData) => !path.isNotStep
  );
  return map;
}
