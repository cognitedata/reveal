import { createLink } from '@cognite/cdf-utilities';

export type WorkflowStepKey = 'upload' | 'process' | 'review';

export const workflowRoutes: Record<WorkflowStepKey, string> = {
  upload: '/:tenant/vision/workflow/upload',
  process: '/:tenant/vision/workflow/process',
  review: '/:tenant/vision/workflow/review',
};

// use for programmatic route updates with history.push
export function getLink(route: string) {
  return createLink(route.slice('/:tenant'.length));
}
