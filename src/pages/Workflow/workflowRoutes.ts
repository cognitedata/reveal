import { createLink } from '@cognite/cdf-utilities';

export type WorkflowStepKey = 'upload' | 'process';

export const workflowRoutes: Record<WorkflowStepKey, string> = {
  upload: '/:tenant/vision/workflow/upload',
  process: '/:tenant/vision/workflow/process',
};

// use for programmatic route updates with history.push
export function getLink(route: string) {
  return createLink(route.slice('/:tenant'.length));
}
