import { WorkflowStep } from 'modules/workflows';

export type StepsData = {
  path: string;
  title: string;
  workflowStepName: WorkflowStep;
};

export default function routesMap(mountedAt: string) {
  const map: StepsData[] = [
    {
      path: `${mountedAt}/workflow/:workflowId`,
      title: 'Select files',
      workflowStepName: 'diagramSelection',
    },
    {
      path: `${mountedAt}/workflow/:workflowId/selection`,
      title: 'Select resources',
      workflowStepName: 'resourceSelection',
    },
    {
      path: `${mountedAt}/workflow/:workflowId/config`,
      title: 'P&ID configuration',
      workflowStepName: 'config',
    },
    {
      path: `${mountedAt}/workflow/:workflowId/review`,
      title: 'Review results',
      workflowStepName: 'review',
    },
    {
      path: `${mountedAt}/workflow/:workflowId/diagram/:fileId`,
      title: 'Review a file',
      workflowStepName: 'finished',
    },
  ];
  return map;
}
