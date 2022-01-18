import { createLink } from '@cognite/cdf-utilities';

export type WorkflowStepKey =
  | 'upload'
  | 'process'
  | 'review'
  | 'explore'
  | 'home';

export const workflowRoutes: Record<WorkflowStepKey, string> = {
  upload: '/:tenant/vision/workflow/upload',
  process: '/:tenant/vision/workflow/process',
  review: '/:tenant/vision/workflow/review/:fileId',
  explore: '/:tenant/vision/explore',
  home: '/:tenant',
};

// use for programmatic route updates with history.push
export function getLink(route: string) {
  return createLink(route.slice('/:tenant'.length));
}

export function getParamLink(route: string, param: string, paramVal: string) {
  return createLink(route.slice('/:tenant'.length).replace(param, paramVal));
}
